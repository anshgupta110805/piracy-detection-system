import React, { useState, useEffect } from 'react';
import { Bell, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Alerts = ({ token }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/history', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const violations = data.filter(d => d.is_violation || d.escalated).slice(0, 50).map(v => ({
          id: v.id,
          time: new Date(v.timestamp).toLocaleString(),
          message: v.is_violation ? `CRITICAL VIOLATION: Unauthorized access by IP ${v.ip_address} intending ${v.intent}.` : `WARNING: Borderline confidence (${Math.round(v.confidence*100)}%) triggered manual escalation.`,
          severity: v.is_violation ? 'CRITICAL' : 'WARNING',
          read: false
        }));
        setAlerts(violations);
      });
  }, [token]);

  const markRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    toast.success("All notifications marked as read.");
  };

  const clearAll = () => {
    setAlerts([]);
    toast.error("Alert history wiped.");
  };

  const dismiss = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} color="var(--brand-primary)" /> System Notifications
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={markRead}>Mark All Read</button>
          <button className="btn-danger" onClick={clearAll}><Trash2 size={16} /> Clear All</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {alerts.map(a => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
              className="card"
              style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: a.read ? 0.6 : 1, borderLeft: `4px solid ${a.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'}` }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{a.time} - {a.severity}</div>
                <div style={{ fontWeight: 600, color: a.read ? 'var(--text-muted)' : '#fff' }}>{a.message}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => toast(`Audit Block ID: #${a.id}`)}>View Event Log</button>
                <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', opacity: 0.5 }} onClick={() => dismiss(a.id)}>Dismiss</button>
              </div>
            </motion.div>
          ))}
          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Notification Center Empty</h3>
              <p>No recent alerts across the cluster.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Alerts;
