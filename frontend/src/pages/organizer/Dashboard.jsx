import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { ActivityFeed } from '../../components/ActivityFeed';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Layers, 
  Boxes, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  ListOrdered,
  Calendar,
  Cpu,
  Edit3,
  UserPlus,
  Trash2,
  XCircle,
  ShieldCheck,
  Armchair,
  ExternalLink
} from 'lucide-react';

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
      const res = await api.admitNext(activeEventId || 0);
      if (res.success) {
        showToast(res.message, 'success');
        loadData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error while processing FIFO admission', 'error');
    } finally {
      setAdmitting(false);
    }
  };

  const handleExpandCapacity = async (secId, currentCap, delta) => {
    try {
      const newCap = currentCap + delta;
      const res = await api.updateSectionCapacity(secId, newCap);
      if (res.success) {
        showToast(res.message || `Capacity increased to ${newCap}!`, 'success');
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
        showToast(`Cancelled registration for ${attName}. Seat and resource auto-released.`, 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to cancel registration', 'error');
      }
    } catch {
      showToast('Network error cancelling member', 'error');
    }
  };

  const handleDeleteAttendee = async (attId, attName) => {
    try {
      const res = await api.deleteAttendee(attId);
      if (res.success) {
        showToast(`Member ${attName} removed. Resource synced.`, 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to delete member', 'error');
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
    const targetSection = (stats.sections && stats.sections[0]?.name) || activeEvent?.venue || 'Silicon Convention Arena';

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
          showToast(`Admitted ${memberName}! Seat and Resource automatically allocated.`, 'success');
        } else {
          showToast(`Event capacity full. ${memberName} placed in FIFO waiting queue at position #${res.data.waitingPosition}.`, 'warning');
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
        showToast(res.message || 'Event details and seating updated!', 'success');
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
    return <Spinner size={40} label="Loading operations dashboard..." />;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Cpu size={15} /> {isOverallView ? 'Multi-Event Master Console' : 'Event Operations Console'}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
            {isOverallView ? 'Overall Multi-Event Dashboard' : (activeEvent?.title || 'Event Operations Center')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {isOverallView 
              ? `Unified aggregate overview of ${events.length} active events across the platform.`
              : `${activeEvent?.date} • ${activeEvent?.venue} — Live capacity, FIFO admissions, and auto-synced resources.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!isOverallView && (
            <>
              <button
                onClick={openEditEventModal}
                className="btn btn-secondary btn-sm"
                style={{ fontWeight: 700, color: '#4f46e5' }}
              >
                <Edit3 size={14} /> Edit Event & Seats
              </button>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={15} /> Add Member
              </button>
            </>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <StatCard
          title={isOverallView ? "Global Registrations" : "Event Registrations"}
          value={stats.totalRegistrations}
          subtitle="Processed in 1D Array"
          icon={<Users size={20} />}
          color="primary"
        />
        <StatCard
          title="Admitted Attendees"
          value={stats.admitted}
          subtitle={`Seating: ${stats.totalOccupied} / ${stats.totalCapacity}`}
          icon={<UserCheck size={20} />}
          color="success"
          trend={`${stats.overallUtilization}% full`}
        />
        <StatCard
          title="FIFO Waiting Queue"
          value={stats.waiting}
          subtitle="Circular Array Queue"
          icon={<Clock size={20} />}
          color="warning"
          trend={stats.waiting > 0 ? 'Strict Order' : 'Empty'}
        />
        <StatCard
          title="Resources Auto-Allocated"
          value={stats.resourcesAllocated || 0}
          subtitle={`Available: ${stats.resourcesAvailable || 0} in stock`}
          icon={<Boxes size={20} />}
          color="secondary"
          trend="Auto-Synced"
        />
      </div>

      {/* OVERALL MULTI-EVENT VIEW: All Events Breakdown Grid */}
      {isOverallView && stats.events && stats.events.length > 0 && (
        <div className="card gradient-top-accent" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="display-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
              All Managed Events Overview
            </h3>
            <span className="mono-font" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
              {stats.events.length} Active Events
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {stats.events.map((ev) => (
              <div
                key={ev.id}
                className="card card-hover"
                style={{
                  padding: '18px 20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span
                      className="mono-font"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: '#4f46e5',
                      }}
                    >
                      {ev.category}
                    </span>
                    <span className="mono-font" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                      #{ev.id}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink-primary)', margin: '0 0 6px 0' }}>
                    {ev.title}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 10 }}>
                    {ev.date} • {ev.venue}
                  </div>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--ink-muted)' }}>
                      Seats: <strong style={{ color: 'var(--ink-primary)' }}>{ev.totalOccupied || 0} / {ev.totalCapacity || 0}</strong>
                    </span>
                    <span className="mono-font" style={{ fontWeight: 800, color: '#4f46e5' }}>
                      {ev.occupancyPercentage || 0}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-main)', marginBottom: 12 }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        background: (ev.occupancyPercentage || 0) >= 90 ? 'var(--grad-ruby)' : 'var(--grad-emerald)',
                        width: `${Math.min(100, ev.occupancyPercentage || 0)}%`,
                      }}
                    />
                  </div>

                  <Link
                    to={`/organizer?eventId=${ev.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                  >
                    Manage Event Dashboard →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Row: FIFO Waiting Queue Snapshot & Capacity Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* FIFO Waiting Queue Snapshot Hero Card */}
        <div className="card gradient-top-accent" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--grad-primary)',
                  color: '#ffffff',
                  boxShadow: 'var(--shadow-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ListOrdered size={18} />
              </div>
              <div>
                <h3 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  FIFO Waiting Queue
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                  {stats.queueSnapshot.queueCount} waiting in circular array queue
                </span>
              </div>
            </div>

            <Link to={`/organizer/waiting-list?eventId=${activeEventId || 0}`} className="btn btn-secondary btn-sm">
              Manage Queue <ArrowRight size={14} />
            </Link>
          </div>

          {stats.queueSnapshot.isQueueEmpty ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-strong)',
                color: 'var(--ink-muted)',
                fontSize: '0.88rem',
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#059669', margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>No attendees currently on waiting list</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>All registrants have been admitted.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.queueSnapshot.frontAttendee && (
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.08)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: 'var(--grad-primary)',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      FRONT OF QUEUE (#01)
                    </span>
                    <div className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-primary)', marginTop: 4 }}>
                      {stats.queueSnapshot.frontAttendee.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginTop: 2 }}>
                      Place: <strong style={{ color: '#4f46e5' }}>{stats.queueSnapshot.frontAttendee.section}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleQuickAdmit}
                    disabled={admitting}
                    className={`btn ${stats.queueSnapshot.canAdmitFront ? 'btn-emerald' : 'btn-secondary'} btn-sm`}
                  >
                    {admitting ? 'Admitting...' : stats.queueSnapshot.canAdmitFront ? 'Admit Next (Auto-Allocate Resource) →' : 'Seats Full (Strict FIFO)'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.queueSnapshot.preview.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-main)',
                      fontSize: '0.86rem',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="mono-font" style={{ fontWeight: 800, color: '#4f46e5', background: 'rgba(79, 70, 229, 0.1)', padding: '2px 6px', borderRadius: 'var(--radius-xs)' }}>
                        #{String(att.waitingPosition).padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{att.name}</span>
                    </div>
                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{att.section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Place & Capacity Status Card */}
        <div className="card gradient-top-accent" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--grad-aurora)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <h3 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Place & Seating Capacity
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                  {isOverallView ? 'Total platform capacity' : `Live seats for ${activeEvent?.title}`}
                </span>
              </div>
            </div>

            <Link to={`/organizer/attendees?eventId=${activeEventId || 0}`} className="btn btn-secondary btn-sm">
              View Attendees <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.sections.map((sec) => {
              const isFull = sec.occupied >= sec.capacity;
              const barGradient = isFull ? 'var(--grad-ruby)' : sec.occupancyPercentage >= 75 ? 'var(--grad-sunset)' : 'var(--grad-emerald)';

              return (
                <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{sec.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono-font" style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {sec.occupied} / {sec.capacity} seats
                      </span>
                      <Badge status={sec.status} label={sec.statusLabel} size="sm" />
                      <button
                        onClick={() => handleExpandCapacity(sec.id, sec.capacity, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700, color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)' }}
                        title="Add 1 Seat & Auto-Admit Next Waiting"
                      >
                        +1 Seat
                      </button>
                      <button
                        onClick={() => handleExpandCapacity(sec.id, sec.capacity, 5)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', borderColor: 'rgba(79, 70, 229, 0.3)' }}
                        title="Add 5 Seats & Auto-Admit Next Waiting"
                      >
                        +5 Seats
                      </button>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-main)' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        background: barGradient,
                        width: `${Math.min(100, sec.occupancyPercentage)}%`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEPARATE EVENT VIEW: Live Member & Attendee Management Section */}
      {!isOverallView && (
        <div className="card gradient-top-accent" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="display-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Live Event Members & Auto-Sync
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(5, 150, 105, 0.1)',
                    color: '#059669',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                  }}
                >
                  Auto-Sync Active
                </span>
              </div>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', margin: '3px 0 0 0' }}>
                Adding, admitting, cancelling, or removing members automatically syncs seat counts and resource allocations.
              </p>
            </div>

            <button
              onClick={() => setShowAddMemberModal(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={15} /> Add Member
            </button>
          </div>

          {stats.attendees && stats.attendees.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-main)', color: 'var(--ink-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Member</th>
                    <th style={{ padding: '10px 14px' }}>Contact</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Registered At</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.attendees.slice(0, 10).map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                        <div>{att.name}</div>
                        <span className="mono-font" style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
                          EVT-{att.id + 1000}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--ink-secondary)', fontSize: '0.82rem' }}>
                        <div>{att.email}</div>
                        <span style={{ color: 'var(--ink-muted)', fontSize: '0.76rem' }}>{att.phone}</span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <Badge status={att.status} label={att.status === 'WAITING' ? `Waiting #${att.waitingPosition}` : att.status} size="sm" />
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--ink-muted)', fontSize: '0.8rem' }}>
                        {att.registeredAt}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {att.status === 'ADMITTED' && (
                            <button
                              onClick={() => handleCancelAttendee(att.id, att.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#ea580c' }}
                              title="Cancel Pass & Auto-Release Resource"
                            >
                              Cancel Pass
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAttendee(att.id, att.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#dc2626' }}
                            title="Remove Member Permanently"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-muted)', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              No members registered yet for this event. Click <strong>+ Add Member</strong> to create the first registration.
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Resource Inventory & Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Resources Snapshot */}
        <div className="card gradient-top-accent" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--grad-sunset)',
                  color: '#ffffff',
                  boxShadow: 'var(--shadow-sunset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Boxes size={18} />
              </div>
              <div>
                <h3 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Resource Inventory
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                  {isOverallView ? 'All event pools' : `Equipment & badge assets for ${activeEvent?.title}`}
                </span>
              </div>
            </div>

            <Link to={`/organizer/resources?eventId=${activeEventId || 0}`} className="btn btn-secondary btn-sm">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {stats.resources && stats.resources.length > 0 ? (
              stats.resources.map((res) => (
                <div
                  key={res.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-main)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {res.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Allocated:</span>
                    <strong style={{ color: '#ea580c' }}>{res.allocated} / {res.total}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Available:</span>
                    <strong style={{ color: '#059669' }}>{res.available}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', color: 'var(--ink-muted)', fontSize: '0.84rem', gridColumn: '1 / -1' }}>
                No resources registered for this event yet.
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card gradient-top-accent" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
              Recent Operations Log
            </h3>
            <span className="badge badge-default" style={{ fontSize: '0.72rem' }}>Live Audit</span>
          </div>

          <ActivityFeed activities={stats.activities} maxItems={6} />
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddMemberModal(false)}
          title={`Add Member to ${activeEvent?.title || 'Event'}`}
          subtitle="Register an attendee with auto-assigned seat and resource allocation."
        >
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Full Name *
              </label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. David Miller"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Email Address *
              </label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="e.g. david@example.com"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Phone Number *
              </label>
              <input
                type="text"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.2)',
                fontSize: '0.8rem',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
              <span>
                Admitting this member will automatically allocate 1 unit from the event's resource pool.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
                {isAddingMember ? 'Registering...' : 'Add Member & Sync Resources'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Event Modal from Dashboard */}
      {showEditEventModal && activeEvent && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditEventModal(false)}
          title={`Edit '${activeEvent.title}'`}
          subtitle="Modify venue, schedule, and expand seats."
        >
          <form onSubmit={handleEditEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: '100%' }}
                required
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
                  min={activeEvent.totalOccupied || 1}
                  max="10000"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  style={{ width: '100%', fontWeight: 700 }}
                  required
                />
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
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
                {isUpdatingEvent ? 'Saving...' : 'Save Changes & Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
