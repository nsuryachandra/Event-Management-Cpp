import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Users,
  Edit3,
  PlusCircle,
  Armchair
} from 'lucide-react';

export const Events = () => {
  const { events, refreshEvents } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceQuantity, setNewResourceQuantity] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Event & Add Seats Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editCapacity, setEditCapacity] = useState(50);
  const [isUpdating, setIsUpdating] = useState(false);

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || '');
    setEditTagline(ev.tagline || '');
    setEditDescription(ev.description || '');
    setEditDate(ev.date || '');
    setEditVenue(ev.venue || '');
    setEditCategory(ev.category || 'Technology');
    setEditCapacity(ev.totalCapacity || 50);
    setShowEditModal(true);
  };

  const handleAddSeatsQuick = (delta) => {
    setEditCapacity((prev) => Math.max(1, (parseInt(prev, 10) || 0) + delta));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate.trim() || !editVenue.trim()) {
      showToast('Title, Date, and Place / Venue are required.', 'error');
      return;
    }

    const cap = parseInt(editCapacity, 10);
    if (isNaN(cap) || cap < (editingEvent?.totalOccupied || 0)) {
      showToast(`Capacity cannot be less than currently occupied seats (${editingEvent?.totalOccupied || 0}).`, 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.updateEvent(editingEvent.id, {
        title: editTitle.trim(),
        tagline: editTagline.trim(),
        description: editDescription.trim(),
        date: editDate.trim(),
        venue: editVenue.trim(),
        category: editCategory.trim(),
        capacity: cap,
      });

      if (res.success) {
        showToast(res.message || 'Event and seat capacity updated successfully!', 'success');
        setShowEditModal(false);
        refreshEvents();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update event', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newVenue.trim()) {
      showToast('Title, Date, and Place / Venue are required.', 'error');
      return;
    }

    const cap = parseInt(newCapacity, 10);
    if (isNaN(cap) || cap < 1) {
      showToast('Please enter a valid capacity (minimum 1).', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createEvent({
        title: newTitle.trim(),
        tagline: newTagline.trim() || 'Innovative conference & workshops.',
        description: newDescription.trim() || 'Interactive event session.',
        date: newDate.trim(),
        venue: newVenue.trim(),
        category: newCategory.trim(),
        capacity: cap,
        resourceName: newResourceName.trim() || `${newTitle.trim()} - VIP Badges & Kits`,
        resourceQuantity: parseInt(newResourceQuantity, 10) || cap,
      });

      if (res.success) {
        showToast(`Event '${newTitle}' created with capacity limit ${cap} and auto-assigned resource pool!`, 'success');
        setShowCreateModal(false);
        setNewTitle('');
        setNewTagline('');
        setNewDescription('');
        setNewDate('');
        setNewVenue('');
        setNewCapacity(50);
        setNewResourceName('');
        setNewResourceQuantity(50);
        refreshEvents();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to create event', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            All Managed Events
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Multi-event management platform. Configure tracks, capacities, and monitor registrations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={refreshEvents}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Grid of Event Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}
      >
        {events.map((ev) => (
          <div
            key={ev.id}
            className="card gradient-top-accent card-hover"
            style={{ padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span
                  className="mono-font"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                    color: '#4f46e5',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    textTransform: 'uppercase',
                  }}
                >
                  {ev.category}
                </span>

                <span className="mono-font" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
                  Event #{ev.id}
                </span>
              </div>

              <h3 className="display-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 8 }}>
                {ev.title}
              </h3>

              <p style={{ color: 'var(--ink-muted)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: 16 }}>
                {ev.tagline}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={15} style={{ color: '#4f46e5' }} />
                  <span>{ev.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={15} style={{ color: '#06b6d4' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.venue}</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--ink-muted)' }}>
                  Occupancy: <strong style={{ color: 'var(--ink-primary)' }}>{ev.totalOccupied || 0} / {ev.totalCapacity || 0}</strong>
                </span>
                <span className="mono-font" style={{ fontWeight: 800, color: '#4f46e5' }}>
                  {ev.occupancyPercentage || 0}%
                </span>
              </div>

              <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-main)', marginBottom: 16 }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    background: (ev.occupancyPercentage || 0) >= 90 ? 'var(--grad-ruby)' : (ev.occupancyPercentage || 0) >= 70 ? 'var(--grad-sunset)' : 'var(--grad-emerald)',
                    width: `${Math.min(100, ev.occupancyPercentage || 0)}%`,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link
                  to={`/organizer?eventId=${ev.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, minWidth: '130px', justifyContent: 'center' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => openEditModal(ev)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#4f46e5' }}
                  title="Edit Event Details and Add Seats"
                >
                  <Edit3 size={14} /> Edit / Seats
                </button>
                <Link
                  to={`/events/${ev.id}`}
                  target="_blank"
                  className="btn btn-secondary btn-sm"
                  title="View Public Page"
                >
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Event & Add Seats Modal */}
      {showEditModal && editingEvent && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title={`Edit '${editingEvent.title}'`}
          subtitle="Modify event details or expand seat capacity to auto-admit waiting attendees."
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
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
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                placeholder="e.g. Build, innovate, and deploy."
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Event description..."
                rows={2}
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
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
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
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Place / Venue *
              </label>
              <input
                type="text"
                value={editVenue}
                onChange={(e) => setEditVenue(e.target.value)}
                placeholder="e.g. Silicon Convention Arena"
                style={{ width: '100%' }}
                required
              />
            </div>

            {/* SEAT CAPACITY & QUICK BOOSTER SECTION */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.08) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Armchair size={18} style={{ color: '#4f46e5' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                    Seat Capacity & Quantity Limit
                  </span>
                </div>
                <span className="mono-font" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
                  Occupied: <strong style={{ color: '#4f46e5' }}>{editingEvent.totalOccupied || 0}</strong> seats
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <input
                    type="number"
                    min={editingEvent.totalOccupied || 1}
                    max="10000"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    style={{ width: '100%', fontSize: '1.05rem', fontWeight: 800 }}
                    required
                  />
                </div>

                {/* Quick Add Seats Boosters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleAddSeatsQuick(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700, color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)', padding: '6px 10px' }}
                    title="Add 1 Seat"
                  >
                    +1 Seat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSeatsQuick(5)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700, color: '#4f46e5', borderColor: 'rgba(79, 70, 229, 0.3)', padding: '6px 10px' }}
                    title="Add 5 Seats"
                  >
                    +5 Seats
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSeatsQuick(10)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700, color: '#7c3aed', borderColor: 'rgba(124, 58, 237, 0.3)', padding: '6px 10px' }}
                    title="Add 10 Seats"
                  >
                    +10 Seats
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSeatsQuick(25)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700, color: '#ea580c', borderColor: 'rgba(234, 88, 12, 0.3)', padding: '6px 10px' }}
                    title="Add 25 Seats"
                  >
                    +25 Seats
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ color: '#059669', flexShrink: 0 }} />
                <span>
                  Adding seats automatically admits the next waiting attendees from the circular FIFO queue.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                {isUpdating ? 'Saving...' : 'Save Changes & Update Seats'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Create New Event"
          subtitle="Add an event to the platform."
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                placeholder="Event description..."
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
                  Place / Venue *
                </label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Silicon Convention Arena"
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
                  max="10000"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="e.g. 50"
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            {/* Auto-Assigned Resource Pool */}
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
                  onChange={(e) => setNewResourceQuantity(e.target.value)}
                  placeholder="e.g. 50"
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

export default Events;
