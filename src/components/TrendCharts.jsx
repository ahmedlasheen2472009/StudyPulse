import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TRANSLATIONS } from '../i18n.js';

export function TrendCharts({ history = [], lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Format data for chart: last 5 minutes (max 300 data points)
  const chartData = history.slice(-60).map((p) => {
    const d = new Date(p.timestamp);
    const timeStr = `${d.getMinutes()}:${d.getSeconds().toString().padStart(2, '0')}`;
    return {
      time: timeStr,
      bpm: p.bpm,
      hrv: p.hrv,
      gsr: p.gsr,
    };
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
        {t.dashboard.liveCharts}
      </h3>

      {/* BPM & HRV Chart */}
      <div style={{ height: 160, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ color: '#ef4444' }}>● BPM (Heart Rate)</span>
          <span style={{ color: '#0284c7' }}>● HRV (RMSSD ms)</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis yAxisId="left" domain={[40, 140]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis yAxisId="right" orientation="right" domain={[10, 90]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Line yAxisId="left" type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="hrv" stroke="#0284c7" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GSR Chart */}
      <div style={{ height: 140, width: '100%', marginTop: 8 }}>
        <div style={{ marginBottom: 4, fontSize: '0.75rem', color: '#f59e0b' }}>
          ● Skin Conductance (GSR raw/mV)
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Line type="monotone" dataKey="gsr" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
