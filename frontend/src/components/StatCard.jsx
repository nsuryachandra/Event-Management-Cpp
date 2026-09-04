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

  const getGradientStyle = () => {
    switch (activeColor) {
      case 'success':
      case 'emerald':
        return {
          iconBg: 'var(--grad-emerald)',
          iconShadow: 'var(--shadow-emerald)',
          topBorder: 'var(--grad-card-emerald)',
        };
      case 'warning':
      case 'sunset':
        return {
          iconBg: 'var(--grad-sunset)',
          iconShadow: 'var(--shadow-sunset)',
          topBorder: 'var(--grad-card-sunset)',
        };
      case 'danger':
      case 'ruby':
        return {
          iconBg: 'var(--grad-ruby)',
          iconShadow: 'var(--shadow-ruby)',
          topBorder: 'var(--grad-card-ruby)',
        };
      case 'indigo':
      case 'violet':
        return {
          iconBg: 'var(--grad-violet)',
          iconShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          topBorder: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
        };
      case 'primary':
      default:
        return {
          iconBg: 'var(--grad-primary)',
          iconShadow: 'var(--shadow-primary)',
          topBorder: 'var(--grad-card-top)',
        };
    }
  };

  const gStyle = getGradientStyle();

  return (
    <div
      className="card card-hover"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        backgroundColor: '#ffffff',
        position: 'relative',
      }}
    >
      {/* Top Gradient Ribbon */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gStyle.topBorder,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className="mono-font"
          style={{
            color: 'var(--ink-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            background: gStyle.iconBg,
            color: '#ffffff',
            boxShadow: gStyle.iconShadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          className="display-font"
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </span>
        {(trend || badge) && (
          <span
            className="mono-font"
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              color: 'var(--ink-secondary)',
              border: '1px solid var(--border-main)',
            }}
          >
            {trend || badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
