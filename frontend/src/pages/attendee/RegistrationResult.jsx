import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  Calendar, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  QrCode,
  Ticket,
  Sparkles,
  MapPin,
  Share2,
  Download
} from 'lucide-react';

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
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  const isAdmitted = attendee.status === 'ADMITTED';
  const regCode = `EVT-${attendee.id + 1000}`;

  return (
    <div style={{ maxWidth: '680px', margin: '48px auto 90px', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
          }}
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.84rem',
            fontWeight: 700,
            padding: '7px 16px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            cursor: 'pointer',
          }}
        >
          <Printer size={15} />
          <span>Print / Save Pass</span>
        </button>
      </div>

      {/* Luxury Conference Pass Ticket Card */}
      <div
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -8px rgba(79, 70, 229, 0.16), 0 6px 16px -4px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Pass Header Ribbon */}
        <div
          style={{
            background: isAdmitted
              ? 'linear-gradient(135deg, #1e40af 0%, #4f46e5 40%, #7c3aed 70%, #ec4899 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #e11d48 100%)',
            padding: '28px 32px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                className="mono-font"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={13} />
                <span>OFFICIAL DELEGATE CREDENTIAL</span>
              </div>
              <div className="display-font" style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.25 }}>
                {attendee.eventTitle || 'CONFERENCE PASS 2026'}
              </div>
            </div>

            <div
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {isAdmitted ? '✨ VERIFIED ADMITTED' : `⏳ FIFO QUEUE #${attendee.waitingPosition}`}
            </div>
          </div>
        </div>

        {/* Pass Body Content */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                DELEGATE ATTENDEE
              </span>
              <h2 className="display-font" style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginTop: 2 }}>
                {attendee.name}
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                {attendee.email} • {attendee.phone}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PASS CODE
              </span>
              <div className="mono-font" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#4f46e5', marginTop: 2 }}>
                {regCode}
              </div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: 26,
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                ASSIGNED PLACE / SESSION
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {attendee.section}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                ADMISSION STATUS
              </span>
              <div style={{ marginTop: 2 }}>
                <Badge
                  status={attendee.status}
                  label={isAdmitted ? 'Verified Admitted' : `FIFO Queue Position #${attendee.waitingPosition}`}
                />
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                TIMESTAMP
              </span>
              <div className="mono-font" style={{ fontSize: '0.82rem', color: '#475569', marginTop: 2 }}>
                {attendee.registeredAt || '2026-09-04 14:00'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                VERIFICATION BACKEND
              </span>
              <div className="mono-font" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginTop: 2 }}>
                C++17 Array Engine
              </div>
            </div>
          </div>

          {/* Perforated Divider with Scannable QR and Barcode Graphic */}
          <div
            style={{
              paddingTop: 22,
              borderTop: '2px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
                }}
              >
                <QrCode size={34} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  Cryptographically Valid Pass
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Present this digital badge upon venue entrance check-in.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: '0.82rem', fontWeight: 800 }}>
              <ShieldCheck size={18} />
              <span>Verified Record</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Below Ticket */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 28 }}>
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
            transition: 'all 0.15s ease',
          }}
        >
          <span>Check Status Tracker</span>
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

