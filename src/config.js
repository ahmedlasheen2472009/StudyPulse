/**
 * BIOADAPT CONFIGURATION & PLACEHOLDERS
 * 
 * IMPORTANT DISCLAIMER:
 * This device is an ISEF research and wellness prototype, NOT a medical device.
 * All thresholds, weights, and scoring algorithms below are RESEARCH PLACEHOLDERS
 * and have NOT been clinically or scientifically validated.
 */

export const BLE_CONFIG = {
  DEVICE_NAME: 'BioAdapt',
  SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  NOTIFY_CHARACTERISTIC_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
  PACKET_INTERVAL_MS: 1000,
};

export const DEFAULT_SETTINGS = {
  // Mode selection: 'baseline' (default) or 'simple'
  stressMode: 'baseline', // 'baseline' | 'simple'

  // Baseline calibration duration in seconds (2 minutes default)
  baselineDurationSeconds: 120,

  // Thresholds for baseline drop calculations (PLACEHOLDERS)
  // When HRV drops by X% and GSR increases by Y%, stress score rises
  hrvMediumDropPercent: 15, // 15% drop from baseline
  hrvHighDropPercent: 30,   // 30% drop from baseline
  gsrMediumRisePercent: 10, // 10% rise from baseline
  gsrHighRisePercent: 25,   // 25% rise from baseline

  // Simple Mode threshold: GSR raw value above which stress is high (PLACEHOLDER)
  simpleGsrThreshold: 2200,

  // Persistence requirement before state is displayed/alerted (seconds)
  persistenceSeconds: 10,

  // Alert settings
  alertCooldownMinutes: 5,
  keepScreenOn: false,
  vibrationEnabled: true,
  alertTypes: {
    highStress: true,
    persistentStress: true,
    mildStress: true, // quieter
    connectionLost: true,
    weakSignal: true,
    abnormalReading: true,
  },

  // Guided Breathing options (durations in minutes)
  breathingDurations: [1, 2, 3],
  defaultBreathingDuration: 2,

  // Physiological Abnormal limits (sensor errors or unusual states)
  bpmMinNormal: 40,
  bpmMaxNormal: 180,
  motionThreshold: 0.5, // above this is considered hand movement
  minQualityBars: 2,    // 0-1 considered weak signal, 2-4 acceptable
};

export const STORAGE_KEYS = {
  BASELINE: 'bioadapt_personal_baseline',
  SETTINGS: 'bioadapt_settings',
  HISTORY: 'bioadapt_history',
  PRIVACY_ACCEPTED: 'bioadapt_privacy_accepted_v1',
  LANGUAGE: 'bioadapt_language',
  THEME: 'bioadapt_theme',
};
