import React, { useState, useEffect } from 'react';
import { Bell, Search, Activity } from 'lucide-react';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '70px',
      background: 'rgba(10, 15, 30, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search IPs, Logs, Policies..." 
            style={{ background: 'transparent', border: 'none', padding: 0, width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
          <Activity size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>SYSTEM PROTECTED</span>
        </div>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
          {time.toLocaleTimeString()}
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={22} color="var(--text-main)" />
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white',
            fontSize: '0.6rem', fontWeight: 'bold', width: '16px', height: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
          }}>
            3
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
