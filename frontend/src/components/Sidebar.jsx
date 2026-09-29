import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ListOrdered, 
  Layers, 
  Boxes, 
  ArrowLeft,
  Calendar,
  Layers as LayersIcon,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Sidebar = ({ activeEventId }) => {
  const queryParam = activeEventId ? `?eventId=${activeEventId}` : '';

  const navItems = [
    { to: `/organizer${queryParam}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `/organizer/events`, label: 'Events Directory', icon: Calendar },
    { to: `/organizer/sections${queryParam}`, label: 'Seating & Floor Plan', icon: Layers },
    { to: `/organizer/waiting-list${queryParam}`, label: 'Waitlist Queue', icon: ListOrdered, badge: 'FIFO' },
    { to: `/organizer/attendees${queryParam}`, label: 'Attendees', icon: Users },
    { to: `/organizer/resources${queryParam}`, label: 'Resources & Kits', icon: Boxes },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '1px 0 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 18px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
            border: '1px solid #e2e8f0',
            backgroundColor: '#051917',
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.jpg"
            alt="Eventora Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.08rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                EVENT
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.08rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ORA
              </span>
            </span>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                letterSpacing: '0.02em',
              }}
            >
              Console
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            Organizer Operations
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#94a3b8',
            padding: '4px 10px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Management
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '8px',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              color: isActive ? '#4f46e5' : '#475569',
              backgroundColor: isActive ? '#eef2ff' : 'transparent',
              border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <item.icon 
                    size={17} 
                    style={{ 
                      color: isActive ? '#4f46e5' : '#64748b',
                      transition: 'color 0.15s ease' 
                    }} 
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      background: isActive ? '#c7d2fe' : '#f1f5f9',
                      color: isActive ? '#3730a3' : '#64748b',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Public Catalog Switcher */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
        }}
      >
        <Link
          to="/"
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #e2e8f0',
            fontSize: '0.8125rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft size={14} />
          <span>Exit to Public Portal</span>
          <ExternalLink size={12} style={{ opacity: 0.5 }} />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
