import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import VenueHeatmap from '../../components/VenueHeatmap';
import { 
  Calendar, 
  MapPin, 
  Layers, 
  Ticket, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Sparkles,
  Users,
  Package,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';

export const EventHome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = parseInt(id) || 1;

  const [event, setEvent] = useState(null);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getEvent(eventId),
      api.getSections(eventId),
      api.getResources(eventId),
    ])
      .then(([evRes, secRes, resRes]) => {
        if (evRes.success && evRes.data) setEvent(evRes.data);
        if (secRes.success && secRes.data) setSections(secRes.data);
        if (resRes.success && resRes.data) setResources(resRes.data);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spinner size={32} label="Loading event sessions and capacity data..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <h2 className="display-font" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Event Not Found</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>The requested event was not found in the database.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  const capacity = event.totalCapacity || event.capacity || 100;
  const occupied = event.totalOccupied || event.occupied || 0;
  const occupancyPct = Math.min(100, Math.round((occupied / capacity) * 100));
  const seatsAvailable = Math.max(0, capacity - occupied);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Radiant Event Header Banner */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '52px 24px 56px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(241, 245, 249, 0.6) 100%)',
        }}
      >
        {/* Glow Orb */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '10%',
            width: '450px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.06) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.84rem',
              color: '#4f46e5',
              fontWeight: 700,
              marginBottom: 24,
              backgroundColor: '#eef2ff',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid #c7d2fe',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} /> Back to Events Catalog
          </Link>

          {event.imageUrl && (
            <div
              style={{
                width: '100%',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: 28,
                position: 'relative',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
              }}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 32,
            }}
          >
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    border: '1px solid #c7d2fe',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {event.category || 'CONFERENCE'}
                </span>
                <span className="mono-font" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Event ID #{event.id}
                </span>
              </div>

              <h1
                className="display-font"
                style={{
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#0f172a',
                  lineHeight: 1.18,
                  marginBottom: 14,
                }}
              >
                {event.title}
              </h1>

              <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.65, marginBottom: 24 }}>
                {event.description || event.tagline}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.88rem',
                    color: '#334155',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <Calendar size={16} style={{ color: '#2563eb' }} />
                  <span>{event.date}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.88rem',
                    color: '#334155',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <MapPin size={16} style={{ color: '#ea580c' }} />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            {/* Quick Registration Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
                padding: '28px',
                minWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ADMISSION STATUS
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: seatsAvailable > 0 ? '#ecfdf5' : '#fffbeb',
                    color: seatsAvailable > 0 ? '#059669' : '#d97706',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${seatsAvailable > 0 ? '#a7f3d0' : '#fde68a'}`,
                  }}
                >
                  {seatsAvailable > 0 ? '🟢 Seats Open' : '🟡 FIFO Queue Active'}
                </span>
              </div>

              <div>
                <div className="display-font" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                  {seatsAvailable} Seats Free
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                  {occupied} registered / {capacity} total place limit
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${occupancyPct}%`,
                    background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                    borderRadius: '999px',
                  }}
                />
              </div>

              <Link
                to={`/register?eventId=${eventId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  border: 'none',
                  marginTop: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <Ticket size={16} />
                <span>Register Admission Pass</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '1200px', margin: '48px auto 0', padding: '0 24px' }}>
        {/* Dedicated Resource Pool Box */}
        {resources.length > 0 && (
          <div
            style={{
              marginBottom: 36,
              padding: '20px 24px',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                }}
              >
                <Package size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  INCLUDED EVENT RESOURCE POOL
                </div>
                <div className="display-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {resources[0]?.name || 'VIP Conference Badge & Kit'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Automatically allocated upon attendee admission ({resources[0]?.available || 0} units available)
                </div>
              </div>
            </div>

            <div
              className="mono-font"
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                backgroundColor: '#f8fafc',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              Pool Total: {resources[0]?.total || 0} Units
            </div>
          </div>
        )}

        {/* Interactive Architectural Venue Floor Heatmap */}
        <VenueHeatmap 
          sections={sections} 
          title={`${event.title || 'Auditorium'} • Live Floor Heatmap`}
          onSelectSection={(sec) => {
            navigate(`/register?eventId=${eventId}&section=${encodeURIComponent(sec.name)}`);
          }}
        />

        {/* Available Places & Sessions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 className="display-font" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              Sessions & Place Capacity
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
              Select an available place or track to claim your admission pass.
            </p>
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#4f46e5',
              backgroundColor: '#eef2ff',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid #c7d2fe',
            }}
          >
            {sections.length} Place(s) Configured
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
          }}
        >
          {sections.map((sec) => {
            const isFull = sec.occupied >= sec.capacity;
            const secOccupancyPct = Math.round((sec.occupied / sec.capacity) * 100);

            return (
              <div
                key={sec.id}
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  borderLeft: isFull ? '4px solid #ea580c' : '4px solid #4f46e5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {sec.name}
                    </h3>
                    <span className="mono-font" style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                      SECTION-0{sec.id}
                    </span>
                  </div>
                  <Badge
                    status={isFull ? 'FULL' : 'OPEN'}
                    label={isFull ? 'FIFO Queue' : 'Seats Open'}
                  />
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#475569' }}>
                      {sec.occupied} / {sec.capacity} Admitted
                    </span>
                    <span style={{ color: isFull ? '#ea580c' : '#059669' }}>
                      {sec.available} Seats Free
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(secOccupancyPct, 100)}%`,
                        height: '100%',
                        backgroundColor: isFull ? '#ea580c' : '#4f46e5',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isFull ? 'Enters circular FIFO queue' : 'Instant admission & pass'}
                  </div>
                  <Link
                    to={`/register?eventId=${eventId}&section=${encodeURIComponent(sec.name)}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      padding: '8px 16px',
                      borderRadius: '10px',
                      color: isFull ? '#9a3412' : '#ffffff',
                      backgroundColor: isFull ? '#ffedd5' : '#4f46e5',
                      border: isFull ? '1px solid #fed7aa' : 'none',
                      boxShadow: isFull ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.25)',
                    }}
                  >
                    {isFull ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                    <span>{isFull ? 'Queue Up' : 'Register'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Academic Guarantee Box */}
        <div
          style={{
            marginTop: 40,
            padding: '24px 28px',
            borderRadius: '18px',
            backgroundColor: '#ffffff',
            border: '1px solid #c7d2fe',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 18,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="display-font" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1b4b', marginBottom: 4 }}>
              Fair Admissions Queue & Real-Time Capacity Management
            </h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
              When a track reaches capacity, attendees enter the waiting queue in strict order of arrival. As seats become available, candidates are admitted in sequential order, guaranteeing fair and unbiased admissions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventHome;

