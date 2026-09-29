import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '540px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
      }}
    >
      <div 
        className="modal-content" 
        style={{ 
          maxWidth,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 25px rgba(79, 70, 229, 0.1)',
          borderRadius: '24px',
          color: '#0f172a',
          padding: '30px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: 4 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ 
              padding: '7px', 
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
