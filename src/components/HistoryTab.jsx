import React, { useState, useEffect } from 'react';
import { Download, Trash2, Calendar, Clock, Activity, FileSpreadsheet } from 'lucide-react';
import { TRANSLATIONS } from '../i18n.js';
import { 
  getStoredData, 
  clearAllLocalData, 
  exportSessionsToCsv, 
  exportPacketsToCsv, 
  downloadCsvFile 
} from '../lib/storage.js';
import { STORAGE_KEYS } from '../config.js';

export function HistoryTab({ rawPackets = [], lang = 'en', onDataCleared }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = getStoredData(STORAGE_KEYS.HISTORY, []);
    setHistory(list);
  };

  const handleClear = () => {
    if (window.confirm(t.history.clearConfirm)) {
      clearAllLocalData();
      loadHistory();
      if (onDataCleared) onDataCleared();
    }
  };

  const handleExportSessions = () => {
    const csv = exportSessionsToCsv(history);
    if (!csv) {
      alert('No sessions to export.');
      return;
    }
    const filename = `bioadapt_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsvFile(filename, csv);
  };

  const handleExportPackets = () => {
    const csv = exportPacketsToCsv(rawPackets);
    if (!csv) {
      alert('No raw packets in current session to export.');
      return;
    }
    const filename = `bioadapt_packets_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsvFile(filename, csv);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title & Description */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>
          {t.history.title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t.history.description}
        </p>

        {/* Export Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportSessions}>
            <Download size={14} />
            {t.history.exportCsvSessions}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPackets}>
            <FileSpreadsheet size={14} />
            {t.history.exportCsvPackets}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleClear} style={{ marginInlineStart: 'auto' }}>
            <Trash2 size={14} />
            {t.history.clearAllData}
          </button>
        </div>
      </div>

      {/* History Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 16px' }}>
            {t.history.noHistory}
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 6,
                  backgroundColor: item.type === 'baseline' ? 'var(--accent-light)' : 'var(--state-calm-bg)',
                  color: item.type === 'baseline' ? 'var(--accent-primary)' : 'var(--state-calm)'
                }}>
                  {item.type === 'baseline' ? t.history.baselineRecord : t.history.breathingRecord}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {item.summary}
              </div>
              {item.hrvChange !== undefined && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  HRV delta: <strong>{item.hrvChange >= 0 ? '+' : ''}{item.hrvChange} ms</strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
