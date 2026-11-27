import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';

export function DisclaimerModal({ isOpen, onAccept, lang = 'en' }) {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--state-high)' }}>
          <ShieldCheck size={28} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {t.disclaimer.title}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <p>{t.disclaimer.text1}</p>
          <div style={{ padding: 12, backgroundColor: 'var(--state-high-bg)', border: '1px solid var(--state-high)', borderRadius: 8, color: 'var(--state-high)', fontWeight: 600 }}>
            {t.disclaimer.text2}
          </div>
          <p>{t.disclaimer.text3}</p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.disclaimer.text4}</p>
        </div>

        <button className="btn btn-primary" onClick={onAccept} style={{ marginTop: 8 }}>
          {t.disclaimer.accept}
        </button>
      </div>
    </div>
  );
}
