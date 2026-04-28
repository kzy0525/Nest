import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Plus, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getApplicationsByClubName, updateApplication, getClubByName } from '../lib/db';

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
  const [hasProfile, setHasProfile] = useState(false);

  const loadApplications = useCallback(() => {
    if (!user?.name) { setLoading(false); return; }
    getApplicationsByClubName(user.name)
      .then(apps => setApplications(apps))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadApplications();
    if (user.name) getClubByName(user.name).then(club => setHasProfile(!!club)).catch(console.error);
  }, [user, loadApplications]);

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

  const getChartData = () => {
    const days = 14;
    const counts = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[key] = 0;
    }
    applications.forEach(app => {
      const d = new Date(app.createdAt || app.submittedAt);
      if (isNaN(d)) return;
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  };

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Chart */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px 20px 12px' }}>
              <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 16 }}>SUBMITTED OVER 14 DAYS</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={getChartData()} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="warmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={warm} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={warm} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#c4b89e', fontFamily: "'Space Grotesk', sans-serif" }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#c4b89e', fontFamily: "'Space Grotesk', sans-serif" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #ede8df', borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#2a1f14', fontWeight: 600, marginBottom: 2 }}
                    itemStyle={{ color: warm }}
                    cursor={{ stroke: '#ede8df' }}
                  />
                  <Area type="monotone" dataKey="count" name="Applications" stroke={warm} strokeWidth={2} fill="url(#warmGrad)" dot={false} activeDot={{ r: 4, fill: warm, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* List */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {applications.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
                  <FileText size={30} style={{ color: '#e8e0d4', marginBottom: 10 }} />
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: '#c4b49a', marginBottom: 4 }}>No applications yet</div>
                  <div style={{ fontSize: 11, color: '#c4b49a', marginBottom: 14 }}>Students who apply will appear here.</div>
                  {!hasProfile && (
                    <button
                      onClick={() => navigate('/club/register')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 16px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                    >
                      <Plus size={12} /> Set up club profile
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {applications.slice(0, 6).map((app, i, arr) => {
                    const meta = STATUS[app.status] || STATUS['Incomplete'];
                    return (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedApplication(app); setShowViewer(true); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf7f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px', cursor: 'pointer',
                          borderBottom: i < arr.length - 1 ? '1px solid #f0ebe3' : 'none',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f0e8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={13} style={{ color: '#a09180' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#2a1f14', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.studentName || 'Anonymous'}</div>
                          {app.position && <div style={{ fontSize: 10, color: '#a09180', marginTop: 1 }}>{app.position}</div>}
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: meta.bg, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.label}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedApplication(app); setShowViewer(true); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, flexShrink: 0 }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: '#2a1f14', marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'Edit Club Profile', desc: 'Update your club info, deadlines, and questions', action: () => navigate('/club/profile') },
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
