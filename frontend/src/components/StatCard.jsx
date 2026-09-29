import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  variant,
  badge,
}) => {
  const activeColor = variant || color;

  const getColorConfig = () => {
    switch (activeColor) {
      case 'success':
      case 'emerald':
        return {
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          trendBg: '#ecfdf5',
          trendColor: '#065f46',
          trendBorder: '#a7f3d0',
          accentBorder: '#10b981',
        };
      case 'warning':
      case 'amber':
      case 'sunset':
        return {
          iconBg: '#fffbeb',
          iconColor: '#d97706',
          trendBg: '#fffbeb',
          trendColor: '#92400e',
          trendBorder: '#fde68a',
          accentBorder: '#f59e0b',
        };
      case 'danger':
      case 'ruby':
        return {
          iconBg: '#fef2f2',
          iconColor: '#e11d48',
          trendBg: '#fef2f2',
          trendColor: '#991b1b',
          trendBorder: '#fecaca',
          accentBorder: '#ef4444',
        };
      case 'secondary':
      case 'violet':
        return {
          iconBg: '#f5f3ff',
          iconColor: '#7c3aed',
          trendBg: '#f5f3ff',
          trendColor: '#5b21b6',
          trendBorder: '#ddd6fe',
          accentBorder: '#8b5cf6',
        };
      case 'primary':
      default:
        return {
          iconBg: '#eef2ff',
          iconColor: '#4f46e5',
          trendBg: '#eef2ff',
          trendColor: '#3730a3',
          trendBorder: '#c7d2fe',
          accentBorder: '#6366f1',
        };
    }
  };

  const cfg = getColorConfig();

  return (
    <div
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        borderTop: `3.5px solid ${cfg.accentBorder}`,
        boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="stat-card-luxury"
    >
      {/* Ambient Micro-Glow in Top-Right Corner */}
      <div
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.iconBg} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header: Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span
          style={{
            color: '#64748b',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: cfg.iconBg,
            color: cfg.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 12px -2px ${cfg.trendBorder}`,
            transition: 'transform 0.2s ease',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Metric Value & Trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, position: 'relative', zIndex: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {(trend || badge) && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: cfg.trendBg,
              color: cfg.trendColor,
              border: `1px solid ${cfg.trendBorder}`,
              letterSpacing: '0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {trend || badge}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 500, position: 'relative', zIndex: 1 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
