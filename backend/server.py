import sqlite3
import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "event_system.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='events';")
    count = cursor.fetchone()[0]
    if count == 0:
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            cursor.executescript(schema_sql)
            conn.commit()
    else:
        try:
            cursor.execute("ALTER TABLE events ADD COLUMN imageUrl TEXT DEFAULT '';")
            conn.commit()
        except Exception:
            pass
    conn.close()

init_db()

def get_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_activity(event_id, message):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO activities (eventId, message, createdAt) VALUES (?, ?, ?)",
        (event_id, message, get_timestamp())
    )
    conn.commit()
    conn.close()

def get_waiting_position(attendee_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT attendee_id FROM queue_state ORDER BY position ASC")
    rows = cursor.fetchall()
    conn.close()
    for idx, row in enumerate(rows):
        if row["attendee_id"] == attendee_id:
            return idx + 1
    return None

def auto_allocate_resource(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE eventId = ?", (event_id,))
    res_list = cursor.fetchall()
    for r in res_list:
        if r["allocated"] < r["total"]:
            cursor.execute("UPDATE resources SET allocated = allocated + 1 WHERE id = ?", (r["id"],))
    conn.commit()
    conn.close()

def auto_release_resource(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE eventId = ?", (event_id,))
    res_list = cursor.fetchall()
    for r in res_list:
        if r["allocated"] > 0:
            cursor.execute("UPDATE resources SET allocated = allocated - 1 WHERE id = ?", (r["id"],))
    conn.commit()
    conn.close()

def format_event(e):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT capacity, occupied FROM sections WHERE eventId = ?", (e["id"],))
    sec_rows = cursor.fetchall()
    conn.close()
    
    total_cap = sum(r["capacity"] for r in sec_rows)
    total_occ = sum(r["occupied"] for r in sec_rows)
    tracks_count = len(sec_rows)
    occ_pct = int((total_occ / total_cap * 100.0)) if total_cap > 0 else 0
    
    return {
        "id": e["id"],
        "title": e["title"],
        "tagline": e["tagline"],
        "description": e["description"],
        "date": e["date"],
        "venue": e["venue"],
        "category": e["category"],
        "status": e["status"],
        "imageUrl": e["imageUrl"] if "imageUrl" in e.keys() and e["imageUrl"] else "",
        "totalCapacity": total_cap,
        "totalOccupied": total_occ,
        "tracksCount": tracks_count,
        "occupancyPercentage": occ_pct
    }

def format_section(s):
    cap = s["capacity"]
    occ = s["occupied"]
    avail = max(0, cap - occ)
    occ_pct = (occ / cap * 100.0) if cap > 0 else 0.0
    
    if occ >= cap:
        status = "FULL"
        status_label = "Full"
    elif occ_pct >= 75.0:
        status = "FILLING_FAST"
        status_label = "Almost Full"
    else:
        status = "OPEN"
        status_label = "Available"
        
    return {
        "id": s["id"],
        "eventId": s["eventId"],
        "name": s["name"],
        "capacity": cap,
        "occupied": occ,
        "available": avail,
        "occupancyPercentage": int(occ_pct),
        "status": status,
        "statusLabel": status_label
    }

def format_attendee(a):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM events WHERE id = ?", (a["eventId"],))
    ev = cursor.fetchone()
    conn.close()
    
    pos = get_waiting_position(a["id"]) if a["status"] == "WAITING" else None
    
    return {
        "id": a["id"],
        "eventId": a["eventId"],
        "registrationId": f"EVT-{a['id'] + 1000}",
        "name": a["name"],
        "email": a["email"],
        "phone": a["phone"],
        "section": a["section"],
        "status": a["status"],
        "registeredAt": a["registeredAt"],
        "waitingPosition": pos,
        "eventTitle": ev["title"] if ev else "TechVerse 2026"
    }

def format_resource(r):
    total = r["total"]
    allocated = r["allocated"]
    avail = max(0, total - allocated)
    return {
        "id": r["id"],
        "eventId": r["eventId"],
        "name": r["name"],
        "category": r["category"],
        "total": total,
        "allocated": allocated,
        "available": avail
    }

# ------------------------------------------------------------------------------
# EVENTS APIS
# ------------------------------------------------------------------------------

@app.route("/api/events", methods=["GET"])
def get_events():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({"success": True, "message": "Events retrieved", "data": [format_event(r) for r in rows]})

@app.route("/api/events", methods=["POST"])
def create_event():
    body = request.get_json(force=True, silent=True) or {}
    title = body.get("title", "")
    tagline = body.get("tagline", "")
    description = body.get("description", "")
    date = body.get("date", "")
    venue = body.get("venue", "")
    category = body.get("category", "Technology")
    imageUrl = body.get("imageUrl", "")
    capacity = body.get("capacity", 0) or body.get("quantity", 0) or 50

    if not title or not date or not venue:
        return jsonify({"success": False, "message": "Title, date, and venue are required."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO events (title, tagline, description, date, venue, category, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)",
        (title, tagline, description, date, venue, category, imageUrl)
    )
    event_id = cursor.lastrowid
    
    # Create default main section
    cursor.execute(
        "INSERT INTO sections (eventId, name, capacity, occupied) VALUES (?, ?, ?, 0)",
        (event_id, venue, capacity)
    )
    
    # Create default resource
    cursor.execute(
        "INSERT INTO resources (eventId, name, category, total, allocated) VALUES (?, ?, 'Event Supplies', ?, 0)",
        (event_id, f"{title} Access Badge", capacity)
    )
    conn.commit()
    conn.close()

    log_activity(event_id, f"Event '{title}' created at {venue} with seating capacity {capacity}.")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev = cursor.fetchone()
    conn.close()
    return jsonify({"success": True, "message": "Event created successfully.", "data": format_event(ev)}), 201

@app.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev = cursor.fetchone()
    conn.close()
    if not ev:
        return jsonify({"success": False, "message": "Event not found."}), 404
    return jsonify({"success": True, "message": "Event details retrieved", "data": format_event(ev)})

@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev = cursor.fetchone()
    if not ev:
        conn.close()
        return jsonify({"success": False, "message": "Event not found."}), 404

    body = request.get_json(force=True, silent=True) or {}
    title = body.get("title", ev["title"])
    tagline = body.get("tagline", ev["tagline"])
    description = body.get("description", ev["description"])
    date = body.get("date", ev["date"])
    venue = body.get("venue", ev["venue"])
    category = body.get("category", ev["category"])
    imageUrl = body.get("imageUrl", ev["imageUrl"] if "imageUrl" in ev.keys() else "")

    cursor.execute(
        "UPDATE events SET title=?, tagline=?, description=?, date=?, venue=?, category=?, imageUrl=? WHERE id=?",
        (title, tagline, description, date, venue, category, imageUrl, event_id)
    )
    conn.commit()

    auto_admitted_count = 0
    auto_admitted_names = []

    if "capacity" in body or "quantity" in body:
        new_cap = body.get("capacity", 0) or body.get("quantity", 0)
        if new_cap > 0:
            cursor.execute("SELECT * FROM sections WHERE eventId = ? LIMIT 1", (event_id,))
            sec = cursor.fetchone()
            if sec:
                if new_cap < sec["occupied"]:
                    conn.close()
                    return jsonify({"success": False, "message": f"Capacity ({new_cap}) cannot be less than current occupied seats ({sec['occupied']})."}), 400
                old_cap = sec["capacity"]
                cursor.execute("UPDATE sections SET capacity=? WHERE id=?", (new_cap, sec["id"]))
                conn.commit()

                if new_cap > old_cap:
                    # Auto admit from FIFO queue
                    while True:
                        cursor.execute("SELECT occupied, capacity FROM sections WHERE id=?", (sec["id"],))
                        curr_sec = cursor.fetchone()
                        if curr_sec["occupied"] >= curr_sec["capacity"]:
                            break
                        
                        cursor.execute("SELECT position, attendee_id FROM queue_state WHERE eventId = ? ORDER BY position ASC LIMIT 1", (event_id,))
                        q_entry = cursor.fetchone()
                        if not q_entry:
                            break
                        
                        att_id = q_entry["attendee_id"]
                        cursor.execute("DELETE FROM queue_state WHERE position = ?", (q_entry["position"],))
                        cursor.execute("UPDATE attendees SET status = 'ADMITTED' WHERE id = ?", (att_id,))
                        cursor.execute("UPDATE sections SET occupied = occupied + 1 WHERE id = ?", (sec["id"],))
                        conn.commit()

                        cursor.execute("SELECT name FROM attendees WHERE id = ?", (att_id,))
                        att_name = cursor.fetchone()["name"]
                        auto_admitted_count += 1
                        auto_admitted_names.append(att_name)
                        log_activity(event_id, f"Seat added (+1): {att_name} (first waiting in FIFO queue) was automatically admitted.")

    conn.close()
    log_activity(event_id, f"Event '{title}' details and seating configuration were updated.")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    updated_ev = cursor.fetchone()
    conn.close()

    msg = "Event updated successfully."
    if auto_admitted_count > 0:
        msg += f" Added seats automatically admitted {auto_admitted_count} waiting attendee(s): {', '.join(auto_admitted_names)}."

    return jsonify({"success": True, "message": msg, "data": format_event(updated_ev)})

@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev = cursor.fetchone()
    if not ev:
        conn.close()
        return jsonify({"success": False, "message": "Event not found."}), 404
    title = ev["title"]
    cursor.execute("DELETE FROM queue_state WHERE eventId = ?", (event_id,))
    cursor.execute("DELETE FROM activities WHERE eventId = ?", (event_id,))
    cursor.execute("DELETE FROM resources WHERE eventId = ?", (event_id,))
    cursor.execute("DELETE FROM attendees WHERE eventId = ?", (event_id,))
    cursor.execute("DELETE FROM sections WHERE eventId = ?", (event_id,))
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Event '{title}' removed successfully."})

# ------------------------------------------------------------------------------
# SECTIONS APIS
# ------------------------------------------------------------------------------

@app.route("/api/sections/public", methods=["GET"])
@app.route("/api/sections", methods=["GET"])
def get_sections():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()
    if event_id > 0:
        cursor.execute("SELECT * FROM sections WHERE eventId = ?", (event_id,))
    else:
        cursor.execute("SELECT * FROM sections")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({"success": True, "message": "Sections list", "data": [format_section(r) for r in rows]})

@app.route("/api/sections", methods=["POST"])
def create_section():
    body = request.get_json(force=True, silent=True) or {}
    event_id = body.get("eventId", 1)
    name = body.get("name", "")
    capacity = body.get("capacity", 0)

    if not name or capacity <= 0:
        return jsonify({"success": False, "message": "Section name cannot be empty and capacity must be > 0."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM sections WHERE eventId = ? AND name = ?", (event_id, name))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": f"Section with name '{name}' already exists in this event."}), 400

    cursor.execute("INSERT INTO sections (eventId, name, capacity, occupied) VALUES (?, ?, ?, 0)", (event_id, name, capacity))
    sec_id = cursor.lastrowid
    conn.commit()
    conn.close()

    log_activity(event_id, f"Created section '{name}' with capacity {capacity}.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sections WHERE id = ?", (sec_id,))
    sec = cursor.fetchone()
    conn.close()
    return jsonify({"success": True, "message": "Section created successfully.", "data": format_section(sec)}), 201

@app.route("/api/sections/<int:section_id>", methods=["PUT"])
def update_section(section_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    sec = cursor.fetchone()
    if not sec:
        conn.close()
        return jsonify({"success": False, "message": "Section not found."}), 404

    body = request.get_json(force=True, silent=True) or {}
    new_name = body.get("name", sec["name"])
    new_capacity = body.get("capacity", sec["capacity"])

    if new_capacity < sec["occupied"]:
        conn.close()
        return jsonify({"success": False, "message": f"New capacity ({new_capacity}) cannot be less than current occupied seats ({sec['occupied']})."}), 400

    old_cap = sec["capacity"]
    cursor.execute("UPDATE sections SET name=?, capacity=? WHERE id=?", (new_name, new_capacity, section_id))
    conn.commit()

    auto_admitted_count = 0
    auto_admitted_names = []

    if new_capacity > old_cap:
        # Auto admit from FIFO queue for this event
        while True:
            cursor.execute("SELECT occupied, capacity FROM sections WHERE id=?", (section_id,))
            curr_sec = cursor.fetchone()
            if curr_sec["occupied"] >= curr_sec["capacity"]:
                break
            
            cursor.execute("""
                SELECT q.position, q.attendee_id, a.name 
                FROM queue_state q 
                JOIN attendees a ON q.attendee_id = a.id 
                WHERE q.eventId = ? AND a.section = ? 
                ORDER BY q.position ASC LIMIT 1
            """, (sec["eventId"], new_name))
            q_entry = cursor.fetchone()
            if not q_entry:
                break
            
            att_id = q_entry["attendee_id"]
            att_name = q_entry["name"]

            cursor.execute("DELETE FROM queue_state WHERE position = ?", (q_entry["position"],))
            cursor.execute("UPDATE attendees SET status = 'ADMITTED' WHERE id = ?", (att_id,))
            cursor.execute("UPDATE sections SET occupied = occupied + 1 WHERE id = ?", (section_id,))
            conn.commit()

            auto_allocate_resource(sec["eventId"])

            auto_admitted_count += 1
            auto_admitted_names.append(att_name)
            log_activity(sec["eventId"], f"Capacity increased (+1): {att_name} (first waiting in FIFO queue) was automatically admitted.")

    msg = f"Section '{new_name}' updated successfully."
    if auto_admitted_count > 0:
        msg += f" Added seats automatically admitted {auto_admitted_count} waiting attendee(s): {', '.join(auto_admitted_names)}."

    log_activity(sec["eventId"], f"Updated section '{new_name}' capacity to {new_capacity}.")

    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    updated_sec = cursor.fetchone()
    conn.close()

    res_data = format_section(updated_sec)
    res_data["autoAdmittedCount"] = auto_admitted_count
    res_data["autoAdmittedNames"] = ", ".join(auto_admitted_names)
    return jsonify({"success": True, "message": msg, "data": res_data})

@app.route("/api/sections/<int:section_id>", methods=["DELETE"])
def delete_section(section_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    sec = cursor.fetchone()
    if not sec:
        conn.close()
        return jsonify({"success": False, "message": "Section not found."}), 404

    if sec["occupied"] > 0:
        conn.close()
        return jsonify({"success": False, "message": f"Cannot delete section '{sec['name']}' because it currently has {sec['occupied']} admitted attendee(s)."}), 400

    cursor.execute("DELETE FROM sections WHERE id = ?", (section_id,))
    conn.commit()
    conn.close()

    log_activity(sec["eventId"], f"Deleted section '{sec['name']}'.")
    return jsonify({"success": True, "message": f"Section '{sec['name']}' deleted successfully."})

# ------------------------------------------------------------------------------
# REGISTRATIONS & ATTENDEES APIS
# ------------------------------------------------------------------------------

@app.route("/api/registrations", methods=["POST"])
def register_attendee():
    body = request.get_json(force=True, silent=True) or {}
    event_id = body.get("eventId", 1)
    name = body.get("name", "").strip()
    email = body.get("email", "").strip()
    phone = body.get("phone", "").strip()
    section_name = body.get("section", "").strip()

    if not name or not email or not phone or not section_name:
        return jsonify({"success": False, "message": "All fields (name, email, phone, section) are required."}), 400

    if "@" not in email:
        return jsonify({"success": False, "message": "Invalid email format."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Selected event does not exist."}), 400

    cursor.execute("SELECT id, status FROM attendees WHERE eventId = ? AND email = ?", (event_id, email))
    existing = cursor.fetchone()
    if existing and existing["status"] != "CANCELLED":
        conn.close()
        return jsonify({"success": False, "message": f"An active registration already exists for email: {email}"}), 400

    cursor.execute("SELECT * FROM sections WHERE eventId = ? AND name = ?", (event_id, section_name))
    sec = cursor.fetchone()
    if not sec:
        conn.close()
        return jsonify({"success": False, "message": f"Selected section '{section_name}' does not exist in this event."}), 400

    registered_at = get_timestamp()

    if sec["occupied"] < sec["capacity"]:
        status = "ADMITTED"
        cursor.execute(
            "INSERT INTO attendees (eventId, name, email, phone, section, status, registeredAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (event_id, name, email, phone, sec["name"], status, registered_at)
        )
        att_id = cursor.lastrowid
        cursor.execute("UPDATE sections SET occupied = occupied + 1 WHERE id = ?", (sec["id"],))
        conn.commit()
        conn.close()

        auto_allocate_resource(event_id)
        log_activity(event_id, f"{name} admitted to {sec['name']} (Resource auto-allocated).")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
        att = cursor.fetchone()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Registration confirmed — admitted to {sec['name']}.",
            "data": format_attendee(att)
        }), 201
    else:
        status = "WAITING"
        cursor.execute(
            "INSERT INTO attendees (eventId, name, email, phone, section, status, registeredAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (event_id, name, email, phone, sec["name"], status, registered_at)
        )
        att_id = cursor.lastrowid
        
        cursor.execute("SELECT COALESCE(MAX(position), 0) + 1 FROM queue_state")
        next_pos = cursor.fetchone()[0]
        cursor.execute("INSERT INTO queue_state (position, eventId, attendee_id) VALUES (?, ?, ?)", (next_pos, event_id, att_id))
        conn.commit()
        conn.close()

        pos = get_waiting_position(att_id)
        log_activity(event_id, f"{name} added to FIFO waiting list for {sec['name']} at position #{pos}.")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
        att = cursor.fetchone()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"{sec['name']} is full — added to the FIFO waiting list at position #{pos}.",
            "data": format_attendee(att)
        }), 201

@app.route("/api/registrations/<path:id_or_email>", methods=["GET"])
def get_registration(id_or_email):
    conn = get_db()
    cursor = conn.cursor()
    if id_or_email.isdigit():
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (int(id_or_email),))
    elif id_or_email.startswith("EVT-"):
        num_str = id_or_email.replace("EVT-", "")
        att_id = int(num_str) - 1000 if num_str.isdigit() else 0
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
    else:
        cursor.execute("SELECT * FROM attendees WHERE email = ? ORDER BY id DESC LIMIT 1", (id_or_email,))
    att = cursor.fetchone()
    conn.close()

    if not att:
        return jsonify({"success": False, "message": "Registration record not found."}), 404

    return jsonify({"success": True, "message": "Registration lookup successful", "data": format_attendee(att)})

@app.route("/api/attendees", methods=["GET"])
def get_attendees():
    event_id = request.args.get("eventId", type=int, default=0)
    search = request.args.get("search", type=str, default="")
    status = request.args.get("status", type=str, default="")
    section = request.args.get("section", type=str, default="")

    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM attendees WHERE 1=1"
    params = []

    if event_id > 0:
        query += " AND eventId = ?"
        params.append(event_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    if section:
        query += " AND section = ?"
        params.append(section)
    if search:
        query += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return jsonify({"success": True, "message": "Attendees list retrieved", "data": [format_attendee(r) for r in rows]})

@app.route("/api/attendees/<int:att_id>", methods=["PUT"])
def update_attendee(att_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
    att = cursor.fetchone()
    if not att:
        conn.close()
        return jsonify({"success": False, "message": "Attendee not found."}), 404

    if att["status"] == "WAITING":
        conn.close()
        return jsonify({"success": False, "message": "Waiting attendees cannot be edited to preserve FIFO queue integrity."}), 400

    body = request.get_json(force=True, silent=True) or {}
    name = body.get("name", "").strip()
    email = body.get("email", "").strip()
    phone = body.get("phone", "").strip()

    if not name or not email or not phone:
        conn.close()
        return jsonify({"success": False, "message": "Name, email, and phone cannot be empty."}), 400

    cursor.execute("UPDATE attendees SET name=?, email=?, phone=? WHERE id=?", (name, email, phone, att_id))
    conn.commit()
    conn.close()

    log_activity(att["eventId"], f"Updated contact details for {name}.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
    updated_att = cursor.fetchone()
    conn.close()

    return jsonify({"success": True, "message": "Attendee details updated successfully.", "data": format_attendee(updated_att)})

@app.route("/api/attendees/<int:att_id>/cancel", methods=["POST"])
def cancel_attendee(att_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
    att = cursor.fetchone()
    if not att:
        conn.close()
        return jsonify({"success": False, "message": "Attendee not found."}), 404

    if att["status"] == "WAITING":
        conn.close()
        return jsonify({"success": False, "message": "Waiting attendees cannot be cancelled directly. The waiting list is strictly FIFO."}), 400

    if att["status"] == "CANCELLED":
        conn.close()
        return jsonify({"success": False, "message": "Attendee registration is already cancelled."}), 400

    if att["status"] == "ADMITTED":
        cursor.execute("UPDATE attendees SET status = 'CANCELLED' WHERE id = ?", (att_id,))
        cursor.execute("UPDATE sections SET occupied = MAX(0, occupied - 1) WHERE eventId = ? AND name = ?", (att["eventId"], att["section"]))
        conn.commit()
        conn.close()

        auto_release_resource(att["eventId"])
        log_activity(att["eventId"], f"Registration for {att['name']} was cancelled (Resource auto-released).")

        # Check if next person in FIFO queue can be auto-admitted
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sections WHERE eventId = ? AND name = ?", (att["eventId"], att["section"]))
        sec = cursor.fetchone()
        if sec and sec["occupied"] < sec["capacity"]:
            cursor.execute("""
                SELECT q.position, q.attendee_id, a.name 
                FROM queue_state q 
                JOIN attendees a ON q.attendee_id = a.id 
                WHERE q.eventId = ? AND a.section = ? 
                ORDER BY q.position ASC LIMIT 1
            """, (att["eventId"], att["section"]))
            q_entry = cursor.fetchone()
            if q_entry:
                next_att_id = q_entry["attendee_id"]
                next_name = q_entry["name"]
                cursor.execute("DELETE FROM queue_state WHERE position = ?", (q_entry["position"],))
                cursor.execute("UPDATE attendees SET status = 'ADMITTED' WHERE id = ?", (next_att_id,))
                cursor.execute("UPDATE sections SET occupied = occupied + 1 WHERE id = ?", (sec["id"],))
                conn.commit()
                auto_allocate_resource(att["eventId"])
                log_activity(att["eventId"], f"{next_name} was automatically admitted from FIFO queue following cancellation.")
        conn.close()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
        updated_att = cursor.fetchone()
        conn.close()

        return jsonify({"success": True, "message": f"Registration for {att['name']} was cancelled. Section capacity and resource unit released.", "data": format_attendee(updated_att)})

    conn.close()
    return jsonify({"success": False, "message": "Invalid status transition."}), 400

@app.route("/api/attendees/<int:att_id>", methods=["DELETE"])
def delete_attendee(att_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
    att = cursor.fetchone()
    if not att:
        conn.close()
        return jsonify({"success": False, "message": "Attendee not found."}), 404

    if att["status"] == "WAITING":
        conn.close()
        return jsonify({"success": False, "message": "The waiting list is strictly FIFO. Waiting attendees must be processed through the queue and cannot be removed."}), 400

    if att["status"] == "ADMITTED":
        cursor.execute("UPDATE sections SET occupied = MAX(0, occupied - 1) WHERE eventId = ? AND name = ?", (att["eventId"], att["section"]))
        auto_release_resource(att["eventId"])

    cursor.execute("DELETE FROM attendees WHERE id = ?", (att_id,))
    cursor.execute("DELETE FROM queue_state WHERE attendee_id = ?", (att_id,))
    conn.commit()
    conn.close()

    log_activity(att["eventId"], f"Attendee record for {att['name']} was permanently removed (Resource auto-released).")
    return jsonify({"success": True, "message": f"Attendee {att['name']} was removed."})

# ------------------------------------------------------------------------------
# FIFO QUEUE APIS
# ------------------------------------------------------------------------------

@app.route("/api/queue", methods=["GET"])
def get_queue():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()
    if event_id > 0:
        cursor.execute("""
            SELECT q.position, a.* 
            FROM queue_state q 
            JOIN attendees a ON q.attendee_id = a.id 
            WHERE q.eventId = ? 
            ORDER BY q.position ASC
        """, (event_id,))
    else:
        cursor.execute("""
            SELECT q.position, a.* 
            FROM queue_state q 
            JOIN attendees a ON q.attendee_id = a.id 
            ORDER BY q.position ASC
        """)
    rows = cursor.fetchall()
    conn.close()

    return jsonify({"success": True, "message": "FIFO queue retrieved", "data": [format_attendee(r) for r in rows]})

@app.route("/api/queue/admit-next", methods=["POST"])
def admit_next():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()

    if event_id > 0:
        cursor.execute("""
            SELECT q.position, q.attendee_id, a.* 
            FROM queue_state q 
            JOIN attendees a ON q.attendee_id = a.id 
            WHERE q.eventId = ? 
            ORDER BY q.position ASC LIMIT 1
        """, (event_id,))
    else:
        cursor.execute("""
            SELECT q.position, q.attendee_id, a.* 
            FROM queue_state q 
            JOIN attendees a ON q.attendee_id = a.id 
            ORDER BY q.position ASC LIMIT 1
        """)
    q_entry = cursor.fetchone()

    if not q_entry:
        conn.close()
        return jsonify({"success": False, "message": "The waiting list is currently empty."}), 400

    att_id = q_entry["attendee_id"]
    ev_id = q_entry["eventId"]
    sec_name = q_entry["section"]

    cursor.execute("SELECT * FROM sections WHERE eventId = ? AND name = ?", (ev_id, sec_name))
    sec = cursor.fetchone()
    if not sec:
        conn.close()
        return jsonify({"success": False, "message": f"Section '{sec_name}' requested by {q_entry['name']} no longer exists."}), 400

    open_seat = request.args.get("openSeat") in ["true", "1"]
    if not open_seat and request.is_json:
        data = request.get_json(silent=True) or {}
        open_seat = bool(data.get("openSeat"))

    if sec["occupied"] >= sec["capacity"] and open_seat:
        cursor.execute("UPDATE sections SET capacity = occupied + 1 WHERE id = ?", (sec["id"],))
        conn.commit()
        cursor.execute("SELECT * FROM sections WHERE id = ?", (sec["id"],))
        sec = cursor.fetchone()
        log_activity(ev_id, f"Section capacity for '{sec_name}' automatically opened (+1 to {sec['capacity']}) to admit waiting candidate.")

    if sec["occupied"] < sec["capacity"]:
        cursor.execute("DELETE FROM queue_state WHERE position = ?", (q_entry["position"],))
        cursor.execute("UPDATE attendees SET status = 'ADMITTED' WHERE id = ?", (att_id,))
        cursor.execute("UPDATE sections SET occupied = occupied + 1 WHERE id = ?", (sec["id"],))
        conn.commit()
        conn.close()

        auto_allocate_resource(ev_id)
        log_activity(ev_id, f"{q_entry['name']} admitted to {sec_name} from FIFO queue (Resource auto-allocated).")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendees WHERE id = ?", (att_id,))
        admitted_att = cursor.fetchone()
        conn.close()

        return jsonify({"success": True, "message": f"{q_entry['name']} was successfully admitted to {sec_name}.", "data": format_attendee(admitted_att)})
    else:
        conn.close()
        msg = f"Cannot admit next attendee. {q_entry['name']} is #1 in FIFO waiting for '{sec_name}', which is currently full ({sec['occupied']}/{sec['capacity']}). Attendees cannot be skipped out of FIFO order."
        return jsonify({"success": False, "message": msg}), 400

# ------------------------------------------------------------------------------
# RESOURCES APIS
# ------------------------------------------------------------------------------

@app.route("/api/resources", methods=["GET"])
def get_resources():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()
    if event_id > 0:
        cursor.execute("SELECT * FROM resources WHERE eventId = ?", (event_id,))
    else:
        cursor.execute("SELECT * FROM resources")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({"success": True, "message": "Resources list", "data": [format_resource(r) for r in rows]})

@app.route("/api/resources", methods=["POST"])
def create_resource():
    body = request.get_json(force=True, silent=True) or {}
    event_id = body.get("eventId", 1)
    name = body.get("name", "")
    category = body.get("category", "General")
    total = body.get("total", 0)

    if not name or total <= 0:
        return jsonify({"success": False, "message": "Resource name cannot be empty and total quantity must be > 0."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO resources (eventId, name, category, total, allocated) VALUES (?, ?, ?, ?, 0)", (event_id, name, category, total))
    res_id = cursor.lastrowid
    conn.commit()
    conn.close()

    log_activity(event_id, f"Added resource item '{name}' ({category}) with total inventory of {total} units.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE id = ?", (res_id,))
    r = cursor.fetchone()
    conn.close()
    return jsonify({"success": True, "message": "Resource added successfully.", "data": format_resource(r)}), 201

@app.route("/api/resources/<int:res_id>", methods=["PUT"])
def update_resource(res_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE id = ?", (res_id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        return jsonify({"success": False, "message": "Resource not found."}), 404

    body = request.get_json(force=True, silent=True) or {}
    action = body.get("action", "")
    quantity = body.get("quantity", 1)

    if action == "allocate":
        if r["allocated"] + quantity > r["total"]:
            conn.close()
            return jsonify({"success": False, "message": f"Cannot allocate {quantity} unit(s). Total inventory is {r['total']} and {r['allocated']} are already allocated."}), 400
        cursor.execute("UPDATE resources SET allocated = allocated + ? WHERE id = ?", (quantity, res_id))
        msg = f"Allocated {quantity} unit(s) of '{r['name']}'."
    elif action == "release":
        if r["allocated"] - quantity < 0:
            conn.close()
            return jsonify({"success": False, "message": f"Cannot release {quantity} unit(s). Only {r['allocated']} unit(s) currently allocated."}), 400
        cursor.execute("UPDATE resources SET allocated = allocated - ? WHERE id = ?", (quantity, res_id))
        msg = f"Released {quantity} unit(s) of '{r['name']}'."
    else:
        new_name = body.get("name", r["name"])
        new_category = body.get("category", r["category"])
        new_total = body.get("total", r["total"])
        if new_total < r["allocated"]:
            conn.close()
            return jsonify({"success": False, "message": f"Total quantity ({new_total}) cannot be less than current allocated quantity ({r['allocated']})."}), 400
        cursor.execute("UPDATE resources SET name=?, category=?, total=? WHERE id=?", (new_name, new_category, new_total, res_id))
        msg = f"Resource '{new_name}' updated successfully."

    conn.commit()
    log_activity(r["eventId"], msg)

    cursor.execute("SELECT * FROM resources WHERE id = ?", (res_id,))
    updated_r = cursor.fetchone()
    conn.close()
    return jsonify({"success": True, "message": msg, "data": format_resource(updated_r)})

@app.route("/api/resources/<int:res_id>", methods=["DELETE"])
def delete_resource(res_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE id = ?", (res_id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        return jsonify({"success": False, "message": "Resource not found."}), 404

    if r["allocated"] > 0:
        conn.close()
        return jsonify({"success": False, "message": f"Cannot delete resource '{r['name']}' while {r['allocated']} unit(s) are currently allocated to attendees."}), 400

    cursor.execute("DELETE FROM resources WHERE id = ?", (res_id,))
    conn.commit()
    conn.close()

    log_activity(r["eventId"], f"Removed resource item '{r['name']}'.")
    return jsonify({"success": True, "message": f"Resource '{r['name']}' removed successfully."})

# ------------------------------------------------------------------------------
# DASHBOARD & ACTIVITY LOGS
# ------------------------------------------------------------------------------

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()

    if event_id > 0:
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        ev = cursor.fetchone()
        cursor.execute("SELECT capacity, occupied FROM sections WHERE eventId = ?", (event_id,))
        sec_rows = cursor.fetchall()
        cursor.execute("SELECT status, COUNT(*) as cnt FROM attendees WHERE eventId = ? GROUP BY status", (event_id,))
        att_counts = {r["status"]: r["cnt"] for r in cursor.fetchall()}
        cursor.execute("SELECT total, allocated FROM resources WHERE eventId = ?", (event_id,))
        res_rows = cursor.fetchall()
    else:
        ev = None
        cursor.execute("SELECT capacity, occupied FROM sections")
        sec_rows = cursor.fetchall()
        cursor.execute("SELECT status, COUNT(*) as cnt FROM attendees GROUP BY status")
        att_counts = {r["status"]: r["cnt"] for r in cursor.fetchall()}
        cursor.execute("SELECT total, allocated FROM resources")
        res_rows = cursor.fetchall()

    conn.close()

    total_cap = sum(r["capacity"] for r in sec_rows)
    total_occ = sum(r["occupied"] for r in sec_rows)
    total_res = sum(r["total"] for r in res_rows)
    alloc_res = sum(r["allocated"] for r in res_rows)

    admitted = att_counts.get("ADMITTED", 0)
    waiting = att_counts.get("WAITING", 0)
    cancelled = att_counts.get("CANCELLED", 0)

    data = {
        "event": format_event(ev) if ev else None,
        "totalCapacity": total_cap,
        "occupiedSeats": total_occ,
        "availableSeats": max(0, total_cap - total_occ),
        "admittedAttendees": admitted,
        "waitingQueue": waiting,
        "cancelledRegistrations": cancelled,
        "totalResources": total_res,
        "allocatedResources": alloc_res,
        "availableResources": max(0, total_res - alloc_res),
        "occupancyPercentage": int((total_occ / total_cap * 100.0)) if total_cap > 0 else 0
    }

    return jsonify({"success": True, "message": "Dashboard analytics retrieved", "data": data})

@app.route("/api/activity", methods=["GET"])
def get_activity():
    event_id = request.args.get("eventId", type=int, default=0)
    conn = get_db()
    cursor = conn.cursor()
    if event_id > 0:
        cursor.execute("SELECT * FROM activities WHERE eventId = ? ORDER BY id DESC LIMIT 50", (event_id,))
    else:
        cursor.execute("SELECT * FROM activities ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()

    data = [{
        "id": r["id"],
        "eventId": r["eventId"],
        "message": r["message"],
        "createdAt": r["createdAt"]
    } for r in rows]

    return jsonify({"success": True, "message": "Activity log retrieved", "data": data})

if __name__ == "__main__":
    print("============================================================")
    print("  SMART EVENT CROWD & RESOURCE MANAGEMENT SYSTEM (BACKEND)   ")
    print("  Python Engine | SQLite Persistence | Fair FIFO Queue       ")
    print("============================================================")
    print("[Server] Listening on http://0.0.0.0:8080")
    app.run(host="0.0.0.0", port=8080, debug=False)
