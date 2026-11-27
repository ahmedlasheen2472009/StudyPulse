import { describe, it, expect } from 'vitest';
import { calculateMedian, computeBaselineFromPackets } from '../lib/baseline.js';

describe('Baseline Utilities', () => {
  it('calculates median for odd and even sets correctly', () => {
    expect(calculateMedian([10, 20, 30])).toBe(20);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([50, 10, 30])).toBe(30);
    expect(calculateMedian([])).toBe(null);
  });

  it('filters out motion-corrupted or low-quality packets', () => {
    const packets = [
      { bpm: 70, hrv: 50, gsr: 1500, motion: 0.1, quality: 3 },
      { bpm: 72, hrv: 52, gsr: 1520, motion: 0.8, quality: 3 }, // Motion > 0.5 (discarded)
      { bpm: 71, hrv: 49, gsr: 1510, motion: 0.05, quality: 1 }, // Quality < 2 (discarded)
      { bpm: 70, hrv: 51, gsr: 1530, motion: 0.02, quality: 4 },
      { bpm: 69, hrv: 53, gsr: 1490, motion: 0.00, quality: 3 },
      { bpm: 73, hrv: 48, gsr: 1540, motion: 0.10, quality: 3 },
      { bpm: 70, hrv: 50, gsr: 1500, motion: 0.04, quality: 4 },
    ];

    const baseline = computeBaselineFromPackets(packets);
    expect(baseline).not.toBeNull();
    expect(baseline.sampleCount).toBe(5);
    expect(baseline.bpm).toBe(70);
    expect(baseline.hrv).toBe(50);
  });

  it('returns null if fewer than 5 valid packets exist', () => {
    const packets = [
      { bpm: 70, hrv: 50, gsr: 1500, motion: 0.1, quality: 3 },
      { bpm: 71, hrv: 50, gsr: 1500, motion: 0.1, quality: 3 },
    ];
    expect(computeBaselineFromPackets(packets)).toBeNull();
  });
});
