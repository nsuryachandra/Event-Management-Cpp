import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Modal } from './Modal';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { 
  Database, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';

export const OrganizerLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(
    searchParams.get('eventId') === '0' || searchParams.get('eventId') === 'all' 
      ? 0 
      : parseInt(searchParams.get('eventId')) || 1
  );

  // Create Event Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newCategory, setNewCategory] = useState('Technology');
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceQuantity, setNewResourceQuantity] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  const loadEvents = async () => {
    try {
      const res = await api.getEvents();
      if (res.success && res.data) {
        setEvents(res.data);
        if (activeEventId !== 0 && !res.data.some(e => e.id === activeEventId) && res.data.length > 0) {
          setActiveEventId(res.data[0].id);
        }
      }
    } catch {
      showToast('Error loading events list', 'error');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEventChange = (e) => {
    const newId = parseInt(e.target.value, 10);
    setActiveEventId(newId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('eventId', newId.toString());
    setSearchParams(newParams);
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newVenue.trim()) {
      showToast('Title, Date, and Place/Venue are required', 'error');
      return;
    }

    if (newCapacity <= 0) {
      showToast('Seating capacity limit must be at least 1', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createEvent({
        title: newTitle.trim(),
        tagline: newTagline.trim() || 'Innovative conference and workshops.',
        description: newDescription.trim() || 'Exciting interactive technical event.',
        date: newDate.trim(),
        venue: newVenue.trim(),
        category: newCategory.trim(),
        capacity: parseInt(newCapacity, 10),
        resourceName: newResourceName.trim() || `${newTitle.trim()} - VIP Badges & Kits`,
        resourceQuantity: parseInt(newResourceQuantity, 10) || parseInt(newCapacity, 10),
      });

      if (res.success && res.data) {
        showToast(`Event '${res.data.title}' created with ${newCapacity} seats and auto-assigned resource pool!`, 'success');
        setShowCreateModal(false);
        setNewTitle('');
        setNewTagline('');
        setNewDescription('');
        setNewDate('');
        setNewVenue('');
        setNewCapacity(50);
        setNewResourceName('');
        setNewResourceQuantity(50);
        await loadEvents();
        setActiveEventId(res.data.id);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('eventId', res.data.id.toString());
        setSearchParams(newParams);
      } else {
        showToast(res.message || 'Failed to create event', 'error');
      }
    } catch {
      showToast('Network error creating event', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const activeEvent = activeEventId === 0 ? null : (events.find((ev) => ev.id === activeEventId) || events[0]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar activeEventId={activeEventId} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top bar */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-main)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Active Event Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              ACTIVE EVENT:
            </span>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={activeEventId}
                onChange={handleEventChange}
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: 'var(--text-main)',
                  paddingRight: '32px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <option value="0">🌐 All Events (Overall Overview)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--primary)', fontWeight: 700 }}
              title="Add New Event"
            >
              <Plus size={15} /> Add Event
            </button>
          </div>

          {/* Engine Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                color: 'var(--success-text)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={13} />
              <span>C++ DSA Engine (Port 8080)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <Database size={13} />
              <span>SQLite Schema Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ activeEventId, activeEvent, events, refreshEvents: loadEvents }} />
        </main>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Create New Event"
          subtitle="Add an event with its place and capacity limit."
        >
          <form onSubmit={handleCreateEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. NATIONAL HACKATHON 2026"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Tagline
              </label>
              <input
                type="text"
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                placeholder="e.g. Build, innovate, and deploy."
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Event details and agenda..."
                rows={3}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Date / Schedule *
                </label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. Dec 15-17, 2026"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Technology">Technology</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Design & Product">Design & Product</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Place / Venue Name *
                </label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Main Auditorium / Convention Hall A"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Seat Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  placeholder="50"
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            {/* Initial Resource Pool for Auto-Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Resource / Badge Item (Auto-Assigned)
                </label>
                <input
                  type="text"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="e.g. VIP Conference Badges & Kits"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Resource Units
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newResourceQuantity}
                  onChange={(e) => setNewResourceQuantity(parseInt(e.target.value) || 1)}
                  placeholder="50"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary"
              >
                {isCreating ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OrganizerLayout;
