import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Users, Server, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CountUp from 'react-countup';

import { useDemoData } from '../hooks/useDemoData';

const COLORS = {
  Marketing: '#00f5ff',
  Billing: '#f1c40f',
  Medical: '#00ff88',
  Piracy: '#ff3366',
  UNCERTAIN: '#8b5cf6'
};

const Dashboard = ({ token }) => {
  const { auditLogs: logs, stats, threatLevel, isLive } = useDemoData(token);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    processChartData(logs);
  }, [logs]);

  const processChartData = (dataList) => {
    // Generate Line Chart Data (Last 10 reqs generalized to minutes for demo)
    const grouped = {};
    const intentCounts = { Marketing: 0, Billing: 0, Medical: 0, Piracy: 0, UNCERTAIN: 0 };
    
    dataList.forEach(log => {
      const intent = log.predicted_purpose || 'UNCERTAIN';
      if (intentCounts[intent] !== undefined) intentCounts[intent]++;
      
      const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (!grouped[time]) grouped[time] = 0;
      grouped[time]++;
    });

    // Make array for LineChart
    const lineArr = Object.keys(grouped).slice(0, 15).reverse().map(k => ({ time: k, count: grouped[k] }));
    setChartData(lineArr);

    // Make array for PieChart
    const pieArr = Object.keys(intentCounts).filter(k => intentCounts[k] > 0).map(k => ({
      name: k, value: intentCounts[k]
    }));
    setPieData(pieArr);
  };

  const threatColor = threatLevel === 'CRITICAL' ? 'var(--danger)' : threatLevel === 'HIGH' ? '#ff8c00' : threatLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Threat Meter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'white' }}>Live Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time traffic and privacy policy enforcement</p>
        </div>
        
        <motion.div 
          className="glass-panel" 
          style={{ width: '300px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${threatColor}` }}
          animate={threatLevel === 'CRITICAL' ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0', '0 0 20px rgba(255,51,102,0.5)', '0 0 0'] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
            <AlertTriangle size={28} color={threatColor} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Threat Level</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: threatColor }}>{threatLevel}</div>
          </div>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 245, 255, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--brand-primary)' }}><Activity size={24} /></div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Scans Today</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}><CountUp end={stats.total} duration={1} /></div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 51, 102, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--danger)' }}><ShieldAlert size={24} /></div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Violations Blocked</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}><CountUp end={stats.violations} duration={1} /></div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(241, 196, 15, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}><Users size={24} /></div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Threat Agents</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{logs.filter(f => f.predicted_purpose === 'Piracy').length}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}><Server size={24} /></div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>System Uptime</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>99.9%</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', height: '350px' }}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Traffic Velocity (Req/min)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ background: 'var(--nav-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="var(--brand-primary)" strokeWidth={3} dot={{ fill: 'var(--bg-main)', strokeWidth: 2, r: 6, stroke: 'var(--brand-primary)' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Intent Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[d.name]}}></div>
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="card" style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '1rem' }}>Live Audit Trail</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Identity</th>
                <th>Intent & Features</th>
                <th>Confidence</th>
                <th>Anomaly</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 15).map(log => (
                <motion.tr key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                           style={{ background: log.is_violation ? 'rgba(255,51,102,0.05)' : log.escalated ? 'rgba(241,196,15,0.05)' : 'transparent' }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.user}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.ip_address}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <span className={`badge badge-${log.predicted_purpose || 'UNCERTAIN'}`}>{log.predicted_purpose}</span>
                    </div>
                    <div className="tags-container">
                      {log.top_features?.map((f, i) => <span key={i} className="feature-tag">{f}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-container" style={{ width: '60px' }}>
                         <div className="progress-bar" style={{ width: `${(log.confidence || 0) * 100}%`, background: log.confidence < 0.70 ? 'var(--warning)' : 'var(--success)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem' }}>{Math.round((log.confidence || 0)*100)}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-container" style={{ width: '60px', background: 'rgba(255,51,102,0.1)' }}>
                       <div className="progress-bar" style={{ width: `${Math.abs(log.anomaly_score * 100)}%`, background: 'var(--danger)' }}></div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
