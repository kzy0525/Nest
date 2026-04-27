import { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Download, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApplicationsByClubName, updateApplication } from '../lib/db';

const warm   = '#b5451b';
const STATUS = {
  'Incomplete': { label: 'Draft',        bg: '#fef3cd', color: '#8a6200' },
  'Submitted':  { label: 'Under Review', bg: '#e8f0fe', color: '#1a56db' },
  'Interview':  { label: 'Interview',    bg: '#e8f5e9', color: '#2e7d32' },
  'Accepted':   { label: 'Accepted',     bg: '#f0ebe3', color: warm },
  'Rejected':   { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

const ClubAnalytics = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const loadApplications = useCallback(() => {
    if (!user?.name) { setLoading(false); return; }
    getApplicationsByClubName(user.name)
      .then(apps => { setApplications(apps); setFilteredApplications(apps); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filterApplications = useCallback(() => {
    let f = [...applications];
    if (searchTerm) f = f.filter(a =>
      a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== 'all') f = f.filter(a => a.status === statusFilter);
    f.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.submittedAt || a.createdAt || 0) - new Date(b.submittedAt || b.createdAt || 0);
      if (sortBy === 'name') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });
    setFilteredApplications(f);
  }, [applications, searchTerm, statusFilter, sortBy]);

  useEffect(() => { if (user) loadApplications(); else setLoading(false); }, [user, loadApplications]);
  useEffect(() => { filterApplications(); }, [filterApplications]);

  const handleUpdateStatus = async (id, status) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApplication?.id === id) setSelectedApplication(prev => ({ ...prev, status }));
    await updateApplication(id, { status });
  };

  const exportCSV = () => {
    const rows = [
      ['Student Name', 'Email', 'Position', 'Status', 'Applied Date', 'Phone', 'Program'],
      ...filteredApplications.map(a => [
        a.studentName || 'N/A', a.email || 'N/A', a.position || 'N/A', a.status || 'N/A',
        new Date(a.submittedAt || a.createdAt || 0).toLocaleDateString(),
        a.phone || 'N/A', a.program || 'N/A',
      ]),
    ].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {
    total:      applications.length,
    submitted:  applications.filter(a => a.status === 'Submitted').length,
    interview:  applications.filter(a => a.status === 'Interview').length,
    accepted:   applications.filter(a => a.status === 'Accepted').length,
    rejected:   applications.filter(a => a.status === 'Rejected').length,
    incomplete: applications.filter(a => a.status === 'Incomplete').length,
  };

  const inputStyle = {
    padding: '9px 12px', borderRadius: 10, border: '1px solid #e8e0d4',
    background: '#fff', color: '#2a1f14', fontSize: 12, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif", color: '#a09180', fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 700, color: '#2a1f14', marginBottom: 4 }}>Analytics</div>
            <div style={{ fontSize: 13, color: '#a09180' }}>Review and manage student applications.</div>
          </div>
          <button
            onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: '#fff', border: '1px solid #e8e0d4', color: '#2a1f14', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total',     value: counts.total },
            { label: 'Submitted', value: counts.submitted },
            { label: 'Interview', value: counts.interview },
            { label: 'Accepted',  value: counts.accepted },
            { label: 'Rejected',  value: counts.rejected },
            { label: 'Draft',     value: counts.incomplete },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede8df', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 6 }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#2a1f14', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede8df', padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#faf7f2', border: '1px solid #e8e0d4', borderRadius: 10, padding: '0 12px' }}>
            <Search size={13} style={{ color: '#c4b89e', flexShrink: 0 }} />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, position, email…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#2a1f14', fontSize: 12, fontFamily: "'DM Sans', sans-serif", padding: '9px 0' }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="all">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Interview">Interview</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Incomplete">Draft</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A–Z</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Applications list */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ebe3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14' }}>Applications</div>
            <span style={{ fontSize: 11, color: '#c4b49a', fontFamily: "'Space Grotesk', sans-serif" }}>{filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredApplications.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <FileText size={36} style={{ color: '#e8e0d4', margin: '0 auto 12px' }} />
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#c4b49a', marginBottom: 6 }}>No applications found</div>
              <div style={{ fontSize: 12, color: '#c4b49a' }}>
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Applications will appear here when students apply.'}
              </div>
            </div>
          ) : (
            filteredApplications.map((app, i, arr) => {
              const meta = STATUS[app.status] || STATUS['Incomplete'];
              return (
                <div
                  key={app.id}
                  onClick={() => { setSelectedApplication(app); setShowViewer(true); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf7f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', cursor: 'pointer',
                    borderBottom: i < arr.length - 1 ? '1px solid #f0ebe3' : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f5f0e8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={14} style={{ color: '#a09180' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.studentName || 'Anonymous'}</div>
                    <div style={{ fontSize: 11, color: '#a09180', marginTop: 1 }}>
                      {app.position || 'General Position'}
                      {app.submittedAt && <span style={{ color: '#c4b49a' }}> · {new Date(app.submittedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: meta.bg, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.label}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedApplication(app); setShowViewer(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, flexShrink: 0 }}
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Application viewer modal */}
      {showViewer && selectedApplication && (
        <div
          onClick={() => setShowViewer(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,31,20,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#faf7f2', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
          >
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#2a1f14' }}>Application</div>
              <button onClick={() => setShowViewer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#a09180', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8df', padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 10 }}>APPLICANT</div>
                {[
                  ['Name', selectedApplication.studentName],
                  ['Email', selectedApplication.email],
                  ['Program', selectedApplication.program],
                  ['Year', selectedApplication.year],
                  ['Phone', selectedApplication.phone],
                ].map(([k, v]) => v ? (
                  <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", width: 60, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#2a1f14' }}>{v}</span>
                  </div>
                ) : null)}
              </div>

              {selectedApplication.answers && Object.keys(selectedApplication.answers).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 10 }}>RESPONSES</div>
                  {Object.entries(selectedApplication.answers).map(([qId, answer]) => (
                    <div key={qId} style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8df', padding: '12px 16px', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>Question {qId}</div>
                      {answer && (answer.startsWith('https://') || answer.startsWith('http://')) ? (
                        <a href={answer} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: warm, textDecoration: 'none', fontWeight: 500 }}>
                          {decodeURIComponent(answer.split('/').pop()).replace(/^\d+-/, '')} ↗
                        </a>
                      ) : (
                        <div style={{ fontSize: 13, color: '#2a1f14', lineHeight: 1.6 }}>{answer || '—'}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { status: 'Accepted', label: 'Accept',    color: warm },
                  { status: 'Interview',label: 'Interview', color: '#2e7d32' },
                  { status: 'Rejected', label: 'Reject',   color: '#991b1b' },
                ].map(({ status, label, color }) => {
                  const active = selectedApplication.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedApplication.id, status)}
                      style={{
                        padding: '10px', borderRadius: 10,
                        border: active ? 'none' : `1px solid ${color}`,
                        background: active ? color : 'transparent',
                        color: active ? '#fff' : color,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", transition: 'all .15s',
                      }}
                    >{label}</button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubAnalytics;
