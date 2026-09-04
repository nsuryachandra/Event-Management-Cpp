import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { 
  Search, 
  UserCheck, 
  Calendar, 
  Layers, 
  Ticket, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const RegistrationStatus = () => {
  const [query, setQuery] = useState('');
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.getRegistration(query.trim());
      if (res.success && res.data) {
        setAttendee(res.data);
      } else {
        setAttendee(null);
        setErrorMsg(res.message || 'No attendee registration found matching that ID or Email.');
      }
    } catch (err) {
      setAttendee(null);
      setErrorMsg(err.message || 'Error connecting to C++ backend.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '54px auto 90px', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
          }}
        >
          <UserCheck size={26} />
        </div>
        <h1 className="display-font" style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Registration & Queue Tracker
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.96rem', marginTop: 6, maxWidth: '520px', margin: '6px auto 0' }}>
          Track your live admission status or check your mathematical position in the deterministic Circular FIFO Queue.
        </p>
      </div>

      {/* Radiant Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            backgroundColor: '#ffffff',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.1), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by Email (e.g. alice@test.com) or Pass ID (e.g. EVT-1001)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 46,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '0.92rem',
                color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {loading ? <Spinner size={16} label="" /> : 'Check Status'}
          </button>
        </div>
      </form>

      {searched && errorMsg && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {attendee && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 30px -4px rgba(79, 70, 229, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ATTENDEE RECORD
              </span>
              <h3 className="display-font" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                {attendee.name}
              </h3>
              <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                {attendee.email} • {attendee.phone}
              </span>
            </div>

            <Badge
              status={attendee.status}
              label={attendee.status === 'ADMITTED' ? 'Verified Admitted' : `FIFO Position #${attendee.waitingPosition}`}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Event</span>
              <strong style={{ color: '#0f172a' }}>{attendee.eventTitle}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Place / Session</span>
              <strong style={{ color: '#4f46e5' }}>{attendee.section}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Registered Timestamp</span>
              <span className="mono-font" style={{ color: '#334155', fontSize: '0.84rem' }}>{attendee.registeredAt || '2026-09-04'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Pass Code ID</span>
              <span className="mono-font" style={{ fontWeight: 800, color: '#4f46e5' }}>
                EVT-{attendee.id + 1000}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              to={`/registration/${attendee.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '0.88rem',
                fontWeight: 800,
                padding: '10px 20px',
                borderRadius: '10px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                border: 'none',
              }}
            >
              <Ticket size={16} />
              <span>View Official Badge Pass</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationStatus;

