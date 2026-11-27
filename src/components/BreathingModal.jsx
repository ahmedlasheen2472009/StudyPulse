import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Wind, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';
import { appendHistoryRecord } from '../lib/storage.js';

export function BreathingModal({ isOpen, onClose, currentPacket, recentPackets = [], lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [durationMinutes, setDurationMinutes] = useState(2);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [subPhase, setSubPhase] = useState('inhale'); // 'inhale' (4s) | 'exhale' (6s)
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  
  // Baseline evaluation for session
  const [beforeHrv, setBeforeHrv] = useState(null);
  const [afterHrv, setAfterHrv] = useState(null);
  const [motionWarning, setMotionWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase('idle');
      setSecondsRemaining(durationMinutes * 60);
      setBeforeHrv(null);
      setAfterHrv(null);
      setMotionWarning(false);
    }
  }, [isOpen, durationMinutes]);

  // Breathing loop: 4s inhale, 6s exhale (10s total cycle)
  useEffect(() => {
    if (phase !== 'running') return;

    // Cycle timer (4s in, 6s out)
    let cycleCount = 0;
    const cycleTimer = setInterval(() => {
      cycleCount = (cycleCount + 1) % 10;
      if (cycleCount < 4) {
        setSubPhase('inhale');
      } else {
        setSubPhase('exhale');
      }
    }, 1000);

    // Countdown timer
    const countdown = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          clearInterval(cycleTimer);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(cycleTimer);
      clearInterval(countdown);
    };
  }, [phase]);

  // Calculate 30s avg HRV before session
  const startSession = () => {
    const validRecent = recentPackets.slice(-30).filter(p => p.motion < 0.5 && p.quality >= 2 && p.hrv > 0);
    if (validRecent.length >= 5) {
      const avg = validRecent.reduce((acc, p) => acc + p.hrv, 0) / validRecent.length;
      setBeforeHrv(Math.round(avg * 10) / 10);
    } else {
      setBeforeHrv(currentPacket?.hrv || 40);
    }
    setSecondsRemaining(durationMinutes * 60);
    setSubPhase('inhale');
    setPhase('running');
  };

  const completeSession = () => {
    setPhase('completed');
    const validEnding = recentPackets.slice(-30).filter(p => p.motion < 0.5 && p.quality >= 2 && p.hrv > 0);
    let endVal = null;
    if (validEnding.length >= 5) {
      const avg = validEnding.reduce((acc, p) => acc + p.hrv, 0) / validEnding.length;
      endVal = Math.round(avg * 10) / 10;
    } else {
      endVal = currentPacket?.hrv || 45;
    }
    setAfterHrv(endVal);

    // Save to history
    const change = beforeHrv && endVal ? Math.round((endVal - beforeHrv) * 10) / 10 : 0;
    appendHistoryRecord({
      type: 'breathing',
      durationSeconds: durationMinutes * 60,
      hrvStart: beforeHrv,
      hrvEnd: endVal,
      hrvChange: change,
      summary: `${durationMinutes}m guided breathing. HRV changed by ${change >= 0 ? '+' : ''}${change} ms`,
    });
  };

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wind color="var(--accent-primary)" />
            {t.breathing.title}
          </h2>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t.breathing.subtitle}
        </p>

        {phase === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '20px 0' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {t.breathing.selectDuration}:
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {[1, 2, 3].map((min) => (
                  <button
                    key={min}
                    className={`btn ${durationMinutes === min ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setDurationMinutes(min)}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={startSession}>
              <Play size={18} />
              {t.breathing.start}
            </button>
          </div>
        )}

        {(phase === 'running' || phase === 'paused') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(secondsRemaining)}
            </div>

            {/* Breathing Circle */}
            <div className="breathing-visual-container">
              <div className="breathing-circle-outer">
                <div className={`breathing-circle-inner ${phase === 'running' ? (subPhase === 'inhale' ? 'inhaling' : 'exhaling') : ''}`}>
                  {subPhase === 'inhale' ? t.breathing.inhale : t.breathing.exhale}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12 }}>
              {phase === 'running' ? (
                <button className="btn btn-secondary" onClick={() => setPhase('paused')}>
                  <Pause size={18} />
                  {t.breathing.pause}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setPhase('running')}>
                  <Play size={18} />
                  {t.breathing.resume}
                </button>
              )}
              <button className="btn btn-danger" onClick={() => setPhase('idle')}>
                <Square size={16} />
                {t.breathing.stop}
              </button>
            </div>
          </div>
        )}

        {phase === 'completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--state-calm)' }}>
              <CheckCircle2 size={48} />
            </div>
            <h3>Session Completed</h3>
            
            <div style={{ padding: 14, backgroundColor: 'var(--bg-subtle)', borderRadius: 10, textAlign: 'start', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontWeight: 600 }}>{t.breathing.baselineComparison}:</div>
              <div>{t.breathing.beforeHrv}: <strong>{beforeHrv ?? '--'} ms</strong></div>
              <div>{t.breathing.afterHrv}: <strong>{afterHrv ?? '--'} ms</strong></div>
              {beforeHrv && afterHrv && (
                <div style={{ marginTop: 4, fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {t.breathing.hrvChange} {afterHrv - beforeHrv >= 0 ? '+' : ''}{(afterHrv - beforeHrv).toFixed(1)} ms
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t.breathing.neutralDisclaimer}
            </p>

            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
