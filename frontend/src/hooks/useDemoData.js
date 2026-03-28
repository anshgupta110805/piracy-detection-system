import { useState, useEffect } from 'react';

export const useDemoData = (token) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, violations: 0, activeThreats: 0, detectionRate: 0 });
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Attempt to load from JSON first for immediate data
    fetch('/sample_data.json')
      .then(res => res.json())
      .then(data => {
        // Take last 50 entries
        const initial = data.slice(-50).reverse();
        setAuditLogs(initial);
        calculateStats(initial);
      })
      .catch(e => console.log("No local sample data found."));

    // Connect to actual WebSocket for live demo
    if (token) {
      setIsLive(true);
      const ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = (e) => {
        const newLog = JSON.parse(e.data);
        setAuditLogs(prev => {
          const updated = [newLog, ...prev].slice(0, 50);
          calculateStats(updated);
          return updated;
        });
      };
      
      return () => ws.close();
    }
  }, [token]);

  const calculateStats = (logs) => {
    const violations = logs.filter(l => l.is_violation || l.escalated).length;
    const threats = logs.filter(l => l.intent === 'Piracy').length;
    
    setStats({
      total: logs.length,
      violations: violations,
      activeThreats: threats,
      detectionRate: logs.length ? ((violations / logs.length) * 100).toFixed(1) : 0
    });

    if (violations > 10) setThreatLevel('CRITICAL');
    else if (violations > 5) setThreatLevel('HIGH');
    else if (violations > 2) setThreatLevel('MEDIUM');
    else setThreatLevel('LOW');
  };

  return { auditLogs, stats, threatLevel, isLive };
};
