/**
 * State Engine (Pure Functions)
 * 
 * Determines current physiological / device state according to priority hierarchy:
 * 1. disconnected (highest)
 * 2. motion (freeze values, pause classification)
 * 3. weak-signal (quality <= 1)
 * 4. abnormal (bpm < 40 or > 180 or hrv <= 0; "may be a sensor error", never diagnosis)
 * 5. persistent (still high after 3 completed breathing sessions)
 * 6. high
 * 7. medium
 * 8. calm (lowest)
 * 
 * If no baseline exists (and in baseline mode), returns 'noBaseline'.
 */

import { DEFAULT_SETTINGS } from '../config.js';

export const STATE_PRIORITIES = {
  disconnected: 100,
  motion: 90,
  'weak-signal': 80,
  abnormal: 70,
  persistent: 60,
  high: 50,
  medium: 40,
  calm: 10,
  noBaseline: 5,
};

/**
 * Classifies an instantaneous packet against personal baseline or simple threshold.
 * 
 * @param {Object} packet - Parsed packet { bpm, hrv, gsr, motion, quality }
 * @param {Object} baseline - Personal baseline { hrv, gsr, bpm } or null
 * @param {Object} options - Custom settings
 * @returns {{ state: string, rawScore?: number, reason: string }}
 */
export function classifyInstantPacket(packet, baseline, options = {}) {
  const isConnected = options.isConnected !== false;
  if (!isConnected || !packet) {
    return { state: 'disconnected', reason: 'No Bluetooth connection' };
  }

  const motionThreshold = options.motionThreshold ?? DEFAULT_SETTINGS.motionThreshold;
  const minQualityBars = options.minQualityBars ?? DEFAULT_SETTINGS.minQualityBars;
  const bpmMinNormal = options.bpmMinNormal ?? DEFAULT_SETTINGS.bpmMinNormal;
  const bpmMaxNormal = options.bpmMaxNormal ?? DEFAULT_SETTINGS.bpmMaxNormal;

  // 1. Motion Gating Check
  if (packet.motion > motionThreshold) {
    return { state: 'motion', reason: 'Wrist movement detected, pulse measurement paused' };
  }

  // 2. Optical Signal Quality Check
  if (packet.quality < minQualityBars) {
    return { state: 'weak-signal', reason: 'Signal quality too low (<= 1 bar)' };
  }

  // 3. Sensor / Physiological Abnormal Check
  if (packet.bpm < bpmMinNormal || packet.bpm > bpmMaxNormal || packet.hrv <= 0 || Number.isNaN(packet.bpm)) {
    return { state: 'abnormal', reason: 'Unusual sensor reading (BPM <40 or >180, or HRV invalid)' };
  }

  // Simple Mode Evaluation (if enabled)
  if (options.stressMode === 'simple') {
    const simpleThreshold = options.simpleGsrThreshold ?? DEFAULT_SETTINGS.simpleGsrThreshold;
    if (packet.gsr >= simpleThreshold) {
      return { state: 'high', reason: `Raw GSR (${packet.gsr}) >= simple threshold (${simpleThreshold})` };
    }
    return { state: 'calm', reason: `Raw GSR (${packet.gsr}) < simple threshold (${simpleThreshold})` };
  }

  // Baseline Mode Evaluation (Default)
  if (!baseline || !baseline.hrv || !baseline.gsr) {
    return { state: 'noBaseline', reason: 'No personal baseline saved yet' };
  }

  // Check persistent stress condition (flag passed in options)
  if (options.completedBreathingCount >= 3 && options.lastStressState === 'high') {
    return { state: 'persistent', reason: 'Stress remains elevated after 3 breathing sessions' };
  }

  // Calculate percentage HRV drop and GSR rise vs baseline
  // Note: HRV drop indicates stress; GSR increase indicates stress.
  const hrvDropPercent = ((baseline.hrv - packet.hrv) / baseline.hrv) * 100;
  const gsrRisePercent = ((packet.gsr - baseline.gsr) / baseline.gsr) * 100;

  const hrvHighDrop = options.hrvHighDropPercent ?? DEFAULT_SETTINGS.hrvHighDropPercent;
  const hrvMedDrop = options.hrvMediumDropPercent ?? DEFAULT_SETTINGS.hrvMediumDropPercent;
  const gsrHighRise = options.gsrHighRisePercent ?? DEFAULT_SETTINGS.gsrHighRisePercent;
  const gsrMedRise = options.gsrMediumRisePercent ?? DEFAULT_SETTINGS.gsrMediumRisePercent;

  // Composite stress score calculation (research placeholder)
  // Weighted: 60% HRV drop contribution, 40% GSR rise contribution
  const normHrvDrop = Math.max(0, hrvDropPercent);
  const normGsrRise = Math.max(0, gsrRisePercent);
  const stressScore = (0.6 * normHrvDrop) + (0.4 * normGsrRise);

  // Classification logic
  const isHighHrv = hrvDropPercent >= hrvHighDrop;
  const isHighGsr = gsrRisePercent >= gsrHighRise;
  const isMedHrv = hrvDropPercent >= hrvMedDrop;
  const isMedGsr = gsrRisePercent >= gsrMedRise;

  if (isHighHrv || isHighGsr || stressScore >= 25) {
    return { state: 'high', rawScore: stressScore, reason: `Significant deviation (HRV drop: ${hrvDropPercent.toFixed(1)}%, GSR rise: ${gsrRisePercent.toFixed(1)}%)` };
  }

  if (isMedHrv || isMedGsr || stressScore >= 12) {
    return { state: 'medium', rawScore: stressScore, reason: `Mild deviation (HRV drop: ${hrvDropPercent.toFixed(1)}%, GSR rise: ${gsrRisePercent.toFixed(1)}%)` };
  }

  return { state: 'calm', rawScore: stressScore, reason: 'Physiological markers near personal baseline' };
}

/**
 * Applies temporal persistence filter so states do not flicker.
 * A medium or high state must persist for persistenceSeconds before transitioning.
 * 
 * @param {Array<{ state: string, timestamp: number }>} recentClassifications 
 * @param {string} currentState 
 * @param {number} persistenceSeconds 
 * @returns {string} Effective smoothed state
 */
export function getPersistentState(recentClassifications, currentState, persistenceSeconds = 10) {
  if (!recentClassifications || recentClassifications.length === 0) {
    return currentState || 'disconnected';
  }

  const latest = recentClassifications[recentClassifications.length - 1];
  const targetState = latest.state;

  // Immediate overrides for hardware/connection events
  if (targetState === 'disconnected' || targetState === 'motion' || targetState === 'weak-signal' || targetState === 'abnormal' || targetState === 'noBaseline') {
    return targetState;
  }

  // If already in target state, keep it
  if (targetState === currentState) {
    return targetState;
  }

  // Count how many consecutive seconds the new target state has been steady
  const now = Date.now();
  const thresholdMs = persistenceSeconds * 1000;
  let duration = 0;

  for (let i = recentClassifications.length - 1; i >= 0; i--) {
    if (recentClassifications[i].state === targetState) {
      duration = now - recentClassifications[i].timestamp;
    } else {
      break;
    }
  }

  if (duration >= thresholdMs) {
    return targetState;
  }

  // Not yet persisted long enough; retain currentState (or fallback to calm if calm is candidate)
  return currentState || 'calm';
}
