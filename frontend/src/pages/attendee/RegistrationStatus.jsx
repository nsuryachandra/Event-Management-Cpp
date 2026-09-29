import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import HolographicPass from '../../components/HolographicPass';
import { 
  Search, 
  UserCheck, 
  AlertCircle,
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
      <div className="no-print" style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            width: 52,
            height: 52,
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
          Look up your instant pass status or live queue priority using your Registration ID or Email.
        </p>
      </div>

      {/* Radiant Search Bar */}
      <form className="no-print" onSubmit={handleSearch} style={{ marginBottom: 36 }}>
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
              placeholder="Search by Registration ID (e.g. 1) or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '12px 16px 12px 46px',
                fontSize: '0.95rem',
                backgroundColor: 'transparent',
                color: '#0f172a',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 24px',
              borderRadius: '12px',
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
          className="no-print"
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
        <div style={{ marginTop: 24 }}>
          <div className="no-print" style={{ textAlign: 'center', marginBottom: 20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid #c7d2fe',
              }}
            >
              <Sparkles size={14} /> Interactive 3D Digital Credential
            </span>
          </div>
          <HolographicPass attendee={attendee} />
        </div>
      )}
    </div>
  );
};

export default RegistrationStatus;
