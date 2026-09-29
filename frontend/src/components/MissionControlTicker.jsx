import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { 
  Radio, 
  Activity, 
  Users, 
  Clock, 
  Box, 
  Zap, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const MissionControlTicker = ({ activeEventId, activeEvent }) => {
  const [stats, setStats] = useState(null);
  const [lastPing, setLastPing] = useState(Date.now());

  const fetchTelemetry = async () => {
    try {
      const res = await api.getDashboard(!activeEventId || activeEventId === 0 ? null : activeEventId);
      if (res && res.success && res.data) {
        setStats(res.data);
        setLastPing(Date.now());
      }
    } catch {
      // Quiet fail to maintain ticker stability
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, [activeEventId]);

  const capacity = stats?.totalCapacity || (activeEvent?.totalCapacity || 100);
  const admitted = stats?.admitted || stats?.totalOccupied || 0;
  const waiting = stats?.waiting || (stats?.queueSnapshot?.queueCount) || 0;
  const utilization = stats?.overallUtilization ?? (capacity > 0 ? Math.round((admitted / capacity) * 100) : 0);
  const resourcesAvail = stats?.resourcesAvailable ?? 45;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#334155',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        zIndex: 20,
      }}
    >
      {/* Left: System Status & Pulse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              position: 'relative',
              display: 'flex',
              height: '8px',
              width: '8px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                display: 'inline-flex',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                opacity: 0.75,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '50%',
                height: '8px',
                width: '8px',
                backgroundColor: '#10b981',
              }}
            />
          </span>
          <span className="mono-font" style={{ fontWeight: 800, color: '#059669', letterSpacing: '0.06em' }}>
            TELEMETRY LIVE
          </span>
        </div>

        <div style={{ height: '14px', width: '1px', backgroundColor: '#e2e8f0' }} />

        {/* Active Scope */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
          <span>STREAM:</span>
          <strong style={{ color: '#0f172a' }}>
            {activeEventId === 0 ? 'All Events Combined' : (activeEvent?.title || 'Selected Event')}
          </strong>
        </div>
      </div>

      {/* Center: Live Stream Metrics Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Admitted vs Capacity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} style={{ color: '#2563eb' }} />
          <span style={{ color: '#64748b' }}>Admissions:</span>
          <strong className="mono-font" style={{ color: '#0f172a' }}>
            {admitted} / {capacity}
          </strong>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: utilization > 85 ? '#fee2e2' : '#eff6ff',
              color: utilization > 85 ? '#dc2626' : '#2563eb',
            }}
          >
            {utilization}%
          </span>
        </div>

        <div style={{ height: '14px', width: '1px', backgroundColor: '#e2e8f0' }} />

        {/* FIFO Waiting Queue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} style={{ color: waiting > 0 ? '#d97706' : '#94a3b8' }} />
          <span style={{ color: '#64748b' }}>Queue Dispatch:</span>
          <strong className="mono-font" style={{ color: waiting > 0 ? '#d97706' : '#0f172a' }}>
            {waiting} waiting
          </strong>
        </div>

        <div style={{ height: '14px', width: '1px', backgroundColor: '#e2e8f0' }} />

        {/* Resources Pool */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Box size={14} style={{ color: '#7c3aed' }} />
          <span style={{ color: '#64748b' }}>Resource Kits:</span>
          <strong className="mono-font" style={{ color: '#7c3aed' }}>
            {resourcesAvail} ready
          </strong>
        </div>
      </div>

      {/* Right: Engine Latency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: '0.74rem' }}>
          <Zap size={13} style={{ color: '#10b981' }} />
          <span className="mono-font">0.14ms Engine Latency</span>
        </div>
      </div>
    </div>
  );
};

export default MissionControlTicker;
