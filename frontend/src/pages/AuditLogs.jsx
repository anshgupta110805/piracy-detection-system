import React, { useState, useEffect } from 'react';
import { Download, Search, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterIntent, setFilterIntent] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch('http://localhost:8000/history', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLogs(d));
  }, [token]);

  const filtered = logs.filter(l => {
    const s = search.toLowerCase();
    const matchSearch = (l.ip_address || '').toLowerCase().includes(s) || (l.user || '').toLowerCase().includes(s);
    const matchIntent = filterIntent === 'All' || l.intent === filterIntent;
    return matchSearch && matchIntent;
  });

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Time,User,Action,IP,Intent,Confidence,Anomaly,Violation,Escalated\n"
      + filtered.map(e => `${e.id},${e.timestamp},${e.user},${e.action},${e.ip_address},${e.intent},${e.confidence},${e.anomaly_score},${e.is_violation},${e.escalated}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri; a.download = `vertexguard_audit_${new Date().getTime()}.csv`;
    a.click();
    toast.success("Audit log exported as CSV.");
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you incredibly sure you want to permanently delete all localized audit logs?")) {
      setLogs([]);
      toast.error("Audit logs physically cleared from local view.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Audit Logs</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleExportCSV}><Download size={16} /> Export CSV</button>
          <button className="btn-danger" onClick={handleClearLogs}><Trash2 size={16} /> Clear Logs</button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search IPs, Identifiers..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <select value={filterIntent} onChange={e => { setFilterIntent(e.target.value); setPage(1); }} style={{ width: '200px' }}>
          <option value="All">All Intents</option>
          <option value="Marketing">Marketing</option>
          <option value="Medical">Medical</option>
          <option value="Billing">Billing</option>
          <option value="Piracy">Piracy</option>
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Identity</th>
                <th>Intent</th>
                <th>Score</th>
                <th>Policy Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{l.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>
                    <div>{l.user}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.ip_address}</div>
                  </td>
                  <td><span className={`badge badge-${l.intent || 'UNCERTAIN'}`}>{l.intent}</span></td>
                  <td>{(l.confidence * 100).toFixed(0)}%</td>
                  <td>
                    {l.is_violation ? <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>BLOCKED</span> : 
                     l.escalated ? <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>ESCALATED</span> : 
                     <span style={{ color: 'var(--success)' }}>ALLOWED</span>}
                  </td>
                  <td><button className="btn-secondary" onClick={() => toast("Details slide-out would open here")}><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Showing {paginated.length} of {filtered.length} entries</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page-1)}>Prev</button>
            <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>Page {page} of {totalPages || 1}</span>
            <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page+1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
