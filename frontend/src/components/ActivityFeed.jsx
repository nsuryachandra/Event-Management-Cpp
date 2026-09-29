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
            padding: '12px 16px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              padding: 6,
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.45, fontWeight: 550, margin: 0 }}>
              {act.message}
            </p>
            <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4, display: 'inline-block', fontFamily: "'JetBrains Mono', monospace" }}>
              {act.createdAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
