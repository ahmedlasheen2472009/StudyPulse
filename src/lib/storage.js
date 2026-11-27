/**
 * Storage and CSV Export Utilities (Pure Functions & LocalStorage)
 */

import { STORAGE_KEYS } from '../config.js';

export function getStoredData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('[Storage] Error reading key:', key, e);
    return fallback;
  }
}

export function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[Storage] Error saving key:', key, e);
  }
}

export function appendHistoryRecord(record) {
  const current = getStoredData(STORAGE_KEYS.HISTORY, []);
  current.unshift({
    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: Date.now(),
    ...record,
  });
  // Cap at 200 records to conserve local storage
  const trimmed = current.slice(0, 200);
  setStoredData(STORAGE_KEYS.HISTORY, trimmed);
  return trimmed;
}

export function clearAllLocalData() {
  localStorage.removeItem(STORAGE_KEYS.BASELINE);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  // Keep settings, theme, and language
}

/**
 * Converts array of session objects to CSV string.
 */
export function exportSessionsToCsv(sessions) {
  if (!sessions || sessions.length === 0) return '';
  const headers = ['Timestamp', 'ISO_Date', 'Type', 'Summary', 'Duration_Sec', 'HRV_Start', 'HRV_End', 'HRV_Change'];
  
  const rows = sessions.map(s => {
    const iso = new Date(s.timestamp).toISOString();
    return [
      s.timestamp,
      `"${iso}"`,
      `"${s.type || ''}"`,
      `"${(s.summary || '').replace(/"/g, '""')}"`,
      s.durationSeconds || '',
      s.hrvStart || '',
      s.hrvEnd || '',
      s.hrvChange || '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts array of raw BLE packet objects to CSV string.
 */
export function exportPacketsToCsv(packets) {
  if (!packets || packets.length === 0) return '';
  const headers = ['Timestamp', 'ISO_Date', 'BPM', 'HRV_RMSSD', 'GSR_raw', 'Motion', 'Quality', 'Raw_Payload'];

  const rows = packets.map(p => {
    const iso = new Date(p.timestamp).toISOString();
    return [
      p.timestamp,
      `"${iso}"`,
      p.bpm,
      p.hrv,
      p.gsr,
      p.motion,
      p.quality,
      `"${(p.raw || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a web/mobile file download for a CSV string.
 */
export function downloadCsvFile(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
