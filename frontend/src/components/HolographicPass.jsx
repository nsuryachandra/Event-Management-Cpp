import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Printer, 
  QrCode,
  Check,
  Download,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const HolographicPass = ({ attendee }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!attendee) return null;

  const isAdmitted = attendee.status === 'ADMITTED';
  const regCode = attendee.registrationId || `EVT-${(attendee.id || 1) + 1000}`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt angle max +/- 8 degrees for smooth elegance
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    
    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.3 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current || downloadingPdf) return;
    setDownloadingPdf(true);

    const cardEl = cardRef.current;
    const origTransform = cardEl.style.transform;
    const origTransition = cardEl.style.transition;
    const origBoxShadow = cardEl.style.boxShadow;

    // Temporarily reset 3D perspective and glare for ultra-flat vector capture
    cardEl.style.transform = 'none';
    cardEl.style.transition = 'none';
    cardEl.style.boxShadow = 'none';

    const glareEl = cardEl.querySelector('.holographic-glare-overlay');
    if (glareEl) glareEl.style.display = 'none';

    try {
      const canvas = await html2canvas(cardEl, {
        scale: 3, // High DPI (300+ DPI equivalent for crisp text and barcodes)
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate card aspect ratio on standard A4 or card-custom dimensions
      const cardWidthMm = 150;
      const cardHeightMm = (canvas.height * cardWidthMm) / canvas.width;
      const pageMargin = 15;
      const pdfWidth = cardWidthMm + pageMargin * 2;
      const pdfHeight = cardHeightMm + pageMargin * 2;

      const pdf = new jsPDF({
        orientation: cardHeightMm > cardWidthMm ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      // Background canvas fill
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Draw crisp pass card image
      pdf.addImage(imgData, 'PNG', pageMargin, pageMargin, cardWidthMm, cardHeightMm, undefined, 'FAST');

      const safeName = (attendee.name || 'Delegate').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Eventora_Pass_${regCode}_${safeName}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed, falling back to window.print():', err);
      window.print();
    } finally {
      // Restore dynamic styles
      if (cardEl) {
        cardEl.style.transform = origTransform;
        cardEl.style.transition = origTransition;
        cardEl.style.boxShadow = origBoxShadow;
      }
      if (glareEl) glareEl.style.display = '';
      setDownloadingPdf(false);
    }
  };

  return (
    <div 
      className="printable-pass-wrapper"
      style={{ 
        perspective: '1200px', 
        width: '100%', 
        maxWidth: '620px', 
        margin: '0 auto',
        fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
      }}
    >
      {/* 3D Tilt Card Shell */}
      <div
        ref={cardRef}
        className="printable-pass-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.18s ease-out, box-shadow 0.25s ease',
          transformStyle: 'preserve-3d',
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          boxShadow: isAdmitted
            ? '0 20px 40px -10px rgba(79, 70, 229, 0.22), 0 8px 18px -4px rgba(15, 23, 42, 0.06)'
            : '0 20px 40px -10px rgba(234, 88, 12, 0.20), 0 8px 18px -4px rgba(15, 23, 42, 0.06)',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Holographic Iridescent Glare Layer */}
        <div
          className="holographic-glare-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.75) 0%, rgba(236, 72, 153, 0.12) 30%, rgba(99, 102, 241, 0.12) 60%, transparent 80%)`,
            opacity: glare.opacity,
            mixBlendMode: 'overlay',
            transition: 'opacity 0.2s ease',
          }}
        />

        {/* Lanyard Top Punch Notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 44,
            height: 5,
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
            zIndex: 5,
          }}
        />

        {/* Pass Header Banner */}
        <div
          style={{
            padding: '28px 28px 22px',
            background: isAdmitted
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 75%, #6d28d9 100%)'
              : 'linear-gradient(135deg, #431407 0%, #7c2d12 45%, #9a3412 75%, #c2410c 100%)',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Ambient Header Glow Orb */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: isAdmitted
                ? 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, transparent 70%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 2 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.82)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                <Sparkles size={12} style={{ color: '#fbbf24' }} />
                <span>OFFICIAL DELEGATE CREDENTIAL</span>
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.3,
                  margin: 0,
                  wordBreak: 'break-word',
                }}
              >
                {attendee.eventTitle || 'CONFERENCE DELEGATE PASS'}
              </h2>
            </div>

            {/* Live Pulsing Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: isAdmitted ? 'rgba(16, 185, 129, 0.22)' : 'rgba(245, 158, 11, 0.22)',
                border: `1px solid ${isAdmitted ? 'rgba(52, 211, 153, 0.45)' : 'rgba(251, 191, 36, 0.45)'}`,
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                flexShrink: 0,
                boxShadow: isAdmitted ? '0 0 12px rgba(16, 185, 129, 0.25)' : '0 0 12px rgba(245, 158, 11, 0.25)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: isAdmitted ? '#34d399' : '#fbbf24',
                  boxShadow: `0 0 8px ${isAdmitted ? '#34d399' : '#fbbf24'}`,
                }}
              />
              <span>{isAdmitted ? 'Verified Admitted' : `Queue Position #${attendee.waitingPosition}`}</span>
            </div>
          </div>
        </div>

        {/* Pass Main Body */}
        <div style={{ padding: '26px 28px' }}>
          {/* Delegate Name & Contacts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span 
                style={{ 
                  fontSize: '0.6875rem', 
                  fontWeight: 600, 
                  color: '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  display: 'block',
                }}
              >
                DELEGATE ATTENDEE
              </span>
              <h3
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: '3px 0 0 0',
                  lineHeight: 1.25,
                }}
              >
                {attendee.name}
              </h3>
              <div 
                style={{ 
                  fontSize: '0.84rem', 
                  color: '#64748b', 
                  marginTop: 4, 
                  fontWeight: 450,
                  wordBreak: 'break-all',
                }}
              >
                {attendee.email} {attendee.phone ? `• ${attendee.phone}` : ''}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span 
                style={{ 
                  fontSize: '0.6875rem', 
                  fontWeight: 600, 
                  color: '#64748b', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  display: 'block',
                }}
              >
                PASS CODE
              </span>
              <div 
                style={{ 
                  fontFamily: "'JetBrains Mono', monospace", 
                  fontSize: '1.15rem', 
                  fontWeight: 700, 
                  color: isAdmitted ? '#4338ca' : '#ea580c', 
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                {regCode}
              </div>
            </div>
          </div>

          {/* Event Track & Venue Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 14,
              backgroundColor: '#f8fafc',
              padding: '15px 18px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Layers size={13} style={{ color: '#4f46e5' }} />
                <span>Track / Seating Area</span>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 650, color: '#0f172a', marginTop: 3 }}>
                {attendee.section || 'General Arena'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <MapPin size={13} style={{ color: '#ea580c' }} />
                <span>Venue Complex</span>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 650, color: '#0f172a', marginTop: 3 }}>
                {attendee.venue || 'Silicon Convention Arena'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Calendar size={13} style={{ color: '#059669' }} />
                <span>Event Date</span>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 650, color: '#0f172a', marginTop: 3 }}>
                {attendee.eventDate || 'October 2026'}
              </div>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '11px 16px',
              borderRadius: '12px',
              backgroundColor: isAdmitted ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${isAdmitted ? '#a7f3d0' : '#fde68a'}`,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAdmitted ? (
                <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
              ) : (
                <Clock size={16} style={{ color: '#d97706', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.8125rem', fontWeight: 550, color: isAdmitted ? '#065f46' : '#92400e' }}>
                {isAdmitted 
                  ? 'Guaranteed Entry Confirmed — Equipment and seating allocated.'
                  : `Waiting in line at Position #${attendee.waitingPosition}. Auto-promotes as seats open.`}
              </span>
            </div>
            <span 
              style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: isAdmitted ? '#059669' : '#d97706', 
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              {isAdmitted ? 'VALIDATED' : 'LIVE QUEUE'}
            </span>
          </div>

          {/* Perforated Divider with Cutout Notches */}
          <div style={{ position: 'relative', margin: '20px -28px', padding: '0 28px' }}>
            {/* Left Notch */}
            <div
              style={{
                position: 'absolute',
                left: -12,
                top: -12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-canvas, #f8fafc)',
                boxShadow: 'inset -2px 0 3px rgba(0, 0, 0, 0.05)',
                borderRight: '1px solid #cbd5e1',
              }}
            />
            {/* Right Notch */}
            <div
              style={{
                position: 'absolute',
                right: -12,
                top: -12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-canvas, #f8fafc)',
                boxShadow: 'inset 2px 0 3px rgba(0, 0, 0, 0.05)',
                borderLeft: '1px solid #cbd5e1',
              }}
            />
            <div style={{ borderTop: '2px dashed #cbd5e1', width: '100%' }} />
          </div>

          {/* Bottom Scannable Ticket Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            {/* Barcode Graphic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                DIGITAL BARCODE PASS
              </span>
              <div
                style={{
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 0',
                }}
              >
                {[4, 2, 5, 2, 6, 3, 2, 4, 6, 2, 3, 5, 2, 4, 7, 2, 3, 6, 2, 5, 3, 2, 6, 4, 2, 5].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: '100%',
                      width: `${w}px`,
                      backgroundColor: i % 2 === 0 ? '#0f172a' : '#94a3b8',
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.02em' }}>
                *{regCode}-SECURE-PASS*
              </div>
            </div>

            {/* QR Code Container */}
            <div
              style={{
                width: 76,
                height: 76,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                flexShrink: 0,
              }}
            >
              <QrCode size={46} style={{ color: '#0f172a' }} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', marginTop: 2, letterSpacing: '0.04em' }}>
                SCAN ENTRY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Below Pass */}
      <div 
        className="no-print"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          gap: 12, 
          marginTop: 22 
        }}
      >
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="btn btn-primary"
          style={{ 
            padding: '11px 22px', 
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 650,
            fontSize: '0.88rem',
            background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            border: 'none',
            color: '#ffffff',
            cursor: downloadingPdf ? 'wait' : 'pointer',
          }}
        >
          {downloadingPdf ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download PDF Pass</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-secondary"
          style={{ 
            padding: '11px 18px', 
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 600,
            fontSize: '0.88rem',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
          }}
        >
          <Printer size={15} />
          <span>Print Pass</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="btn btn-secondary"
          style={{ 
            padding: '11px 18px', 
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 600,
            fontSize: '0.88rem',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
          }}
        >
          {copied ? <Check size={15} style={{ color: '#059669' }} /> : <Share2 size={15} />}
          <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
        </button>
      </div>
    </div>
  );
};

export default HolographicPass;
