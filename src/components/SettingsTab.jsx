import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe, RotateCcw, VolumeX, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';
import { DEFAULT_SETTINGS } from '../config.js';

export function SettingsTab({
  settings,
  onSaveSettings,
  lang,
  onLanguageChange,
  theme,
  onThemeChange,
  onTestAlert,
  onToggleMute,
  mutedUntil,
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [form, setForm] = useState({ ...settings });
  const isMuted = Date.now() < mutedUntil;

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleNestedAlertChange = (key, val) => {
    setForm((prev) => ({
      ...prev,
      alertTypes: {
        ...prev.alertTypes,
        [key]: val,
      },
    }));
  };

  const handleSave = () => {
    onSaveSettings(form);
    alert(t.settings.savedSuccess);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SETTINGS });
    onSaveSettings(DEFAULT_SETTINGS);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>
          {t.settings.title}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t.settings.note}
        </p>
      </div>

      {/* Language & Theme */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} />
            {t.common.language}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onLanguageChange('en')}
            >
              English
            </button>
            <button
              className={`btn btn-sm ${lang === 'ar' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onLanguageChange('ar')}
            >
              العربية
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {t.common.theme}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onThemeChange('light')}
            >
              {t.common.light}
            </button>
            <button
              className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onThemeChange('dark')}
            >
              {t.common.dark}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
          {t.settings.modeSection}
        </h3>

        <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
          <input
            type="radio"
            name="stressMode"
            checked={form.stressMode === 'baseline'}
            onChange={() => handleChange('stressMode', 'baseline')}
            style={{ marginTop: 4 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.settings.baselineMode}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.settings.baselineModeDesc}</div>
          </div>
        </label>

        <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
          <input
            type="radio"
            name="stressMode"
            checked={form.stressMode === 'simple'}
            onChange={() => handleChange('stressMode', 'simple')}
            style={{ marginTop: 4 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.settings.simpleMode}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.settings.simpleModeDesc}</div>
          </div>
        </label>

        {form.stressMode === 'simple' && (
          <div style={{ padding: 10, backgroundColor: 'var(--bg-subtle)', borderRadius: 8, marginTop: 4 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              {t.settings.simpleThresholdLabel}:
            </label>
            <input
              type="number"
              className="input-field"
              value={form.simpleGsrThreshold}
              onChange={(e) => handleChange('simpleGsrThreshold', parseFloat(e.target.value) || 2000)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>
        )}
      </div>

      {/* Thresholds (Placeholders) */}
      {form.stressMode === 'baseline' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {t.settings.thresholdSection}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.hrvMediumDrop}
              </label>
              <input
                type="number"
                value={form.hrvMediumDropPercent}
                onChange={(e) => handleChange('hrvMediumDropPercent', parseFloat(e.target.value) || 15)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.hrvHighDrop}
              </label>
              <input
                type="number"
                value={form.hrvHighDropPercent}
                onChange={(e) => handleChange('hrvHighDropPercent', parseFloat(e.target.value) || 30)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.gsrMediumRise}
              </label>
              <input
                type="number"
                value={form.gsrMediumRisePercent}
                onChange={(e) => handleChange('gsrMediumRisePercent', parseFloat(e.target.value) || 10)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.gsrHighRise}
              </label>
              <input
                type="number"
                value={form.gsrHighRisePercent}
                onChange={(e) => handleChange('gsrHighRisePercent', parseFloat(e.target.value) || 25)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.persistenceLabel}
              </label>
              <input
                type="number"
                value={form.persistenceSeconds}
                onChange={(e) => handleChange('persistenceSeconds', parseInt(e.target.value, 10) || 10)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                {t.settings.cooldownLabel}
              </label>
              <input
                type="number"
                value={form.alertCooldownMinutes}
                onChange={(e) => handleChange('alertCooldownMinutes', parseInt(e.target.value, 10) || 5)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Notifications */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
          {t.settings.alertsSection}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries({
            highStress: 'High Stress Alert',
            persistentStress: 'Persistent Stress Alert',
            mildStress: 'Mild Stress (Quiet)',
            connectionLost: 'Connection Lost Alert',
            weakSignal: 'Weak Signal (>30s) Alert',
            abnormalReading: 'Unusual Reading Alert',
          }).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.85rem' }}>{label}</span>
              <input
                type="checkbox"
                checked={form.alertTypes?.[key] ?? true}
                onChange={(e) => handleNestedAlertChange(key, e.target.checked)}
              />
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onTestAlert}>
            <Bell size={14} />
            {t.settings.testAlert}
          </button>
          <button
            className={`btn btn-sm ${isMuted ? 'btn-primary' : 'btn-outline'}`}
            onClick={onToggleMute}
          >
            <VolumeX size={14} />
            {isMuted ? t.settings.unmute : t.settings.mute30Min}
          </button>
        </div>
      </div>

      {/* Screen & Background Monitoring Notice */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--state-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem', color: 'var(--state-medium)' }}>
          <ShieldAlert size={18} />
          {t.settings.backgroundNoticeTitle}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t.settings.backgroundNoticeText}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
          Save Settings
        </button>
        <button className="btn btn-outline" onClick={handleReset} title={t.settings.resetDefaults}>
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
