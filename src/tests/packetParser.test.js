import { describe, it, expect } from 'vitest';
import { parseBlePacket, formatBlePacket } from '../lib/packetParser.js';

describe('BLE Packet Parser', () => {
  it('parses valid contract string correctly', () => {
    const raw = '72,45.2,1830,0.12,3';
    const result = parseBlePacket(raw);

    expect(result.valid).toBe(true);
    expect(result.data.bpm).toBe(72);
    expect(result.data.hrv).toBe(45.2);
    expect(result.data.gsr).toBe(1830);
    expect(result.data.motion).toBe(0.12);
    expect(result.data.quality).toBe(3);
    expect(result.data.raw).toBe('72,45.2,1830,0.12,3');
  });

  it('handles Uint8Array byte payloads', () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('80.5,50.1,1950,0.00,4\r\n');
    const result = parseBlePacket(bytes);

    expect(result.valid).toBe(true);
    expect(result.data.bpm).toBe(80.5);
    expect(result.data.hrv).toBe(50.1);
    expect(result.data.gsr).toBe(1950);
    expect(result.data.motion).toBe(0);
    expect(result.data.quality).toBe(4);
  });

  it('rejects malformed packets with wrong comma counts', () => {
    const result = parseBlePacket('72,45.2,1830');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Expected 5 comma-separated values');
  });

  it('rejects packets with non-numeric fields', () => {
    const result = parseBlePacket('72,INVALID,1830,0.1,3');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Non-numeric');
  });

  it('clamps quality strictly between 0 and 4', () => {
    const result = parseBlePacket('70,40,1500,0.0,9');
    expect(result.valid).toBe(true);
    expect(result.data.quality).toBe(4);
  });

  it('formats packet correctly for simulation', () => {
    const str = formatBlePacket(75.5, 42.1, 1900, 0.05, 3);
    expect(str).toBe('75.5,42.1,1900.0,0.05,3');
  });
});
