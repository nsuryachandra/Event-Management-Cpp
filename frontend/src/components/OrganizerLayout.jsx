import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Modal } from './Modal';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';

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
  const [newImageUrl, setNewImageUrl] = useState('');
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
      showToast('Title, Date, and Venue are required', 'error');
      return;
    }

    if (newCapacity <= 0) {
      showToast('Seating capacity must be at least 1', 'error');
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
        capacity: parseInt(newCapacity, 10),
        resourceName: newResourceName.trim() || `${newTitle.trim()} - Badges & Kits`,
        resourceQuantity: parseInt(newResourceQuantity, 10) || parseInt(newCapacity, 10),
        imageUrl: newImageUrl.trim(),
      });

      if (res.success && res.data) {
        showToast(`Event '${res.data.title}' created successfully!`, 'success');
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

  // Standard practical presets
  const EVENT_PRESETS = [
    {
      label: 'Conference Track',
      title: 'Global Tech & Engineering Conference 2026',
      tagline: 'High-throughput architecture, microservices, and reliable cloud systems.',
      description: 'Industry keynote tracks, architecture breakdowns, and cross-team networking for senior engineers.',
      venue: 'Metropolitan Convention Hall - Main Auditorium',
      date: 'Oct 24-26, 2026',
      category: 'Technology',
      capacity: 150,
      resourceName: 'Attendee Badges & Conference Kits',
      resourceUnits: 150,
    },
    {
      label: 'Developer Summit',
      title: 'Distributed Systems & Cloud Conclave',
      tagline: 'Zero-downtime platforms, eBPF telemetry, and global resilience.',
      description: 'Engineering keynote tracks on scalable distributed platforms and production resilience.',
      venue: 'Metropolis Expo Pavilion - Hall B',
      date: 'Nov 12-14, 2026',
      category: 'Cloud Computing',
      capacity: 100,
      resourceName: 'Developer Badges & Workshop Packs',
      resourceUnits: 100,
    },
    {
      label: 'Hands-on Workshop',
      title: 'Cyber Defense & Security Operations Sprint',
      tagline: 'Threat modeling, incident response, and cryptographic security.',
      description: 'Intense technical drills covering adversarial modeling and defense pipelines.',
      venue: 'Tech Innovation Pavilion - Lab 4',
      date: 'Dec 04-05, 2026',
      category: 'Cybersecurity',
      capacity: 60,
      resourceName: 'Security Tokens & Lab Passports',
      resourceUnits: 60,
    },
  ];

  const handleApplyPreset = (preset) => {
    setNewTitle(preset.title);
    setNewTagline(preset.tagline);
    setNewDescription(preset.description);
    setNewVenue(preset.venue);
    setNewDate(preset.date);
    setNewCategory(preset.category);
    setNewCapacity(preset.capacity);
    setNewResourceName(preset.resourceName);
    setNewResourceQuantity(preset.resourceUnits);
    showToast(`Template applied: ${preset.label}`, 'info');
  };

  return (
    <div 
      className="organizer-portal-root"
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Sidebar activeEventId={activeEventId} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Modern Sticky Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
          }}
        >
          {/* Left: Event Scope Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="floating-selector"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} style={{ color: '#4f46e5' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  Event:
                </span>
              </div>

              <select
                value={activeEventId}
                onChange={handleEventChange}
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  paddingRight: '6px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="0">All Events (Global Summary)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                {events.length} Active
              </span>
            </div>
          </div>

          {/* Right: Operational Status & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            <button
              onClick={loadEvents}
              title="Refresh Event Data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.8125rem',
                padding: '7px 14px',
              }}
            >
              <Plus size={15} />
              <span>Create Event</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ activeEventId, activeEvent, events, refreshEvents: loadEvents }} />
        </main>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Create New Event"
          subtitle="Configure event details, date, venue, capacity limits, and resource kits."
        >
          {/* Quick Presets Bar */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                Quick Presets:
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Auto-fill details & capacity
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EVENT_PRESETS.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleApplyPreset(tpl)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Event Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Annual Cloud Summit 2026"
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
                placeholder="e.g. Next-generation systems architecture."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Full agenda and overview..."
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
                  placeholder="e.g. Nov 14-16, 2026"
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
                  Venue / Location *
                </label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Grand Convention Pavilion"
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

            {/* Resource Pool Auto-Allocation */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Badge / Kit Pool Name
                </label>
                <input
                  type="text"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="e.g. VIP Badges & Welcome Kits"
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
