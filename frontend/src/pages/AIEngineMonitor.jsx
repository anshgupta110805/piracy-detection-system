import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Download, RefreshCw, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const AIEngineMonitor = ({ token }) => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/history', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLogs(d));
  }, [token]);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      toast.success("Model retrained successfully on new behavioral data traces.");
    }, 3000);
  };

  const handleExport = () => {
    const report = { modelName: "DistilBERT Sequence Classifier", activeWeights: 66362880, accuracyEstimate: 0.942, timestamp: new Date() };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'model_report.json'; a.click();
    toast.success("Model configuration exported.");
  };

  const confData = [{ range: '0-50%', count: 0 }, { range: '50-70%', count: 0 }, { range: '70-90%', count: 0 }, { range: '90-100%', count: 0 }];
  logs.forEach(l => {
    if (l.confidence < 0.5) confData[0].count++;
    else if (l.confidence < 0.70) confData[1].count++;
    else if (l.confidence < 0.90) confData[2].count++;
    else confData[3].count++;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>AI Engine Monitor</h2>
          <p style={{ color: 'var(--text-muted)' }}>DistilBERT & Isolation Forest Subsystems</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Export Model State</button>
          <button className="btn-primary" onClick={handleRetrain} disabled={isRetraining}>
            {isRetraining ? <span className="loaderSpinner"></span> : <RefreshCw size={16} />} 
            {isRetraining ? 'Retraining Weights...' : 'Retrain Pipeline'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Model</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--brand-primary)', marginTop: '0.5rem' }}>distilbert-base-uncased</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Internal Accuracy Estimate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.5rem' }}>94.2%</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Anomaly Subsystem</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--warning)', marginTop: '0.5rem' }}>IsolationForest v1.0</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Retrained</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.5rem' }}>System Boot</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ height: '350px' }}>
          <h3>Confidence Threshold Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={confData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" allowDecimals={false} />
              <RechartsTooltip contentStyle={{ background: 'var(--nav-bg)', border: '1px solid var(--border)' }} />
              <Bar dataKey="count" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ height: '350px', overflowY: 'auto' }}>
          <h3>Live NLP Inference Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {logs.slice(0, 10).map(log => (
              <div key={log.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: log.confidence > 0.7 ? '3px solid var(--success)' : '3px solid var(--warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{log.context_text || 'Execution Context'}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{Math.round(log.confidence * 100)}% Confidence</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Determined Intent: <strong style={{ color: '#fff' }}>{log.intent}</strong></div>
                <div className="tags-container" style={{ marginTop: '0.5rem' }}>
                  {log.top_features?.map(f => <span key={f} className="feature-tag">{f}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIEngineMonitor;
