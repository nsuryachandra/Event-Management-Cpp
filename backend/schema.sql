-- ==============================================================================
-- SMART EVENT CROWD & RESOURCE MANAGEMENT SYSTEM - SQL SCHEMA & SEED DATA
-- ==============================================================================

-- 1. Events Table (Multi-Event Platform)
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technology',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    imageUrl TEXT DEFAULT ''
);

-- 2. Sections / Tracks Table
CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    occupied INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(eventId) REFERENCES events(id)
);

-- 3. Attendees Table
CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    section TEXT NOT NULL,
    status TEXT NOT NULL,
    registeredAt TEXT NOT NULL,
    FOREIGN KEY(eventId) REFERENCES events(id)
);

-- 4. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    total INTEGER NOT NULL,
    allocated INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(eventId) REFERENCES events(id)
);

-- 5. Activities Log Table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 6. FIFO Queue State Table
CREATE TABLE IF NOT EXISTS queue_state (
    position INTEGER PRIMARY KEY,
    eventId INTEGER NOT NULL,
    attendee_id INTEGER NOT NULL
);

-- ==============================================================================
-- INITIAL SEED DATA (Fresh Multi-Event Platform)
-- ==============================================================================

INSERT INTO events (id, title, tagline, description, date, venue, category, status) VALUES 
(1, 'TECHVERSE 2026', 'Smart admissions. Fair FIFO processing. Efficient event operations.', 'Premier technology and software engineering conference featuring keynotes, hands-on workshops, and interactive coding labs.', 'October 24-26, 2026', 'Silicon Convention Arena', 'Technology', 'ACTIVE'),
(2, 'AI & ROBOTICS SUMMIT 2026', 'Frontiers of autonomous systems and neural intelligence.', 'A gathering of researchers, founders, and engineers exploring next-generation neural architectures and intelligent robotics.', 'November 12-14, 2026', 'Metropolitan Convention Hall A', 'Artificial Intelligence', 'ACTIVE'),
(3, 'CLOUD & DEVOPS CONCLAVE', 'Scale resilient cloud-native infrastructure.', 'Practical architectural sessions on high-throughput microservices, continuous delivery pipelines, and distributed databases.', 'December 05-06, 2026', 'Cyber City Auditorium 3', 'Cloud Computing', 'ACTIVE');

-- Single Place Section per Event (Clean & Consistent)
INSERT INTO sections (id, eventId, name, capacity, occupied) VALUES 
(1, 1, 'Silicon Convention Arena', 100, 0),
(2, 2, 'Metropolitan Convention Hall A', 80, 0),
(3, 3, 'Cyber City Auditorium 3', 60, 0);

-- Resources for Events (Auto-assigned to attendees upon admission)
INSERT INTO resources (id, eventId, name, category, total, allocated) VALUES 
(1, 1, 'VIP Conference Badge & Kit', 'Badging & Supplies', 100, 0),
(2, 2, 'Robotics Workshop Kit & Lanyard', 'Hardware', 80, 0),
(3, 3, 'Cloud DevOps Swag & Access Token', 'Computing', 60, 0);

-- Initial Activities
INSERT INTO activities (eventId, message, createdAt) VALUES 
(1, 'TechVerse 2026 created at Silicon Convention Arena with 100 seats and 100 VIP Badge Kits.', '2026-09-04 10:00:00'),
(2, 'AI & Robotics Summit created with 80 seats and 80 Workshop Kits.', '2026-09-04 10:05:00'),
(3, 'Cloud & DevOps Conclave created with 60 seats and 60 Swag Packs.', '2026-09-04 10:10:00');
