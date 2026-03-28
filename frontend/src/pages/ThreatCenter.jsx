import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Ban, Search, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const ThreatCenter = ({ token }) => {
  const [threats, setThreats] = useState([]);
  const [blockedIps, setBlockedIps] = useState(['192.168.1.100', '10.0.0.55']);
  const [chartData, setChartData] = useState([]);
  const [investigating, setInvestigating] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/history', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const violations = data.filter(d => d.is_violation || d.escalated);
        setThreats(violations);
        
        // Group by hour for BarChart
        const hours = {};
        violations.forEach(v => {
          const hour = new Date(v.timestamp).getHours() + ":00";
          if (!hours[hour]) hours[hour] = 0;
          hours[hour]++;
        });
        setChartData(Object.keys(hours).map(k => ({ time: k, count: hours[k] })));
      });
  }, [token]);

  const blockIp = (ip) => {
    if (!blockedIps.includes(ip)) {
      setBlockedIps(prev => [...prev, ip]);
      toast.success(`IP ${ip} has been added to the blocklist.`);
    }
  };

  const unblockIp = (ip) => {
    setBlockedIps(prev => prev.filter(i => i !== ip));
    toast.success(`IP ${ip} has been unblocked.`);
  };

  const markSafe = (id) => {
    setThreats(prev => prev.filter(t => t.id !== id));
    toast.success('Marked as completely safe (False Positive logic triggered).');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Threat Center</h2>
        <p style={{ color: 'var(--text-muted)' }}>Isolate and eliminate active network intruders.</p>
      </div>

      <AnimatePresence>
        {threats.length > 5 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="threat-banner"
          >
            <ShieldAlert size={36} color="var(--danger)" />
            <div>
              <h3 style={{ margin: 0, color: 'var(--danger)' }}>CRITICAL THREAT CLUSTER DETECTED</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>High concentration of severe policy violations originating from multiple vectors.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Threats Table */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--warning)" /> Active Threat Vectors
            </h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>IP Address</th>
                    <th>Intent</th>
                    <th>Anomaly</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                      <td style={{ fontWeight: 600 }}>{t.ip_address}</td>
                      <td><span className={`badge badge-${t.intent || 'UNCERTAIN'}`}>{t.intent || 'UNCERTAIN'}</span></td>
                      <td>
                        <div className="progress-container" style={{ width: '60px' }}>
                          <div className="progress-bar" style={{ width: `${Math.abs(t.anomaly_score) * 100}%`, background: 'var(--danger)' }}></div>
                        </div>
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-success" style={{ padding: '0.4rem 0.6rem' }} onClick={() => markSafe(t.id)} title="Mark Safe"><CheckCircle size={16} /></button>
                        <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }} onClick={() => setInvestigating(t)} title="Investigate"><Search size={16} /></button>
                        <button className="btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => blockIp(t.ip_address)} title="Block IP Address"><Ban size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {threats.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No active threats. System is secure.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{ height: '300px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Threat Timeline (Hourly)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--nav-bg)', border: '1px solid var(--border)' }} />
                <Bar dataKey="count" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Blocked Network Gateways</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <AnimatePresence>
                {blockedIps.map(ip => (
                  <motion.li 
                    key={ip} 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255, 51, 102, 0.05)', borderRadius: '8px', border: '1px solid var(--danger)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Ban size={14} color="var(--danger)" /> {ip}</div>
                    <button onClick={() => unblockIp(ip)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Unblock</button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>

      {investigating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Threat Analysis Report</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
              <p><strong>Database ID:</strong> {investigating.id}</p>
              <p><strong>Actor:</strong> {investigating.user}</p>
              <p><strong>IP:</strong> {investigating.ip_address}</p>
              <p><strong>Target Action:</strong> {investigating.action}</p>
              <p><strong>Predicted Vector:</strong> {investigating.intent}</p>
              <p><strong>AI Confidence:</strong> {(investigating.confidence * 100).toFixed(1)}%</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setInvestigating(null)}>Close</button>
              <button className="btn-danger" onClick={() => { blockIp(investigating.ip_address); setInvestigating(null); }}>Block IP Now</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ThreatCenter;
