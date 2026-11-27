import React, { useState } from 'react';
import { Bluetooth, RefreshCw, AlertCircle, Settings, Play, Sliders } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';

export function ConnectionBar({
  connectionStatus,
  isDemoMode,
  onToggleDemo,
  onConnectReal,
  onDisconnect,
  onOpenSettings,
  onEnableBluetooth,
  bleError,
  lang = 'en',
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [showDevPanel, setShowDevPanel] = useState(false);

  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {/* Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="status-pill">
            <span className={`status-dot ${connectionStatus}`} />
            <span style={{ textTransform: 'capitalize' }}>
              {isDemoMode ? t.common.demoMode : connectionStatus}
            </span>
          </div>

          <button
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            onClick={onToggleDemo}
          >
            {isDemoMode ? t.common.realBleMode : t.common.demoMode}
          </button>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isDemoMode && (
            connectionStatus === 'connected' ? (
              <button className="btn btn-secondary btn-sm" onClick={onDisconnect}>
                {t.common.disconnect}
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={onConnectReal}
                disabled={connectionStatus === 'scanning' || connectionStatus === 'connecting'}
              >
                <Bluetooth size={14} />
                {connectionStatus === 'scanning' ? 'Scanning...' : t.common.connect}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bluetooth Errors & Permission Guides */}
      {bleError && (
        <div style={{ marginTop: 10, padding: 8, borderRadius: 8, backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={16} />
            <span>{bleError}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={onEnableBluetooth}>
              {t.common.enableBluetooth}
            </button>
            <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={onOpenSettings}>
              {t.common.openSettings}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
