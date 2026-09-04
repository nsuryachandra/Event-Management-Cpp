# Smart Event Crowd & Resource Management System
> **Smart Admissions. Fair FIFO Processing. Multi-Event Operations.**

An enterprise-grade, multi-event operations and crowd management platform powered by a lightweight **C++17 engine** (strictly aligned with fundamental Data Structures syllabus concepts: Structures, 1D Arrays, and Array-Based Circular FIFO Queue) and a **React 18 + Pure JSX Light Theme UI**.

---

## 🌟 Key Highlights

- 🏢 **Multi-Event Platform**: Host, browse, and manage multiple concurrent conferences, hackathons, and workshops with isolated event contexts.
- 🚦 **Strict Circular FIFO Queue**: In-memory circular queue with front/rear wrap-around pointers. Guarantees fair, no-skip admissions when session tracks reach capacity.
- ☀️ **Strict Light Theme UI**: High-contrast, clean aesthetic with slate typography (`#0f172a`, `#334155`), crisp borders (`#e2e8f0`), soft shadows, and vibrant status pills.
- ⚡ **Pure JSX / Zero TypeScript**: Completely clean, readable React 18 frontend with no TypeScript dependencies or build overhead.
- 🗄️ **SQLite via `schema.sql`**: Clear SQL schema file initialized automatically by a clean ~140-line `database.cpp`.
- 📦 **Resource & Hardware Inventory**: Real-time allocation, capacity caps, and safety checks preventing deletion of assigned equipment.

---

## 🏗️ System Architecture

```
cppfinal/
├── backend/
│   ├── main.cpp              # C++ REST API server, Circular FIFO Queue & No-Skip logic
│   ├── database.h            # SQLite persistence headers
│   ├── database.cpp          # SQLite DB operations & schema execution (~140 lines)
│   ├── schema.sql            # SQLite DDL & seed records
│   ├── build_backend.bat     # MinGW compilation script
│   └── third_party/
│       ├── httplib.h         # Header-only HTTP server
│       ├── json.hpp          # nlohmann::json
│       └── sqlite/           # sqlite3.c & sqlite3.h
│
├── frontend/
│   ├── index.html            # Vite HTML shell
│   ├── vite.config.js        # Vite config with API proxy
│   ├── package.json          # Pure JS dependencies (React 18, Lucide React, React Router 6)
│   └── src/
│       ├── main.jsx          # Entry point
│       ├── App.jsx           # App router
│       ├── api.js            # Pure JS API service layer
│       ├── index.css         # Strict light theme design tokens
│       ├── context/
│       │   └── ToastContext.jsx
│       ├── components/       # Shared UI components (Badge, Modal, StatCard, Sidebar, Navbar...)
│       └── pages/
│           ├── attendee/     # EventsCatalog, EventHome, Register, RegistrationResult, RegistrationStatus
│           └── organizer/    # Dashboard, Events, WaitingList, Attendees, Sections, Resources
│
├── test_system.ps1           # Automated acceptance test suite
└── README.md                 # Documentation
```

---

## 🧠 Academic DSA Implementation

| Concept | Implementation in C++ Engine |
| :--- | :--- |
| **Structures (`struct`)** | `Event`, `Section`, `Attendee`, `WaitingEntry`, `Resource`, `ActivityLog` |
| **1D Array Storage** | `events[MAX_EVENTS]`, `sections[MAX_SECTIONS]`, `attendees[MAX_ATTENDEES]`, `resources[MAX_RESOURCES]` |
| **Circular FIFO Queue** | Fixed-size array `waitingQueue[MAX_QUEUE]` with `queueFront`, `queueRear`, `queueCount`. Wrap-around via `(queueRear + 1) % MAX_QUEUE`. |
| **Strict No-Skip FIFO** | If the front waiting attendee's requested section is full, admission is **strictly blocked** and refuses to skip to later candidates. |
| **Dynamic Queue Position** | Waiting queue positions (`#01`, `#02`, ...) are computed dynamically from queue order `(queueFront + i) % MAX_QUEUE`. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **GCC / G++ with C++17 support** (MinGW-w64 on Windows)
- **Node.js 18+ and npm**

### 1. Build and Start the C++ Backend
```powershell
cd backend
.\build_backend.bat
.\server.exe
```
*The server will start on `http://localhost:8080` and automatically initialize `schema.sql` into `events.db`.*

### 2. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```
*The React UI will open on `http://localhost:5173`.*

### 3. Run Automated Acceptance Tests
```powershell
.\test_system.ps1
```

---

## 📡 API Reference

### Events
- `GET /api/events` — Retrieve all active events.
- `POST /api/events` — Create a new event with custom tracks and sections.
- `GET /api/events/:id` — Get detailed event information.

### Sections & Capacity
- `GET /api/sections?eventId=:id` — Get tracks, seating limits, and occupancy for an event.
- `PUT /api/sections/:id` — Update section seating capacity.
- `POST /api/sections` — Create a new track.
- `DELETE /api/sections/:id` — Delete an empty track.

### Registrations & FIFO Queue
- `POST /api/registrations` — Register an attendee. Returns `ADMITTED` if seats exist or `WAITING` with queue position `#X`.
- `GET /api/registrations/:idOrEmail` — Public lookup for live status and digital badge pass.
- `GET /api/queue?eventId=:id` — Inspect the in-memory array circular FIFO queue.
- `POST /api/queue/admit-next` — Admit the next waiting attendee at the front of the FIFO queue.
- `POST /api/attendees/:id/cancel` — Cancel an admitted attendee and decrement section occupancy.

### Resources
- `GET /api/resources?eventId=:id` — List hardware and logistical equipment.
- `POST /api/resources` — Add equipment to the pool.
- `PUT /api/resources/:id` — Allocate (+1), release (-1), or edit quantity.
- `DELETE /api/resources/:id` — Remove equipment (blocked if `allocated_qty > 0`).

---

## 📄 License
Academic & Educational Use — Smart Event Crowd & Resource Management System.
