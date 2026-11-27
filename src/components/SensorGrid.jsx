import React from 'react';
import { Heart, Activity, Zap, Waves } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';

export function SensorGrid({ packet, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const bpm = packet?.bpm ?? '--';
  const hrv = packet?.hrv ?? '--';
  const gsr = packet?.gsr ?? '--';
  const motion = packet?.motion ?? '--';
  const quality = packet?.quality ?? 0;

  return (
    <div className="sensor-grid">
      {/* Heart Rate */}
      <div className="sensor-card">
        <div className="sensor-label">
          <span>{t.dashboard.heartRate}</span>
          <Heart size={16} color="var(--state-high)" />
        </div>
        <div className="sensor-value-row">
          <span className="sensor-value">{bpm}</span>
          <span className="sensor-unit">BPM</span>
        </div>
      </div>

      {/* HRV (RMSSD) */}
      <div className="sensor-card">
        <div className="sensor-label">
          <span>{t.dashboard.hrv}</span>
          <Activity size={16} color="var(--accent-primary)" />
        </div>
        <div className="sensor-value-row">
          <span className="sensor-value">{hrv}</span>
          <span className="sensor-unit">ms</span>
        </div>
      </div>

      {/* Skin Conductance (GSR) */}
      <div className="sensor-card">
        <div className="sensor-label">
          <span>{t.dashboard.gsr}</span>
          <Zap size={16} color="var(--state-medium)" />
        </div>
        <div className="sensor-value-row">
          <span className="sensor-value">{gsr}</span>
          <span className="sensor-unit">raw</span>
        </div>
      </div>

      {/* Motion & Quality */}
      <div className="sensor-card">
        <div className="sensor-label">
          <span>{t.dashboard.motion}</span>
          <Waves size={16} color="var(--state-motion)" />
        </div>
        <div className="sensor-value-row">
          <span className="sensor-value">{motion}</span>
          <span className="sensor-unit">g-diff</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.dashboard.signalQuality}</span>
          <div className="quality-bars" title={`Quality: ${quality}/4`}>
            {[1, 2, 3, 4].map(bar => (
              <div 
                key={bar}
                className={`quality-bar ${bar <= quality ? 'active' : ''}`}
                style={{ height: `${bar * 3.5 + 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
