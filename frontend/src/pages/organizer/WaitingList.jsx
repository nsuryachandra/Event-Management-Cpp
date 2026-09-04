import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { 
  ListOrdered, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck,
  Cpu
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
      showToast('Failed to load FIFO queue data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeEventId]);

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
        showToast(res.message, 'success');
        loadQueue();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Network error while executing Admit Next', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !queueData) {
    return <Spinner size={40} label="Loading FIFO Waiting Queue..." />;
  }

  const items = queueData?.items || [];
  const frontItem = queueData?.front;
  const isQueueEmpty = items.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Cpu size={15} /> Academic DSA Feature
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
            FIFO Waiting Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 2 }}>
            <strong>First In, First Out</strong> — Attendees in {activeEvent?.title || 'this event'} are processed strictly in registration order.
          </p>
        </div>

        <button
          onClick={loadQueue}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Hero "NEXT IN FIFO" Action Card */}
      <div
        className="card gradient-top-accent"
        style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(236, 72, 153, 0.03) 50%, #ffffff 100%)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--grad-primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  boxShadow: 'var(--shadow-primary)',
                }}
              >
                NEXT IN FIFO (FRONT)
              </span>
              <span className="mono-font" style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
                Queue Length: {items.length}
              </span>
            </div>

            {frontItem ? (
              <div>
                <h2 className="display-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 6 }}>
                  {frontItem.name}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                  <span>ID: <strong style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-mono)' }}>{frontItem.registrationId}</strong></span>
                  <span>•</span>
                  <span>Requested Track: <strong style={{ color: '#4f46e5' }}>{frontItem.section}</strong></span>
                  <span>•</span>
                  <span>
                    Track Status:{' '}
                    <strong style={{ color: frontItem.canBeAdmitted ? '#059669' : '#dc2626' }}>
                      {frontItem.canBeAdmitted
                        ? `Available (${frontItem.sectionAvailable} seats free)`
                        : 'Full (0 seats free)'}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="display-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-secondary)', marginBottom: 4 }}>
                  Waiting Queue is Currently Empty
                </h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem' }}>
                  When attendees register for sessions that have reached capacity, they will queue here in FIFO order.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              onClick={handleAdmitNext}
              disabled={isQueueEmpty || processing}
              className={`btn ${frontItem?.canBeAdmitted ? 'btn-emerald' : 'btn-primary'} btn-lg`}
            >
              {processing ? (
                'Processing Admission...'
              ) : (
                <>
                  <UserCheck size={20} />
                  Admit Next Attendee →
                </>
              )}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
              Operates directly on array queue front
            </span>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {lastActionResult && (
          <div
            style={{
              marginTop: 22,
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: lastActionResult.success ? 'var(--status-admitted-bg)' : 'var(--status-full-bg)',
              border: `1px solid ${lastActionResult.success ? 'var(--status-admitted-border)' : 'var(--status-full-border)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              fontSize: '0.9rem',
            }}
          >
            {lastActionResult.success ? (
              <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
            )}
            <div style={{ color: lastActionResult.success ? '#047857' : '#b91c1c', lineHeight: 1.45 }}>
              <strong>{lastActionResult.success ? 'FIFO Admission Successful:' : 'Strict FIFO Admission Blocked:'}</strong>{' '}
              {lastActionResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Academic Rule Explanation Card */}
      <div
        style={{
          padding: '18px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-main)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: '0.88rem',
          color: 'var(--ink-secondary)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--grad-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-primary)',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong style={{ color: 'var(--ink-primary)' }}>Strict No-Skip Policy:</strong> If the front attendee's requested section is full, the C++ backend refuses admission and <em>will not skip</em> to candidates behind them. Admission only proceeds once capacity opens up for the front candidate.
        </div>
      </div>

      {/* Visual FIFO Queue Representation */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="display-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Active Queue Order ({items.length} Attendees)
          </h3>
          <span className="mono-font" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
            Array Circular Indexing • (front + i) % MAX_QUEUE
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px',
              textAlign: 'center',
              color: 'var(--ink-muted)',
            }}
          >
            <ListOrdered size={40} style={{ color: '#4f46e5', margin: '0 auto 12px' }} />
            <h4 className="display-font" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 4 }}>
              No Waiting Attendees
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
              All registered attendees for {activeEvent?.title || 'this event'} have been admitted.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* FRONT Indicator Marker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px',
                color: '#4f46e5',
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
              }}
            >
              <span>▼ FRONT OF QUEUE (FIRST IN LINE)</span>
            </div>

            {items.map((att, idx) => {
              const isFront = idx === 0;

              return (
                <div
                  key={att.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                    border: isFront ? '2px solid #6366f1' : '1px solid var(--border-main)',
                    boxShadow: isFront ? '0 6px 20px rgba(99, 102, 241, 0.15)' : 'var(--shadow-xs)',
                    background: isFront ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, #ffffff 100%)' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      className="mono-font"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-sm)',
                        background: isFront ? 'var(--grad-primary)' : 'var(--bg-subtle)',
                        color: isFront ? '#ffffff' : 'var(--ink-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        boxShadow: isFront ? 'var(--shadow-primary)' : 'none',
                      }}
                    >
                      #{String(att.waitingPosition).padStart(2, '0')}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="display-font" style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                          {att.name}
                        </span>
                        <span className="mono-font" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                          {att.registrationId}
                        </span>
                        {isFront && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: 'var(--grad-primary)',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            HEAD
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                        <span>Email: {att.email}</span>
                        <span>•</span>
                        <span>Joined: {att.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Status */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4f46e5' }}>
                      {att.section}
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                      {att.sectionHasSpace ? (
                        <span style={{ color: '#047857', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #a7f3d0' }}>
                          <CheckCircle2 size={13} /> {att.sectionAvailable} seats free
                        </span>
                      ) : (
                        <span style={{ color: '#b91c1c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef2f2', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #fecaca' }}>
                          <AlertTriangle size={13} /> Track Full ({att.sectionOccupied}/{att.sectionCapacity})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* REAR Indicator Marker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px',
                color: 'var(--ink-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
              }}
            >
              <span>▲ REAR OF QUEUE (LAST JOINED)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingList;
