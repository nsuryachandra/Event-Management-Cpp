import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  PlusCircle, 
  MinusCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const Sections = () => {
  const { activeEventId, activeEvent } = useOutletContext();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState(30);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Place / Capacity Modal
  const [editSection, setEditSection] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quick action loading ID
  const [quickActionId, setQuickActionId] = useState(null);

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSections = async () => {
    try {
      const res = await api.getSections(activeEventId);
      if (res.success && res.data) {
        setSections(res.data);
      }
    } catch {
      showToast('Error loading section data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, [activeEventId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      showToast('Place / Area / Hall name is required', 'error');
      return;
    }
    if (newSectionCapacity <= 0) {
      showToast('Seating capacity must be at least 1', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createSection({
        eventId: activeEventId,
        name: newSectionName.trim(),
        capacity: parseInt(newSectionCapacity, 10),
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowCreateModal(false);
        setNewSectionName('');
        setNewSectionCapacity(30);
        loadSections();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to create custom area', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (sec) => {
    setEditSection(sec);
    setEditName(sec.name);
    setEditCapacity(sec.capacity);
  };

  const handleQuickExpand = async (sec, delta) => {
    const targetCapacity = sec.capacity + delta;
    if (targetCapacity < sec.occupied) {
      showToast(`Capacity cannot be reduced below current occupied seats (${sec.occupied}).`, 'error');
      return;
    }

    setQuickActionId(sec.id);
    try {
      const res = await api.updateSectionCapacity(sec.id, targetCapacity);
      if (res.success) {
        showToast(res.message, 'success');
        loadSections();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update capacity', 'error');
    } finally {
      setQuickActionId(null);
    }
  };

  const handleUpdateCapacitySubmit = async (e) => {
    e.preventDefault();
    if (!editSection) return;

    if (!editName.trim()) {
      showToast('Area / Place name cannot be empty', 'error');
      return;
    }

    if (editCapacity < editSection.occupied) {
      showToast(`Capacity cannot be lower than current occupied seats (${editSection.occupied}).`, 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.updateSection(editSection.id, {
        name: editName.trim(),
        capacity: parseInt(editCapacity, 10),
      });
      if (res.success) {
        showToast(res.message, 'success');
        setEditSection(null);
        loadSections();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update area details', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteSection(deleteTarget.id);
      if (res.success) {
        showToast(res.message, 'success');
        setDeleteTarget(null);
        loadSections();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to delete section', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: 'var(--sapphire-light)',
                color: 'var(--sapphire)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--sapphire-border)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {activeEvent?.title || 'Active Event'}
            </span>
          </div>
          <h1 className="display-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.025em' }}>
            Event Tracks & Dynamic Capacity Limits
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', marginTop: 2 }}>
            Add custom tracks, set limits, and auto-admit the #1 FIFO waiting candidate when expanding capacity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadSections}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add Custom Track
          </button>
        </div>
      </div>

      {/* Auto-Admission Rule Callout */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--sapphire-light)',
          border: '1px solid var(--sapphire-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <ShieldCheck size={22} style={{ color: 'var(--sapphire)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
          <strong>Automatic FIFO Queue Admission:</strong> When a section is full and you increase its capacity (+1 or more), the C++ engine immediately checks the FIFO queue and <strong>automatically admits the first candidate</strong> waiting for that track without skipping!
        </div>
      </div>

      {/* Sections Grid */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Spinner size={32} label="Loading event tracks and capacity meters..." />
        </div>
      ) : sections.length === 0 ? (
        <div className="light-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Layers size={40} style={{ color: 'var(--ink-muted)', margin: '0 auto 12px' }} />
          <h3 className="display-font" style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Tracks Created Yet</h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Click "Add Custom Track" to configure session areas and capacity limits.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16 }}
          >
            <Plus size={14} /> Add First Track
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
          }}
        >
          {sections.map((sec) => {
            const isFull = sec.occupied >= sec.capacity;
            const occPct = Math.round((sec.occupied / sec.capacity) * 100);
            const isBusy = quickActionId === sec.id;

            return (
              <div
                key={sec.id}
                className="card gradient-top-accent card-hover"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                      {sec.name}
                    </h3>
                    <span className="mono-font" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                      AREA / HALL #{sec.id}
                    </span>
                  </div>
                  <Badge
                    status={isFull ? 'FULL' : 'OPEN'}
                    label={isFull ? 'Queueing (FIFO)' : `${sec.available} Seats Open`}
                  />
                </div>

                {/* Progress Bar & Seating Count */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: 8 }}>
                    <span style={{ color: 'var(--ink-secondary)' }}>
                      <strong style={{ color: 'var(--ink-primary)' }}>{sec.occupied}</strong> / {sec.capacity} Admitted
                    </span>
                    <span className="mono-font" style={{ color: isFull ? '#dc2626' : '#059669', fontWeight: 800 }}>
                      {occPct}% Capacity
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-main)' }}>
                    <div
                      style={{
                        width: `${Math.min(occPct, 100)}%`,
                        height: '100%',
                        background: isFull ? 'var(--grad-ruby)' : occPct >= 75 ? 'var(--grad-sunset)' : 'var(--grad-emerald)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Capacity Stepper & Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      title="Quick Expand Capacity (+1 Seat & Auto-Admit Front of Queue)"
                      disabled={isBusy}
                      onClick={() => handleQuickExpand(sec, 1)}
                      className="btn btn-emerald btn-sm"
                      style={{
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        padding: '6px 10px',
                      }}
                    >
                      <PlusCircle size={14} /> +1 Seat (Auto-Admit FIFO)
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(sec)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Place Name & Seating Capacity Limit"
                    >
                      <Edit3 size={13} /> Edit Place
                    </button>
                    <button
                      type="button"
                      disabled={sec.occupied > 0}
                      onClick={() => setDeleteTarget(sec)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#dc2626' }}
                      title={sec.occupied > 0 ? 'Cannot delete area with active attendees' : 'Delete Area'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Custom Area / Hall Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Add Custom Event Place / Hall"
          subtitle="Configure a custom seating capacity limit for this session area."
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="track-name">Place / Hall / Room Name *</label>
              <input
                id="track-name"
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Hall A - Keynote Arena, Workshop Lab 2, VIP Lounge"
                required
              />
            </div>

            <div>
              <label htmlFor="track-cap">Seating Capacity Limit *</label>
              <input
                id="track-cap"
                type="number"
                min="1"
                max="2000"
                value={newSectionCapacity}
                onChange={(e) => setNewSectionCapacity(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary btn-sm"
              >
                {isCreating ? 'Creating Area...' : 'Create Place / Area'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Place / Capacity Modal */}
      {editSection && (
        <Modal
          isOpen={true}
          onClose={() => setEditSection(null)}
          title={`Edit Area: ${editSection.name}`}
          subtitle={`Current capacity: ${editSection.capacity} seats | Currently occupied: ${editSection.occupied} seats`}
        >
          <form onSubmit={handleUpdateCapacitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="edit-place-name">Place / Hall / Room Name *</label>
              <input
                id="edit-place-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Hall A - Main Stage"
                required
              />
            </div>

            <div>
              <label htmlFor="new-cap">
                Seating Capacity Limit (Minimum: {editSection.occupied}) *
              </label>
              <input
                id="new-cap"
                type="number"
                min={editSection.occupied}
                max="2000"
                value={editCapacity}
                onChange={(e) => setEditCapacity(parseInt(e.target.value) || editSection.occupied)}
                required
              />
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.84rem',
                color: 'var(--ink-secondary)',
                lineHeight: 1.5,
              }}
            >
              <strong>FIFO Auto-Admit Guarantee:</strong> If you increase this limit, candidates waiting at the front of the FIFO queue for this place will be <strong>automatically admitted</strong> in exact chronological arrival order!
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditSection(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary btn-sm"
              >
                {isUpdating ? 'Saving...' : 'Save Place & Capacity'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Event Track"
          message={`Are you sure you want to delete '${deleteTarget.name}'? This action cannot be undone.`}
          confirmText="Yes, Delete Track"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Sections;
