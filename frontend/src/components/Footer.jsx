import React from 'react';
import { Terminal, Shield, Database } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-main)',
        backgroundColor: '#ffffff',
        padding: '32px 24px 24px',
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
          <div>
            <div className="display-font" style={{ fontWeight: 800, color: 'var(--ink-primary)', fontSize: '0.95rem' }}>
              EVENTORA PLATFORM
            </div>
            <div style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginTop: 2 }}>
              Smart crowd admissions & circular FIFO queue management.
            </div>
          </div>

          <div
            className="mono-font"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-main)',
              fontSize: '0.72rem',
              color: 'var(--ink-secondary)',
              fontWeight: 600,
            }}
          >
            <Terminal size={13} />
            <span>C++17 Engine • 1D Arrays • Array Circular FIFO Queue</span>
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
          <div>© 2026 Eventora Enterprise. Persistent SQLite Storage.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--status-admitted)', fontWeight: 600 }}>
              <Shield size={13} /> Strict FIFO No-Skip Rule
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={13} /> SQLite Schema Synchronized
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
