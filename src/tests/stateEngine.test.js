import { describe, it, expect } from 'vitest';
import { classifyInstantPacket, getPersistentState } from '../lib/stateEngine.js';

describe('State Engine', () => {
  const mockBaseline = { hrv: 50, gsr: 1500, bpm: 70 };

  it('prioritizes disconnected when not connected', () => {
    const res = classifyInstantPacket(null, mockBaseline, { isConnected: false });
    expect(res.state).toBe('disconnected');
  });

  it('prioritizes motion gating over stress indicators', () => {
    const packet = { bpm: 72, hrv: 20, gsr: 2500, motion: 0.85, quality: 3 };
    const res = classifyInstantPacket(packet, mockBaseline, { isConnected: true });
    expect(res.state).toBe('motion');
  });

  it('prioritizes weak signal when quality <= 1', () => {
    const packet = { bpm: 72, hrv: 20, gsr: 2500, motion: 0.05, quality: 1 };
    const res = classifyInstantPacket(packet, mockBaseline, { isConnected: true });
    expect(res.state).toBe('weak-signal');
  });

  it('detects abnormal readings outside physiological thresholds', () => {
    const packetLow = { bpm: 32, hrv: 50, gsr: 1500, motion: 0.05, quality: 4 };
    expect(classifyInstantPacket(packetLow, mockBaseline, { isConnected: true }).state).toBe('abnormal');

    const packetHigh = { bpm: 195, hrv: 50, gsr: 1500, motion: 0.05, quality: 4 };
    expect(classifyInstantPacket(packetHigh, mockBaseline, { isConnected: true }).state).toBe('abnormal');
  });

  it('returns noBaseline if baseline mode is active but baseline is missing', () => {
    const packet = { bpm: 72, hrv: 50, gsr: 1500, motion: 0.05, quality: 4 };
    const res = classifyInstantPacket(packet, null, { isConnected: true });
    expect(res.state).toBe('noBaseline');
  });

  it('classifies calm state when metrics align with baseline', () => {
    const packet = { bpm: 71, hrv: 52, gsr: 1480, motion: 0.02, quality: 4 };
    const res = classifyInstantPacket(packet, mockBaseline, { isConnected: true });
    expect(res.state).toBe('calm');
  });

  it('classifies high stress when HRV drops significantly and GSR spikes', () => {
    // 50 -> 30 (40% drop), 1500 -> 2100 (40% rise)
    const packet = { bpm: 85, hrv: 30, gsr: 2100, motion: 0.05, quality: 4 };
    const res = classifyInstantPacket(packet, mockBaseline, { isConnected: true });
    expect(res.state).toBe('high');
  });

  it('evaluates simple mode based purely on fixed GSR threshold', () => {
    const packet = { bpm: 75, hrv: 45, gsr: 2300, motion: 0.05, quality: 4 };
    const res = classifyInstantPacket(packet, null, {
      isConnected: true,
      stressMode: 'simple',
      simpleGsrThreshold: 2200,
    });
    expect(res.state).toBe('high');
  });

  it('applies temporal persistence smoothing', () => {
    const now = Date.now();
    const classifications = [
      { state: 'high', timestamp: now - 5000 },
      { state: 'high', timestamp: now },
    ];
    // 5 seconds is less than 10s persistence requirement
    const state = getPersistentState(classifications, 'calm', 10);
    expect(state).toBe('calm');

    // 12 seconds persisted
    const sustained = [
      { state: 'high', timestamp: now - 12000 },
      { state: 'high', timestamp: now - 5000 },
      { state: 'high', timestamp: now },
    ];
    const sustainedState = getPersistentState(sustained, 'calm', 10);
    expect(sustainedState).toBe('high');
  });
});
