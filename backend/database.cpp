#include "database.h"
#include "third_party/sqlite/sqlite3.h"
#include <iostream>
#include <fstream>
#include <sstream>

static sqlite3* db = nullptr;

static bool executeSqlFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[Database] Warning: Could not open schema file: " << filepath << std::endl;
        return false;
    }
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string sql = buffer.str();

    char* errMsg = nullptr;
    int rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);
    if (rc != SQLITE_OK) {
        std::cerr << "[Database] SQL Execution Error: " << (errMsg ? errMsg : "") << std::endl;
        if (errMsg) sqlite3_free(errMsg);
        return false;
    }
    std::cout << "[Database] Schema & seed data loaded from: " << filepath << std::endl;
    return true;
}

bool initDatabase(const std::string& dbPath, const std::string& schemaSqlPath) {
    int rc = sqlite3_open(dbPath.c_str(), &db);
    if (rc != SQLITE_OK) {
        std::cerr << "[Database] Cannot open database: " << sqlite3_errmsg(db) << std::endl;
        return false;
    }

    // Check if events table exists
    sqlite3_stmt* stmt = nullptr;
    const char* checkSql = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='events';";
    int tableCount = 0;
    if (sqlite3_prepare_v2(db, checkSql, -1, &stmt, nullptr) == SQLITE_OK) {
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            tableCount = sqlite3_column_int(stmt, 0);
        }
        sqlite3_finalize(stmt);
    }

    if (tableCount == 0) {
        // Fresh database: Execute schema.sql
        executeSqlFile(schemaSqlPath);
    } else {
        // Safe migration: Add imageUrl column if it doesn't exist
        sqlite3_exec(db, "ALTER TABLE events ADD COLUMN imageUrl TEXT DEFAULT '';", nullptr, nullptr, nullptr);
    }

    return true;
}

void closeDatabase() {
    if (db) {
        sqlite3_close(db);
        db = nullptr;
    }
}

int loadEvents(Event arr[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT id, title, tagline, description, date, venue, category, status, imageUrl FROM events ORDER BY id ASC;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        arr[count].id = sqlite3_column_int(stmt, 0);
        arr[count].title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        arr[count].tagline = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        arr[count].description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        arr[count].date = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        arr[count].venue = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        arr[count].category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        arr[count].status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        const char* imgText = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
        arr[count].imageUrl = imgText ? imgText : "";
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

int loadAttendees(Attendee arr[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT id, eventId, name, email, phone, section, status, registeredAt FROM attendees ORDER BY id ASC;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        arr[count].id = sqlite3_column_int(stmt, 0);
        arr[count].eventId = sqlite3_column_int(stmt, 1);
        arr[count].name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        arr[count].email = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        arr[count].phone = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        arr[count].section = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        arr[count].status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        arr[count].registeredAt = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

int loadSections(Section arr[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT id, eventId, name, capacity, occupied FROM sections ORDER BY id ASC;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        arr[count].id = sqlite3_column_int(stmt, 0);
        arr[count].eventId = sqlite3_column_int(stmt, 1);
        arr[count].name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        arr[count].capacity = sqlite3_column_int(stmt, 3);
        arr[count].occupied = sqlite3_column_int(stmt, 4);
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

int loadResources(Resource arr[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT id, eventId, name, category, total, allocated FROM resources ORDER BY id ASC;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        arr[count].id = sqlite3_column_int(stmt, 0);
        arr[count].eventId = sqlite3_column_int(stmt, 1);
        arr[count].name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        arr[count].category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        arr[count].total = sqlite3_column_int(stmt, 4);
        arr[count].allocated = sqlite3_column_int(stmt, 5);
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

int loadActivities(Activity arr[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT id, eventId, message, createdAt FROM activities ORDER BY id DESC LIMIT ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;
    sqlite3_bind_int(stmt, 1, maxCount);

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        arr[count].id = sqlite3_column_int(stmt, 0);
        arr[count].eventId = sqlite3_column_int(stmt, 1);
        arr[count].message = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        arr[count].createdAt = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

int loadQueueAttendeeIds(int queueIds[], int maxCount) {
    if (!db) return 0;
    const char* sql = "SELECT attendee_id FROM queue_state ORDER BY position ASC;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;

    int count = 0;
    while (sqlite3_step(stmt) == SQLITE_ROW && count < maxCount) {
        queueIds[count] = sqlite3_column_int(stmt, 0);
        count++;
    }
    sqlite3_finalize(stmt);
    return count;
}

bool dbInsertEvent(Event& e) {
    if (!db) return false;
    const char* sql = "INSERT INTO events (title, tagline, description, date, venue, category, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, e.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, e.tagline.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, e.description.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, e.date.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, e.venue.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, e.category.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, e.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 8, e.imageUrl.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    if (rc == SQLITE_DONE) {
        e.id = static_cast<int>(sqlite3_last_insert_rowid(db));
        return true;
    }
    return false;
}

bool dbUpdateEvent(const Event& e) {
    if (!db) return false;
    const char* sql = "UPDATE events SET title = ?, tagline = ?, description = ?, date = ?, venue = ?, category = ?, status = ?, imageUrl = ? WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, e.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, e.tagline.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, e.description.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, e.date.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, e.venue.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, e.category.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, e.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 8, e.imageUrl.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 9, e.id);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbDeleteEvent(int id) {
    if (!db) return false;
    sqlite3_exec(db, "BEGIN TRANSACTION;", nullptr, nullptr, nullptr);

    std::string sqlQueue = "DELETE FROM queue_state WHERE eventId = " + std::to_string(id) + ";";
    sqlite3_exec(db, sqlQueue.c_str(), nullptr, nullptr, nullptr);

    std::string sqlAct = "DELETE FROM activities WHERE eventId = " + std::to_string(id) + ";";
    sqlite3_exec(db, sqlAct.c_str(), nullptr, nullptr, nullptr);

    std::string sqlRes = "DELETE FROM resources WHERE eventId = " + std::to_string(id) + ";";
    sqlite3_exec(db, sqlRes.c_str(), nullptr, nullptr, nullptr);

    std::string sqlAtt = "DELETE FROM attendees WHERE eventId = " + std::to_string(id) + ";";
    sqlite3_exec(db, sqlAtt.c_str(), nullptr, nullptr, nullptr);

    std::string sqlSec = "DELETE FROM sections WHERE eventId = " + std::to_string(id) + ";";
    sqlite3_exec(db, sqlSec.c_str(), nullptr, nullptr, nullptr);

    const char* sql = "DELETE FROM events WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) {
        sqlite3_exec(db, "ROLLBACK;", nullptr, nullptr, nullptr);
        return false;
    }
    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc == SQLITE_DONE) {
        sqlite3_exec(db, "COMMIT;", nullptr, nullptr, nullptr);
        return true;
    } else {
        sqlite3_exec(db, "ROLLBACK;", nullptr, nullptr, nullptr);
        return false;
    }
}

bool dbInsertAttendee(Attendee& a) {
    if (!db) return false;
    const char* sql = "INSERT INTO attendees (eventId, name, email, phone, section, status, registeredAt) VALUES (?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, a.eventId);
    sqlite3_bind_text(stmt, 2, a.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, a.email.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, a.phone.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, a.section.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, a.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, a.registeredAt.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    if (rc == SQLITE_DONE) {
        a.id = static_cast<int>(sqlite3_last_insert_rowid(db));
        return true;
    }
    return false;
}

bool dbUpdateAttendee(const Attendee& a) {
    if (!db) return false;
    const char* sql = "UPDATE attendees SET name = ?, email = ?, phone = ?, section = ?, status = ?, registeredAt = ? WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, a.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, a.email.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, a.phone.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, a.section.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, a.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, a.registeredAt.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 7, a.id);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbDeleteAttendee(int id) {
    if (!db) return false;
    const char* sql = "DELETE FROM attendees WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbInsertSection(Section& s) {
    if (!db) return false;
    const char* sql = "INSERT INTO sections (eventId, name, capacity, occupied) VALUES (?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, s.eventId);
    sqlite3_bind_text(stmt, 2, s.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 3, s.capacity);
    sqlite3_bind_int(stmt, 4, s.occupied);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    if (rc == SQLITE_DONE) {
        s.id = static_cast<int>(sqlite3_last_insert_rowid(db));
        return true;
    }
    return false;
}

bool dbUpdateSection(const Section& s) {
    if (!db) return false;
    const char* sql = "UPDATE sections SET name = ?, capacity = ?, occupied = ? WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, s.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 2, s.capacity);
    sqlite3_bind_int(stmt, 3, s.occupied);
    sqlite3_bind_int(stmt, 4, s.id);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbDeleteSection(int id) {
    if (!db) return false;
    const char* sql = "DELETE FROM sections WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbInsertResource(Resource& r) {
    if (!db) return false;
    const char* sql = "INSERT INTO resources (eventId, name, category, total, allocated) VALUES (?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, r.eventId);
    sqlite3_bind_text(stmt, 2, r.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, r.category.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 4, r.total);
    sqlite3_bind_int(stmt, 5, r.allocated);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    if (rc == SQLITE_DONE) {
        r.id = static_cast<int>(sqlite3_last_insert_rowid(db));
        return true;
    }
    return false;
}

bool dbUpdateResource(const Resource& r) {
    if (!db) return false;
    const char* sql = "UPDATE resources SET name = ?, category = ?, total = ?, allocated = ? WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, r.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, r.category.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 3, r.total);
    sqlite3_bind_int(stmt, 4, r.allocated);
    sqlite3_bind_int(stmt, 5, r.id);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbDeleteResource(int id) {
    if (!db) return false;
    const char* sql = "DELETE FROM resources WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return (rc == SQLITE_DONE);
}

bool dbInsertActivity(Activity& act) {
    if (!db) return false;
    const char* sql = "INSERT INTO activities (eventId, message, createdAt) VALUES (?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_int(stmt, 1, act.eventId);
    sqlite3_bind_text(stmt, 2, act.message.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, act.createdAt.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    if (rc == SQLITE_DONE) {
        act.id = static_cast<int>(sqlite3_last_insert_rowid(db));
        return true;
    }
    return false;
}

bool dbSaveQueue(const Attendee queueArr[], int front, int count, int maxQueue) {
    if (!db) return false;
    sqlite3_exec(db, "DELETE FROM queue_state;", nullptr, nullptr, nullptr);
    if (count == 0) return true;

    const char* sql = "INSERT INTO queue_state (position, eventId, attendee_id) VALUES (?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    for (int i = 0; i < count; ++i) {
        int idx = (front + i) % maxQueue;
        sqlite3_reset(stmt);
        sqlite3_bind_int(stmt, 1, i + 1);
        sqlite3_bind_int(stmt, 2, queueArr[idx].eventId);
        sqlite3_bind_int(stmt, 3, queueArr[idx].id);
        sqlite3_step(stmt);
    }
    sqlite3_finalize(stmt);
    return true;
}
