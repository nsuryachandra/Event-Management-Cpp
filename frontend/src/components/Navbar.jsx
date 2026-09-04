import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Calendar, UserCheck, Shield, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
import { api } from '../api';

export const Navbar = () => {
  const location = useLocation();
  const [engineOnline, setEngineOnline] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then(() => setEngineOnline(true))
      .catch(() => setEngineOnline(false));
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
        {/* Brand Logo with Glowing Gradient Emblem */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="group">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="display-font"
                style={{
                  fontWeight: 900,
                  fontSize: '1.28rem',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                EVENTORA
              </span>
              <span
                className="mono-font"
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.06em',
                  boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
                }}
              >
                C++ PRO
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 600, letterSpacing: '0.01em' }}>
              Crowd Admissions & Deterministic FIFO Queue
            </div>
          </div>
        </Link>

        {/* Live Engine Status & Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* C++ Engine Health Badge */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              backgroundColor: engineOnline ? 'rgba(236, 253, 245, 0.9)' : 'rgba(254, 242, 242, 0.9)',
              borderRadius: '999px',
              border: `1px solid ${engineOnline ? '#a7f3d0' : '#fecaca'}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: engineOnline ? '#059669' : '#dc2626',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            }}
            className="md-flex"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: engineOnline ? '#10b981' : '#ef4444',
                boxShadow: engineOnline ? '0 0 8px #10b981' : '0 0 8px #ef4444',
                display: 'inline-block',
              }}
            />
            <span className="mono-font">{engineOnline ? 'C++17 Engine Online' : 'Connecting Engine...'}</span>
          </div>

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
