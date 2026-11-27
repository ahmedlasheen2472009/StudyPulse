/**
 * Alert Rules & Anti-Annoyance Engine (Pure Functions)
 * 
 * Rules:
 * 1. Alerts only fire after the state persists for required seconds.
 * 2. Cooldown period between notifications (e.g. 5 minutes).
 * 3. Mute capability (e.g. 30 minutes).
 * 4. Never fire stress alerts while the state is motion, weak-signal, disconnected or abnormal.
 * 5. Respect per-alert settings toggles.
 */

/**
 * Evaluates whether an alert should trigger.
 * 
 * @param {Object} context
 * @param {string} context.currentState - Active persistent state
 * @param {string} context.previousState - Previous state
 * @param {number} context.statePersistDuration - How long current state has persisted in seconds
 * @param {number} context.now - Current timestamp in ms
 * @param {number} context.lastAlertTime - Timestamp of last triggered alert
 * @param {number} context.mutedUntil - Timestamp until which alerts are muted
 * @param {Object} context.settings - User settings
 * @param {number} context.weakSignalDuration - How long weak signal has persisted (sec)
 * @returns {{ shouldAlert: boolean, alertType?: string, title?: string, body?: string, level?: 'info'|'warning'|'critical' }}
 */
export function evaluateAlert(context) {
  const {
    currentState,
    previousState,
    statePersistDuration,
    now = Date.now(),
    lastAlertTime = 0,
    mutedUntil = 0,
    settings = {},
    weakSignalDuration = 0,
  } = context;

  // 1. Check if user activated temporary mute
  if (now < mutedUntil) {
    return { shouldAlert: false, reason: 'Muted by user' };
  }

  // 2. Check alert types config
  const alertTypes = settings.alertTypes || {};
  const cooldownMs = (settings.alertCooldownMinutes ?? 5) * 60 * 1000;
  const isCooldownOver = (now - lastAlertTime) >= cooldownMs;

  // 3. Hardware / Connection Alerts (Ignore stress cooldown if critical hardware change)
  if (currentState === 'disconnected' && previousState !== 'disconnected') {
    if (alertTypes.connectionLost) {
      return {
        shouldAlert: true,
        alertType: 'connectionLost',
        title: 'Band Disconnected',
        body: 'Bluetooth connection to BioAdapt wristband was lost.',
        level: 'warning',
      };
    }
  }

  if (currentState === 'weak-signal' && weakSignalDuration >= 30) {
    if (alertTypes.weakSignal && isCooldownOver) {
      return {
        shouldAlert: true,
        alertType: 'weakSignal',
        title: 'Sensor Check Needed',
        body: 'Weak optical signal detected for over 30 seconds. Check strap fit and ambient light.',
        level: 'warning',
      };
    }
  }

  if (currentState === 'abnormal' && previousState !== 'abnormal') {
    if (alertTypes.abnormalReading && isCooldownOver) {
      return {
        shouldAlert: true,
        alertType: 'abnormalReading',
        title: 'Unusual Reading',
        body: 'Pulse reading out of normal range. Re-seat the sensor strap.',
        level: 'warning',
      };
    }
  }

  // 4. Anti-annoyance: No stress alerts while in motion, weak signal, abnormal or disconnected
  const nonStressStates = ['motion', 'weak-signal', 'abnormal', 'disconnected', 'calm', 'noBaseline'];
  if (nonStressStates.includes(currentState)) {
    return { shouldAlert: false, reason: 'State is non-stress or invalid' };
  }

  // 5. Check Cooldown for stress alerts
  if (!isCooldownOver) {
    return { shouldAlert: false, reason: 'Alert cooldown active' };
  }

  // 6. Check Persistence requirement
  const minPersistence = settings.persistenceSeconds ?? 10;
  if (statePersistDuration < minPersistence) {
    return { shouldAlert: false, reason: 'State not yet persisted long enough' };
  }

  // 7. Evaluate Persistent Stress
  if (currentState === 'persistent' && alertTypes.persistentStress) {
    return {
      shouldAlert: true,
      alertType: 'persistentStress',
      title: 'Persistent High Stress',
      body: 'Your stress indicators remain elevated. Time to take a longer break and step away.',
      level: 'critical',
    };
  }

  // 8. Evaluate High Stress
  if (currentState === 'high' && alertTypes.highStress) {
    return {
      shouldAlert: true,
      alertType: 'highStress',
      title: 'High Stress Detected',
      body: 'Significant deviation from your baseline. Consider a 2-minute guided breathing session.',
      level: 'critical',
    };
  }

  // 9. Evaluate Mild Stress (quieter)
  if (currentState === 'medium' && alertTypes.mildStress) {
    return {
      shouldAlert: true,
      alertType: 'mildStress',
      title: 'Mild Stress',
      body: 'Elevated stress indicators detected. Take a slow breath, stretch, and drink water.',
      level: 'info',
    };
  }

  return { shouldAlert: false };
}
