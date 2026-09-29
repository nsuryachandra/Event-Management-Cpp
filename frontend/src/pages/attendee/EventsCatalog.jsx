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
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  Package, 
  Tag,
  Cpu,
  Cloud,
  Terminal,
  Flame
} from 'lucide-react';

export const EventsCatalog = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

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
    const matchesUpcoming = !showUpcomingOnly || (e.date && (e.date.includes('2026') || e.date.includes('2027')));
    return matchesSearch && matchesCat && matchesUpcoming;
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

  const getEventCoverConfig = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('ai') || cat.includes('robot')) {
      return {
        gradient: 'radial-gradient(ellipse at 85% 20%, rgba(16, 185, 129, 0.5) 0%, transparent 65%), radial-gradient(ellipse at 15% 85%, rgba(6, 182, 212, 0.4) 0%, transparent 60%), linear-gradient(135deg, #022c22 0%, #064e3b 45%, #0f172a 100%)',
        accentColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.22)',
        badgeBorder: 'rgba(52, 211, 153, 0.4)',
        badgeText: '#a7f3d0',
        icon: Cpu,
        themeTag: 'Neural AI Summit',
      };
    }
    if (cat.includes('cloud') || cat.includes('devops')) {
      return {
        gradient: 'radial-gradient(ellipse at 85% 20%, rgba(249, 115, 22, 0.5) 0%, transparent 65%), radial-gradient(ellipse at 15% 85%, rgba(219, 39, 119, 0.4) 0%, transparent 60%), linear-gradient(135deg, #431407 0%, #7c2d12 45%, #0f172a 100%)',
        accentColor: '#f97316',
        badgeBg: 'rgba(249, 115, 22, 0.22)',
        badgeBorder: 'rgba(251, 146, 60, 0.4)',
        badgeText: '#fed7aa',
        icon: Cloud,
        themeTag: 'Cloud Infrastructure',
      };
    }
    if (cat.includes('hack') || cat.includes('fintech') || cat.includes('finance')) {
      return {
        gradient: 'radial-gradient(ellipse at 85% 20%, rgba(244, 63, 94, 0.5) 0%, transparent 65%), radial-gradient(ellipse at 15% 85%, rgba(139, 92, 246, 0.4) 0%, transparent 60%), linear-gradient(135deg, #4c0519 0%, #881337 45%, #0f172a 100%)',
        accentColor: '#f43f5e',
        badgeBg: 'rgba(244, 63, 94, 0.22)',
        badgeBorder: 'rgba(251, 113, 133, 0.4)',
        badgeText: '#fecdd3',
        icon: Terminal,
        themeTag: 'Hackathon Sprint',
      };
    }
    return {
      gradient: 'radial-gradient(ellipse at 85% 20%, rgba(99, 102, 241, 0.5) 0%, transparent 65%), radial-gradient(ellipse at 15% 85%, rgba(236, 72, 153, 0.4) 0%, transparent 60%), linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)',
      accentColor: '#818cf8',
      badgeBg: 'rgba(99, 102, 241, 0.22)',
      badgeBorder: 'rgba(129, 140, 248, 0.4)',
      badgeText: '#c7d2fe',
      icon: Sparkles,
      themeTag: 'Flagship Tech Conclave',
    };
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Radiant Luxury Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '84px 24px 64px',
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(248, 250, 252, 0.8) 100%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Soft Glow Orb */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.09) 0%, rgba(236, 72, 153, 0.04) 45%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>

            {/* Radiant Announcement Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#4f46e5',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.08)',
              }}
            >
              <Sparkles size={14} style={{ color: '#6366f1' }} />
              <span>Next-Gen Event Admissions & Fair FIFO Queuing</span>
            </div>

            {/* Headline */}
            <h1
              className="display-font"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 'clamp(2.5rem, 4.8vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
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
                  display: 'inline-block',
                }}
              >
                Guaranteed Fair Queuing
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              style={{
                fontSize: '1.05rem',
                color: '#64748b',
                lineHeight: 1.6,
                maxWidth: '620px',
                fontWeight: 450,
                marginTop: '2px',
              }}
            >
              Reserve your seat at premier conferences, track live venue seating in real time, and experience seamless, fair admissions.
            </p>

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
              className="input-focus-glow"
              style={{
                width: '100%',
                paddingLeft: 42,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: '0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                outline: 'none',
                fontFamily: "var(--font-sans)",
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
                  className="filter-pill-btn"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "var(--font-display)",
                    letterSpacing: '0.01em',
                    border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  {cat === 'ALL' ? '✨ All Conferences' : cat}
                </button>
              );
            })}

            {/* Dedicated Upcoming Filter Pill */}
            <button
              type="button"
              onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
              className="filter-pill-btn"
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 750,
                cursor: 'pointer',
                fontFamily: "var(--font-display)",
                letterSpacing: '0.01em',
                border: showUpcomingOnly ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                backgroundColor: showUpcomingOnly ? '#fef3c7' : '#ffffff',
                color: showUpcomingOnly ? '#b45309' : '#475569',
                boxShadow: showUpcomingOnly ? '0 4px 14px rgba(245, 158, 11, 0.25)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Flame size={14} style={{ color: showUpcomingOnly ? '#d97706' : '#f59e0b' }} />
              <span>Upcoming 2026 Schedule</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Spinner size={32} label="Loading active events..." />
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
              const coverConfig = getEventCoverConfig(ev.category);
              const CoverIcon = coverConfig.icon;

              return (
                <div
                  key={ev.id}
                  className="event-card-interactive"
                >
                  {/* Studio Mesh Gradient Banner or Custom Image Banner */}
                  <div
                    className="event-card-cover"
                    style={{
                      height: '200px',
                      position: 'relative',
                      background: coverConfig.gradient,
                      overflow: 'hidden',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Custom Image Banner if specified */}
                    {ev.imageUrl && (
                      <>
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.2) 40%, rgba(15, 23, 42, 0.88) 100%)',
                            zIndex: 1,
                            pointerEvents: 'none',
                          }}
                        />
                      </>
                    )}

                    {/* Default Background Decorative Rings/Constellation if no image */}
                    {!ev.imageUrl && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            right: -30,
                            bottom: -40,
                            width: 170,
                            height: 170,
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.08)',
                            pointerEvents: 'none',
                          }}
                        />
                        <div
                          className="event-card-watermark"
                          style={{
                            position: 'absolute',
                            right: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'rgba(255, 255, 255, 0.09)',
                            pointerEvents: 'none',
                          }}
                        >
                          <CoverIcon size={110} strokeWidth={1.1} />
                        </div>
                      </>
                    )}

                    {/* Top Row: Floating Glass Pill & Status Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 11px',
                          borderRadius: '999px',
                          backgroundColor: coverConfig.badgeBg,
                          border: `1px solid ${coverConfig.badgeBorder}`,
                          color: coverConfig.badgeText,
                          fontSize: '0.74rem',
                          fontWeight: 750,
                          backdropFilter: 'blur(8px)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        <CoverIcon size={13} />
                        <span>{ev.category || 'CONFERENCE'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(4px)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Upcoming
                        </span>

                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(15, 23, 42, 0.45)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#f8fafc',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isFull ? '#ef4444' : '#10b981',
                              boxShadow: isFull ? '0 0 8px #ef4444' : '0 0 8px #10b981',
                            }}
                          />
                          <span>{isFull ? 'Queue Only' : 'Open'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Tagline on Cover */}
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)', letterSpacing: '0.02em' }}>
                        {coverConfig.themeTag}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>
                        EVT-0{ev.id}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                    {/* Title */}
                    <h3
                      className="display-font event-card-title"
                      style={{
                        fontSize: '1.22rem',
                        fontWeight: 750,
                        letterSpacing: '-0.02em',
                        color: '#0f172a',
                        marginBottom: 8,
                        lineHeight: 1.35,
                      }}
                    >
                      {ev.title}
                    </h3>

                    {/* Description / Tagline */}
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: '#64748b',
                        lineHeight: 1.55,
                        marginBottom: 18,
                        flex: 1,
                      }}
                    >
                      {ev.tagline || ev.description}
                    </p>

                    {/* Live Capacity Meter */}
                    <div
                      className="event-card-meter"
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
                        className="event-btn-details"
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
                          textDecoration: 'none',
                        }}
                      >
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </Link>

                      <Link
                        to={`/register?eventId=${ev.id}`}
                        className="event-btn-register"
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
                          textDecoration: 'none',
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

