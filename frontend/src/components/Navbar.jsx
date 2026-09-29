import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, UserCheck, Shield, Sparkles, ArrowUpRight } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo with Official Project Logo & Highlighted EVENTORA */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }} className="group">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.16)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              backgroundColor: '#051917',
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <img
              src="/logo.jpg"
              alt="Eventora Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.42rem',
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
                  fontSize: '1.42rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ORA
              </span>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#64748b',
                fontWeight: 650,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: 3,
                fontFamily: 'var(--font-sans)',
              }}
            >
              Crowd Admissions & Event Management
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '0.86rem',
                fontWeight: isActive('/') ? 800 : 600,
                padding: '8px 16px',
                borderRadius: '10px',
                color: isActive('/') ? '#4f46e5' : '#475569',
                backgroundColor: isActive('/') ? '#eef2ff' : 'transparent',
                border: isActive('/') ? '1px solid #c7d2fe' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Calendar size={15} style={{ color: isActive('/') ? '#4f46e5' : '#64748b' }} />
              <span>Events Catalog</span>
            </Link>

            <Link
              to="/status"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '0.86rem',
                fontWeight: isActive('/status') ? 800 : 600,
                padding: '8px 16px',
                borderRadius: '10px',
                color: isActive('/status') ? '#4f46e5' : '#475569',
                backgroundColor: isActive('/status') ? '#eef2ff' : 'transparent',
                border: isActive('/status') ? '1px solid #c7d2fe' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <UserCheck size={15} style={{ color: isActive('/status') ? '#4f46e5' : '#64748b' }} />
              <span>Check Status</span>
            </Link>

            <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-main)', margin: '0 4px' }} />

            <Link
              to="/organizer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.86rem',
                fontWeight: 800,
                padding: '9px 18px',
                borderRadius: '10px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                border: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <Shield size={15} />
              <span>Organizer Console</span>
            </Link>
          </nav>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
