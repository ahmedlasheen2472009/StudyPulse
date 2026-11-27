import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Wind, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

import { TRANSLATIONS } from './i18n.js';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './config.js';
import { parseBlePacket } from './lib/packetParser.js';
import { computeBaselineFromPackets } from './lib/baseline.js';
import { classifyInstantPacket, getPersistentState } from './lib/stateEngine.js';
import { evaluateAlert } from './lib/alertRules.js';
import { bleService } from './lib/bleService.js';
import { notificationService } from './lib/notificationService.js';
import { PacketSimulator } from './lib/simulator.js';
import { getStoredData, setStoredData, appendHistoryRecord } from './lib/storage.js';

import { ConnectionBar } from './components/ConnectionBar.jsx';
import { StateHero } from './components/StateHero.jsx';
import { SensorGrid } from './components/SensorGrid.jsx';
import { TrendCharts } from './components/TrendCharts.jsx';
import { DeveloperPanel } from './components/DeveloperPanel.jsx';
import { BreathingModal } from './components/BreathingModal.jsx';
import { HistoryTab } from './components/HistoryTab.jsx';
import { SettingsTab } from './components/SettingsTab.jsx';
import { DisclaimerModal } from './components/DisclaimerModal.jsx';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'breathing' | 'history' | 'settings'

  // Locale & Theme
  const [lang, setLang] = useState(() => getStoredData(STORAGE_KEYS.LANGUAGE, 'en'));
  const [theme, setTheme] = useState(() => getStoredData(STORAGE_KEYS.THEME, 'light'));

  // User Settings & Baseline
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...getStoredData(STORAGE_KEYS.SETTINGS, {}),
  }));
  const [baseline, setBaseline] = useState(() => getStoredData(STORAGE_KEYS.BASELINE, null));
  const [showDisclaimer, setShowDisclaimer] = useState(() => !getStoredData(STORAGE_KEYS.PRIVACY_ACCEPTED, false));

  // Connection & BLE State
  const [isDemoMode, setIsDemoMode] = useState(true); // Default ON as required
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected' | 'connecting' | 'scanning' | 'disconnected'
  const [bleError, setBleError] = useState(null);

  // Live Telemetry
  const [currentPacket, setCurrentPacket] = useState(null);
  const [packetHistory, setPacketHistory] = useState([]);
  const [packetCount, setPacketCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [packetRate, setPacketRate] = useState(0);

  // State Engine
  const [currentState, setCurrentState] = useState('calm');
  const [recentClassifications, setRecentClassifications] = useState([]);
  const [completedBreathingCount, setCompletedBreathingCount] = useState(0);

  // Alerts
  const [activeBannerAlert, setActiveBannerAlert] = useState(null);
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [mutedUntil, setMutedUntil] = useState(0);

  // Baseline Calibration Progress
  const [isRecordingBaseline, setIsRecordingBaseline] = useState(false);
  const [baselineProgressSec, setBaselineProgressSec] = useState(0);
  const baselineBuffer = useRef([]);

  // Modals & Panels
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  // Refs for tracking mutable timing without re-render cascades
  const simulatorRef = useRef(null);
  const lastSecondPacketCount = useRef(0);
  const stateStartTimeRef = useRef(Date.now());
  const weakSignalStartTimeRef = useRef(0);
  const previousStateRef = useRef('calm');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Sync RTL and Theme attributes to document element
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    setStoredData(STORAGE_KEYS.LANGUAGE, lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredData(STORAGE_KEYS.THEME, theme);
    try {
      StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
    } catch (e) {
      // Ignore in browser
    }
  }, [theme]);

  // Keep screen awake listener
  useEffect(() => {
    notificationService.setKeepScreenOn(settings.keepScreenOn);
  }, [settings.keepScreenOn]);

  // Android Back Button handler (closes modals first)
  useEffect(() => {
    let listenerHandle = null;
    try {
      listenerHandle = CapApp.addListener('backButton', () => {
        if (showBreathingModal) {
          setShowBreathingModal(false);
        } else if (showDisclaimer) {
          // keep disclaimer
        } else if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          CapApp.exitApp();
        }
      });
    } catch (e) {
      // browser
    }

    return () => {
      if (listenerHandle?.remove) listenerHandle.remove();
    };
  }, [showBreathingModal, showDisclaimer, activeTab]);

  // Calculate packets/second
  useEffect(() => {
    const rateInterval = setInterval(() => {
      setPacketRate(lastSecondPacketCount.current);
      lastSecondPacketCount.current = 0;
    }, 1000);
    return () => clearInterval(rateInterval);
  }, []);

  // Initialize Simulator on Mount (Demo default)
  useEffect(() => {
    simulatorRef.current = new PacketSimulator((packet) => {
      handleIncomingPacket(packet);
    });

    if (isDemoMode) {
      simulatorRef.current.start();
      setConnectionStatus('connected');
    }

    return () => {
      if (simulatorRef.current) simulatorRef.current.stop();
    };
  }, [isDemoMode]);

  // Set up BLE Service Callbacks
  useEffect(() => {
    bleService.setCallbacks({
      onPacket: (data) => {
        handleIncomingPacket(data);
      },
      onStatusChange: (status, details) => {
        setConnectionStatus(status);
        if (status === 'disconnected') {
          if (details?.error) setBleError(details.error);
        } else if (status === 'connected') {
          setBleError(null);
        }
      },
      onError: (err) => {
        setErrorCount((prev) => prev + 1);
      },
    });
  }, [baseline, settings, completedBreathingCount]);

  // Handle Each Ingested Packet (from BLE or Simulator)
  const handleIncomingPacket = (packet) => {
    lastSecondPacketCount.current += 1;
    setPacketCount((prev) => prev + 1);
    setCurrentPacket(packet);

    setPacketHistory((prev) => {
      const updated = [...prev, packet];
      return updated.slice(-300); // keep 5 minutes (300 seconds)
    });

    // Baseline Recording Buffer Accumulation
    if (isRecordingBaseline) {
      baselineBuffer.current.push(packet);
      setBaselineProgressSec((prev) => prev + 1);
      if (baselineBuffer.current.length >= settings.baselineDurationSeconds) {
        finishBaselineCalibration();
      }
    }

    // State Classification
    const instant = classifyInstantPacket(packet, baseline, {
      isConnected: connectionStatus === 'connected' || isDemoMode,
      stressMode: settings.stressMode,
      simpleGsrThreshold: settings.simpleGsrThreshold,
      hrvMediumDropPercent: settings.hrvMediumDropPercent,
      hrvHighDropPercent: settings.hrvHighDropPercent,
      gsrMediumRisePercent: settings.gsrMediumRisePercent,
      gsrHighRisePercent: settings.gsrHighRisePercent,
      motionThreshold: settings.motionThreshold,
      minQualityBars: settings.minQualityBars,
      bpmMinNormal: settings.bpmMinNormal,
      bpmMaxNormal: settings.bpmMaxNormal,
      completedBreathingCount,
      lastStressState: currentState,
    });

    const now = Date.now();
    const updatedClassifications = [...recentClassifications, { state: instant.state, timestamp: now }].slice(-60);
    setRecentClassifications(updatedClassifications);

    const effective = getPersistentState(updatedClassifications, currentState, settings.persistenceSeconds);

    if (effective !== currentState) {
      previousStateRef.current = currentState;
      setCurrentState(effective);
      stateStartTimeRef.current = now;
    }

    // Track Weak Signal Duration
    if (effective === 'weak-signal') {
      if (weakSignalStartTimeRef.current === 0) weakSignalStartTimeRef.current = now;
    } else {
      weakSignalStartTimeRef.current = 0;
    }

    // Evaluate Alerts
    const statePersistDuration = Math.floor((now - stateStartTimeRef.current) / 1000);
    const weakSigDuration = weakSignalStartTimeRef.current > 0 ? Math.floor((now - weakSignalStartTimeRef.current) / 1000) : 0;

    const alertCheck = evaluateAlert({
      currentState: effective,
      previousState: previousStateRef.current,
      statePersistDuration,
      now,
      lastAlertTime,
      mutedUntil,
      settings,
      weakSignalDuration: weakSigDuration,
    });

    if (alertCheck.shouldAlert) {
      triggerAlert({
        title: alertCheck.title,
        body: alertCheck.body,
        level: alertCheck.level,
      });
      setLastAlertTime(now);
    }
  };

  const triggerAlert = ({ title, body, level = 'info' }) => {
    setActiveBannerAlert({ title, body, level, id: Date.now() });

    // Native vibration & local notification
    notificationService.triggerVibration(level);
    notificationService.sendNotification({ title, body, level });

    // Auto dismiss in-app banner after 8 seconds
    setTimeout(() => {
      setActiveBannerAlert((prev) => (prev?.title === title ? null : prev));
    }, 8000);
  };

  // Baseline Calibration Functions
  const startBaselineRecording = () => {
    baselineBuffer.current = [];
    setBaselineProgressSec(0);
    setIsRecordingBaseline(true);
  };

  const finishBaselineCalibration = () => {
    setIsRecordingBaseline(false);
    const computed = computeBaselineFromPackets(baselineBuffer.current, {
      motionThreshold: settings.motionThreshold,
      minQualityBars: settings.minQualityBars,
    });

    if (computed) {
      setBaseline(computed);
      setStoredData(STORAGE_KEYS.BASELINE, computed);
      appendHistoryRecord({
        type: 'baseline',
        durationSeconds: baselineBuffer.current.length,
        summary: `Baseline calibrated: HRV ${computed.hrv} ms, GSR ${computed.gsr}, BPM ${computed.bpm} (${computed.sampleCount} clean samples)`,
      });
      alert(t.dashboard.baselineSuccess);
    } else {
      alert('Calibration incomplete: too much movement or low signal. Please hold still and try again.');
    }
    baselineBuffer.current = [];
    setBaselineProgressSec(0);
  };

  // Demo Controls
  const toggleDemoMode = () => {
    if (isDemoMode) {
      // Turn OFF Demo, switch to real BLE
      if (simulatorRef.current) simulatorRef.current.stop();
      setIsDemoMode(false);
      setConnectionStatus('disconnected');
    } else {
      // Turn ON Demo
      bleService.disconnect();
      setIsDemoMode(true);
      setConnectionStatus('connected');
      if (simulatorRef.current) simulatorRef.current.start();
    }
  };

  const handleForceState = (st) => {
    if (simulatorRef.current) {
      simulatorRef.current.setForcedState(st);
    }
  };

  const handleCycleStates = () => {
    if (simulatorRef.current) {
      if (simulatorRef.current.cycling) {
        simulatorRef.current.stopCycling();
      } else {
        simulatorRef.current.startCycling();
      }
    }
  };

  // Real BLE Connect
  const handleConnectReal = async () => {
    setBleError(null);
    await bleService.scanAndConnect();
  };

  const handleDisconnect = async () => {
    await bleService.disconnect();
  };

  const handleEnableBluetooth = async () => {
    await bleService.requestEnableBluetooth();
  };

  const handleOpenSettings = async () => {
    await bleService.openAppSettings();
  };

  // Mute Alerts
  const toggleMute = () => {
    const isCurrentlyMuted = Date.now() < mutedUntil;
    if (isCurrentlyMuted) {
      setMutedUntil(0);
    } else {
      setMutedUntil(Date.now() + 30 * 60 * 1000); // 30 mins
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setStoredData(STORAGE_KEYS.SETTINGS, newSettings);
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setStoredData(STORAGE_KEYS.PRIVACY_ACCEPTED, true);
  };

  return (
    <div className="app-container">
      {/* Disclaimer on First Launch */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        lang={lang}
      />

      {/* Guided Breathing Modal */}
      <BreathingModal
        isOpen={showBreathingModal}
        onClose={() => {
          setShowBreathingModal(false);
          setCompletedBreathingCount((prev) => prev + 1);
        }}
        currentPacket={currentPacket}
        recentPackets={packetHistory}
        lang={lang}
      />

      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <Activity color="var(--accent-primary)" size={24} />
          <div>
            <h1 className="brand-title">{t.appName}</h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.prototypeNotice}</div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-sm ${Date.now() < mutedUntil ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '6px 8px' }}
            onClick={toggleMute}
            title={Date.now() < mutedUntil ? 'Unmute' : 'Mute 30m'}
          >
            {Date.now() < mutedUntil ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* Demo & Untested Banners */}
      {isDemoMode && (
        <div className="demo-banner">
          <AlertTriangle size={14} />
          <span>{t.dashboard.demoBanner}</span>
        </div>
      )}
      {!isDemoMode && (
        <div className="untested-banner">
          <span>{t.dashboard.untestedBleBanner}</span>
        </div>
      )}

      {/* In-App Alert Banner */}
      {activeBannerAlert && (
        <div className={`alert-banner ${activeBannerAlert.level}`}>
          <AlertTriangle size={20} />
          <div className="alert-banner-text">
            <div className="alert-banner-title">{activeBannerAlert.title}</div>
            <div className="alert-banner-body">{activeBannerAlert.body}</div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => setActiveBannerAlert(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Tabs Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <>
            {/* Connection Bar */}
            <ConnectionBar
              connectionStatus={connectionStatus}
              isDemoMode={isDemoMode}
              onToggleDemo={toggleDemoMode}
              onConnectReal={handleConnectReal}
              onDisconnect={handleDisconnect}
              onOpenSettings={handleOpenSettings}
              onEnableBluetooth={handleEnableBluetooth}
              bleError={bleError}
              lang={lang}
            />

            {/* Baseline Calibration Widget */}
            {isRecordingBaseline ? (
              <div className="card" style={{ border: '2px solid var(--accent-primary)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {t.dashboard.recordingBaseline}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0' }}>
                  Please sit still and breathe normally. Keep your wrist rested on the table.
                </p>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', margin: '8px 0' }}>
                  {baselineProgressSec} / {settings.baselineDurationSeconds} s
                </div>
                <div style={{ height: 6, backgroundColor: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: 'var(--accent-primary)',
                      width: `${(baselineProgressSec / settings.baselineDurationSeconds) * 100}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
              </div>
            ) : !baseline && settings.stressMode === 'baseline' ? (
              <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.dashboard.noBaselineWarning}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Requires 2 minutes of calm calibration.</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={startBaselineRecording}>
                  {t.dashboard.recordBaseline}
                </button>
              </div>
            ) : baseline && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                <span>{t.dashboard.currentBaseline}: <strong>HRV {baseline.hrv} ms</strong> • <strong>GSR {baseline.gsr}</strong></span>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  onClick={startBaselineRecording}
                >
                  Recalibrate
                </button>
              </div>
            )}

            {/* State Hero */}
            <StateHero
              state={currentState}
              lang={lang}
              onRecordBaseline={startBaselineRecording}
              hasBaseline={Boolean(baseline)}
            />

            {/* Sensor Numerical Grid */}
            <SensorGrid packet={currentPacket} lang={lang} />

            {/* Real-time Trend Charts */}
            <TrendCharts history={packetHistory} lang={lang} />

            {/* Developer & Demo Inspector Panel */}
            <DeveloperPanel
              lastPacket={currentPacket}
              packetCount={packetCount}
              packetRate={packetRate}
              errorCount={errorCount}
              onForceState={handleForceState}
              onCycleStates={handleCycleStates}
              isCycling={simulatorRef.current?.cycling}
              lang={lang}
            />
          </>
        )}

        {activeTab === 'breathing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <Wind size={48} color="var(--accent-primary)" style={{ margin: '0 auto 12px auto' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6 }}>
                {t.breathing.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                {t.breathing.subtitle}
              </p>
              <button className="btn btn-primary" onClick={() => setShowBreathingModal(true)}>
                Start Guided Session
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryTab
            rawPackets={packetHistory}
            lang={lang}
            onDataCleared={() => setBaseline(null)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSaveSettings={handleSaveSettings}
            lang={lang}
            onLanguageChange={setLang}
            theme={theme}
            onThemeChange={setTheme}
            onTestAlert={() => triggerAlert({
              title: 'Test Warning Alert',
              body: 'This is a test notification verifying haptics, local alert channel, and in-app banner.',
              level: 'warning',
            })}
            onToggleMute={toggleMute}
            mutedUntil={mutedUntil}
          />
        )}

        {/* Mandatory Safety Footer */}
        <footer className="safety-footer">
          <div className="safety-footer-text">
            {t.prototypeNotice}
          </div>
          <div className="safety-footer-alert">
            {t.medicalEmergencyNotice}
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={20} />
          <span>{t.tabs.dashboard}</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={20} />
          <span>{t.tabs.breathing}</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HistoryIcon size={20} />
          <span>{t.tabs.history}</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} />
          <span>{t.tabs.settings}</span>
        </button>
      </nav>
    </div>
  );
}
