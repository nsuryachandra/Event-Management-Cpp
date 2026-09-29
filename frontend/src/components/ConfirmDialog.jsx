import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div
          style={{
            padding: 12,
            borderRadius: '14px',
            backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${isDestructive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            color: isDestructive ? '#f87171' : '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isDestructive ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 700 }}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={isDestructive ? 'btn btn-danger' : 'btn btn-primary'}
          style={{ fontWeight: 800 }}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
