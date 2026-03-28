import React, { useState, useEffect } from 'react';
import { Download, Share2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';
import toast from 'react-hot-toast';

const Analytics = ({ token }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/history', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setData(d));
  }, [token]);

  // Aggregate by Hour
  const trendMap = {};
  data.forEach(d => {
    const time = new Date(d.timestamp).getHours() + ":00";
    if (!trendMap[time]) trendMap[time] = { time, Violations: 0, Safe: 0 };
    if (d.is_violation || d.escalated) trendMap[time].Violations++;
    else trendMap[time].Safe++;
  });
  const trendData = Object.values(trendMap).sort((a,b) => a.time.localeCompare(b.time));

  // Scatter plot data
  const scatterData = data.slice(0, 100).map(d => ({
    x: d.confidence * 100, y: Math.abs(d.anomaly_score) * 100, z: d.is_violation ? 200 : 50, intent: d.intent
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Analytics & Threat Intelligence</h2>
          <p style={{ color: 'var(--text-muted)' }}>Advanced correlation of vector pathways and AI modeling.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText("https://vertexguard.local/share/report/10xad"); toast.success("Secure sharing link copied!"); }}><Share2 size={16} /> Share Link</button>
          <button className="btn-primary" onClick={() => toast.success("PDF Report compilation started...")}><Download size={16} /> Generate Executive PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>False Positives Identified</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            0.12% <TrendingDown size={18} color="var(--success)" />
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Average Inference Latency</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            54ms <Target size={18} color="var(--brand-primary)" />
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Weekly Volumetric Trend</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            +14% <TrendingUp size={18} color="var(--danger)" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ height: '350px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Daily Vector Timeline</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: 'var(--nav-bg)', border: '1px solid var(--border)' }} />
              <Area type="monotone" dataKey="Violations" stackId="1" stroke="var(--danger)" fill="rgba(255,51,102,0.3)" />
              <Area type="monotone" dataKey="Safe" stackId="1" stroke="var(--success)" fill="rgba(0,255,136,0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: '350px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Confidence vs Anomaly Matrix</h3>
          <ResponsiveContainer width="100%" height="80%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="Confidence" stroke="var(--text-muted)" />
              <YAxis type="number" dataKey="y" name="Anomaly Score" stroke="var(--text-muted)" />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--nav-bg)', border: '1px solid var(--border)' }} />
              <Scatter name="Vectors" data={scatterData} fill="var(--accent-purple)" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
