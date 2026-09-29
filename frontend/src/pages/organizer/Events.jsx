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
  Layers, 
  Users,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Tag,
  Image as ImageIcon,
  Upload,
  Sparkles,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'Design & Product'
];

const IMAGE_PRESETS = [
  { label: 'Technology', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI & Neural', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cloud Systems', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cybersecurity', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Coding Lab', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80' },
];

const getCategoryGradient = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ai') || cat.includes('robot')) {
    return 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #0f172a 100%)';
  }
  if (cat.includes('cloud') || cat.includes('devops')) {
    return 'linear-gradient(135deg, #431407 0%, #7c2d12 45%, #0f172a 100%)';
  }
  if (cat.includes('cyber') || cat.includes('hack') || cat.includes('fintech')) {
    return 'linear-gradient(135deg, #4c0519 0%, #881337 45%, #0f172a 100%)';
  }
  return 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)';
};

export const Events = () => {
  const { events, refreshEvents } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { showToast } = useToast();

  // Create Event Modal State
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Event Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editCapacity, setEditCapacity] = useState(50);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Event Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Direct card-level seat boost loading state
  const [boostingId, setBoostingId] = useState(null);

  const openDeleteModal = (ev) => {
    setDeletingEvent(ev);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteEvent(deletingEvent.id);
      if (res.success) {
        showToast(res.message || `Event '${deletingEvent.title}' was successfully removed.`, 'success');
        setShowDeleteModal(false);
        setDeletingEvent(null);
        refreshEvents();
      } else {
        showToast(res.message || 'Failed to remove event.', 'error');
      }
    } catch {
      showToast('Failed to remove event.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || '');
    setEditTagline(ev.tagline || '');
    setEditDescription(ev.description || '');
    setEditDate(ev.date || '');
    setEditVenue(ev.venue || '');
    setEditCategory(ev.category || 'Technology');
    setEditCapacity(ev.totalCapacity || 50);
    setEditImageUrl(ev.imageUrl || '');
    setShowEditModal(true);
  };

  const handleDirectBoost = async (ev, delta) => {
    const newCap = (ev.totalCapacity || 0) + delta;
    setBoostingId(ev.id);
    try {
      const res = await api.updateEvent(ev.id, {
        title: ev.title,
        tagline: ev.tagline,
        description: ev.description,
        date: ev.date,
        venue: ev.venue,
        category: ev.category,
        capacity: newCap,
      });

      if (res.success) {
        showToast(`Increased capacity for "${ev.title}" to ${newCap} seats!`, 'success');
        refreshEvents();
      } else {
        showToast(res.message || 'Failed to update capacity', 'error');
      }
    } catch {
      showToast('Network error updating capacity', 'error');
    } finally {
      setBoostingId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate.trim() || !editVenue.trim()) {
      showToast('Title, Date, and Venue are required.', 'error');
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
        imageUrl: editImageUrl.trim(),
      });

      if (res.success) {
        showToast(res.message || 'Event updated successfully!', 'success');
        setShowEditModal(false);
        refreshEvents();
      } else {
        showToast(res.message || 'Failed to update event', 'error');
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
      showToast('Title, Date, and Venue are required.', 'error');
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
        tagline: newTagline.trim() || 'Professional event and workshops.',
        description: newDescription.trim() || 'Interactive event session.',
        date: newDate.trim(),
        venue: newVenue.trim(),
        category: newCategory.trim(),
        capacity: cap,
        resourceName: newResourceName.trim() || `${newTitle.trim()} - Badges & Kits`,
        resourceQuantity: parseInt(newResourceQuantity, 10) || cap,
        imageUrl: newImageUrl.trim(),
      });

      if (res.success) {
        showToast(`Event '${newTitle}' created successfully!`, 'success');
        setShowCreateModal(false);
        setNewTitle('');
        setNewTagline('');
        setNewDescription('');
        setNewDate('');
        setNewVenue('');
        setNewCapacity(50);
        setNewResourceName('');
        setNewResourceQuantity(50);
        setNewImageUrl('');
        refreshEvents();
      } else {
        showToast(res.message || 'Failed to create event', 'error');
      }
    } catch {
      showToast('Failed to create event', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = (ev.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ev.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: 16,
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              {events.length} Events Total
            </span>
          </div>

          <h1 
            style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#0f172a', 
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              margin: '0 0 6px 0',
            }}
          >
            Events Directory
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '640px', margin: 0 }}>
            Configure seat capacities, manage venue tracks, and oversee attendee registrations across all active events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            <Plus size={15} /> Create Event
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: selectedCategory === cat ? 600 : 500,
                backgroundColor: selectedCategory === cat ? '#eef2ff' : '#ffffff',
                color: selectedCategory === cat ? '#4f46e5' : '#475569',
                border: selectedCategory === cat ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or venue..."
            style={{
              paddingLeft: '32px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontSize: '0.8125rem',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
          }}
        >
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginBottom: 4 }}>
            No events found
          </div>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search criteria.' : 'Click "Create Event" to start your first conference.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filteredEvents.map((ev) => {
            const occPct = ev.occupancyPercentage || 0;
            const isFull = occPct >= 100;
            const isBoosting = boostingId === ev.id;

            return (
              <div
                key={ev.id}
                style={{
                  padding: '22px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                }}
                className="card-hover"
              >
                <div>
                  {/* Top Cover Banner */}
                  <div
                    style={{
                      height: '150px',
                      margin: '-22px -22px 14px -22px',
                      position: 'relative',
                      background: ev.imageUrl 
                        ? `linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.78) 100%), url(${ev.imageUrl}) center/cover no-repeat`
                        : getCategoryGradient(ev.category),
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 750,
                        padding: '3px 9px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.22)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        backdropFilter: 'blur(4px)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {ev.category}
                    </span>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.72rem', 
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: 700,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      EVT-#{ev.id}
                    </span>
                  </div>

                  <h3 
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.15rem', 
                      fontWeight: 600, 
                      color: '#0f172a', 
                      margin: '0 0 6px 0',
                    }}
                  >
                    {ev.title}
                  </h3>

                  {ev.tagline && (
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                      {ev.tagline}
                    </p>
                  )}

                  <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} style={{ color: '#4f46e5' }} />
                      <span>{ev.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} style={{ color: '#059669' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.venue}</span>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  {/* Seating Progress */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>
                      Seating: <strong style={{ color: '#0f172a' }}>{ev.totalOccupied || 0} / {ev.totalCapacity || 0}</strong>
                    </span>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 600, 
                        color: isFull ? '#e11d48' : '#4f46e5' 
                      }}
                    >
                      {occPct}%
                    </span>
                  </div>

                  <div 
                    style={{ 
                      width: '100%', 
                      height: 6, 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: '999px', 
                      overflow: 'hidden', 
                      marginBottom: 12 
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor: isFull ? '#e11d48' : occPct >= 75 ? '#f59e0b' : '#10b981',
                        width: `${Math.min(100, occPct)}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleDirectBoost(ev, 5)}
                        disabled={isBoosting}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Add 5 seats"
                      >
                        +5 Seats
                      </button>
                      <button
                        onClick={() => openEditModal(ev)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(ev)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#e11d48', borderColor: '#fecdd3' }}
                        title="Remove Event"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <Link
                      to={`/organizer?eventId=${ev.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <span>Dashboard</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Create New Event"
          subtitle="Configure event details, date, venue, capacity limits, and resource kits."
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Event Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Distributed Systems Summit 2026"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Tagline
              </label>
              <input
                type="text"
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                placeholder="e.g. Architecting high-throughput resilience."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Event overview and sessions..."
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Date / Schedule *
                </label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. Dec 10-12, 2026"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Venue Location *
                </label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Tech Arena Grand Hall"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Total Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Badge / Kit Pool Name
                </label>
                <input
                  type="text"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="e.g. VIP Badges & Kits"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Kit Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newResourceQuantity}
                  onChange={(e) => setNewResourceQuantity(parseInt(e.target.value) || 1)}
                  placeholder="50"
                />
              </div>
            </div>

            {/* Top Cover Banner Image Section */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={14} style={{ color: '#4f46e5' }} />
                  Card Cover Banner Image
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#64748b' }}>(Optional)</span>
                </label>
                {newImageUrl && (
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('')}
                    style={{ fontSize: '0.72rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                  >
                    <X size={12} /> Clear to default
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Custom header image for the event card. If left blank, the card uses the default vibrant {newCategory} gradient color.
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste image URL (https://...) or choose preset below"
                  style={{ flex: 1, fontSize: '0.8125rem' }}
                />
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Upload image from computer"
                >
                  <Upload size={13} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEv) => setNewImageUrl(uploadEv.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                {IMAGE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setNewImageUrl(p.url)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: newImageUrl === p.url ? '#818cf8' : '#e2e8f0',
                      backgroundColor: newImageUrl === p.url ? '#eef2ff' : '#ffffff',
                      color: newImageUrl === p.url ? '#4f46e5' : '#475569',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Card Banner Preview */}
              <div
                style={{
                  height: '100px',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: newImageUrl 
                    ? `linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%), url(${newImageUrl}) center/cover no-repeat`
                    : getCategoryGradient(newCategory),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 750,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(4px)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {newCategory}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600, opacity: 0.9 }}>
                    Preview: {newImageUrl ? 'Custom Image' : 'Default Gradient'}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Top of Card
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title="Edit Event"
          subtitle="Modify details and seating capacity."
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Event Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Tagline
              </label>
              <input
                type="text"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Date / Schedule *
                </label>
                <input
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Total Capacity *
                </label>
                <input
                  type="number"
                  min={editingEvent.totalOccupied || 1}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Venue Location *
              </label>
              <input
                type="text"
                value={editVenue}
                onChange={(e) => setEditVenue(e.target.value)}
                required
              />
            </div>

            {/* Top Cover Banner Image Section (Edit) */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={14} style={{ color: '#4f46e5' }} />
                  Card Cover Banner Image
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#64748b' }}>(Optional)</span>
                </label>
                {editImageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('')}
                    style={{ fontSize: '0.72rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                  >
                    <X size={12} /> Clear to default
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Custom header image for the event card. If left blank, the card uses the default vibrant {editCategory} gradient color.
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Paste image URL (https://...) or choose preset below"
                  style={{ flex: 1, fontSize: '0.8125rem' }}
                />
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Upload image from computer"
                >
                  <Upload size={13} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEv) => setEditImageUrl(uploadEv.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                {IMAGE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setEditImageUrl(p.url)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: editImageUrl === p.url ? '#818cf8' : '#e2e8f0',
                      backgroundColor: editImageUrl === p.url ? '#eef2ff' : '#ffffff',
                      color: editImageUrl === p.url ? '#4f46e5' : '#475569',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Card Banner Preview */}
              <div
                style={{
                  height: '100px',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: editImageUrl 
                    ? `linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%), url(${editImageUrl}) center/cover no-repeat`
                    : getCategoryGradient(editCategory),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 750,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(4px)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {editCategory}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600, opacity: 0.9 }}>
                    Preview: {editImageUrl ? 'Custom Image' : 'Default Gradient'}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Top of Card
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  const evToDelete = editingEvent;
                  setShowEditModal(false);
                  openDeleteModal(evToDelete);
                }}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #fecdd3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <Trash2 size={13} />
                Remove Event
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
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
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Event Confirmation Modal */}
      {showDeleteModal && deletingEvent && (
        <Modal
          isOpen={true}
          onClose={() => !isDeleting && setShowDeleteModal(false)}
          title="Remove Event"
          subtitle={`Permanently remove '${deletingEvent.title}' and all its data.`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div 
              style={{ 
                display: 'flex', 
                gap: 12, 
                alignItems: 'flex-start', 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: '#fff1f2', 
                border: '1px solid #fecdd3' 
              }}
            >
              <AlertTriangle size={22} style={{ color: '#e11d48', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.84rem', color: '#9f1239', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem' }}>
                  Are you sure you want to remove this event?
                </strong>
                This action is permanent and cannot be undone. Removing <strong>{deletingEvent.title}</strong> will also erase its associated tracks, attendee registrations, waitlist queue, and resource allocations.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="btn"
                style={{
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  border: '1px solid #e11d48',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Removing Event...' : 'Confirm Remove Event'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;
