import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
    <span style={{ fontWeight: 500 }}>{label}</span>
    <div 
      onClick={onChange}
      style={{
        width: '45px', height: '24px', borderRadius: '12px',
        background: checked ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: '0.3s'
      }}
    >
      <div style={{ width: '20px', height: '20px', background: checked ? '#000' : '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: checked ? '23px' : '2px', transition: '0.3s' }} />
    </div>
  </div>
);

const Settings = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [anomaly, setAnomaly] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [threshold, setThreshold] = useState(70);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <h2>System Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure strictness and webhook integrations.</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Core Defense Modules</h3>
        <Toggle label="Enable DistilBERT Intent AI Engine" checked={aiEnabled} onChange={() => setAiEnabled(!aiEnabled)} />
        <Toggle label="Enable IsolationForest Anomaly Engine" checked={anomaly} onChange={() => setAnomaly(!anomaly)} />
        <Toggle label="Enable Live WebSocket Alerts" checked={alerts} onChange={() => setAlerts(!alerts)} />
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Confidence Escalate Threshold</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>If the AI model confidence is below this value, the request is escalated for manual review automatically.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <input type="range" min="50" max="95" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ flex: 1, accentColor: 'var(--brand-primary)' }} />
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontWeight: 'bold' }}>{threshold}%</div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Alert Webhook</h3>
        <input type="text" placeholder="https://external-siem.com/webhook/receive" defaultValue="http://localhost:8000/internal-alert" />
        <button className="btn-secondary" style={{ width: 'fit-content' }} onClick={() => toast.success("Test ping sent to webhook!")}>Test Webhook</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-primary" onClick={() => toast.success("Global Settings Saved!")}><Save size={18} /> Save Configurations</button>
        <button className="btn-danger" onClick={() => window.confirm("Reset to factory defaults?") && toast("Reset applied.")}><RefreshCw size={18} /> Default Reset</button>
      </div>
    </div>
  );
};
export default Settings;
