import { describe, it, expect } from 'vitest';
import { evaluateAlert } from '../lib/alertRules.js';

describe('Alert Rules Engine', () => {
  const baseSettings = {
    alertCooldownMinutes: 5,
    persistenceSeconds: 10,
    alertTypes: {
      highStress: true,
      persistentStress: true,
      mildStress: true,
      connectionLost: true,
      weakSignal: true,
      abnormalReading: true,
    },
  };

  it('triggers connection lost alert immediately', () => {
    const res = evaluateAlert({
      currentState: 'disconnected',
      previousState: 'calm',
      settings: baseSettings,
    });
    expect(res.shouldAlert).toBe(true);
    expect(res.alertType).toBe('connectionLost');
  });

  it('suppresses stress alerts when muted by user', () => {
    const now = Date.now();
    const res = evaluateAlert({
      currentState: 'high',
      previousState: 'high',
      statePersistDuration: 15,
      now,
      mutedUntil: now + 60000,
      settings: baseSettings,
    });
    expect(res.shouldAlert).toBe(false);
    expect(res.reason).toBe('Muted by user');
  });

  it('suppresses stress alerts when cooldown is active', () => {
    const now = Date.now();
    const res = evaluateAlert({
      currentState: 'high',
      previousState: 'high',
      statePersistDuration: 20,
      now,
      lastAlertTime: now - (2 * 60 * 1000), // only 2 min ago (cooldown is 5 min)
      settings: baseSettings,
    });
    expect(res.shouldAlert).toBe(false);
    expect(res.reason).toBe('Alert cooldown active');
  });

  it('triggers high stress alert when persisted beyond threshold and cooldown passed', () => {
    const now = Date.now();
    const res = evaluateAlert({
      currentState: 'high',
      previousState: 'high',
      statePersistDuration: 15, // >= 10s
      now,
      lastAlertTime: now - (6 * 60 * 1000), // 6 min ago
      settings: baseSettings,
    });
    expect(res.shouldAlert).toBe(true);
    expect(res.alertType).toBe('highStress');
  });

  it('never fires stress alerts during motion gating', () => {
    const now = Date.now();
    const res = evaluateAlert({
      currentState: 'motion',
      previousState: 'high',
      statePersistDuration: 20,
      now,
      lastAlertTime: 0,
      settings: baseSettings,
    });
    expect(res.shouldAlert).toBe(false);
  });
});
