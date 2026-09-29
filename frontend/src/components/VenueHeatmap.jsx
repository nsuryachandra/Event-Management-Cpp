import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  MapPin, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';

export const VenueHeatmap = ({ sections = [], onSelectSection, title = "Interactive Venue Floor Plan" }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'tiers'

  // Aggregate stats
  const totalCapacity = sections.reduce((acc, s) => acc + (s.capacity || 0), 0) || 100;
  const totalOccupied = sections.reduce((acc, s) => acc + (s.occupied || 0), 0) || 0;
  const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
  const overallLoad = Math.round((totalOccupied / totalCapacity) * 100) || 0;

  // Helper to get color by occupancy
  const getSectionColor = (occupied = 0, capacity = 1) => {
    const pct = capacity > 0 ? (occupied / capacity) * 100 : 0;
    if (pct >= 100) return { bg: '#ef4444', text: '#991b1b', lightBg: '#fee2e2', border: '#fca5a5', label: 'Full / Waitlist' };
    if (pct >= 75) return { bg: '#f97316', text: '#9a3412', lightBg: '#ffedd5', border: '#fdba74', label: 'Filling Fast' };
    if (pct >= 40) return { bg: '#3b82f6', text: '#1e40af', lightBg: '#dbeafe', border: '#93c5fd', label: 'Filling Up' };
    return { bg: '#10b981', text: '#065f46', lightBg: '#d1fae5', border: '#6ee7b7', label: 'Available' };
  };

  // Map arbitrary sections to architectural pods (or use mock pods if few sections)
  const displaySections = sections.length > 0 ? sections : [
    { id: 1, name: 'VIP Grand Circle', capacity: 30, occupied: 28, available: 2 },
    { id: 2, name: 'Main Orchestra Tier', capacity: 60, occupied: 42, available: 18 },
    { id: 3, name: 'Balcony Mezzanine', capacity: 40, occupied: 12, available: 28 },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '32px 28px',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 45px -12px rgba(99, 102, 241, 0.08), 0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '36px',
      }}
    >
      {/* Background Ambience Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 60%), linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem',
                fontWeight: 850,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#4f46e5',
                backgroundColor: '#eef2ff',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid #c7d2fe',
              }}
            >
              <Sparkles size={12} /> Architectural View
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>• Live Floor Heatmap</span>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>

        {/* Aggregate Metrics HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: 600 }}>Load:</span>
            <strong style={{ color: overallLoad > 85 ? '#e11d48' : '#2563eb', fontWeight: 800 }}>{overallLoad}%</strong>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: overallLoad > 85 ? '#e11d48' : '#10b981',
                boxShadow: `0 0 8px ${overallLoad > 85 ? '#e11d48' : '#10b981'}`,
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: 600 }}>Available:</span>
            <strong style={{ color: '#059669', fontWeight: 800 }}>{totalAvailable} seats</strong>
          </div>
        </div>
      </div>

      {/* Architectural SVG Stage and Seating Layout */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#f8fafc',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '28px 16px 20px',
          textAlign: 'center',
        }}
      >
        {/* Stage Curved Banner */}
        <div
          style={{
            maxWidth: '440px',
            margin: '0 auto 36px',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.03) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '999px 999px 12px 12px',
            padding: '12px 24px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)',
          }}
        >
          {/* Stage Glow Light Spot */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '6px',
              backgroundColor: '#6366f1',
              borderRadius: '999px',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#4338ca',
            }}
          >
            MAIN KEYNOTE STAGE & PODIUM
          </span>
        </div>

        {/* Section Pods Layout (3 Tiers: VIP front, Orchestra Center, Balcony Rear) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: displaySections.length === 1 
              ? '1fr' 
              : displaySections.length === 2 
                ? 'repeat(2, 1fr)' 
                : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            maxWidth: '880px',
            margin: '0 auto 24px',
          }}
        >
          {displaySections.map((sec, idx) => {
            const occupied = sec.occupied || 0;
            const cap = sec.capacity || 1;
            const pct = Math.min(100, Math.round((occupied / cap) * 100));
            const color = getSectionColor(occupied, cap);
            const isHovered = hoveredSection?.id === sec.id;
            const isSelected = selectedSectionId === sec.id;

            return (
              <div
                key={sec.id || idx}
                onMouseEnter={() => setHoveredSection(sec)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  if (onSelectSection) onSelectSection(sec);
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: isSelected
                    ? '2px solid #6366f1'
                    : isHovered 
                      ? '1px solid #818cf8' 
                      : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px 18px',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isHovered 
                    ? '0 12px 28px -6px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.2)' 
                    : '0 2px 8px rgba(15, 23, 42, 0.04)',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                {/* Pod header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#64748b',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ZONE 0{idx + 1}
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 850,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: color.lightBg,
                      color: color.text,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    {color.label}
                  </span>
                </div>

                {/* Section Title */}
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 10,
                  }}
                >
                  {sec.name}
                </h4>

                {/* Simulated Visual Seat Dots */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 5,
                    marginBottom: 14,
                    padding: '8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {Array.from({ length: 14 }).map((_, seatIdx) => {
                    const isOccupied = (seatIdx / 14) * 100 < pct;
                    return (
                      <div
                        key={seatIdx}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '3px',
                          backgroundColor: isOccupied ? color.bg : '#cbd5e1',
                          boxShadow: isOccupied ? `0 0 4px ${color.bg}` : 'none',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Occupancy Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 5 }}>
                  <span style={{ color: '#64748b' }}>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>{occupied}</strong> / {cap} seats
                  </span>
                  <strong style={{ color: color.bg, fontWeight: 850 }}>{pct}% Full</strong>
                </div>

                <div
                  style={{
                    height: 6,
                    backgroundColor: '#e2e8f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: color.bg,
                      borderRadius: '999px',
                      boxShadow: `0 0 8px ${color.bg}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Heatmap Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.8rem',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>&lt; 40% (High Availability)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
            <span>40% - 74% (Filling Up)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }} />
            <span>75% - 99% (Filling Fast)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
            <span>100% (Waitlist Triggered)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueHeatmap;
