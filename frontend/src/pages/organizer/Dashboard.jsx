import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Layers, 
  Boxes, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  ListOrdered,
  Calendar,
  Edit3,
  UserPlus,
  Trash2,
  MapPin,
  Plus,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

const AVATAR_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#059669',
  '#d97706',
  '#e11d48',
  '#7c3aed',
];

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export const Dashboard = () => {
  const { activeEventId, activeEvent, events, refreshEvents } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admitting, setAdmitting] = useState(false);
  const { showToast } = useToast();

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Edit Event Modal State
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editCapacity, setEditCapacity] = useState(50);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(!activeEventId || activeEventId === 0 ? null : activeEventId);
      if (res && res.success && res.data) {
        setData(res.data);
      }
    } catch {
      showToast('Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEventId]);

  const handleQuickAdmit = async () => {
    setAdmitting(true);
    try {
      if (stats?.queueSnapshot?.canAdmitFront) {
        const res = await api.admitNext(activeEventId || 0);
        if (res.success) {
          showToast(res.message, 'success');
          loadData();
        } else {
          showToast(res.message, 'error');
        }
      } else {
        // Section is full -> Open Seat (+1) & Admit candidate
        const front = stats?.queueSnapshot?.frontAttendee;
        const targetSectionName = front?.section;
        const matchSec = (stats?.sections || []).find(s => s.name === targetSectionName);

        if (matchSec) {
          const updateRes = await api.updateSectionCapacity(matchSec.id, matchSec.capacity + 1);
          if (updateRes.success) {
            showToast(`Seat opened! Admitted ${front?.name || 'candidate'} to ${matchSec.name}!`, 'success');
            loadData();
          } else {
            const res = await api.admitNext(activeEventId || 0, { openSeat: true });
            if (res.success) {
              showToast(res.message, 'success');
              loadData();
            } else {
              showToast(updateRes.message || res.message, 'error');
            }
          }
        } else {
          const res = await api.admitNext(activeEventId || 0, { openSeat: true });
          if (res.success) {
            showToast(res.message, 'success');
            loadData();
          } else {
            showToast(res.message, 'error');
          }
        }
      }
    } catch {
      showToast('Network error while processing admission', 'error');
    } finally {
      setAdmitting(false);
    }
  };

  const handleExpandCapacity = async (secId, currentCap, delta) => {
    try {
      const newCap = currentCap + delta;
      const res = await api.updateSectionCapacity(secId, newCap);
      if (res.success) {
        showToast(res.message || `Capacity updated to ${newCap}!`, 'success');
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update capacity', 'error');
    }
  };

  const handleCancelAttendee = async (attId, attName) => {
    try {
      const res = await api.cancelAttendee(attId);
      if (res.success) {
        showToast(`Registration for ${attName} cancelled. Seat and kit released.`, 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to cancel registration', 'error');
      }
    } catch {
      showToast('Network error cancelling attendee', 'error');
    }
  };

  const handleDeleteAttendee = async (attId, attName) => {
    try {
      const res = await api.deleteAttendee(attId);
      if (res.success) {
        showToast(`Member ${attName} removed.`, 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to remove member', 'error');
      }
    } catch {
      showToast('Network error removing member', 'error');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim() || !memberPhone.trim()) {
      showToast('Name, Email, and Phone are required.', 'error');
      return;
    }

    const currentEvId = activeEventId && activeEventId !== 0 ? activeEventId : (events[0]?.id || 1);
    const targetSection = (stats.sections && stats.sections[0]?.name) || activeEvent?.venue || 'Main Track';

    setIsAddingMember(true);
    try {
      const res = await api.register({
        eventId: currentEvId,
        name: memberName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim(),
        section: targetSection,
      });

      if (res.success && res.data) {
        if (res.data.status === 'ADMITTED') {
          showToast(`Admitted ${memberName}! Seat and kit allocated.`, 'success');
        } else {
          showToast(`Capacity full. ${memberName} placed in queue at position #${res.data.waitingPosition}.`, 'warning');
        }
        setShowAddMemberModal(false);
        setMemberName('');
        setMemberEmail('');
        setMemberPhone('');
        loadData();
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch {
      showToast('Network error registering member', 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  const openEditEventModal = () => {
    if (!activeEvent) return;
    setEditTitle(activeEvent.title || '');
    setEditDate(activeEvent.date || '');
    setEditVenue(activeEvent.venue || '');
    setEditCapacity(activeEvent.totalCapacity || 50);
    setShowEditEventModal(true);
  };

  const handleEditEventSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate.trim() || !editVenue.trim()) {
      showToast('Title, Date, and Venue are required.', 'error');
      return;
    }

    setIsUpdatingEvent(true);
    try {
      const res = await api.updateEvent(activeEvent.id, {
        title: editTitle.trim(),
        date: editDate.trim(),
        venue: editVenue.trim(),
        capacity: parseInt(editCapacity, 10),
      });

      if (res.success) {
        showToast(res.message || 'Event details updated!', 'success');
        setShowEditEventModal(false);
        if (refreshEvents) refreshEvents();
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update event', 'error');
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  if (loading && !data) {
    return <Spinner size={36} label="Loading dashboard..." />;
  }

  const isOverallView = !activeEventId || activeEventId === 0;

  const stats = data || {
    totalRegistrations: 0,
    admitted: 0,
    waiting: 0,
    cancelled: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    overallUtilization: 0,
    totalResources: 0,
    resourcesAllocated: 0,
    resourcesAvailable: 0,
    events: [],
    sections: [],
    queueSnapshot: { queueCount: 0, isQueueEmpty: true, canAdmitFront: false, frontAttendee: null, preview: [] },
    resources: [],
    activities: [],
    attendees: [],
  };

  const totalCap = stats.totalCapacity || (activeEvent?.totalCapacity || 100);
  const totalOcc = stats.admitted || stats.totalOccupied || 0;
  const queueDepth = stats.waiting || (stats.queueSnapshot?.queueCount) || 0;
  const currentOccPct = totalCap > 0 ? Math.min(100, Math.round((totalOcc / totalCap) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Overview Banner */}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#eef2ff',
                color: '#4f46e5',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid #c7d2fe',
              }}
            >
              {isOverallView ? 'Unified Console' : 'Event Console'}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid #a7f3d0',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Live Synced
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
            {isOverallView ? 'Operations Overview' : (activeEvent?.title || 'Event Operations Center')}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', color: '#64748b', fontSize: '0.875rem' }}>
            {isOverallView ? (
              <span>Aggregated metrics across {events.length} active events in the SQLite database.</span>
            ) : (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 500 }}>
                  <Calendar size={14} style={{ color: '#4f46e5' }} /> {activeEvent?.date}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 500 }}>
                  <MapPin size={14} style={{ color: '#059669' }} /> {activeEvent?.venue}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  Occupancy: {activeEvent?.totalOccupied || stats.totalOccupied} / {activeEvent?.totalCapacity || stats.totalCapacity} ({stats.overallUtilization}%)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {!isOverallView && (
            <>
              <button
                onClick={openEditEventModal}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={14} /> Edit Event
              </button>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={14} /> Add Attendee
              </button>
            </>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh metrics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard
          title={isOverallView ? "Global Registrations" : "Total Registrations"}
          value={stats.totalRegistrations}
          subtitle={`${stats.admitted} admitted • ${stats.waiting} waiting`}
          icon={<Users size={18} />}
          color="primary"
          trend="Total"
        />
        <StatCard
          title="Seating Occupancy"
          value={`${currentOccPct}%`}
          subtitle={`${stats.totalOccupied} / ${stats.totalCapacity} seats filled`}
          icon={<UserCheck size={18} />}
          color="emerald"
          trend={`${Math.max(0, stats.totalCapacity - stats.totalOccupied)} left`}
        />
        <StatCard
          title="FIFO Waitlist Queue"
          value={stats.waiting}
          subtitle={stats.waiting > 0 ? "Candidates waiting for seats" : "Queue clear"}
          icon={<Clock size={18} />}
          color={stats.waiting > 0 ? "warning" : "success"}
          trend={stats.waiting > 0 ? "In Line" : "Clear"}
        />
        <StatCard
          title="Resource Stock & Kits"
          value={stats.resourcesAllocated || 0}
          subtitle={`${stats.resourcesAvailable || 0} units available in stock`}
          icon={<Boxes size={18} />}
          color="secondary"
          trend="In Sync"
        />
      </div>

      {/* Real-Time Capacity Saturation Progress */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.875rem' }}>
          <div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              Venue Capacity Saturation
            </span>
            <span style={{ marginLeft: 8, color: '#64748b', fontSize: '0.8125rem' }}>
              Real-time seating distribution
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#4f46e5', fontSize: '0.8125rem' }}>
            {totalOcc} Confirmed / {totalCap} Total Capacity ({currentOccPct}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 10,
            backgroundColor: '#f1f5f9',
            borderRadius: '999px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: `${currentOccPct}%`,
              height: '100%',
              backgroundColor: '#10b981',
              transition: 'width 0.3s ease',
            }}
            title={`Admitted: ${totalOcc} attendees`}
          />
          {queueDepth > 0 && (
            <div
              style={{
                width: `${Math.min(100 - currentOccPct, Math.round((queueDepth / totalCap) * 100))}%`,
                height: '100%',
                backgroundColor: '#f59e0b',
                transition: 'width 0.3s ease',
              }}
              title={`Waiting in queue: ${queueDepth} candidates`}
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '0.8125rem', color: '#64748b' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              Admitted ({totalOcc})
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              In Waitlist ({queueDepth})
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
              Available ({Math.max(0, totalCap - totalOcc)})
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
            Queue Status: {stats.queueSnapshot?.isQueueEmpty ? 'Idle' : 'Active'}
          </span>
        </div>
      </div>

      {/* OVERALL MULTI-EVENT VIEW: All Events Breakdown Grid */}
      {isOverallView && stats.events && stats.events.length > 0 && (
        <div 
          style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 18,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  color: '#0f172a',
                  letterSpacing: '-0.015em',
                  margin: 0,
                }}
              >
                Managed Events Catalog
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '3px 0 0 0' }}>
                Select an event to open its dedicated operational console.
              </p>
            </div>
            <span 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              {stats.events.length} Events
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {stats.events.map((ev) => {
              const occPct = ev.occupancyPercentage || 0;
              const isFull = occPct >= 100;

              return (
                <div
                  key={ev.id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                    transition: 'all 0.15s ease',
                  }}
                  className="card-hover"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#eef2ff',
                          color: '#4f46e5',
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        {ev.category}
                      </span>
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '0.75rem', 
                          color: '#64748b' 
                        }}
                      >
                        #{ev.id}
                      </span>
                    </div>

                    <h4 
                      style={{ 
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem', 
                        fontWeight: 600, 
                        color: '#0f172a', 
                        margin: '0 0 8px 0',
                      }}
                    >
                      {ev.title}
                    </h4>

                    <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
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

                  <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                      <span style={{ color: '#64748b' }}>
                        Seats: <strong style={{ color: '#0f172a' }}>{ev.totalOccupied || 0} / {ev.totalCapacity || 0}</strong>
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

                    <Link
                      to={`/organizer?eventId=${ev.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Manage Event</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle Row: FIFO Queue & Seating Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        
        {/* FIFO Waiting Queue Hero Card */}
        <div 
          style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ListOrdered size={18} />
              </div>
              <div>
                <h3 
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem', 
                    fontWeight: 600, 
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  FIFO Queue Dispatch
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {stats.queueSnapshot.queueCount} candidate(s) in waiting list
                </span>
              </div>
            </div>

            <Link 
              to={`/organizer/waiting-list?eventId=${activeEventId || 0}`} 
              className="btn btn-secondary btn-sm"
            >
              Full Queue <ArrowRight size={13} />
            </Link>
          </div>

          {stats.queueSnapshot.isQueueEmpty ? (
            <div
              style={{
                padding: '32px 18px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>Queue Clear</div>
              <span style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '280px' }}>
                All registrants have been confirmed. Incoming overflow registrations will queue here in strict order.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.queueSnapshot.frontAttendee && (
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #fffdf7 0%, #fff7ed 100%)',
                    border: '1.5px solid #fed7aa',
                    boxShadow: '0 4px 16px -2px rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 750,
                        fontSize: '0.92rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                      }}
                    >
                      {getInitials(stats.queueSnapshot.frontAttendee.name)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 750,
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fde68a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Clock size={11} />
                          Next Candidate (#01)
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Target Track: <strong style={{ color: '#0f172a' }}>{stats.queueSnapshot.frontAttendee.section}</strong>
                        </span>
                      </div>

                      <div 
                        style={{ 
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem', 
                          fontWeight: 700, 
                          color: '#0f172a', 
                          marginTop: 3 
                        }}
                      >
                        {stats.queueSnapshot.frontAttendee.name}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleQuickAdmit}
                    disabled={admitting}
                    className="btn btn-sm"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontWeight: 750,
                      fontSize: '0.85rem',
                      color: '#ffffff',
                      background: stats.queueSnapshot.canAdmitFront
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                      boxShadow: stats.queueSnapshot.canAdmitFront
                        ? '0 4px 14px rgba(5, 150, 105, 0.3)'
                        : '0 4px 14px rgba(79, 70, 229, 0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {admitting ? (
                      'Admitting...' 
                    ) : stats.queueSnapshot.canAdmitFront ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Admit Next Candidate →</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        <span>Admit to Open Seat</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Queue Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.queueSnapshot.preview.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontWeight: 600, 
                          color: '#4f46e5', 
                          backgroundColor: '#eef2ff', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.6875rem', 
                        }}
                      >
                        #{String(att.waitingPosition).padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 500, color: '#0f172a' }}>{att.name}</span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{att.section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Track & Capacity Management Card */}
        <div 
          style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <h3 
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem', 
                    fontWeight: 600, 
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  Track & Seating Breakdown
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {stats.sections?.length || 0} active section(s)
                </span>
              </div>
            </div>

            <Link 
              to={`/organizer/sections?eventId=${activeEventId || 0}`} 
              className="btn btn-secondary btn-sm"
            >
              Floor Plan <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.sections.map((sec) => {
              const isFull = sec.occupied >= sec.capacity;

              return (
                <div 
                  key={sec.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 6,
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{sec.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                        <span 
                          style={{ 
                            fontFamily: 'var(--font-mono)', 
                            color: '#64748b', 
                            fontSize: '0.75rem', 
                          }}
                        >
                          {sec.occupied} / {sec.capacity} seats ({sec.occupancyPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Badge status={sec.status} label={sec.statusLabel} size="sm" />
                      <button
                        onClick={() => handleExpandCapacity(sec.id, sec.capacity, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Add 1 seat (auto-admits next in waitlist)"
                      >
                        +1 Seat
                      </button>
                      <button
                        onClick={() => handleExpandCapacity(sec.id, sec.capacity, 5)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Add 5 seats (auto-admits next in waitlist)"
                      >
                        +5 Seats
                      </button>
                    </div>
                  </div>

                  <div 
                    style={{ 
                      width: '100%', 
                      height: 6, 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '999px', 
                      overflow: 'hidden', 
                      marginTop: 2 
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor: isFull ? '#e11d48' : sec.occupancyPercentage >= 75 ? '#f59e0b' : '#10b981',
                        width: `${Math.min(100, sec.occupancyPercentage)}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Roster & Quick Actions Table (Separate Event View) */}
      {!isOverallView && (
        <div 
          style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                Registered Attendees
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '3px 0 0 0' }}>
                Recent attendees registered for {activeEvent?.title}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link 
                to={`/organizer/attendees?eventId=${activeEventId}`}
                className="btn btn-secondary btn-sm"
              >
                View All <ArrowRight size={13} />
              </Link>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={14} /> Add Attendee
              </button>
            </div>
          </div>

          {stats.attendees && stats.attendees.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 14px' }}>Attendee</th>
                    <th style={{ padding: '10px 14px' }}>Contact</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Registered At</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.attendees.slice(0, 6).map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              backgroundColor: getAvatarColor(att.name),
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.75rem',
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
                              ID #{att.id + 1000}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', color: '#334155', fontSize: '0.8125rem' }}>
                        <div>{att.email}</div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{att.phone}</span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <Badge status={att.status} label={att.status === 'WAITING' ? `Waiting #${att.waitingPosition}` : att.status} size="sm" />
                      </td>

                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8125rem' }}>
                        {att.registeredAt}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {att.status === 'ADMITTED' && (
                            <button
                              onClick={() => handleCancelAttendee(att.id, att.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#d97706' }}
                              title="Cancel Pass & Release Seat"
                            >
                              Cancel Pass
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAttendee(att.id, att.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.75rem', color: '#dc2626' }}
                            title="Remove Permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '28px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              No attendees registered yet for this event. Click <strong>+ Add Attendee</strong> to register.
            </div>
          )}
        </div>
      )}

      {/* Add Attendee Modal */}
      {showAddMemberModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddMemberModal(false)}
          title="Register Attendee"
          subtitle={`Add attendee to ${activeEvent?.title || 'event'}. Auto-allocates seat and kit if capacity is available.`}
        >
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingMember}
                className="btn btn-primary"
              >
                {isAddingMember ? 'Registering...' : 'Register Attendee'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && activeEvent && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditEventModal(false)}
          title="Edit Event Details"
          subtitle="Update schedule, venue location, or seating capacity limit."
        >
          <form onSubmit={handleEditEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  min={activeEvent.totalOccupied || 1}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowEditEventModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingEvent}
                className="btn btn-primary"
              >
                {isUpdatingEvent ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
