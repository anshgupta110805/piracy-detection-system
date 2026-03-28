import React from 'react';
import { User, Shield, Key, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Personal Profile</h2>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        <div style={{ width: '100px', height: '100px', background: 'rgba(0, 245, 255, 0.1)', border: '2px solid var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={48} color="var(--brand-primary)" />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>System Administrator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0' }}><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> admin@vertexguard.ai</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 255, 136, 0.15)', color: 'var(--success)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
             <Shield size={14} /> Level 5 Clearance (ROOT)
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3>Security Credentials</h3>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role Context</label>
          <input type="text" value="SuperAdmin / Overseer" disabled style={{ opacity: 0.6 }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
        </div>

        <button className="btn-primary" style={{ width: 'fit-content' }} onClick={() => toast.success("Security profile updated across cluster nodes.")}>
          <Key size={18} /> Update Credentials
        </button>
      </div>
    </div>
  );
};
export default UserProfile;
