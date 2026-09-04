import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import { 
  Calendar, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Search, 
  Ticket, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Users,
  Package,
  Zap,
  Tag
} from 'lucide-react';

export const EventsCatalog = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    api.getEvents()
      .then((res) => {
        if (res.success && res.data) {
          setEvents(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...new Set(events.map((e) => e.category).filter(Boolean))];

  const filteredEvents = events.filter((e) => {
    const matchesSearch = 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.tagline && e.tagline.toLowerCase().includes(search.toLowerCase())) ||
      (e.venue && e.venue.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Category Accent Colors & Gradients
  const getCategoryGradient = (category) => {
    switch ((category || '').toUpperCase()) {
      case 'ARTIFICIAL INTELLIGENCE':
      case 'AI':
        return 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)';
      case 'CLOUD COMPUTING':
      case 'CLOUD':
        return 'linear-gradient(90deg, #059669 0%, #06b6d4 100%)';
      case 'FINTECH':
      case 'FINANCE':
        return 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)';
      case 'DEVELOPER':
      case 'TECH':
      case 'TECHNOLOGY':
      default:
        return 'linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)';
    }
  };

  const getCategoryColor = (category) => {
    switch ((category || '').toUpperCase()) {
      case 'ARTIFICIAL INTELLIGENCE':
      case 'AI':
        return '#8b5cf6';
      case 'CLOUD COMPUTING':
      case 'CLOUD':
        return '#059669';
      case 'FINTECH':
      case 'FINANCE':
        return '#d97706';
      default:
        return '#2563eb';
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Radiant Luxury Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 64px',
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(241, 245, 249, 0.6) 100%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Glow Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
            {/* Top Engine Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'rgba(238, 242, 255, 0.9)',
                border: '1px solid rgba(199, 210, 254, 0.8)',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.1)',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                }}
              >
                C++17 ENGINE
              </span>
              <span style={{ fontSize: '0.84rem', color: '#4338ca', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Zero-Skip Fair FIFO Queue • Instant Resource Allocation
              </span>
            </div>

            {/* Headline */}
            <h1
              className="display-font"
              style={{
                fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.035em',
                color: '#0f172a',
                maxWidth: '920px',
              }}
            >
              Intelligent Admissions &{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Guaranteed Fair Queuing
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              style={{
                fontSize: '1.14rem',
                color: '#475569',
                lineHeight: 1.65,
                maxWidth: '720px',
                fontWeight: 500,
              }}
            >
              Reserve your seat at premium conferences, track live venue seating limits in real time, and experience guaranteed mathematical zero-skip admissions.
            </p>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                <ShieldCheck size={16} style={{ color: '#2563eb' }} />
                <span>Deterministic FIFO Fairness</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
                <span>Live Seat & Capacity Sync</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Zap size={16} style={{ color: '#d97706' }} />
                <span>Ultra-Fast In-Memory Arrays</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Listing */}
      <div style={{ maxWidth: '1240px', margin: '48px auto 0', padding: '0 24px' }}>
        {/* Search & Category Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 36,
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.06)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by event title, venue, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 42,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: '0.9rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.15s ease',
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: '0.01em',
                    border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat === 'ALL' ? '✨ All Conferences' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Spinner size={32} label="Fetching active events from C++ Engine..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '70px 20px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px dashed #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#64748b',
              }}
            >
              <Calendar size={28} />
            </div>
            <h3 className="display-font" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              No Conferences Found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: 6, maxWidth: '400px', margin: '6px auto 0' }}>
              We couldn't find any events matching your search. Try another keyword or switch categories.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
              gap: 28,
            }}
          >
            {filteredEvents.map((ev) => {
              const capacity = ev.totalCapacity || ev.capacity || 100;
              const occupied = ev.totalOccupied || ev.occupied || 0;
              const occupancyPct = Math.min(100, Math.round((occupied / capacity) * 100));
              const seatsAvailable = Math.max(0, capacity - occupied);
              const isFull = seatsAvailable === 0;

              return (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(79, 70, 229, 0.16), 0 6px 12px -2px rgba(15, 23, 42, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  {/* Top Colorful Accent Strip */}
                  <div
                    style={{
                      height: '6px',
                      background: getCategoryGradient(ev.category),
                      width: '100%',
                    }}
                  />

                  <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Category Chip & Event ID */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          backgroundColor: '#f1f5f9',
                          color: getCategoryColor(ev.category),
                          padding: '4px 12px',
                          borderRadius: '999px',
                          border: '1px solid #e2e8f0',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ev.category || 'CONFERENCE'}
                      </span>
                      <span className="mono-font" style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
                        EVT-0{ev.id}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="display-font"
                      style={{
                        fontSize: '1.42rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: '#0f172a',
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {ev.title}
                    </h3>

                    {/* Description / Tagline */}
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#475569',
                        lineHeight: 1.55,
                        marginBottom: 18,
                        flex: 1,
                      }}
                    >
                      {ev.tagline || ev.description}
                    </p>

                    {/* Live Capacity Meter */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        marginBottom: 18,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                          <Users size={14} style={{ color: '#4f46e5' }} />
                          <span>Place & Seating Capacity</span>
                        </div>
                        <span
                          className="mono-font"
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: isFull ? '#dc2626' : '#059669',
                          }}
                        >
                          {isFull ? 'Queueing Mode' : `${seatsAvailable} Seats Free`}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          height: 7,
                          backgroundColor: '#e2e8f0',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${occupancyPct}%`,
                            background: isFull
                              ? 'linear-gradient(90deg, #ea580c 0%, #dc2626 100%)'
                              : 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                        <span>{occupied} Admitted</span>
                        <span>{capacity} Total Limit</span>
                      </div>
                    </div>

                    {/* Date & Venue Box */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        fontSize: '0.84rem',
                        color: '#334155',
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{ev.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={15} style={{ color: '#ea580c', flexShrink: 0 }} />
                        <span className="truncate" style={{ fontWeight: 500 }}>{ev.venue}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                      <Link
                        to={`/events/${ev.id}`}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </Link>

                      <Link
                        to={`/register?eventId=${ev.id}`}
                        style={{
                          flex: 1.3,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          padding: '10px 16px',
                          borderRadius: '10px',
                          color: '#ffffff',
                          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                          border: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Ticket size={15} />
                        <span>Register Pass</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsCatalog;

