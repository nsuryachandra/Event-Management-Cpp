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
  Grid
} from 'lucide-react';

export const Sidebar = ({ activeEventId }) => {
  const queryParam = activeEventId ? `?eventId=${activeEventId}` : '';

  const navItems = [
    { to: `/organizer${queryParam}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `/organizer/events`, label: 'All Events', icon: Calendar },
    { to: `/organizer/waiting-list${queryParam}`, label: 'FIFO Waiting Queue', icon: ListOrdered, badge: 'FIFO' },
    { to: `/organizer/attendees${queryParam}`, label: 'Attendees List', icon: Users },
    { to: `/organizer/resources${queryParam}`, label: 'Resource Inventory', icon: Boxes },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-main)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 20px',
          borderBottom: '1px solid var(--border-main)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          <Grid size={18} />
        </div>
        <div>
          <div className="display-font" style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>
            ORGANIZER HUB
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
            Multi-Event Operations
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          padding: '18px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <div className="mono-font" style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-muted)', padding: '0 10px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Operations & Data
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: isActive ? 700 : 600,
              fontSize: '0.86rem',
              color: isActive ? '#4f46e5' : 'var(--ink-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.06) 100%)'
                : 'transparent',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
              boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.08)' : 'none',
              transition: 'all 0.16s ease',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <item.icon size={17} style={{ color: 'inherit' }} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className="mono-font"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: 'var(--grad-amber)',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Switcher */}
      <div
        style={{
          padding: '14px',
          borderTop: '1px solid var(--border-main)',
          backgroundColor: 'var(--bg-canvas)',
        }}
      >
        <Link
          to="/"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <ArrowLeft size={13} />
          Public Catalog
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
