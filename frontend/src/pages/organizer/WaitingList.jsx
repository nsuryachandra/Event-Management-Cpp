import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { triggerConfetti } from '../../utils/confetti';
import { 
  ListOrdered, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock
} from 'lucide-react';

export const WaitingList = () => {
  const { activeEventId, activeEvent } = useOutletContext();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastActionResult, setLastActionResult] = useState(null);
  const { showToast } = useToast();

  const loadQueue = async () => {
    try {
      const res = await api.getQueue(activeEventId);
      if (res.success && res.data) {
        setQueueData(res.data);
      }
    } catch {
      showToast('Failed to load queue data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeEventId]);

  // Admit Next in FIFO queue
  const handleAdmitNext = async () => {
    setProcessing(true);
    setLastActionResult(null);
    try {
      const res = await api.admitNext(activeEventId);
      setLastActionResult({
        success: res.success,
        message: res.message,
      });

      if (res.success) {
        triggerConfetti(2500);
        showToast(`Admitted candidate from front of queue!`, 'success');
        loadQueue();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error executing admission', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Simulate Seat Opening & Instant Admission
  const handleSimulateSeatOpening = async () => {
    if (!frontItem) return;
    setProcessing(true);
    setLastActionResult(null);

    try {
      if (frontItem.canBeAdmitted) {
        const res = await api.admitNext(activeEventId);
        if (res.success) {
          triggerConfetti(2800);
          showToast(`Admitted ${frontItem.name} into ${frontItem.section}!`, 'success');
          loadQueue();
        } else {
          showToast(res.message, 'error');
        }
      } else {
        const secRes = await api.getSections(activeEventId);
        if (secRes.success && secRes.data) {
          const matchSec = secRes.data.find(s => s.name === frontItem.section) || secRes.data[0];
          if (matchSec) {
            const updateRes = await api.updateSectionCapacity(matchSec.id, matchSec.capacity + 1);
            if (updateRes.success) {
              triggerConfetti(2800);
              showToast(`Seat opened! Auto-admitted ${frontItem.name} to ${matchSec.name}!`, 'success');
              setLastActionResult({
                success: true,
                message: `Admitted ${frontItem.name} immediately via newly opened seat in ${matchSec.name}.`,
              });
              loadQueue();
            } else {
              showToast(updateRes.message || 'Could not expand capacity', 'error');
            }
          }
        }
      }
    } catch (err) {
      showToast('Error during seat simulation', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !queueData) {
    return <Spinner size={36} label="Loading waitlist queue..." />;
  }

  const items = queueData?.items || [];
  const frontItem = queueData?.front;
  const isQueueEmpty = items.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: 16,
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                border: '1px solid #fde68a',
              }}
            >
              FIFO Circular Array Queue
            </span>
          </div>

          <h1 
            style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#0f172a', 
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              margin: '0 0 6px 0',
            }}
          >
            Waitlist Queue Dispatch
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Strict first-come, first-served queue for <strong>{activeEvent?.title || 'this event'}</strong>. When seats open or capacity expands, attendees are promoted in order.
          </p>
        </div>

        <button
          onClick={loadQueue}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Front Candidate Console Card */}
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ListOrdered size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>
                Queue Dispatch Status
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {isQueueEmpty ? 'No attendees waiting' : `${items.length} candidate(s) currently in line`}
              </div>
            </div>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: isQueueEmpty ? '#ecfdf5' : '#fffbeb',
              color: isQueueEmpty ? '#065f46' : '#92400e',
              border: isQueueEmpty ? '1px solid #a7f3d0' : '1px solid #fde68a',
            }}
          >
            {isQueueEmpty ? 'Clear' : 'Active Waitlist'}
          </span>
        </div>

        {isQueueEmpty ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={28} style={{ color: '#10b981' }} />
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
              No Attendees in Waitlist
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '360px', margin: 0 }}>
              All registered candidates have been admitted with seats. New registrations when the venue is full will enter this queue automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Candidate #01 Card */}
            <div
              style={{
                padding: '22px 24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fffdf7 0%, #fff7ed 100%)',
                border: '1.5px solid #fed7aa',
                boxShadow: '0 4px 18px -2px rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  01
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Clock size={11} />
                      Head of Queue (Priority 1)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Target Track: <strong style={{ color: '#0f172a' }}>{frontItem.section}</strong>
                    </span>
                  </div>

                  <div 
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      color: '#0f172a', 
                      marginTop: 3 
                    }}
                  >
                    {frontItem.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
                    {frontItem.email} • {frontItem.phone}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleSimulateSeatOpening}
                  disabled={processing}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  title="Expand capacity by +1 and automatically admit this attendee"
                >
                  <Zap size={14} style={{ color: '#d97706' }} />
                  <span>Open Seat (+1) & Admit</span>
                </button>

                <button
                  onClick={handleAdmitNext}
                  disabled={processing}
                  className="btn btn-sm"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: frontItem.canBeAdmitted
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    boxShadow: frontItem.canBeAdmitted
                      ? '0 4px 14px rgba(5, 150, 105, 0.3)'
                      : '0 4px 14px rgba(79, 70, 229, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <UserCheck size={15} />
                  <span>{processing ? 'Admitting...' : 'Admit Candidate'}</span>
                </button>
              </div>
            </div>

            {lastActionResult && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: lastActionResult.success ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${lastActionResult.success ? '#a7f3d0' : '#fecaca'}`,
                  color: lastActionResult.success ? '#065f46' : '#991b1b',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
              >
                {lastActionResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Queue Table */}
      {!isQueueEmpty && (
        <div 
          style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              Full Queue Sequence
            </div>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Strict FIFO Order Guaranteed
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', width: '90px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Position</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Attendee</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Target Track</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Contact</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontWeight: 700, 
                          color: index === 0 ? '#b45309' : '#4f46e5', 
                          backgroundColor: index === 0 ? '#fffbeb' : '#eef2ff', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          border: index === 0 ? '1px solid #fde68a' : '1px solid #c7d2fe',
                          fontSize: '0.75rem', 
                        }}
                      >
                        #{String(item.waitingPosition).padStart(2, '0')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 650, color: '#0f172a' }}>{item.name}</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
                        ID #{item.id}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 550 }}>
                      {item.section}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.8125rem' }}>
                      <div>{item.email}</div>
                      <span>{item.phone}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: index === 0 ? '#ecfdf5' : '#f1f5f9',
                          color: index === 0 ? '#065f46' : '#64748b',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          border: index === 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                        }}
                      >
                        {index === 0 ? 'Next Eligible' : `Queue Position #${item.waitingPosition}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingList;
