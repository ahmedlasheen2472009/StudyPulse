/**
 * BLE Packet Parser (Pure Functions)
 * 
 * Contract:
 * UTF-8 text sent ~1x/second: "bpm,hrv,gsr,motion,quality"
 * e.g. "72,45.2,1830,0.12,3"
 * 
 * bpm: beats per minute (Number)
 * hrv: RMSSD in ms (Number)
 * gsr: raw/mV value (Number)
 * motion: movement level, 0 = still (Number)
 * quality: signal quality 0 to 4 (Integer)
 */

/**
 * Parses a raw BLE string or Uint8Array/DataView into a structured packet.
 * @param {string|Uint8Array|ArrayBuffer} rawInput 
 * @returns {{ valid: boolean, data?: { bpm: number, hrv: number, gsr: number, motion: number, quality: number, timestamp: number, raw: string }, error?: string }}
 */
export function parseBlePacket(rawInput) {
  let text = '';
  if (typeof rawInput === 'string') {
    text = rawInput.trim();
  } else if (rawInput instanceof Uint8Array || rawInput instanceof ArrayBuffer) {
    try {
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(rawInput).trim();
    } catch (err) {
      return { valid: false, error: 'Failed to decode UTF-8 byte stream' };
    }
  } else {
    return { valid: false, error: 'Input must be string, Uint8Array or ArrayBuffer' };
  }

  if (!text) {
    return { valid: false, error: 'Empty packet string' };
  }

  // Remove any stray trailing nulls or newlines
  const clean = text.replace(/[\r\n\0]/g, '').trim();
  const parts = clean.split(',');

  if (parts.length !== 5) {
    return {
      valid: false,
      error: `Expected 5 comma-separated values, got ${parts.length} (payload: "${clean}")`,
      raw: clean
    };
  }

  const bpm = parseFloat(parts[0]);
  const hrv = parseFloat(parts[1]);
  const gsr = parseFloat(parts[2]);
  const motion = parseFloat(parts[3]);
  const quality = parseInt(parts[4], 10);

  // Validate number formats
  if (Number.isNaN(bpm) || Number.isNaN(hrv) || Number.isNaN(gsr) || Number.isNaN(motion) || Number.isNaN(quality)) {
    return {
      valid: false,
      error: `Non-numeric values found in packet: "${clean}"`,
      raw: clean
    };
  }

  // Quality must be integer 0 to 4
  const clampedQuality = Math.max(0, Math.min(4, Math.round(quality)));

  return {
    valid: true,
    data: {
      bpm: Math.round(bpm * 10) / 10,
      hrv: Math.round(hrv * 10) / 10,
      gsr: Math.round(gsr * 10) / 10,
      motion: Math.round(motion * 100) / 100,
      quality: clampedQuality,
      timestamp: Date.now(),
      raw: clean
    }
  };
}

/**
 * Creates a synthetic packet string matching the BLE contract.
 * @param {number} bpm 
 * @param {number} hrv 
 * @param {number} gsr 
 * @param {number} motion 
 * @param {number} quality 
 * @returns {string} e.g. "72,45.2,1830,0.12,3"
 */
export function formatBlePacket(bpm, hrv, gsr, motion, quality) {
  return `${bpm.toFixed(1)},${hrv.toFixed(1)},${gsr.toFixed(1)},${motion.toFixed(2)},${quality}`;
}
