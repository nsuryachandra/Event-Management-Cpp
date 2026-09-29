import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import HolographicPass from '../../components/HolographicPass';
import { ArrowLeft, Ticket, Search } from 'lucide-react';

export const RegistrationResult = () => {
  const { id } = useParams();
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRegistration(id)
      .then((res) => {
        if (res.success && res.data) {
          setAttendee(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spinner size={32} label="Generating digital attendee pass..." />
      </div>
    );
  }

  if (!attendee) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <h2 className="display-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Pass Not Found</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>Unable to find registration record with ID #{id}.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '48px auto 90px', padding: '0 24px' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.84rem',
            color: '#4f46e5',
            fontWeight: 700,
            backgroundColor: '#eef2ff',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid #c7d2fe',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>

      {/* 3D Holographic Pass Ticket */}
      <HolographicPass attendee={attendee} />

      {/* Action Buttons Below Ticket */}
      <div className="no-print" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 28 }}>
        <Link
          to="/status"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontSize: '0.88rem',
            fontWeight: 700,
            padding: '11px 18px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Search size={15} />
          <span>Status Tracker</span>
        </Link>

        <Link
          to="/"
          style={{
            flex: 1.2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontSize: '0.88rem',
            fontWeight: 800,
            padding: '11px 18px',
            borderRadius: '12px',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            border: 'none',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Ticket size={16} />
          <span>Browse More Events</span>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationResult;
