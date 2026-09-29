import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { 
  Ticket, 
  User, 
  Mail, 
  Phone, 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  QrCode,
  Check
} from 'lucide-react';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(
    parseInt(searchParams.get('eventId')) || 1
  );
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    searchParams.get('section') || ''
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getEvents()
      .then((res) => {
        if (res.success && res.data) {
          setEvents(res.data);
          const paramId = parseInt(searchParams.get('eventId'));
          if (paramId && res.data.some((e) => e.id === paramId)) {
            setSelectedEventId(paramId);
          } else if (res.data.length > 0 && !selectedEventId) {
            setSelectedEventId(res.data[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    api.getSections(selectedEventId).then((res) => {
      if (res.success && res.data) {
        setSections(res.data);
        const urlSection = searchParams.get('section');
        const matched = res.data.find((s) => s.name === urlSection);
        if (matched) {
          setSelectedSection(matched.name);
        } else if (res.data.length > 0) {
          setSelectedSection(res.data[0].name);
        }
      }
    });
  }, [selectedEventId]);

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const activeSectionObj = sections.find((s) => s.name === selectedSection);
  const isSectionFull = activeSectionObj ? activeSectionObj.occupied >= activeSectionObj.capacity : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !selectedSection) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        eventId: selectedEventId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        section: selectedSection,
      };

      const res = await api.register(payload);
      if (res.success && res.data) {
        if (res.data.status === 'ADMITTED') {
          showToast(`Admitted to ${selectedSection}. Pass issued.`, 'success');
        } else {
          showToast(`Section full. Assigned to FIFO queue at Position #${res.data.waitingPosition}.`, 'warning');
        }
        navigate(`/registration/${res.data.id}`);
      } else {
        showToast(res.message || 'Registration request could not be processed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error communicating with C++ backend.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spinner size={32} label="Loading registration portal..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '48px auto 90px', padding: '0 24px' }}>
      <Link
        to={selectedEventId ? `/events/${selectedEventId}` : '/'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.84rem',
          color: '#4f46e5',
          fontWeight: 700,
          marginBottom: 28,
          backgroundColor: '#eef2ff',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid #c7d2fe',
        }}
      >
        <ArrowLeft size={14} /> Back to Event
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32, alignItems: 'start' }}>
        {/* Left Column: Live Digital Badge Pass Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              LIVE TICKET PREVIEW
            </span>
            <h2 className="display-font" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              Your Official Digital Pass
            </h2>
          </div>

          {/* Interactive Live Pass Visualizer */}
          <div
            style={{
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 12px 30px -4px rgba(79, 70, 229, 0.15), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Pass Top Ribbon */}
            <div
              style={{
                background: isSectionFull
                  ? 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                padding: '22px 24px',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="mono-font" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
                  EVENTORA ADMISSION PASS
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.03em',
                  }}
                >
                  {isSectionFull ? 'FIFO QUEUE' : 'GUARANTEED SEAT'}
                </span>
              </div>

              <div className="display-font" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {activeEvent?.title || 'Conference Pass'}
              </div>
            </div>

            {/* Pass Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ATTENDEE NAME
                  </div>
                  <div className="display-font" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {name.trim() || 'Your Full Name'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                    {email.trim() || 'attendee@email.com'}
                  </div>
                </div>

                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4f46e5',
                  }}
                >
                  <QrCode size={30} />
                </div>
              </div>

              {/* Grid Meta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  backgroundColor: '#f8fafc',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: 18,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    SESSION / PLACE
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {selectedSection || 'Select Place'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    DATE
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {activeEvent?.date || '2026'}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: isSectionFull ? '#fffbeb' : '#ecfdf5',
                  border: `1px solid ${isSectionFull ? '#fde68a' : '#a7f3d0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {isSectionFull ? (
                  <Clock size={16} style={{ color: '#d97706', flexShrink: 0 }} />
                ) : (
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                )}
                <div style={{ fontSize: '0.78rem', color: isSectionFull ? '#92400e' : '#065f46', fontWeight: 600 }}>
                  {isSectionFull
                    ? 'Place is full. You will be assigned a verified spot in the Circular FIFO Queue.'
                    : `Instant admission ready. ${activeSectionObj?.available || 0} seats left in this place.`}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <ShieldCheck size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, fontWeight: 500 }}>
              Admissions are processed fairly with guaranteed real-time capacity validation.
            </span>
          </div>
        </div>

        {/* Right Column: Registration Form Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
            padding: '32px',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 className="display-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Attendee Registration
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 4 }}>
              Fill in your details below to generate your official pass credential.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label htmlFor="event-select" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Select Event *
              </label>
              <select
                id="event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
                className="input-focus-glow"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  fontWeight: 600,
                  outline: 'none',
                }}
                required
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Select Event Place / Session *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sections.map((sec) => {
                  const isSelected = selectedSection === sec.name;
                  const isFull = sec.occupied >= sec.capacity;
                  const remaining = Math.max(0, sec.capacity - sec.occupied);
                  const pct = Math.min(100, Math.round((sec.occupied / sec.capacity) * 100)) || 0;

                  return (
                    <div
                      key={sec.id || sec.name}
                      onClick={() => setSelectedSection(sec.name)}
                      className={`track-card-selector ${isSelected ? 'selected' : ''} ${isFull ? 'is-full' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            background: isSelected
                              ? (isFull ? '#fed7aa' : '#e0e7ff')
                              : '#f1f5f9',
                            color: isSelected
                              ? (isFull ? '#ea580c' : '#4f46e5')
                              : '#64748b',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Layers size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                              {sec.name}
                            </span>
                            {isFull ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: '#fff7ed',
                                  color: '#ea580c',
                                  border: '1px solid #ffedd5',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <Clock size={11} />
                                Full • Waitlist
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #dcfce7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <Check size={11} />
                                {remaining} seat{remaining === 1 ? '' : 's'} available
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                            <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: isFull ? '#ea580c' : (pct > 75 ? '#f59e0b' : '#6366f1'),
                                  borderRadius: 99,
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                              {sec.occupied}/{sec.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection Radio / Check Pill */}
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: isSelected
                            ? `2px solid ${isFull ? '#ea580c' : '#4f46e5'}`
                            : '2px solid #cbd5e1',
                          background: isSelected
                            ? (isFull ? '#ea580c' : '#4f46e5')
                            : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          flexShrink: 0,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="full-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="full-name"
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-focus-glow"
                  style={{
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 14,
                    paddingTop: 11,
                    paddingBottom: 11,
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="email-address"
                  type="email"
                  placeholder="e.g. alice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-focus-glow"
                  style={{
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 14,
                    paddingTop: 11,
                    paddingBottom: 11,
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone-number" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="e.g. +1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-focus-glow"
                  style={{
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 14,
                    paddingTop: 11,
                    paddingBottom: 11,
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  padding: '13px 22px',
                  borderRadius: '12px',
                  color: '#ffffff',
                  background: isSectionFull
                    ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                  boxShadow: isSectionFull
                    ? '0 4px 14px rgba(234, 88, 12, 0.35)'
                    : '0 4px 16px rgba(79, 70, 229, 0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {submitting ? (
                  <Spinner size={18} label="Processing Registration..." />
                ) : isSectionFull ? (
                  <>
                    <Clock size={17} />
                    <span>Join Priority Waiting List</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    <span>Complete Registration & Issue Pass</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

