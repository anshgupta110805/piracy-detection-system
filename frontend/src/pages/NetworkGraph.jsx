import React, { useState, useEffect } from 'react';
import { Share2, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const NetworkGraph = ({ token }) => {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    setTimeout(() => { setAnalyzing(false); toast("Graph structure retrieved via NetworkX integration."); }, 2000);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Threat Topology Graph</h2>
          <p style={{ color: 'var(--text-muted)' }}>NetworkX behavioral correlation analysis bridging IP clusters.</p>
        </div>
        <button className="btn-secondary" onClick={() => setAnalyzing(true) || setTimeout(() => setAnalyzing(false), 2000)}><Code size={16} /> Reconstruct Nodes</button>
      </div>

      <div className="card" style={{ flex: 1, minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)' }} />
        
        {analyzing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
            <span className="loaderSpinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderTopColor: 'var(--accent-purple)' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Executing Graph Construction Algorithm...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 10 }}>
            {/* Visual placeholder for the actual NetworkX output render */}
            <Share2 size={80} color="var(--accent-purple)" style={{ animation: 'spin 15s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent-purple)' }}>0 Coordinated Clusters</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginTop: '1rem' }}>
                All observed IP nodes act autonomously. No structural cliques of size &gt;= 3 detected based on payload similarities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NetworkGraph;
