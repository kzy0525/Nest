import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, ChevronDown, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApplications, deleteApplication, getClubById } from '../lib/db';

const warm = '#b5451b';

const CLUB_COLORS = ['#8B1A1A','#7B1D1D','#1a3a6e','#1a2a1a','#1565C0','#4a3728','#1a2a3a','#8B0000','#2c3e50','#4a2c6a'];
const getClubColor = (name) => {
  if (!name) return CLUB_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CLUB_COLORS[Math.abs(hash) % CLUB_COLORS.length];
};

const STATUS_META = {
  'Incomplete': { label: 'Incomplete',   bg: '#fef3cd', color: '#8a6200' },
  'Submitted':  { label: 'Under Review', bg: '#e8f0fe', color: '#1a56db' },
  'Interview':  { label: 'Interview',    bg: '#e8f5e9', color: '#2e7d32' },
  'Accepted':   { label: 'Accepted',     bg: '#f0ebe3', color: warm },
  'Rejected':   { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


const HiringDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [clubData, setClubData] = useState({});
  const [deleteAction, setDeleteAction] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = () => getApplications(user.id).then(setApplications).catch(console.error);
    load();
    window.addEventListener('clubApplicationAdded', load);
    return () => window.removeEventListener('clubApplicationAdded', load);
  }, [user]);

  const handleViewApplication = (application) => {
    setViewingApplication(application);
    getClubById(application.clubId)
      .then(data => setClubData(prev => ({ ...prev, [application.clubId]: data })))
      .catch(console.error);
    setShowApplicationViewer(true);
  };

  const handleEditApplication = (application) => {
    navigate(`/club/${application.clubId}/apply?edit=true`);
  };

  const handleDeleteClick = (application, action) => {
    setApplicationToDelete(application);
    setDeleteAction(action);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (applicationToDelete) {
      setApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      await deleteApplication(applicationToDelete.id);
    }
    setShowDeleteModal(false);
    setApplicationToDelete(null);
    setDeleteAction('');
  };

  const today = new Date();
  const calendarEvents = applications
    .filter(app => app.status !== 'Incomplete')
    .reduce((events, app) => {
      const clubName = app.clubName;
      const clubLogo = app.clubLogo;

      if (app.applicationDeadline) {
        const d = new Date(app.applicationDeadline);
        if (d >= today)
          events.push({ id: `deadline-${app.id}`, day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), event: 'Application Due', clubName, clubLogo });
      }
      if (app.interviewStartDate) {
        const d = new Date(app.interviewStartDate);
        if (d >= today)
          events.push({ id: `interview-${app.id}`, day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), event: '1st Round Interview', clubName, clubLogo });
      }
      if (app.resultsReleased) {
        const d = new Date(app.resultsReleased);
        if (d >= today)
          events.push({ id: `results-${app.id}`, day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), event: 'Results Released', clubName, clubLogo });
      }
      return events;
    }, [])
    .sort((a, b) => new Date(a.year, a.month, a.day) - new Date(b.year, b.month, b.day));

  const getEventTypeColor = (name) => {
    if (name?.includes('Interview')) return '#1a3a6e';
    if (name?.includes('Due') || name?.includes('Deadline')) return warm;
    if (name?.includes('Result')) return '#7B1D1D';
    return '#1565C0';
  };

  const getEventTypeLabel = (name) => {
    if (name?.includes('Interview')) return 'INTERVIEW';
    if (name?.includes('Due')) return 'DEADLINE';
    if (name?.includes('Result')) return 'DECISION';
    return 'EVENT';
  };

  const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || { label: status, bg: '#f5f0e8', color: '#a09180' };
    return (
      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: meta.bg, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, whiteSpace: 'nowrap' }}>
        {meta.label}
      </span>
    );
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid #e0d8cc', background: '#fff',
    fontSize: 13, color: '#2a1f14', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif", outline: 'none'
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — application list */}
        <div style={{ flex: '0 0 58%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '28px 28px 0' }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 50, fontWeight: 700, color: '#2a1f14', marginBottom: 4 }}>My Applications</div>
          <div style={{ fontSize: 12, color: '#a09180', marginBottom: 20 }}>
            {applications.length} active application{applications.length !== 1 ? 's' : ''}
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 28 }}>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: 13, color: '#a09180' }}>No applications yet.</div>
                <button onClick={() => navigate('/search')} style={{ marginTop: 12, fontSize: 12, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Browse clubs →
                </button>
              </div>
            ) : (
              applications.map(app => {
                const color = getClubColor(app.clubName);
                const initials = (app.clubName || '?').split(' ').map(w => w[0]).join('').substring(0, 2);
                return (
                  <div key={app.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {app.clubLogo
                        ? <img src={app.clubLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{initials}</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={() => navigate(`/club/${app.clubId}`)} style={{ fontWeight: 500, fontSize: 13, color: '#2a1f14', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'block', marginBottom: 3, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.clubName}
                      </button>
                      {app.appliedRole && (
                        <span style={{ fontSize: 10, color: '#a0917e', background: '#f5f0e8', padding: '1px 6px', borderRadius: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {app.appliedRole}
                        </span>
                      )}
                    </div>

                    <StatusBadge status={app.status}/>

                    <div style={{ fontSize: 11, color: '#c4b49a', fontFamily: "'Space Grotesk', sans-serif", width: 56, textAlign: 'right', flexShrink: 0 }}>
                      {app.status !== 'Incomplete' ? app.dateSubmitted : '—'}
                    </div>

                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {app.status === 'Incomplete' ? (
                        <>
                          <button onClick={() => handleEditApplication(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b49a', padding: 4 }} title="Edit"><Edit size={14}/></button>
                          <button onClick={() => handleDeleteClick(app, 'delete')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e0cfc0', padding: 4 }} title="Delete"><Trash2 size={14}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleViewApplication(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b49a', padding: 4 }} title="View"><Eye size={14}/></button>
                          <button onClick={() => handleDeleteClick(app, 'withdraw')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e0cfc0', padding: 4 }} title="Withdraw"><Trash2 size={14}/></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#ede8df', flexShrink: 0, margin: '28px 0' }}/>

        {/* Right — upcoming dates */}
        <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 50, fontWeight: 700, color: '#2a1f14', marginBottom: 4 }}>Upcoming Dates</div>
          <div style={{ fontSize: 12, color: '#a09180', marginBottom: 20 }}>
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 28 }}>
            {calendarEvents.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 40, color: '#a09180', fontSize: 13 }}>
                No upcoming events in the next 7 days
              </div>
            ) : (
              calendarEvents.map(ev => {
                const typeColor = getEventTypeColor(ev.event);
                const typeLabel = getEventTypeLabel(ev.event);
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', borderRadius: 12, border: '1px solid #e8e0d4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 44, flexShrink: 0, textAlign: 'center', borderRight: '1px solid #ede8df', paddingRight: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#2a1f14', fontFamily: "'Instrument Serif', serif" }}>{ev.day}</div>
                      <div style={{ fontSize: 10, color: '#b8a898', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}>{MONTHS[ev.month].toUpperCase()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14', marginBottom: 2 }}>{ev.event}</div>
                      <div style={{ fontSize: 11, color: '#b8a898' }}>{ev.clubName}</div>
                    </div>
                    <div style={{ fontSize: 9, color: typeColor, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{typeLabel}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor, flexShrink: 0 }}/>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Application viewer modal */}
      {showApplicationViewer && viewingApplication && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#faf7f2', width: '60%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e8e0d4', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#2a1f14' }}>{viewingApplication.clubName}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#a09180' }}>Status:</span>
                  <StatusBadge status={viewingApplication.status}/>
                </div>
              </div>
              <button onClick={() => setShowApplicationViewer(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f0ebe3', color: '#a09180', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Personal info */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e0d4', overflow: 'hidden' }}>
                <div style={{ background: '#f7f3ee', padding: '12px 16px', borderBottom: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChevronDown size={15} style={{ color: warm }}/>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14' }}>Personal Information</span>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['Full Name', viewingApplication.fullName], ['Email', viewingApplication.email], ['Phone', viewingApplication.phone], ['Year', viewingApplication.year], ['Program', viewingApplication.program], ['Position', viewingApplication.appliedRole]].map(([label, val]) => val ? (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 3 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: '#2a1f14' }}>{val}</div>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Documents */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e0d4', overflow: 'hidden' }}>
                <div style={{ background: '#f7f3ee', padding: '12px 16px', borderBottom: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChevronDown size={15} style={{ color: warm }}/>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14' }}>Documents & Resources</span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f7f3ee', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={14} style={{ color: '#a09180' }}/>
                      <span style={{ fontSize: 13, color: '#2a1f14' }}>Resume</span>
                      {(viewingApplication.resumeFileName || viewingApplication.resume) && (
                        <span style={{ fontSize: 10, color: '#2e7d32', background: '#e8f5e9', padding: '2px 8px', borderRadius: 20, fontFamily: "'Space Grotesk', sans-serif" }}>✓ Uploaded</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#a09180' }}>
                      {viewingApplication.resumeFileName || (viewingApplication.resume ? viewingApplication.resume.name : 'No resume')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              {viewingApplication.answers && Object.keys(viewingApplication.answers).length > 0 && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e0d4', overflow: 'hidden' }}>
                  <div style={{ background: '#f7f3ee', padding: '12px 16px', borderBottom: '1px solid #e8e0d4', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronDown size={15} style={{ color: warm }}/>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14' }}>Application Questions</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {Object.entries(viewingApplication.answers).map(([questionId, answer]) => {
                      let questionText = `Question ${questionId}`;
                      try {
                        const clubInfo = clubData[viewingApplication.clubId];
                        if (clubInfo?.application_questions) {
                          const questions = JSON.parse(clubInfo.application_questions);
                          const q = questions.find(q => q.id === parseInt(questionId));
                          if (q?.text) questionText = q.text;
                        }
                      } catch {}
                      return (
                        <div key={questionId} style={{ borderLeft: `3px solid ${warm}`, paddingLeft: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14', marginBottom: 6 }}>{questionText}</div>
                          <div style={{ fontSize: 13, color: '#4a3728', lineHeight: 1.6 }}>{answer || 'No answer provided'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete / withdraw modal */}
      {showDeleteModal && applicationToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#faf7f2', borderRadius: 16, padding: 24, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14', marginBottom: 10 }}>
              {deleteAction === 'withdraw' ? 'Withdraw Application' : 'Delete Application'}
            </div>
            <div style={{ fontSize: 13, color: '#a09180', lineHeight: 1.6, marginBottom: 20 }}>
              {deleteAction === 'withdraw'
                ? `Withdraw your application to ${applicationToDelete.clubName}?`
                : `Delete your application to ${applicationToDelete.clubName}? This cannot be undone.`
              }
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #e8e0d4', background: '#fff', color: '#a09180', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: deleteAction === 'withdraw' ? warm : '#991b1b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {deleteAction === 'withdraw' ? 'Withdraw' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringDashboard;
