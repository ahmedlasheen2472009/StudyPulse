/**
 * Baseline Calculation Utilities (Pure Functions)
 * 
 * Computes median baseline values over calibration periods.
 * Median is preferred over mean to protect against optical sensor glitches and movement outliers.
 */

/**
 * Calculates median of an array of numbers.
 * @param {number[]} values 
 * @returns {number|null}
 */
export function calculateMedian(values) {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Computes baseline from an array of valid packet objects.
 * Gating: ignores packets where motion > motionThreshold or quality < minQuality.
 * 
 * @param {Array<{ bpm: number, hrv: number, gsr: number, motion: number, quality: number }>} packets 
 * @param {{ motionThreshold?: number, minQualityBars?: number }} options 
 * @returns {{ hrv: number, gsr: number, bpm: number, sampleCount: number, timestamp: number } | null}
 */
export function computeBaselineFromPackets(packets, options = {}) {
  const motionThreshold = options.motionThreshold ?? 0.5;
  const minQualityBars = options.minQualityBars ?? 2;

  if (!packets || packets.length === 0) return null;

  const validPackets = packets.filter(p => {
    return (
      p.motion <= motionThreshold &&
      p.quality >= minQualityBars &&
      p.bpm >= 40 &&
      p.bpm <= 180 &&
      p.hrv > 5
    );
  });

  if (validPackets.length < 5) {
    // Insufficient clean data points to form a reliable baseline
    return null;
  }

  const hrvValues = validPackets.map(p => p.hrv);
  const gsrValues = validPackets.map(p => p.gsr);
  const bpmValues = validPackets.map(p => p.bpm);

  const medianHrv = calculateMedian(hrvValues);
  const medianGsr = calculateMedian(gsrValues);
  const medianBpm = calculateMedian(bpmValues);

  return {
    hrv: Math.round(medianHrv * 10) / 10,
    gsr: Math.round(medianGsr * 10) / 10,
    bpm: Math.round(medianBpm * 10) / 10,
    sampleCount: validPackets.length,
    timestamp: Date.now(),
  };
}
