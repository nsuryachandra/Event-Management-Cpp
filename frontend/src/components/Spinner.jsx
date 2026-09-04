import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, label = 'Loading...' }) => {
  const numericSize = typeof size === 'number' ? size : size === 'sm' ? 16 : size === 'lg' ? 32 : size === 'xl' ? 40 : 24;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '30px 0' }}>
      <Loader2 size={numericSize} style={{ animation: 'spin 1s linear infinite', color: '#4f46e5' }} />
      {label && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const Skeleton = ({ height = 20, width = '100%', borderRadius = 'var(--radius-md)' }) => (
  <div
    style={{
      height,
      width,
      borderRadius,
      backgroundColor: '#e2e8f0',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  >
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

export default Spinner;
