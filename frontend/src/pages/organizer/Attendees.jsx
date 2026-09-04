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
  UserX, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

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
      showToast('Waiting attendees cannot be edited while in FIFO queue to protect queue integrity.', 'error');
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
        showToast(res.message, 'success');
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
        showToast(res.message, 'success');
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
        showToast(res.message, 'success');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="display-font" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Attendee Directory
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 2 }}>
            {activeEvent ? `Managing attendees for ${activeEvent.title}` : 'Linear array storage & search.'}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card gradient-top-accent" style={{ padding: '22px 26px' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or EVT-ID..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={16} /> Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ADMITTED">Admitted</option>
              <option value="WAITING">Waiting (FIFO)</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="ALL">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner size={36} label="Loading attendee records..." />
      ) : attendees.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            color: 'var(--ink-muted)',
          }}
        >
          <Users size={36} style={{ color: '#4f46e5', margin: '0 auto 12px' }} />
          <h3 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 4 }}>
            No Attendees Found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
            No records matched your search or filter in this event.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Attendee Name</th>
                <th>Contact</th>
                <th>Track / Section</th>
                <th>Status</th>
                <th>Registered At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((att) => (
                <tr key={att.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {att.registrationId}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{att.name}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>{att.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{att.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.88rem' }}>
                      {att.section}
                    </span>
                  </td>
                  <td>
                    <Badge status={att.status} />
                    {att.status === 'WAITING' && att.waitingPosition && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--warning-text)', fontWeight: 700, marginLeft: 6, fontFamily: 'var(--font-mono)' }}>
                        #{att.waitingPosition}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {att.registeredAt}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => openEditModal(att)}
                        disabled={att.status === 'WAITING'}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        title={att.status === 'WAITING' ? 'Waiting attendees cannot be edited' : 'Edit details'}
                      >
                        <Edit size={13} /> Edit
                      </button>

                      {att.status === 'ADMITTED' && (
                        <button
                          onClick={() => setCancelTarget(att)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title="Cancel admission"
                        >
                          <UserX size={13} /> Cancel
                        </button>
                      )}

                      {att.status !== 'WAITING' ? (
                        <button
                          onClick={() => setDeleteTarget(att)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px', color: '#dc2626' }}
                          title="Delete attendee record"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => showToast('Waiting attendees are protected in FIFO queue and cannot be removed directly.', 'error')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px', opacity: 0.35, cursor: 'not-allowed' }}
                          title="Protected in FIFO queue"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editAttendee && (
        <Modal
          isOpen={true}
          onClose={() => setEditAttendee(null)}
          title={`Edit Attendee: ${editAttendee.name}`}
          subtitle={`ID: ${editAttendee.registrationId} • Section: ${editAttendee.section}`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-main)',
                fontSize: '0.8rem',
                color: 'var(--text-sub)',
              }}
            >
              <strong>Academic Rule:</strong> Section and status cannot be changed directly via edit. To change tracks, attendees must cancel and re-register.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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

      {/* Cancel Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel Attendee Registration"
          message={`Are you sure you want to cancel the registration for ${cancelTarget.name} (${cancelTarget.section})? This will decrement section occupancy and free up one seat.`}
          confirmText="Yes, Cancel Registration"
          isDestructive={true}
          isLoading={isCancelling}
        />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Permanently Delete Attendee"
          message={`Are you sure you want to permanently remove ${deleteTarget.name} from the database? This action cannot be undone.`}
          confirmText="Yes, Delete Record"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Attendees;
