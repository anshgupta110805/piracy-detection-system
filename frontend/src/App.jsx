import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ThreatCenter from './pages/ThreatCenter';
import AIEngineMonitor from './pages/AIEngineMonitor';
import AuditLogs from './pages/AuditLogs';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import NetworkGraph from './pages/NetworkGraph';
import UserProfile from './pages/UserProfile';

import { motion } from 'framer-motion';
import { API_BASE_URL } from './config';


function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
      } else {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        alert(`Login failed: ${err.detail || "Invalid credentials"}`);
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Could not connect to server. Ensure main.py is running on port 8000.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('access_token');
  };

  if (!token) {
    return (
      <div className="layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--brand-primary)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="loaderSpinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span> 
              VertexGuard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>AI Data Privacy & Security Monitoring</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <input 
                type="text" 
                placeholder="Username (admin)" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password (admin)" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '1rem' }} disabled={isLoggingIn}>
              {isLoggingIn ? "Authenticating..." : "Access Secure Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="layout">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <Navbar />
          <motion.div 
            className="page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard token={token} />} />
              <Route path="/threats" element={<ThreatCenter token={token} />} />
              <Route path="/ai-engine" element={<AIEngineMonitor token={token} />} />
              <Route path="/logs" element={<AuditLogs token={token} />} />
              <Route path="/graph" element={<NetworkGraph token={token} />} />
              <Route path="/analytics" element={<Analytics token={token} />} />
              <Route path="/alerts" element={<Alerts token={token} />} />
              <Route path="/settings" element={<Settings token={token} />} />
              <Route path="/profile" element={<UserProfile token={token} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </div>
        <Toaster position="top-right" toastOptions={{ 
          style: { background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }
        }} />
      </div>
    </Router>
  );
}

export default App;
