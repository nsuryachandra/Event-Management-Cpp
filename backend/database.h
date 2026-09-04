#ifndef DATABASE_H
#define DATABASE_H

#include <string>

struct Event {
    int id;
    std::string title;
    std::string tagline;
    std::string description;
    std::string date;
    std::string venue;
    std::string category;
    std::string status;
};

struct Attendee {
    int id;
    int eventId;
    std::string name;
    std::string email;
    std::string phone;
    std::string section;
    std::string status;       // "ADMITTED", "WAITING", "CANCELLED"
    std::string registeredAt;
};

struct Section {
    int id;
    int eventId;
    std::string name;
    int capacity;
    int occupied;
};

struct Resource {
    int id;
    int eventId;
    std::string name;
    std::string category;
    int total;
    int allocated;
};

struct Activity {
    int id;
    int eventId;
    std::string message;
    std::string createdAt;
};

// Database lifecycle
bool initDatabase(const std::string& dbPath, const std::string& schemaSqlPath = "schema.sql");
void closeDatabase();

// Loading records into 1D arrays on startup
int loadEvents(Event arr[], int maxCount);
int loadAttendees(Attendee arr[], int maxCount);
int loadSections(Section arr[], int maxCount);
int loadResources(Resource arr[], int maxCount);
int loadActivities(Activity arr[], int maxCount);
int loadQueueAttendeeIds(int queueIds[], int maxCount);

// Persistence mutations
bool dbInsertEvent(Event& e);
bool dbUpdateEvent(const Event& e);

bool dbInsertAttendee(Attendee& a);
bool dbUpdateAttendee(const Attendee& a);
bool dbDeleteAttendee(int id);

bool dbInsertSection(Section& s);
bool dbUpdateSection(const Section& s);
bool dbDeleteSection(int id);

bool dbInsertResource(Resource& r);
bool dbUpdateResource(const Resource& r);
bool dbDeleteResource(int id);

bool dbInsertActivity(Activity& act);

// Queue state persistence
bool dbSaveQueue(const Attendee queueArr[], int front, int count, int maxQueue);

#endif // DATABASE_H
