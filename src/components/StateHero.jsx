import React from 'react';
import { 
  Smile, 
  AlertTriangle, 
  Flame, 
  AlertOctagon, 
  Hand, 
  WifiOff, 
  Activity, 
  HelpCircle,
  SlidersHorizontal 
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';

export function StateHero({ state, lang = 'en', onRecordBaseline, hasBaseline }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const stateData = t.states[state] || t.states.disconnected;

  const configMap = {
    calm: {
      color: 'var(--state-calm)',
      bg: 'var(--state-calm-bg)',
      icon: Smile,
      badge: 'Calm',
      badgeAr: 'هادئ',
    },
    medium: {
      color: 'var(--state-medium)',
      bg: 'var(--state-medium-bg)',
      icon: AlertTriangle,
      badge: 'Mild Stress',
      badgeAr: 'إجهاد خفيف',
    },
    high: {
      color: 'var(--state-high)',
      bg: 'var(--state-high-bg)',
      icon: Flame,
      badge: 'High Stress',
      badgeAr: 'توتر مرتفع',
    },
    persistent: {
      color: 'var(--state-persistent)',
      bg: 'var(--state-persistent-bg)',
      icon: AlertOctagon,
      badge: 'Persistent',
      badgeAr: 'مستمر',
    },
    motion: {
      color: 'var(--state-motion)',
      bg: 'var(--state-motion-bg)',
      icon: Hand,
      badge: 'Motion Gating',
      badgeAr: 'حركة اليد',
    },
    'weak-signal': {
      color: 'var(--state-weak)',
      bg: 'var(--state-weak-bg)',
      icon: Activity,
      badge: 'Weak Signal',
      badgeAr: 'إشارة ضعيفة',
    },
    abnormal: {
      color: 'var(--state-abnormal)',
      bg: 'var(--state-abnormal-bg)',
      icon: AlertOctagon,
      badge: 'Unusual Reading',
      badgeAr: 'قراءة غير معتادة',
    },
    disconnected: {
      color: 'var(--state-disconnected)',
      bg: 'var(--state-disconnected-bg)',
      icon: WifiOff,
      badge: 'Offline',
      badgeAr: 'غير متصل',
    },
    noBaseline: {
      color: 'var(--accent-primary)',
      bg: 'var(--accent-light)',
      icon: SlidersHorizontal,
      badge: 'Baseline Needed',
      badgeAr: 'يلزم خط أساس',
    },
  };

  const currentCfg = configMap[state] || configMap.disconnected;
  const IconComponent = currentCfg.icon;

  return (
    <section 
      className="state-hero"
      style={{
        backgroundColor: currentCfg.bg,
        borderColor: currentCfg.color,
      }}
      aria-live="polite"
    >
      <div className="state-hero-header">
        <div 
          className="state-icon-box"
          style={{ backgroundColor: currentCfg.color, color: '#ffffff' }}
        >
          <IconComponent size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span 
              className="state-badge"
              style={{ backgroundColor: currentCfg.color, color: '#ffffff' }}
            >
              {lang === 'ar' ? currentCfg.badgeAr : currentCfg.badge}
            </span>
          </div>
          <h2 className="state-title-text" style={{ color: currentCfg.color }}>
            {stateData.title}
          </h2>
        </div>
      </div>

      <p className="state-message">
        {stateData.message}
      </p>

      {stateData.steps && stateData.steps.length > 0 && (
        <ol className="state-steps">
          {stateData.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      )}

      {state === 'noBaseline' && (
        <div style={{ marginTop: 8 }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onRecordBaseline}
          >
            {t.dashboard.recordBaseline}
          </button>
        </div>
      )}
    </section>
  );
}
