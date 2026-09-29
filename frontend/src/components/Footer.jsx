import React from 'react';

export const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-main)',
        backgroundColor: '#ffffff',
        padding: '28px 24px 22px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#051917',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <img src="/logo.jpg" alt="Eventora" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    letterSpacing: '0.03em',
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
                    fontSize: '1.05rem',
                    letterSpacing: '0.03em',
                    background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ORA
                </span>
              </div>
              <div style={{ color: 'var(--ink-muted)', fontSize: '0.78rem', marginTop: 1 }}>
                Crowd Admissions & Event Management
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-faint)',
            paddingTop: 14,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--ink-muted)',
            fontSize: '0.75rem',
            gap: 12,
          }}
        >
          <div>© 2026 Eventora Enterprise. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
