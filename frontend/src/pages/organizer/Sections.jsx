import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import VenueHeatmap from '../../components/VenueHeatmap';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck
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
      setLoading(true);
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
      showToast('Area / Hall name is required', 'error');
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
        showToast(res.message || 'Track created successfully', 'success');
        setShowCreateModal(false);
        setNewSectionName('');
        setNewSectionCapacity(30);
        loadSections();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to create area', 'error');
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
        showToast(res.message || `Capacity increased to ${targetCapacity}!`, 'success');
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
      showToast('Area name cannot be empty', 'error');
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
        showToast(res.message || 'Area details updated', 'success');
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
        showToast(res.message || 'Section deleted', 'success');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
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
              {activeEvent ? activeEvent.title : 'All Events'}
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
            Seating & Floor Layout
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Manage room capacities, monitor real-time utilization heatmaps, and automatically admit waiting list attendees when expanding capacity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            <Plus size={15} /> Add Track / Room
          </button>
        </div>
      </div>

      {/* Auto-Admission Rule Callout */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div style={{ fontSize: '0.875rem', color: '#312e81', lineHeight: 1.5 }}>
          <strong style={{ color: '#1e1b4b' }}>Strict FIFO Auto-Admission:</strong> When an area is at full capacity and you increase its seating limit, the engine automatically admits candidates from the front of the waiting queue for that track without manual re-registration.
        </div>
      </div>

      {/* Interactive Venue Floor Heatmap */}
      {!loading && sections.length > 0 && (
        <VenueHeatmap 
          sections={sections} 
          title="Floor Layout & Real-Time Capacity Heatmap" 
        />
      )}

      {/* Sections Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner size={32} label="Loading session tracks..." />
        </div>
      ) : sections.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          <Layers size={36} style={{ color: '#4f46e5', margin: '0 auto 10px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#0f172a' }}>No Session Areas Created</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            Click "Add Track / Room" to configure seating limits and track zones.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 14 }}
          >
            <Plus size={14} /> Add First Track
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {sections.map((sec) => {
            const isFull = sec.occupied >= sec.capacity;
            const occPct = Math.round((sec.occupied / sec.capacity) * 100);
            const isBusy = quickActionId === sec.id;

            return (
              <div
                key={sec.id}
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
                className="card-hover"
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                      {sec.name}
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b' }}>
                      Track #{sec.id}
                    </span>
                  </div>
                  <Badge
                    status={isFull ? 'FULL' : 'OPEN'}
                    label={isFull ? 'Full (Queueing)' : `${sec.available} Seats Available`}
                  />
                </div>

                {/* Progress Bar & Seating Count */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>
                      Occupied: <strong style={{ color: '#0f172a' }}>{sec.occupied}</strong> / {sec.capacity} seats
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: isFull ? '#e11d48' : '#059669', fontWeight: 600 }}>
                      {occPct}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(occPct, 100)}%`,
                        height: '100%',
                        backgroundColor: isFull ? '#e11d48' : occPct >= 75 ? '#f59e0b' : '#10b981',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Capacity Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      title="Add 1 seat and auto-admit next in waitlist"
                      disabled={isBusy}
                      onClick={() => handleQuickExpand(sec, 1)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                      }}
                    >
                      +1 Seat
                    </button>
                    <button
                      type="button"
                      title="Add 5 seats and auto-admit next in waitlist"
                      disabled={isBusy}
                      onClick={() => handleQuickExpand(sec, 5)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                      }}
                    >
                      +5 Seats
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(sec)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Edit Track"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={sec.occupied > 0}
                      onClick={() => setDeleteTarget(sec)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626' }}
                      title={sec.occupied > 0 ? 'Cannot delete track with active attendees' : 'Delete Track'}
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

      {/* Create Custom Track Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Add Session Track / Room"
          subtitle="Configure a seating capacity limit for this session area."
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="track-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Room / Track Name *
              </label>
              <input
                id="track-name"
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Main Auditorium, Workshop Room 2"
                required
              />
            </div>

            <div>
              <label htmlFor="track-cap" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Seating Capacity *
              </label>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
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
                {isCreating ? 'Creating...' : 'Create Track'}
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
          subtitle={`Current capacity: ${editSection.capacity} | Occupied: ${editSection.occupied}`}
        >
          <form onSubmit={handleUpdateCapacitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="edit-place-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Track / Room Name *
              </label>
              <input
                id="edit-place-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="new-cap" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Seating Capacity (Minimum: {editSection.occupied}) *
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
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                fontSize: '0.8125rem',
                color: '#3730a3',
                lineHeight: 1.45,
              }}
            >
              Increasing this capacity will automatically admit candidates from the front of the FIFO waitlist.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditSection(null)}
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
