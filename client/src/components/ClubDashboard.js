import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Plus, ArrowRight } from 'lucide-react';
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

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(() => {
    if (!user?.name) { setLoading(false); return; }
    getApplicationsByClubName(user.name)
      .then(apps => setApplications(apps))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { if (user) loadApplications(); else setLoading(false); }, [user, loadApplications]);

  const handleUpdateStatus = async (id, status) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApplication?.id === id) setSelectedApplication(prev => ({ ...prev, status }));
    await updateApplication(id, { status });
  };

  const stats = [
    { label: 'Total',       value: applications.length },
    { label: 'Under Review',value: applications.filter(a => a.status === 'Submitted').length },
    { label: 'Interview',   value: applications.filter(a => a.status === 'Interview').length },
    { label: 'Accepted',    value: applications.filter(a => a.status === 'Accepted').length },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
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

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 50, fontWeight: 700, color: '#2a1f14', marginBottom: 4 }}>
            {getGreeting()}
          </div>
          <div style={{ fontSize: 13, color: '#a09180' }}>Manage your club and incoming applications.</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 8 }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: '#2a1f14', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Applications */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: '#2a1f14' }}>Applications</div>
            <button
              onClick={() => navigate('/club/analytics')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {applications.length === 0 ? (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <FileText size={36} style={{ color: '#e8e0d4', margin: '0 auto 12px' }} />
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#c4b49a', marginBottom: 6 }}>No applications yet</div>
                <div style={{ fontSize: 12, color: '#c4b49a' }}>Students who apply to your club will appear here.</div>
                <button
                  onClick={() => navigate('/club/register')}
                  style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 18px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                >
                  <Plus size={13} /> Set up your club profile
                </button>
              </div>
            ) : (
              applications.slice(0, 8).map((app, i, arr) => {
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
                      <FileText size={15} style={{ color: '#a09180' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.studentName || 'Anonymous'}</div>
                      {app.position && <div style={{ fontSize: 11, color: '#a09180', marginTop: 1 }}>{app.position}</div>}
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: meta.bg, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.label}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedApplication(app); setShowViewer(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, flexShrink: 0 }}
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: '#2a1f14', marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'Edit Club Profile', desc: 'Update your club info, deadlines, and questions', action: () => navigate('/club/register') },
              { label: 'Analytics', desc: 'View detailed application statistics and export data', action: () => navigate('/club/analytics') },
            ].map(({ label, desc, action }) => (
              <div
                key={label}
                onClick={action}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
                style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', border: '1px solid #ede8df', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
              >

                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: '#2a1f14', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#a09180', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
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
            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#2a1f14' }}>Application</div>
              <button onClick={() => setShowViewer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#a09180', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Applicant info */}
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

              {/* Answers */}
              {selectedApplication.answers && Object.keys(selectedApplication.answers).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 10 }}>RESPONSES</div>
                  {Object.entries(selectedApplication.answers).map(([qId, answer]) => (
                    <div key={qId} style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8df', padding: '12px 16px', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>Question {qId}</div>
                      <div style={{ fontSize: 13, color: '#2a1f14', lineHeight: 1.6 }}>{answer || '—'}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Status actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { status: 'Accepted', label: 'Accept',    bg: warm,      active: selectedApplication.status === 'Accepted' },
                  { status: 'Interview',label: 'Interview', bg: '#2e7d32', active: selectedApplication.status === 'Interview' },
                  { status: 'Rejected', label: 'Reject',   bg: '#991b1b', active: selectedApplication.status === 'Rejected' },
                ].map(({ status, label, bg, active }) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedApplication.id, status)}
                    style={{
                      padding: '10px', borderRadius: 10, border: active ? 'none' : `1px solid ${bg}`,
                      background: active ? bg : 'transparent', color: active ? '#fff' : bg,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all .15s',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDashboard;
