import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const Badge = ({ status = '', label = '', size = 'md' }) => {
  const norm = String(status).toUpperCase();

  let className = 'badge';
  let icon = null;
  let text = label || status;

  if (norm === 'ADMITTED') {
    className += ' badge-admitted';
    icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
  } else if (norm === 'WAITING') {
    className += ' badge-waiting';
    icon = <Clock size={size === 'sm' ? 12 : 14} />;
  } else if (norm === 'CANCELLED') {
    className += ' badge-cancelled';
    icon = <XCircle size={size === 'sm' ? 12 : 14} />;
  } else if (norm === 'OPEN') {
    className += ' badge-open';
    icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
    text = label || 'Available';
  } else if (norm === 'FILLING_FAST') {
    className += ' badge-filling-fast';
    icon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
    text = label || 'Filling Fast';
  } else if (norm === 'FULL') {
    className += ' badge-full';
    icon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
    text = label || 'Full';
  } else {
    className += ' badge-category';
  }

  return (
    <span className={className} style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
      {icon}
      <span>{text}</span>
    </span>
  );
};

export default Badge;
