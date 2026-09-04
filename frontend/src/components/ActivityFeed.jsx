import React from 'react';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const ActivityFeed = ({ activities = [], maxItems = 10 }) => {
  const displayItems = activities.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No Recent Activity"
        description="Operational activities such as registrations, FIFO queue admissions, and resource updates will appear here."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {displayItems.map((act) => (
        <div
          key={act.id || act.createdAt + act.message}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-main)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#eef2ff',
              color: 'var(--primary)',
              marginTop: 2,
            }}
          >
            <Clock size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 500 }}>
              {act.message}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>
              {act.createdAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
