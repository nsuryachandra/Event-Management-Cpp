import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  UserCheck,
  Clock,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

const AVATAR_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#059669',
  '#d97706',
  '#e11d48',
  '#7c3aed',
];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const getAvatarColor = (id = 0) => {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
};

export const Attendees = () => {
  const { activeEventId, activeEvent } = useOutletContext();
  const [attendees, setAttendees] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const { showToast } = useToast();

  // Edit Modal
  const [editAttendee, setEditAttendee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Cancel Dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, secRes] = await Promise.all([
        api.getAttendees({
          eventId: activeEventId,
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
        }),
        api.getSections(activeEventId),
      ]);

      if (attRes.success && attRes.data) setAttendees(attRes.data);
      if (secRes.success && secRes.data) setSections(secRes.data);
    } catch {
      showToast('Error loading attendees from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEventId, statusFilter, sectionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openEditModal = (att) => {
    if (att.status === 'WAITING') {
      showToast('Waiting attendees cannot be edited while in queue to preserve queue integrity.', 'error');
      return;
    }
    setEditAttendee(att);
    setEditName(att.name);
    setEditEmail(att.email);
    setEditPhone(att.phone);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editAttendee) return;

    setIsSavingEdit(true);
    try {
      const res = await api.updateAttendee(editAttendee.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      });

      if (res.success) {
        showToast(res.message || 'Attendee details updated', 'success');
        setEditAttendee(null);
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error updating attendee', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelAttendee(cancelTarget.id);
      if (res.success) {
        showToast(res.message || 'Registration cancelled and seat released', 'success');
        setCancelTarget(null);
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error cancelling attendee', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAttendee(deleteTarget.id);
      if (res.success) {
        showToast(res.message || 'Attendee removed successfully', 'success');
        setDeleteTarget(null);
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error deleting attendee', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Counts
  const totalCount = attendees.length;
  const admittedCount = attendees.filter((a) => a.status === 'ADMITTED').length;
  const waitingCount = attendees.filter((a) => a.status === 'WAITING').length;
  const cancelledCount = attendees.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
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
            Attendee Roster
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Manage registrations, view queue positions, update contact info, or release reserved seating.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Registered</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{totalCount}</div>
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Admitted & Confirmed</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginTop: 2 }}>{admittedCount}</div>
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>In FIFO Waitlist</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: 2 }}>{waitingCount}</div>
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cancelled</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#64748b', marginTop: 2 }}>{cancelledCount}</div>
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
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'ALL', label: 'All Attendees' },
            { key: 'ADMITTED', label: 'Admitted' },
            { key: 'WAITING', label: 'Waitlist' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className="filter-pill-btn"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: statusFilter === tab.key ? 700 : 550,
                backgroundColor: statusFilter === tab.key ? '#eef2ff' : '#ffffff',
                color: statusFilter === tab.key ? '#4f46e5' : '#475569',
                border: statusFilter === tab.key ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: statusFilter === tab.key ? '0 2px 6px rgba(79, 70, 229, 0.15)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section Filter & Search */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {sections.length > 0 && (
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="input-focus-glow"
              style={{
                fontSize: '0.8125rem',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                width: 'auto',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="ALL">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="input-focus-glow"
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                paddingTop: '7px',
                paddingBottom: '7px',
                fontSize: '0.8125rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                outline: 'none',
                width: '100%',
              }}
            />
          </form>
        </div>
      </div>

      {/* Attendees Table */}
      <div 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Spinner size={32} label="Loading attendees..." />
          </div>
        ) : attendees.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginBottom: 4 }}>
              No attendees found
            </div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {search || statusFilter !== 'ALL' || sectionFilter !== 'ALL'
                ? 'Try resetting the filters or clearing the search.'
                : 'No attendees have registered for this event yet.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Attendee</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Contact</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Section / Hall</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Registered At</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((att) => (
                  <tr key={att.id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: getAvatarColor(att.id),
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(att.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{att.name}</div>
                          <span 
                            style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '0.6875rem', 
                              color: '#64748b', 
                            }}
                          >
                            #EVT-{att.id + 1000}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', color: '#334155', fontSize: '0.8125rem' }}>
                      <div>{att.email}</div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{att.phone}</span>
                    </td>

                    <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500, fontSize: '0.8125rem' }}>
                      {att.section || 'General Admission'}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <Badge 
                        status={att.status} 
                        label={att.status === 'WAITING' ? `Waiting #${att.waitingPosition}` : att.status} 
                        size="sm" 
                      />
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.8125rem' }}>
                      {att.registeredAt}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {att.status === 'ADMITTED' && (
                          <button
                            onClick={() => openEditModal(att)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            title="Edit details"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {att.status === 'ADMITTED' && (
                          <button
                            onClick={() => setCancelTarget(att)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#d97706' }}
                            title="Cancel Pass & Release Seat"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(att)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 6px', fontSize: '0.75rem', color: '#dc2626' }}
                          title="Remove Permanently"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Attendee Modal */}
      {editAttendee && (
        <Modal
          isOpen={true}
          onClose={() => setEditAttendee(null)}
          title="Edit Attendee Details"
          subtitle={`Update contact details for ${editAttendee.name}.`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditAttendee(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="btn btn-primary"
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Cancel Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Cancel Registration"
          message={`Are you sure you want to cancel the registration for ${cancelTarget.name}? Their reserved seat and kit will be released back to the event pool.`}
          confirmLabel={isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Remove Attendee"
          message={`Are you sure you want to delete ${deleteTarget.name} permanently? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Attendee'}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Attendees;
