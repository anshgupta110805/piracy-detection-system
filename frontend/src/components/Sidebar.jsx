import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Cpu, List, Share2, Settings, BarChart2, Bell, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Threat Center', path: '/threats', icon: ShieldAlert },
    { name: 'AI Engine Monitor', path: '/ai-engine', icon: Cpu },
    { name: 'Audit Logs', path: '/logs', icon: List },
    { name: 'Network Graph', path: '/graph', icon: Share2 },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart2 },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'User Profile', path: '/profile', icon: User },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--border)',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <ShieldAlert size={28} color="var(--brand-primary)" />
        <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>VertexGuard</h2>
      </div>

      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
              background: isActive ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent'
            })}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
            padding: '0.8rem 1rem', background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={20} />
          Logout API
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
