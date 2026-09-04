import React from 'react';

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText,
  onAction,
}) => {
  const renderIcon = React.isValidElement(icon)
    ? icon
    : icon && typeof icon === 'function'
    ? React.createElement(icon, { size: 28 })
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 20px',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-main)',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#eef2ff',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {renderIcon}
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '380px', marginBottom: (actionText || action) ? 20 : 0 }}>
        {description}
      </p>
      {action ? (
        action
      ) : actionText && onAction ? (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
