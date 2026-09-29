// ==============================================================================
// SMART EVENT CROWD & RESOURCE MANAGEMENT SYSTEM (MULTI-EVENT ENGINE)
// ==============================================================================
// Academic Data Structures Syllabus Implementation:
//   1. STRUCTURES        -> Represent application records (Event, Attendee, etc.)
//   2. 1D ARRAYS         -> Store collections with explicit array operations
//   3. FIFO QUEUE        -> Array-based Circular FIFO Queue for Waiting List
// ==============================================================================

// ==============================================================================
// 1. INCLUDES AND CONSTANTS
// ==============================================================================
#define CPPHTTPLIB_NO_OPENSSL
#include "third_party/httplib.h"
#include "third_party/json.hpp"
#include "database.h"

#include <iostream>
#include <string>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cctype>

using json = nlohmann::json;

// Fixed array capacities (Academic Constraint: 1D Fixed Arrays)
const int MAX_EVENTS      = 50;
const int MAX_ATTENDEES   = 500;
const int MAX_SECTIONS     = 100;
const int MAX_RESOURCES    = 200;
const int MAX_ACTIVITIES   = 100;
const int MAX_QUEUE        = 500;

// Port and DB settings
const int SERVER_PORT = 8080;
const std::string DB_FILENAME = "event_system.db";
const std::string SCHEMA_FILENAME = "schema.sql";

// Helper: current timestamp
static std::string getTimestampNow() {
    std::time_t now = std::time(nullptr);
    std::tm tmStruct;
#if defined(_WIN32) || defined(_WIN64)
    localtime_s(&tmStruct, &now);
#else
    localtime_r(&now, &tmStruct);
#endif
    char buf[64];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tmStruct);
    return std::string(buf);
}

// Helper: case-insensitive string contains
static bool stringContainsIgnoreCase(const std::string& haystack, const std::string& needle) {
    if (needle.empty()) return true;
    auto it = std::search(
        haystack.begin(), haystack.end(),
        needle.begin(), needle.end(),
        [](char ch1, char ch2) { return std::tolower(static_cast<unsigned char>(ch1)) == std::tolower(static_cast<unsigned char>(ch2)); }
    );
    return (it != haystack.end());
}

// Helper: case-insensitive equality
static bool stringEqualsIgnoreCase(const std::string& a, const std::string& b) {
    if (a.length() != b.length()) return false;
    for (size_t i = 0; i < a.length(); ++i) {
        if (std::tolower(static_cast<unsigned char>(a[i])) != std::tolower(static_cast<unsigned char>(b[i])))
            return false;
    }
    return true;
}

// ==============================================================================
// 2. STRUCTURES (Included from database.h)
// ==============================================================================
// struct Event    { int id; string title, tagline, description, date, venue, category, status; };
// struct Attendee { int id, eventId; string name, email, phone, section, status, registeredAt; };
// struct Section  { int id, eventId; string name; int capacity, occupied; };
// struct Resource { int id, eventId; string name, category; int total, allocated; };
// struct Activity { int id, eventId; string message, createdAt; };

// ==============================================================================
// 3. GLOBAL ARRAYS AND COUNTERS
// ==============================================================================
Event     events[MAX_EVENTS];
int       eventCount = 0;

Attendee  attendees[MAX_ATTENDEES];
int       attendeeCount = 0;

Section   sections[MAX_SECTIONS];
int       sectionCount = 0;

Resource  resources[MAX_RESOURCES];
int       resourceCount = 0;

Activity  activities[MAX_ACTIVITIES];
int       activityCount = 0;

// Circular Queue State for FIFO Waiting List
Attendee  waitingQueue[MAX_QUEUE];
int       queueFront = 0;
int       queueRear = -1;
int       queueCount = 0;

// ==============================================================================
// 4. ARRAY OPERATIONS (Passing 1D Arrays to Functions)
// ==============================================================================

int findEventById(const Event arr[], int count, int id) {
    for (int i = 0; i < count; ++i) {
        if (arr[i].id == id) return i;
    }
    return -1;
}

int findAttendeeById(const Attendee arr[], int count, int id) {
    for (int i = 0; i < count; ++i) {
        if (arr[i].id == id) return i;
    }
    return -1;
}

int findAttendeeByEmail(const Attendee arr[], int count, int eventId, const std::string& email) {
    for (int i = 0; i < count; ++i) {
        if ((eventId == 0 || arr[i].eventId == eventId) && stringEqualsIgnoreCase(arr[i].email, email)) {
            return i;
        }
    }
    return -1;
}

int findSectionByName(const Section arr[], int count, int eventId, const std::string& name) {
    for (int i = 0; i < count; ++i) {
        if ((eventId == 0 || arr[i].eventId == eventId) && stringEqualsIgnoreCase(arr[i].name, name)) {
            return i;
        }
    }
    return -1;
}

int findSectionById(const Section arr[], int count, int id) {
    for (int i = 0; i < count; ++i) {
        if (arr[i].id == id) return i;
    }
    return -1;
}

int findResourceById(const Resource arr[], int count, int id) {
    for (int i = 0; i < count; ++i) {
        if (arr[i].id == id) return i;
    }
    return -1;
}

bool addEventToArray(Event arr[], int &count, const Event& item) {
    if (count >= MAX_EVENTS) return false;
    arr[count] = item;
    count++;
    return true;
}

bool removeEventFromArray(Event arr[], int &count, int index) {
    if (index < 0 || index >= count) return false;
    for (int i = index; i < count - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    count--;
    return true;
}

bool addAttendeeToArray(Attendee arr[], int &count, const Attendee& person) {
    if (count >= MAX_ATTENDEES) return false;
    arr[count] = person;
    count++;
    return true;
}

bool removeAttendeeFromArray(Attendee arr[], int &count, int index) {
    if (index < 0 || index >= count) return false;
    for (int i = index; i < count - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    count--;
    return true;
}

bool addSectionToArray(Section arr[], int &count, const Section& s) {
    if (count >= MAX_SECTIONS) return false;
    arr[count] = s;
    count++;
    return true;
}

bool removeSectionFromArray(Section arr[], int &count, int index) {
    if (index < 0 || index >= count) return false;
    for (int i = index; i < count - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    count--;
    return true;
}

bool addResourceToArray(Resource arr[], int &count, const Resource& r) {
    if (count >= MAX_RESOURCES) return false;
    arr[count] = r;
    count++;
    return true;
}

bool removeResourceFromArray(Resource arr[], int &count, int index) {
    if (index < 0 || index >= count) return false;
    for (int i = index; i < count - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    count--;
    return true;
}

void logActivity(Activity arr[], int &count, int eventId, const std::string& message) {
    Activity act;
    act.id = 0;
    act.eventId = eventId;
    act.message = message;
    act.createdAt = getTimestampNow();

    dbInsertActivity(act);

    if (count < MAX_ACTIVITIES) {
        for (int i = count; i > 0; --i) arr[i] = arr[i - 1];
        arr[0] = act;
        count++;
    } else {
        for (int i = MAX_ACTIVITIES - 1; i > 0; --i) arr[i] = arr[i - 1];
        arr[0] = act;
    }
}

// ==============================================================================
// 5. FIFO QUEUE IMPLEMENTATION (Array-Based Circular FIFO Queue)
// ==============================================================================

bool isQueueEmpty() {
    return (queueCount == 0);
}

bool isQueueFull() {
    return (queueCount >= MAX_QUEUE);
}

int getQueueSize() {
    return queueCount;
}

bool enqueue(const Attendee& person) {
    if (isQueueFull()) return false;
    queueRear = (queueRear + 1) % MAX_QUEUE;
    waitingQueue[queueRear] = person;
    queueCount++;
    dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);
    return true;
}

bool dequeue(Attendee& result) {
    if (isQueueEmpty()) return false;
    result = waitingQueue[queueFront];
    queueFront = (queueFront + 1) % MAX_QUEUE;
    queueCount--;
    dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);
    return true;
}

bool queueFrontItem(Attendee& result) {
    if (isQueueEmpty()) return false;
    result = waitingQueue[queueFront];
    return true;
}

int getWaitingPosition(int attendeeId) {
    for (int i = 0; i < queueCount; ++i) {
        int idx = (queueFront + i) % MAX_QUEUE;
        if (waitingQueue[idx].id == attendeeId) {
            return i + 1; // 1-indexed
        }
    }
    return -1;
}

// ==============================================================================
// 6. BUSINESS LOGIC & RESOURCE AUTO-SYNC
// ==============================================================================

void autoAllocateResourceForEvent(int eventId) {
    for (int i = 0; i < resourceCount; ++i) {
        if (resources[i].eventId == eventId) {
            if (resources[i].allocated < resources[i].total) {
                resources[i].allocated++;
                dbUpdateResource(resources[i]);
            }
        }
    }
}

void autoReleaseResourceForEvent(int eventId) {
    for (int i = 0; i < resourceCount; ++i) {
        if (resources[i].eventId == eventId) {
            if (resources[i].allocated > 0) {
                resources[i].allocated--;
                dbUpdateResource(resources[i]);
            }
        }
    }
}

bool processRegistration(int eventId, const std::string& name, const std::string& email, const std::string& phone, 
                         const std::string& sectionName, Attendee& outAttendee, int& outPosition, std::string& outMessage) {
    if (name.empty() || email.empty() || phone.empty() || sectionName.empty()) {
        outMessage = "All fields (name, email, phone, section) are required.";
        return false;
    }

    if (email.find('@') == std::string::npos) {
        outMessage = "Invalid email format.";
        return false;
    }

    int evIdx = findEventById(events, eventCount, eventId);
    if (evIdx == -1) {
        outMessage = "Selected event does not exist.";
        return false;
    }

    int existingIdx = findAttendeeByEmail(attendees, attendeeCount, eventId, email);
    if (existingIdx != -1) {
        if (attendees[existingIdx].status != "CANCELLED") {
            outMessage = "An active registration already exists for email: " + email;
            return false;
        }
    }

    int secIdx = findSectionByName(sections, sectionCount, eventId, sectionName);
    if (secIdx == -1) {
        outMessage = "Selected section '" + sectionName + "' does not exist in this event.";
        return false;
    }

    Attendee newPerson;
    newPerson.eventId = eventId;
    newPerson.name = name;
    newPerson.email = email;
    newPerson.phone = phone;
    newPerson.section = sections[secIdx].name;
    newPerson.registeredAt = getTimestampNow();

    if (sections[secIdx].occupied < sections[secIdx].capacity) {
        newPerson.status = "ADMITTED";
        if (!dbInsertAttendee(newPerson)) {
            outMessage = "Database error saving attendee.";
            return false;
        }

        sections[secIdx].occupied++;
        dbUpdateSection(sections[secIdx]);
        autoAllocateResourceForEvent(eventId);

        addAttendeeToArray(attendees, attendeeCount, newPerson);
        logActivity(activities, activityCount, eventId, newPerson.name + " admitted to " + newPerson.section + " (Resource auto-allocated).");

        outAttendee = newPerson;
        outPosition = 0;
        outMessage = "Registration confirmed — admitted to " + newPerson.section + ".";
        return true;
    } else {
        if (isQueueFull()) {
            outMessage = "The event waiting list is currently at maximum capacity.";
            return false;
        }

        newPerson.status = "WAITING";
        if (!dbInsertAttendee(newPerson)) {
            outMessage = "Database error saving attendee.";
            return false;
        }

        addAttendeeToArray(attendees, attendeeCount, newPerson);
        enqueue(newPerson);

        outPosition = getWaitingPosition(newPerson.id);
        logActivity(activities, activityCount, eventId, newPerson.name + " added to FIFO waiting list for " + newPerson.section + " at position #" + std::to_string(outPosition) + ".");

        outAttendee = newPerson;
        outMessage = newPerson.section + " is full — added to the FIFO waiting list at position #" + std::to_string(outPosition) + ".";
        return true;
    }
}

bool admitNextAttendee(int eventId, Attendee& outAdmitted, std::string& outMessage, bool openSeatIfFull = false) {
    if (isQueueEmpty()) {
        outMessage = "The waiting list is currently empty.";
        return false;
    }

    int matchRelativeIdx = -1;
    for (int i = 0; i < queueCount; ++i) {
        int qIdx = (queueFront + i) % MAX_QUEUE;
        if (eventId == 0 || waitingQueue[qIdx].eventId == eventId) {
            matchRelativeIdx = i;
            break;
        }
    }

    if (matchRelativeIdx == -1) {
        outMessage = (eventId > 0) ? "No attendees in waiting queue for this event." : "The waiting list is currently empty.";
        return false;
    }

    int targetPos = (queueFront + matchRelativeIdx) % MAX_QUEUE;
    Attendee frontPerson = waitingQueue[targetPos];

    int secIdx = findSectionByName(sections, sectionCount, frontPerson.eventId, frontPerson.section);
    if (secIdx == -1) {
        outMessage = "Section '" + frontPerson.section + "' requested by " + frontPerson.name + " no longer exists.";
        return false;
    }

    if (sections[secIdx].occupied >= sections[secIdx].capacity && openSeatIfFull) {
        sections[secIdx].capacity = sections[secIdx].occupied + 1;
        dbUpdateSection(sections[secIdx]);
        logActivity(activities, activityCount, frontPerson.eventId, 
                    "Section capacity for '" + sections[secIdx].name + "' automatically opened (+1 to " + 
                    std::to_string(sections[secIdx].capacity) + ") to admit waiting candidate.");
    }

    if (sections[secIdx].occupied < sections[secIdx].capacity) {
        Attendee dequeuedPerson = waitingQueue[targetPos];

        // Shift remaining queue elements to maintain circular array FIFO order
        for (int j = matchRelativeIdx; j < queueCount - 1; ++j) {
            int cur = (queueFront + j) % MAX_QUEUE;
            int nxt = (queueFront + j + 1) % MAX_QUEUE;
            waitingQueue[cur] = waitingQueue[nxt];
        }
        queueCount--;
        if (queueCount == 0) {
            queueFront = 0;
            queueRear = -1;
        } else {
            queueRear = (queueFront + queueCount - 1) % MAX_QUEUE;
        }
        dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);

        int attIdx = findAttendeeById(attendees, attendeeCount, dequeuedPerson.id);
        if (attIdx != -1) {
            attendees[attIdx].status = "ADMITTED";
            dbUpdateAttendee(attendees[attIdx]);
            dequeuedPerson = attendees[attIdx];
        }

        sections[secIdx].occupied++;
        dbUpdateSection(sections[secIdx]);
        autoAllocateResourceForEvent(dequeuedPerson.eventId);

        logActivity(activities, activityCount, dequeuedPerson.eventId, dequeuedPerson.name + " admitted to " + dequeuedPerson.section + " from FIFO queue (Resource auto-allocated).");

        outAdmitted = dequeuedPerson;
        outMessage = dequeuedPerson.name + " was successfully admitted to " + dequeuedPerson.section + ".";
        return true;
    } else {
        outMessage = "Cannot admit next attendee. " + frontPerson.name + " is #1 in FIFO waiting for '" + 
                     frontPerson.section + "', which is currently full (" + 
                     std::to_string(sections[secIdx].occupied) + "/" + std::to_string(sections[secIdx].capacity) + 
                     "). Attendees cannot be skipped out of FIFO order.";
        return false;
    }
}

bool cancelAttendeeRegistration(int attendeeId, std::string& outMessage) {
    int idx = findAttendeeById(attendees, attendeeCount, attendeeId);
    if (idx == -1) {
        outMessage = "Attendee not found.";
        return false;
    }

    if (attendees[idx].status == "WAITING") {
        outMessage = "Waiting attendees cannot be cancelled directly. The waiting list is strictly FIFO.";
        return false;
    }

    if (attendees[idx].status == "CANCELLED") {
        outMessage = "Attendee registration is already cancelled.";
        return false;
    }

    if (attendees[idx].status == "ADMITTED") {
        attendees[idx].status = "CANCELLED";
        dbUpdateAttendee(attendees[idx]);

        int secIdx = findSectionByName(sections, sectionCount, attendees[idx].eventId, attendees[idx].section);
        if (secIdx != -1 && sections[secIdx].occupied > 0) {
            sections[secIdx].occupied--;
            dbUpdateSection(sections[secIdx]);
        }
        autoReleaseResourceForEvent(attendees[idx].eventId);

        logActivity(activities, activityCount, attendees[idx].eventId, "Registration for " + attendees[idx].name + " was cancelled (Resource auto-released).");
        outMessage = "Registration for " + attendees[idx].name + " was cancelled. Section capacity and resource unit released.";
        return true;
    }

    outMessage = "Invalid status transition.";
    return false;
}

bool deleteAttendeeRecord(int attendeeId, std::string& outMessage) {
    int idx = findAttendeeById(attendees, attendeeCount, attendeeId);
    if (idx == -1) {
        outMessage = "Attendee not found.";
        return false;
    }

    if (attendees[idx].status == "WAITING") {
        outMessage = "The waiting list is strictly FIFO. Waiting attendees must be processed through the queue and cannot be removed.";
        return false;
    }

    std::string name = attendees[idx].name;
    int evId = attendees[idx].eventId;
    std::string sec = attendees[idx].section;
    std::string stat = attendees[idx].status;

    if (stat == "ADMITTED") {
        int secIdx = findSectionByName(sections, sectionCount, evId, sec);
        if (secIdx != -1 && sections[secIdx].occupied > 0) {
            sections[secIdx].occupied--;
            dbUpdateSection(sections[secIdx]);
        }
        autoReleaseResourceForEvent(evId);
    }

    dbDeleteAttendee(attendeeId);
    removeAttendeeFromArray(attendees, attendeeCount, idx);

    logActivity(activities, activityCount, evId, "Attendee record for " + name + " was permanently removed (Resource auto-released).");
    outMessage = "Attendee " + name + " was removed.";
    return true;
}

bool updateAttendeeDetails(int attendeeId, const std::string& name, const std::string& email, const std::string& phone, std::string& outMessage) {
    int idx = findAttendeeById(attendees, attendeeCount, attendeeId);
    if (idx == -1) {
        outMessage = "Attendee not found.";
        return false;
    }

    if (attendees[idx].status == "WAITING") {
        outMessage = "Waiting attendees cannot be edited to preserve FIFO queue integrity.";
        return false;
    }

    if (name.empty() || email.empty() || phone.empty()) {
        outMessage = "Name, email, and phone cannot be empty.";
        return false;
    }

    attendees[idx].name = name;
    attendees[idx].email = email;
    attendees[idx].phone = phone;

    dbUpdateAttendee(attendees[idx]);
    logActivity(activities, activityCount, attendees[idx].eventId, "Updated contact details for " + name + ".");

    outMessage = "Attendee details updated successfully.";
    return true;
}

bool deleteEventCascade(int eventId, std::string& outMessage) {
    int evIdx = findEventById(events, eventCount, eventId);
    if (evIdx == -1) {
        outMessage = "Event not found.";
        return false;
    }

    std::string title = events[evIdx].title;

    // 1. Remove waiting attendees for this event from circular FIFO queue
    Attendee tempQueue[MAX_QUEUE];
    int tempCount = 0;
    for (int i = 0; i < queueCount; ++i) {
        int qIdx = (queueFront + i) % MAX_QUEUE;
        if (waitingQueue[qIdx].eventId != eventId) {
            tempQueue[tempCount++] = waitingQueue[qIdx];
        }
    }
    queueCount = tempCount;
    queueFront = 0;
    queueRear = (queueCount > 0) ? queueCount - 1 : -1;
    for (int i = 0; i < queueCount; ++i) {
        waitingQueue[i] = tempQueue[i];
    }
    dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);

    // 2. Remove attendees for this event from 1D attendees array
    for (int i = attendeeCount - 1; i >= 0; --i) {
        if (attendees[i].eventId == eventId) {
            removeAttendeeFromArray(attendees, attendeeCount, i);
        }
    }

    // 3. Remove sections for this event from 1D sections array
    for (int i = sectionCount - 1; i >= 0; --i) {
        if (sections[i].eventId == eventId) {
            removeSectionFromArray(sections, sectionCount, i);
        }
    }

    // 4. Remove resources for this event from 1D resources array
    for (int i = resourceCount - 1; i >= 0; --i) {
        if (resources[i].eventId == eventId) {
            removeResourceFromArray(resources, resourceCount, i);
        }
    }

    // 5. Remove activities for this event from 1D activities array
    for (int i = activityCount - 1; i >= 0; --i) {
        if (activities[i].eventId == eventId) {
            for (int j = i; j < activityCount - 1; ++j) {
                activities[j] = activities[j + 1];
            }
            activityCount--;
        }
    }

    // 6. Remove event from 1D events array
    removeEventFromArray(events, eventCount, evIdx);

    // 7. Persist deletion in SQLite database
    dbDeleteEvent(eventId);

    outMessage = "Event '" + title + "' and all associated tracks, registrations, and resources have been successfully removed.";
    return true;
}

// ==============================================================================
// 7. JSON / API SERIALIZATION HELPERS
// ==============================================================================

json eventToJson(const Event& e) {
    json j;
    j["id"] = e.id;
    j["title"] = e.title;
    j["tagline"] = e.tagline;
    j["description"] = e.description;
    j["date"] = e.date;
    j["venue"] = e.venue;
    j["category"] = e.category;
    j["status"] = e.status;
    j["imageUrl"] = e.imageUrl;

    int cap = 0;
    int occ = 0;
    int trackCount = 0;
    for (int i = 0; i < sectionCount; ++i) {
        if (sections[i].eventId == e.id) {
            cap += sections[i].capacity;
            occ += sections[i].occupied;
            trackCount++;
        }
    }
    j["totalCapacity"] = cap;
    j["totalOccupied"] = occ;
    j["tracksCount"] = trackCount;
    j["occupancyPercentage"] = (cap > 0) ? static_cast<int>(static_cast<double>(occ) / cap * 100.0) : 0;
    return j;
}

json attendeeToJson(const Attendee& a) {
    json j;
    j["id"] = a.id;
    j["eventId"] = a.eventId;
    j["registrationId"] = "EVT-" + std::to_string(a.id + 1000);
    j["name"] = a.name;
    j["email"] = a.email;
    j["phone"] = a.phone;
    j["section"] = a.section;
    j["status"] = a.status;
    j["registeredAt"] = a.registeredAt;
    if (a.status == "WAITING") {
        j["waitingPosition"] = getWaitingPosition(a.id);
    } else {
        j["waitingPosition"] = nullptr;
    }

    int evIdx = findEventById(events, eventCount, a.eventId);
    if (evIdx != -1) {
        j["eventTitle"] = events[evIdx].title;
    } else {
        j["eventTitle"] = "TechVerse 2026";
    }

    return j;
}

json sectionToJson(const Section& s) {
    json j;
    j["id"] = s.id;
    j["eventId"] = s.eventId;
    j["name"] = s.name;
    j["capacity"] = s.capacity;
    j["occupied"] = s.occupied;
    j["available"] = (s.capacity >= s.occupied) ? (s.capacity - s.occupied) : 0;
    
    double occPct = (s.capacity > 0) ? (static_cast<double>(s.occupied) / s.capacity * 100.0) : 0.0;
    j["occupancyPercentage"] = static_cast<int>(occPct);

    if (s.occupied >= s.capacity) {
        j["status"] = "FULL";
        j["statusLabel"] = "Full";
    } else if (occPct >= 75.0) {
        j["status"] = "FILLING_FAST";
        j["statusLabel"] = "Almost Full";
    } else {
        j["status"] = "OPEN";
        j["statusLabel"] = "Available";
    }
    return j;
}

json resourceToJson(const Resource& r) {
    json j;
    j["id"] = r.id;
    j["eventId"] = r.eventId;
    j["name"] = r.name;
    j["category"] = r.category;
    j["total"] = r.total;
    j["allocated"] = r.allocated;
    j["available"] = (r.total >= r.allocated) ? (r.total - r.allocated) : 0;
    return j;
}

json activityToJson(const Activity& act) {
    json j;
    j["id"] = act.id;
    j["eventId"] = act.eventId;
    j["message"] = act.message;
    j["createdAt"] = act.createdAt;
    return j;
}

void sendJsonResponse(httplib::Response& res, int statusCode, bool success, const std::string& message, const json& data = json()) {
    json responseBody;
    responseBody["success"] = success;
    responseBody["message"] = message;
    if (!data.is_null()) {
        responseBody["data"] = data;
    }
    res.status = statusCode;
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set_content(responseBody.dump(), "application/json");
}

// ==============================================================================
// 8. HTTP ROUTES AND API HANDLERS
// ==============================================================================

void registerRoutes(httplib::Server& svr) {
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type, Authorization"}
    });

    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 200;
    });

    // --------------------------------------------------------------------------
    // EVENTS APIS (Multi-Event Platform)
    // --------------------------------------------------------------------------

    // GET /api/events
    svr.Get("/api/events", [](const httplib::Request&, httplib::Response& res) {
        json arr = json::array();
        for (int i = 0; i < eventCount; ++i) {
            arr.push_back(eventToJson(events[i]));
        }
        sendJsonResponse(res, 200, true, "Events retrieved", arr);
    });

    // POST /api/events
    svr.Post("/api/events", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string title = body.value("title", "");
            std::string tagline = body.value("tagline", "");
            std::string description = body.value("description", "");
            std::string date = body.value("date", "");
            std::string venue = body.value("venue", "");
            std::string category = body.value("category", "General");
            std::string imageUrl = body.value("imageUrl", "");
            int capacity = body.value("capacity", 0);
            if (capacity <= 0 && body.contains("quantity")) {
                capacity = body.value("quantity", 0);
            }
            if (capacity <= 0) capacity = 50;

            if (title.empty() || date.empty() || venue.empty()) {
                sendJsonResponse(res, 400, false, "Title, date, and venue/place are required.");
                return;
            }

            Event e;
            e.title = title;
            e.tagline = tagline.empty() ? "Innovative conference & workshops." : tagline;
            e.description = description;
            e.date = date;
            e.venue = venue;
            e.category = category;
            e.status = "ACTIVE";
            e.imageUrl = imageUrl;

            if (!dbInsertEvent(e)) {
                sendJsonResponse(res, 500, false, "Database error saving event.");
                return;
            }

            addEventToArray(events, eventCount, e);

            // Create place section for new event with specified capacity quantity
            Section s;
            s.eventId = e.id;
            s.name = venue;
            s.capacity = capacity;
            s.occupied = 0;
            if (dbInsertSection(s)) {
                addSectionToArray(sections, sectionCount, s);
            }

            // Create initial resource for this event (auto-assigned to attendees)
            std::string resName = body.value("resourceName", "");
            if (resName.empty()) {
                resName = title + " - VIP Badges & Kits";
            }
            int resQty = body.value("resourceQuantity", capacity);
            if (resQty <= 0) resQty = capacity;

            Resource r;
            r.eventId = e.id;
            r.name = resName;
            r.category = "Badging & Supplies";
            r.total = resQty;
            r.allocated = 0;
            if (dbInsertResource(r)) {
                addResourceToArray(resources, resourceCount, r);
            }

            logActivity(activities, activityCount, e.id, "Event '" + title + "' created at " + venue + 
                        " (Capacity: " + std::to_string(capacity) + ", Resource: " + resName + " [" + std::to_string(resQty) + "]).");

            sendJsonResponse(res, 201, true, "Event created successfully.", eventToJson(e));
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON in create event request.");
        }
    });

    // GET /api/events/:id (also /api/event compatibility)
    svr.Get(R"(/api/events/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findEventById(events, eventCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Event not found.");
            return;
        }
        sendJsonResponse(res, 200, true, "Event details", eventToJson(events[idx]));
    });

    svr.Get("/api/event", [](const httplib::Request& req, httplib::Response& res) {
        int evId = req.has_param("id") ? std::stoi(req.get_param_value("id")) : 1;
        int idx = findEventById(events, eventCount, evId);
        if (idx == -1 && eventCount > 0) idx = 0;
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "No events available.");
            return;
        }
        sendJsonResponse(res, 200, true, "Event details", eventToJson(events[idx]));
    });

    // PUT /api/events/:id (Edit Event & Add Seats/Capacity)
    svr.Put(R"(/api/events/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findEventById(events, eventCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Event not found.");
            return;
        }

        try {
            auto body = json::parse(req.body);
            std::string title = body.value("title", events[idx].title);
            std::string tagline = body.value("tagline", events[idx].tagline);
            std::string description = body.value("description", events[idx].description);
            std::string date = body.value("date", events[idx].date);
            std::string venue = body.value("venue", events[idx].venue);
            std::string category = body.value("category", events[idx].category);
            std::string imageUrl = body.value("imageUrl", events[idx].imageUrl);

            events[idx].title = title;
            events[idx].tagline = tagline;
            events[idx].description = description;
            events[idx].date = date;
            events[idx].venue = venue;
            events[idx].category = category;
            events[idx].imageUrl = imageUrl;
            dbUpdateEvent(events[idx]);

            int autoAdmittedCount = 0;
            std::string autoAdmittedNames = "";

            // Handle seat capacity update if provided
            if (body.contains("capacity") || body.contains("quantity")) {
                int newCap = body.contains("capacity") ? body.value("capacity", 0) : body.value("quantity", 0);
                if (newCap > 0) {
                    // Find matching section for this event
                    int secIdx = -1;
                    for (int s = 0; s < sectionCount; ++s) {
                        if (sections[s].eventId == id) {
                            secIdx = s;
                            break;
                        }
                    }

                    if (secIdx != -1) {
                        if (newCap < sections[secIdx].occupied) {
                            sendJsonResponse(res, 400, false, "Capacity (" + std::to_string(newCap) + 
                                             ") cannot be less than current occupied seats (" + 
                                             std::to_string(sections[secIdx].occupied) + ").");
                            return;
                        }

                        int oldCap = sections[secIdx].capacity;
                        sections[secIdx].capacity = newCap;
                        if (!venue.empty()) {
                            sections[secIdx].name = venue;
                        }
                        dbUpdateSection(sections[secIdx]);

                        // Auto-admit waiting attendees if seats were added
                        if (newCap > oldCap) {
                            while (sections[secIdx].occupied < sections[secIdx].capacity && !isQueueEmpty()) {
                                int matchRelativeIdx = -1;
                                for (int i = 0; i < queueCount; ++i) {
                                    int qIdx = (queueFront + i) % MAX_QUEUE;
                                    if (waitingQueue[qIdx].eventId == id) {
                                        matchRelativeIdx = i;
                                        break;
                                    }
                                }

                                if (matchRelativeIdx == -1) break;

                                int targetPos = (queueFront + matchRelativeIdx) % MAX_QUEUE;
                                Attendee admitted = waitingQueue[targetPos];

                                for (int j = matchRelativeIdx; j < queueCount - 1; ++j) {
                                    int cur = (queueFront + j) % MAX_QUEUE;
                                    int nxt = (queueFront + j + 1) % MAX_QUEUE;
                                    waitingQueue[cur] = waitingQueue[nxt];
                                }
                                queueCount--;
                                if (queueCount == 0) {
                                    queueFront = 0;
                                    queueRear = -1;
                                } else {
                                    queueRear = (queueFront + queueCount - 1) % MAX_QUEUE;
                                }
                                dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);

                                admitted.status = "ADMITTED";
                                int attIdx = findAttendeeById(attendees, attendeeCount, admitted.id);
                                if (attIdx != -1) {
                                    attendees[attIdx].status = "ADMITTED";
                                }
                                sections[secIdx].occupied++;
                                dbUpdateAttendee(admitted);
                                dbUpdateSection(sections[secIdx]);

                                autoAdmittedCount++;
                                if (!autoAdmittedNames.empty()) autoAdmittedNames += ", ";
                                autoAdmittedNames += admitted.name;

                                logActivity(activities, activityCount, id, 
                                            "Seat added (+1): " + admitted.name + " (first waiting in FIFO queue) was automatically admitted.");
                            }
                        }
                    }
                }
            }

            std::string msg = "Event updated successfully.";
            if (autoAdmittedCount > 0) {
                msg += " Added seats automatically admitted " + std::to_string(autoAdmittedCount) + 
                       " waiting attendee(s): " + autoAdmittedNames + ".";
            }

            logActivity(activities, activityCount, id, "Event '" + title + "' details and seating configuration were updated.");
            sendJsonResponse(res, 200, true, msg, eventToJson(events[idx]));
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON in update event request.");
        }
    });

    // DELETE /api/events/:id
    svr.Delete(R"(/api/events/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        std::string msg;
        if (!deleteEventCascade(id, msg)) {
            sendJsonResponse(res, 404, false, msg);
            return;
        }
        sendJsonResponse(res, 200, true, msg);
    });

    // --------------------------------------------------------------------------
    // SECTIONS APIS
    // --------------------------------------------------------------------------

    // GET /api/sections/public
    svr.Get("/api/sections/public", [](const httplib::Request& req, httplib::Response& res) {
        int evId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        json arr = json::array();
        for (int i = 0; i < sectionCount; ++i) {
            if (evId == 0 || sections[i].eventId == evId) {
                arr.push_back(sectionToJson(sections[i]));
            }
        }
        sendJsonResponse(res, 200, true, "Public section list", arr);
    });

    // GET /api/sections
    svr.Get("/api/sections", [](const httplib::Request& req, httplib::Response& res) {
        int evId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        json arr = json::array();
        for (int i = 0; i < sectionCount; ++i) {
            if (evId == 0 || sections[i].eventId == evId) {
                arr.push_back(sectionToJson(sections[i]));
            }
        }
        sendJsonResponse(res, 200, true, "Sections list", arr);
    });

    // POST /api/sections
    svr.Post("/api/sections", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int eventId = body.value("eventId", 1);
            std::string name = body.value("name", "");
            int capacity = body.value("capacity", 0);

            if (name.empty() || capacity <= 0) {
                sendJsonResponse(res, 400, false, "Section name cannot be empty and capacity must be > 0.");
                return;
            }

            if (findSectionByName(sections, sectionCount, eventId, name) != -1) {
                sendJsonResponse(res, 400, false, "Section with name '" + name + "' already exists in this event.");
                return;
            }

            Section s;
            s.eventId = eventId;
            s.name = name;
            s.capacity = capacity;
            s.occupied = 0;

            if (!dbInsertSection(s)) {
                sendJsonResponse(res, 500, false, "Database error saving section.");
                return;
            }

            addSectionToArray(sections, sectionCount, s);
            logActivity(activities, activityCount, eventId, "Created section '" + name + "' with capacity " + std::to_string(capacity) + ".");

            sendJsonResponse(res, 201, true, "Section created successfully.", sectionToJson(s));
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON payload.");
        }
    });

    // PUT /api/sections/:id
    svr.Put(R"(/api/sections/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findSectionById(sections, sectionCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Section not found.");
            return;
        }

        try {
            auto body = json::parse(req.body);
            std::string newName = body.value("name", "");
            int newCapacity = body.value("capacity", sections[idx].capacity);

            if (newCapacity < sections[idx].occupied) {
                sendJsonResponse(res, 400, false, "New capacity (" + std::to_string(newCapacity) + 
                                 ") cannot be less than current occupied seats (" + 
                                 std::to_string(sections[idx].occupied) + ").");
                return;
            }

            if (!newName.empty()) {
                sections[idx].name = newName;
            }

            int oldCap = sections[idx].capacity;
            sections[idx].capacity = newCapacity;
            dbUpdateSection(sections[idx]);

            int autoAdmittedCount = 0;
            std::string autoAdmittedNames = "";

            // If capacity increased, automatically admit the first waiting attendee(s) in FIFO order for this section
            if (newCapacity > oldCap) {
                while (sections[idx].occupied < sections[idx].capacity && !isQueueEmpty()) {
                    int matchRelativeIdx = -1;
                    for (int i = 0; i < queueCount; ++i) {
                        int qIdx = (queueFront + i) % MAX_QUEUE;
                        if (waitingQueue[qIdx].eventId == sections[idx].eventId && 
                            stringEqualsIgnoreCase(waitingQueue[qIdx].section, sections[idx].name)) {
                            matchRelativeIdx = i;
                            break; // First person in FIFO order for this section
                        }
                    }

                    if (matchRelativeIdx == -1) {
                        break; // No one in FIFO waiting for this section
                    }

                    int targetPos = (queueFront + matchRelativeIdx) % MAX_QUEUE;
                    Attendee admitted = waitingQueue[targetPos];

                    // Shift remaining queue elements to maintain circular array FIFO order
                    for (int j = matchRelativeIdx; j < queueCount - 1; ++j) {
                        int cur = (queueFront + j) % MAX_QUEUE;
                        int nxt = (queueFront + j + 1) % MAX_QUEUE;
                        waitingQueue[cur] = waitingQueue[nxt];
                    }
                    queueCount--;
                    if (queueCount == 0) {
                        queueFront = 0;
                        queueRear = -1;
                    } else {
                        queueRear = (queueFront + queueCount - 1) % MAX_QUEUE;
                    }
                    dbSaveQueue(waitingQueue, queueFront, queueCount, MAX_QUEUE);

                    admitted.status = "ADMITTED";
                    int attIdx = findAttendeeById(attendees, attendeeCount, admitted.id);
                    if (attIdx != -1) {
                        attendees[attIdx].status = "ADMITTED";
                    }
                    sections[idx].occupied++;
                    dbUpdateAttendee(admitted);
                    dbUpdateSection(sections[idx]);

                    logActivity(activities, activityCount, admitted.eventId, 
                                "Capacity expanded (+1): " + admitted.name + " (first waiting in FIFO queue) was admitted to " + admitted.section + ".");

                    if (autoAdmittedCount > 0) autoAdmittedNames += ", ";
                    autoAdmittedNames += admitted.name;
                    autoAdmittedCount++;
                }
            }

            std::string logMsg = "Updated capacity of section '" + sections[idx].name + "' to " + std::to_string(newCapacity) + ".";
            if (autoAdmittedCount > 0) {
                logMsg += " Auto-admitted " + autoAdmittedNames + " from front of FIFO queue.";
            }
            logActivity(activities, activityCount, sections[idx].eventId, logMsg);

            json resData = sectionToJson(sections[idx]);
            resData["autoAdmittedCount"] = autoAdmittedCount;
            resData["autoAdmittedNames"] = autoAdmittedNames;

            std::string userMsg = "Section capacity updated to " + std::to_string(newCapacity) + ".";
            if (autoAdmittedCount > 0) {
                userMsg += " Automatically admitted first person in FIFO queue: " + autoAdmittedNames + ".";
            }

            sendJsonResponse(res, 200, true, userMsg, resData);
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON payload.");
        }
    });

    // DELETE /api/sections/:id
    svr.Delete(R"(/api/sections/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findSectionById(sections, sectionCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Section not found.");
            return;
        }

        if (sections[idx].occupied > 0) {
            sendJsonResponse(res, 400, false, "Cannot delete section '" + sections[idx].name + "' because it has " + std::to_string(sections[idx].occupied) + " active admitted attendees.");
            return;
        }

        for (int i = 0; i < queueCount; ++i) {
            int qIdx = (queueFront + i) % MAX_QUEUE;
            if (waitingQueue[qIdx].eventId == sections[idx].eventId && stringEqualsIgnoreCase(waitingQueue[qIdx].section, sections[idx].name)) {
                sendJsonResponse(res, 400, false, "Cannot delete section '" + sections[idx].name + "' because attendees in FIFO queue are waiting for it.");
                return;
            }
        }

        std::string secName = sections[idx].name;
        int evId = sections[idx].eventId;
        dbDeleteSection(id);
        removeSectionFromArray(sections, sectionCount, idx);

        logActivity(activities, activityCount, evId, "Section '" + secName + "' was deleted.");
        sendJsonResponse(res, 200, true, "Section deleted successfully.");
    });

    // --------------------------------------------------------------------------
    // REGISTRATIONS & ATTENDEES APIS
    // --------------------------------------------------------------------------

    // POST /api/registrations
    svr.Post("/api/registrations", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int eventId = body.value("eventId", 1);
            std::string name = body.value("name", "");
            std::string email = body.value("email", "");
            std::string phone = body.value("phone", "");
            std::string section = body.value("section", "");

            Attendee result;
            int waitPos = 0;
            std::string msg;

            bool ok = processRegistration(eventId, name, email, phone, section, result, waitPos, msg);
            if (ok) {
                sendJsonResponse(res, 201, true, msg, attendeeToJson(result));
            } else {
                sendJsonResponse(res, 400, false, msg);
            }
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON payload in registration request.");
        }
    });

    // GET /api/registrations/:id
    svr.Get(R"(/api/registrations/([^/]+))", [](const httplib::Request& req, httplib::Response& res) {
        std::string param = req.matches[1];
        int attendeeId = -1;

        if (param.rfind("EVT-", 0) == 0) {
            try {
                attendeeId = std::stoi(param.substr(4)) - 1000;
            } catch (...) { attendeeId = -1; }
        } else {
            try {
                attendeeId = std::stoi(param);
            } catch (...) { attendeeId = -1; }
        }

        int idx = -1;
        if (attendeeId > 0) {
            idx = findAttendeeById(attendees, attendeeCount, attendeeId);
        }

        if (idx == -1) {
            idx = findAttendeeByEmail(attendees, attendeeCount, 0, param);
        }

        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Registration not found with provided ID or Email.");
            return;
        }

        sendJsonResponse(res, 200, true, "Registration details found", attendeeToJson(attendees[idx]));
    });

    // GET /api/attendees
    svr.Get("/api/attendees", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        std::string search = req.has_param("search") ? req.get_param_value("search") : "";
        std::string status = req.has_param("status") ? req.get_param_value("status") : "";
        std::string section = req.has_param("section") ? req.get_param_value("section") : "";

        json arr = json::array();
        for (int i = 0; i < attendeeCount; ++i) {
            const Attendee& a = attendees[i];

            if (eventId > 0 && a.eventId != eventId) continue;

            std::string regId = "EVT-" + std::to_string(a.id + 1000);
            if (!search.empty()) {
                bool matchName = stringContainsIgnoreCase(a.name, search);
                bool matchEmail = stringContainsIgnoreCase(a.email, search);
                bool matchRegId = stringContainsIgnoreCase(regId, search);
                if (!matchName && !matchEmail && !matchRegId) continue;
            }

            if (!status.empty() && status != "ALL") {
                if (!stringEqualsIgnoreCase(a.status, status)) continue;
            }

            if (!section.empty() && section != "ALL") {
                if (!stringEqualsIgnoreCase(a.section, section)) continue;
            }

            arr.push_back(attendeeToJson(a));
        }

        sendJsonResponse(res, 200, true, "Attendees retrieved", arr);
    });

    // PUT /api/attendees/:id
    svr.Put(R"(/api/attendees/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        try {
            int idx = findAttendeeById(attendees, attendeeCount, id);
            if (idx == -1) {
                sendJsonResponse(res, 404, false, "Attendee not found.");
                return;
            }

            auto body = json::parse(req.body);
            std::string name = body.value("name", attendees[idx].name);
            std::string email = body.value("email", attendees[idx].email);
            std::string phone = body.value("phone", attendees[idx].phone);

            std::string msg;
            if (updateAttendeeDetails(id, name, email, phone, msg)) {
                sendJsonResponse(res, 200, true, msg, attendeeToJson(attendees[idx]));
            } else {
                sendJsonResponse(res, 400, false, msg);
            }
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON in attendee update.");
        }
    });

    // POST /api/attendees/:id/cancel
    svr.Post(R"(/api/attendees/(\d+)/cancel)", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        std::string msg;
        if (cancelAttendeeRegistration(id, msg)) {
            sendJsonResponse(res, 200, true, msg);
        } else {
            sendJsonResponse(res, 400, false, msg);
        }
    });

    // DELETE /api/attendees/:id
    svr.Delete(R"(/api/attendees/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        std::string msg;
        if (deleteAttendeeRecord(id, msg)) {
            sendJsonResponse(res, 200, true, msg);
        } else {
            sendJsonResponse(res, 400, false, msg);
        }
    });

    // --------------------------------------------------------------------------
    // FIFO QUEUE APIS
    // --------------------------------------------------------------------------

    // GET /api/queue
    svr.Get("/api/queue", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        json queueData;
        queueData["count"] = queueCount;
        queueData["maxQueue"] = MAX_QUEUE;
        queueData["isEmpty"] = isQueueEmpty();
        queueData["isFull"] = isQueueFull();

        json queueList = json::array();
        int matchedCount = 0;
        for (int i = 0; i < queueCount; ++i) {
            int idx = (queueFront + i) % MAX_QUEUE;
            if (eventId == 0 || waitingQueue[idx].eventId == eventId) {
                json item = attendeeToJson(waitingQueue[idx]);
                item["waitingPosition"] = i + 1;

                int secIdx = findSectionByName(sections, sectionCount, waitingQueue[idx].eventId, waitingQueue[idx].section);
                if (secIdx != -1) {
                    item["sectionCapacity"] = sections[secIdx].capacity;
                    item["sectionOccupied"] = sections[secIdx].occupied;
                    item["sectionAvailable"] = sections[secIdx].capacity - sections[secIdx].occupied;
                    item["sectionHasSpace"] = (sections[secIdx].occupied < sections[secIdx].capacity);
                }
                queueList.push_back(item);
                matchedCount++;
            }
        }
        queueData["items"] = queueList;
        queueData["eventQueueCount"] = matchedCount;

        int firstMatchIdx = -1;
        for (int i = 0; i < queueCount; ++i) {
            int idx = (queueFront + i) % MAX_QUEUE;
            if (eventId == 0 || waitingQueue[idx].eventId == eventId) {
                firstMatchIdx = idx;
                break;
            }
        }

        if (firstMatchIdx != -1) {
            Attendee frontPerson = waitingQueue[firstMatchIdx];
            json fJson = attendeeToJson(frontPerson);
            fJson["waitingPosition"] = 1;
            int secIdx = findSectionByName(sections, sectionCount, frontPerson.eventId, frontPerson.section);
            if (secIdx != -1) {
                fJson["sectionAvailable"] = sections[secIdx].capacity - sections[secIdx].occupied;
                fJson["canBeAdmitted"] = (sections[secIdx].occupied < sections[secIdx].capacity);
            }
            queueData["front"] = fJson;
        } else {
            queueData["front"] = nullptr;
        }

        sendJsonResponse(res, 200, true, "FIFO Queue status retrieved", queueData);
    });

    // POST /api/queue/admit-next
    svr.Post("/api/queue/admit-next", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        bool openSeat = false;
        if (req.has_param("openSeat")) {
            std::string osVal = req.get_param_value("openSeat");
            if (osVal == "true" || osVal == "1") openSeat = true;
        }
        if (!openSeat && !req.body.empty()) {
            try {
                auto body = json::parse(req.body);
                if (body.contains("openSeat")) {
                    if (body["openSeat"].is_boolean()) {
                        openSeat = body["openSeat"].get<bool>();
                    } else if (body["openSeat"].is_number()) {
                        openSeat = (body["openSeat"].get<int>() != 0);
                    } else if (body["openSeat"].is_string()) {
                        std::string s = body["openSeat"].get<std::string>();
                        openSeat = (s == "true" || s == "1");
                    }
                }
            } catch (...) {}
        }

        Attendee admitted;
        std::string msg;
        if (admitNextAttendee(eventId, admitted, msg, openSeat)) {
            sendJsonResponse(res, 200, true, msg, attendeeToJson(admitted));
        } else {
            sendJsonResponse(res, 400, false, msg);
        }
    });

    // --------------------------------------------------------------------------
    // DASHBOARD & SUMMARY APIS
    // --------------------------------------------------------------------------

    // GET /api/dashboard
    svr.Get("/api/dashboard", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 1;

        int total = 0;
        int admitted = 0;
        int waiting = 0;
        int cancelled = 0;

        for (int i = 0; i < attendeeCount; ++i) {
            if (eventId == 0 || attendees[i].eventId == eventId) {
                total++;
                if (attendees[i].status == "ADMITTED") admitted++;
                else if (attendees[i].status == "WAITING") waiting++;
                else if (attendees[i].status == "CANCELLED") cancelled++;
            }
        }

        json stats;
        stats["totalRegistrations"] = total;
        stats["admitted"] = admitted;
        stats["waiting"] = waiting;
        stats["cancelled"] = cancelled;

        // Sections
        json secArr = json::array();
        int totalCap = 0;
        int totalOcc = 0;
        for (int i = 0; i < sectionCount; ++i) {
            if (eventId == 0 || sections[i].eventId == eventId) {
                secArr.push_back(sectionToJson(sections[i]));
                totalCap += sections[i].capacity;
                totalOcc += sections[i].occupied;
            }
        }
        stats["sections"] = secArr;
        stats["totalCapacity"] = totalCap;
        stats["totalOccupied"] = totalOcc;
        stats["overallUtilization"] = (totalCap > 0) ? static_cast<int>(static_cast<double>(totalOcc) / totalCap * 100.0) : 0;

        // Queue Snapshot
        json queueSnapshot;
        queueSnapshot["queueCount"] = queueCount;
        queueSnapshot["isQueueEmpty"] = isQueueEmpty();

        int firstMatchIdx = -1;
        for (int i = 0; i < queueCount; ++i) {
            int idx = (queueFront + i) % MAX_QUEUE;
            if (eventId == 0 || waitingQueue[idx].eventId == eventId) {
                firstMatchIdx = idx;
                break;
            }
        }

        if (firstMatchIdx != -1) {
            Attendee frontPerson = waitingQueue[firstMatchIdx];
            queueSnapshot["frontAttendee"] = attendeeToJson(frontPerson);

            int secIdx = findSectionByName(sections, sectionCount, frontPerson.eventId, frontPerson.section);
            bool canAdmit = (secIdx != -1 && sections[secIdx].occupied < sections[secIdx].capacity);
            queueSnapshot["canAdmitFront"] = canAdmit;
            queueSnapshot["frontSectionAvailable"] = (secIdx != -1) ? (sections[secIdx].capacity - sections[secIdx].occupied) : 0;
        } else {
            queueSnapshot["frontAttendee"] = nullptr;
            queueSnapshot["canAdmitFront"] = false;
            queueSnapshot["frontSectionAvailable"] = 0;
        }

        json topQueue = json::array();
        int previewCount = 0;
        for (int i = 0; i < queueCount && previewCount < 5; ++i) {
            int idx = (queueFront + i) % MAX_QUEUE;
            if (eventId == 0 || waitingQueue[idx].eventId == eventId) {
                json qItem = attendeeToJson(waitingQueue[idx]);
                qItem["waitingPosition"] = i + 1;
                topQueue.push_back(qItem);
                previewCount++;
            }
        }
        queueSnapshot["preview"] = topQueue;
        stats["queueSnapshot"] = queueSnapshot;

        // Resources
        json resArr = json::array();
        int totalRes = 0;
        int allocRes = 0;
        for (int i = 0; i < resourceCount; ++i) {
            if (eventId == 0 || resources[i].eventId == eventId) {
                resArr.push_back(resourceToJson(resources[i]));
                totalRes += resources[i].total;
                allocRes += resources[i].allocated;
            }
        }
        stats["resources"] = resArr;
        stats["totalResources"] = totalRes;
        stats["resourcesAllocated"] = allocRes;
        stats["resourcesAvailable"] = (totalRes >= allocRes) ? (totalRes - allocRes) : 0;

        // Attendees for live event management
        json attArr = json::array();
        for (int i = 0; i < attendeeCount; ++i) {
            if (eventId == 0 || attendees[i].eventId == eventId) {
                attArr.push_back(attendeeToJson(attendees[i]));
            }
        }
        stats["attendees"] = attArr;

        // All Events summary
        json evArr = json::array();
        for (int i = 0; i < eventCount; ++i) {
            evArr.push_back(eventToJson(events[i]));
        }
        stats["events"] = evArr;

        // Recent Activities
        json actArr = json::array();
        int actLimit = 0;
        for (int i = 0; i < activityCount && actLimit < 12; ++i) {
            if (eventId == 0 || activities[i].eventId == eventId) {
                actArr.push_back(activityToJson(activities[i]));
                actLimit++;
            }
        }
        stats["activities"] = actArr;

        sendJsonResponse(res, 200, true, "Dashboard operations summary", stats);
    });

    // --------------------------------------------------------------------------
    // RESOURCES APIS
    // --------------------------------------------------------------------------

    // GET /api/resources
    svr.Get("/api/resources", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        json arr = json::array();
        for (int i = 0; i < resourceCount; ++i) {
            if (eventId == 0 || resources[i].eventId == eventId) {
                arr.push_back(resourceToJson(resources[i]));
            }
        }
        sendJsonResponse(res, 200, true, "Resources list", arr);
    });

    // POST /api/resources
    svr.Post("/api/resources", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            int eventId = body.value("eventId", 1);
            std::string name = body.value("name", "");
            std::string category = body.value("category", "General");
            int total = body.value("total", 0);

            if (name.empty() || total < 0) {
                sendJsonResponse(res, 400, false, "Resource name required and total must be >= 0.");
                return;
            }

            Resource r;
            r.eventId = eventId;
            r.name = name;
            r.category = category;
            r.total = total;
            r.allocated = 0;

            if (!dbInsertResource(r)) {
                sendJsonResponse(res, 500, false, "Database error creating resource.");
                return;
            }

            addResourceToArray(resources, resourceCount, r);
            logActivity(activities, activityCount, eventId, "Added resource '" + name + "' (" + category + ") with total " + std::to_string(total) + ".");

            sendJsonResponse(res, 201, true, "Resource created.", resourceToJson(r));
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON payload.");
        }
    });

    // PUT /api/resources/:id
    svr.Put(R"(/api/resources/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findResourceById(resources, resourceCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Resource not found.");
            return;
        }

        try {
            auto body = json::parse(req.body);
            std::string action = body.value("action", "update");

            if (action == "allocate") {
                int qty = body.value("quantity", 1);
                if (qty <= 0) {
                    sendJsonResponse(res, 400, false, "Allocation quantity must be > 0.");
                    return;
                }
                if (resources[idx].allocated + qty > resources[idx].total) {
                    sendJsonResponse(res, 400, false, "Cannot allocate " + std::to_string(qty) + " units. Only " + 
                                     std::to_string(resources[idx].total - resources[idx].allocated) + " available.");
                    return;
                }
                resources[idx].allocated += qty;
                dbUpdateResource(resources[idx]);
                logActivity(activities, activityCount, resources[idx].eventId, "Allocated " + std::to_string(qty) + " units of " + resources[idx].name + ".");
                sendJsonResponse(res, 200, true, "Allocated " + std::to_string(qty) + " " + resources[idx].name, resourceToJson(resources[idx]));
                return;
            } else if (action == "release") {
                int qty = body.value("quantity", 1);
                if (qty <= 0) {
                    sendJsonResponse(res, 400, false, "Release quantity must be > 0.");
                    return;
                }
                if (resources[idx].allocated - qty < 0) {
                    sendJsonResponse(res, 400, false, "Cannot release " + std::to_string(qty) + " units. Only " + 
                                     std::to_string(resources[idx].allocated) + " currently allocated.");
                    return;
                }
                resources[idx].allocated -= qty;
                dbUpdateResource(resources[idx]);
                logActivity(activities, activityCount, resources[idx].eventId, "Released " + std::to_string(qty) + " units of " + resources[idx].name + ".");
                sendJsonResponse(res, 200, true, "Released " + std::to_string(qty) + " " + resources[idx].name, resourceToJson(resources[idx]));
                return;
            } else {
                std::string newName = body.value("name", resources[idx].name);
                std::string newCat = body.value("category", resources[idx].category);
                int newTotal = body.value("total", resources[idx].total);

                if (newTotal < resources[idx].allocated) {
                    sendJsonResponse(res, 400, false, "Total cannot be less than currently allocated units (" + 
                                     std::to_string(resources[idx].allocated) + ").");
                    return;
                }

                resources[idx].name = newName;
                resources[idx].category = newCat;
                resources[idx].total = newTotal;
                dbUpdateResource(resources[idx]);

                logActivity(activities, activityCount, resources[idx].eventId, "Updated resource details for '" + newName + "'.");
                sendJsonResponse(res, 200, true, "Resource updated successfully.", resourceToJson(resources[idx]));
                return;
            }
        } catch (...) {
            sendJsonResponse(res, 400, false, "Invalid JSON payload.");
        }
    });

    // DELETE /api/resources/:id
    svr.Delete(R"(/api/resources/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        int id = std::stoi(req.matches[1]);
        int idx = findResourceById(resources, resourceCount, id);
        if (idx == -1) {
            sendJsonResponse(res, 404, false, "Resource not found.");
            return;
        }

        if (resources[idx].allocated > 0) {
            sendJsonResponse(res, 400, false, "Cannot delete resource '" + resources[idx].name + "' while " + 
                             std::to_string(resources[idx].allocated) + " units are allocated.");
            return;
        }

        std::string rName = resources[idx].name;
        int evId = resources[idx].eventId;
        dbDeleteResource(id);
        removeResourceFromArray(resources, resourceCount, idx);

        logActivity(activities, activityCount, evId, "Resource '" + rName + "' was deleted.");
        sendJsonResponse(res, 200, true, "Resource deleted successfully.");
    });

    // --------------------------------------------------------------------------
    // ACTIVITY FEED API
    // --------------------------------------------------------------------------

    // GET /api/activity
    svr.Get("/api/activity", [](const httplib::Request& req, httplib::Response& res) {
        int eventId = req.has_param("eventId") ? std::stoi(req.get_param_value("eventId")) : 0;
        json arr = json::array();
        for (int i = 0; i < activityCount; ++i) {
            if (eventId == 0 || activities[i].eventId == eventId) {
                arr.push_back(activityToJson(activities[i]));
            }
        }
        sendJsonResponse(res, 200, true, "Recent activity feed", arr);
    });
}

// ==============================================================================
// 9. MAIN()
// ==============================================================================

int main() {
    std::cout << "============================================================" << std::endl;
    std::cout << "  SMART EVENT CROWD & RESOURCE MANAGEMENT SYSTEM (BACKEND)   " << std::endl;
    std::cout << "  C++17 Multi-Event Engine | 1D Arrays | Circular FIFO Queue  " << std::endl;
    std::cout << "============================================================" << std::endl;

    // 1. Initialize SQLite Database with schema.sql
    if (!initDatabase(DB_FILENAME, SCHEMA_FILENAME)) {
        std::cerr << "[Error] Failed to initialize SQLite database. Exiting." << std::endl;
        return 1;
    }
    std::cout << "[Database] SQLite database initialized successfully: " << DB_FILENAME << std::endl;

    // 2. Load Persisted State into 1D Arrays
    eventCount = loadEvents(events, MAX_EVENTS);
    attendeeCount = loadAttendees(attendees, MAX_ATTENDEES);
    sectionCount = loadSections(sections, MAX_SECTIONS);
    resourceCount = loadResources(resources, MAX_RESOURCES);
    activityCount = loadActivities(activities, MAX_ACTIVITIES);

    std::cout << "[Storage] Loaded " << eventCount << " events, "
              << attendeeCount << " attendees, "
              << sectionCount << " sections, "
              << resourceCount << " resources, "
              << activityCount << " activities into 1D arrays." << std::endl;

    // 3. Reconstruct Array-Based Circular FIFO Queue from persisted state
    int storedQueueIds[MAX_QUEUE];
    int qIdCount = loadQueueAttendeeIds(storedQueueIds, MAX_QUEUE);

    queueFront = 0;
    queueRear = -1;
    queueCount = 0;

    for (int i = 0; i < qIdCount; ++i) {
        int attIdx = findAttendeeById(attendees, attendeeCount, storedQueueIds[i]);
        if (attIdx != -1 && attendees[attIdx].status == "WAITING") {
            enqueue(attendees[attIdx]);
        }
    }
    std::cout << "[FIFO Queue] Reconstructed circular queue with " << queueCount << " waiting attendees." << std::endl;

    // 4. Setup HTTP Server and Routes
    httplib::Server svr;
    registerRoutes(svr);

    std::cout << "[Server] C++ backend listening on http://0.0.0.0:" << SERVER_PORT << std::endl;
    std::cout << "[Server] Ready for Attendee Portal and Organizer Console requests." << std::endl;

    svr.listen("0.0.0.0", SERVER_PORT);

    closeDatabase();
    return 0;
}
