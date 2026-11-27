import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';

export function DeveloperPanel({
  lastPacket,
  packetCount,
  packetRate,
  errorCount,
  onForceState,
  onCycleStates,
  isCycling,
  lang = 'en',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const states = [
    { id: 'calm', label: 'Calm' },
    { id: 'medium', label: 'Mild Stress' },
    { id: 'high', label: 'High Stress' },
    { id: 'persistent', label: 'Persistent' },
    { id: 'motion', label: 'Motion' },
    { id: 'weak-signal', label: 'Weak Signal' },
    { id: 'abnormal', label: 'Abnormal' },
  ];

  return (
    <div className="card" style={{ padding: '12px 16px', backgroundColor: 'var(--bg-subtle)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={16} />
          Developer & Demo Inspector
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
          {/* Demo Controls */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
              {t.dashboard.quickStateTest}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {states.map((s) => (
                <button
                  key={s.id}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={() => onForceState(s.id)}
                >
                  {s.label}
                </button>
              ))}
              <button
                className={`btn btn-sm ${isCycling ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                onClick={onCycleStates}
              >
                <Shuffle size={12} />
                {t.dashboard.cycleDemo}
              </button>
            </div>
          </div>

          {/* Telemetry Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 8, backgroundColor: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>{t.dashboard.packetsReceived}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{packetCount}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>{t.dashboard.packetRate}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{packetRate}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>{t.dashboard.errorCount}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: errorCount > 0 ? 'var(--state-high)' : 'inherit' }}>
                {errorCount}
              </div>
            </div>
          </div>

          {/* Raw Payload */}
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{t.dashboard.lastRawPacket}:</div>
            <code style={{
              display: 'block',
              padding: '6px 10px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'var(--accent-primary)',
              wordBreak: 'break-all'
            }}>
              {lastPacket?.raw || 'Waiting for packet...'}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
