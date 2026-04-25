import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubById, getApplications, saveApplication, uploadClubAsset } from '../lib/db';

const warm = '#b5451b';

const card = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  padding: '24px 28px', marginBottom: 16,
};

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: '1px solid #e0d8cc', background: '#faf7f2',
  color: '#2a1f14', fontSize: 13, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: '0.06em', display: 'block', marginBottom: 6,
};

const sectionTitle = {
  fontFamily: "'Instrument Serif', serif", fontSize: 18,
  color: '#2a1f14', marginBottom: 18,
};

const ClubApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationForm, setApplicationForm] = useState({
    email: '', phone: '', year: '', program: '',
    position: '', secondRole: '', answers: {},
  });
  const [fileAnswers, setFileAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // { title, message, type }

  useEffect(() => {
    const load = async () => {
      try {
        const clubData = await getClubById(id);
        setClub(clubData);

        if (user) {
          const apps = await getApplications(user.id);
          const draft = apps.find(a => String(a.clubId) === String(id) && a.status === 'Incomplete');
          if (draft) {
            setApplicationForm({
              email: draft.email || '', phone: draft.phone || '',
              year: draft.year || '', program: draft.program || '',
              position: draft.position || '', secondRole: draft.secondRole || '',
              answers: draft.answers || {},
            });
            return;
          }
        }

        const questions = Array.isArray(clubData.application_questions) ? clubData.application_questions : [];
        if (questions.length > 0) {
          const init = {};
          questions.forEach(q => { init[q.id] = ''; });
          setApplicationForm(prev => ({ ...prev, answers: init }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleAnswerChange = (qId, value) => {
    setApplicationForm(prev => ({ ...prev, answers: { ...prev.answers, [qId]: value } }));
  };

  const handleFileAnswerChange = (qId, file) => {
    setFileAnswers(prev => ({ ...prev, [qId]: file }));
  };

  const uploadFileAnswers = async () => {
    const merged = { ...applicationForm.answers };
    for (const [qId, file] of Object.entries(fileAnswers)) {
      if (file) {
        const url = await uploadClubAsset('application-files', `${Date.now()}-${file.name}`, file);
        merged[qId] = url;
      }
    }
    return merged;
  };

  const saveDraft = async () => {
    if (!user) { setModal({ title: 'Not logged in', message: 'Please log in to save your application.', type: 'error' }); return; }
    setSaving(true);
    try {
      const answers = await uploadFileAnswers();
      await saveApplication(user.id, {
        clubId: club.id, clubName: club.name, clubLogo: club.logo || null,
        position: applicationForm.position, secondRole: applicationForm.secondRole,
        year: applicationForm.year, program: applicationForm.program,
        email: applicationForm.email, phone: applicationForm.phone,
        answers, status: 'Incomplete',
        applicationDeadline: club.application_deadline,
        interviewStartDate: club.interview_start_date,
        resultsReleased: club.results_released,
      });
      window.dispatchEvent(new CustomEvent('applicationSaved'));
      setModal({ title: 'Draft Saved', message: 'Draft saved! Complete and submit it later from the Hiring Dashboard.', type: 'success' });
      setTimeout(() => navigate('/hiring'), 2000);
    } catch {
      setModal({ title: 'Save Error', message: 'Error saving draft. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!applicationForm.email || !applicationForm.phone || !applicationForm.year || !applicationForm.program) {
      setModal({ title: 'Missing Information', message: 'Please fill in all required fields (email, phone, year, and program).', type: 'error' });
      return;
    }

    let positions = [];
    try { positions = Array.isArray(club.open_positions) ? club.open_positions : JSON.parse(club.open_positions || '[]'); } catch {}
    if (positions.length > 0 && !applicationForm.position) {
      setModal({ title: 'Position Required', message: 'Please select a position before submitting.', type: 'error' });
      return;
    }

    const questions = Array.isArray(club.application_questions) ? club.application_questions : [];
    const unanswered = questions.filter(q =>
      q.type === 'file'
        ? !fileAnswers[q.id] && !applicationForm.answers[q.id]
        : !applicationForm.answers[q.id]?.trim()
    );
    if (unanswered.length > 0) {
      setModal({ title: 'Incomplete Application', message: 'Please answer all application questions before submitting.', type: 'error' });
      return;
    }

    if (!user) { setModal({ title: 'Not logged in', message: 'Please log in to submit.', type: 'error' }); return; }
    setSubmitting(true);
    try {
      const answers = await uploadFileAnswers();
      await saveApplication(user.id, {
        clubId: club.id, clubName: club.name, clubLogo: club.logo || null,
        position: applicationForm.position, secondRole: applicationForm.secondRole,
        year: applicationForm.year, program: applicationForm.program,
        email: applicationForm.email, phone: applicationForm.phone,
        answers, status: 'Submitted',
        applicationDeadline: club.application_deadline,
        interviewStartDate: club.interview_start_date,
        resultsReleased: club.results_released,
        dateSubmitted: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      });
      window.dispatchEvent(new CustomEvent('applicationSubmitted'));
      setModal({ title: 'Application Submitted', message: 'Application submitted! Track it in the Hiring Dashboard.', type: 'success' });
      setTimeout(() => navigate('/hiring'), 2000);
    } catch {
      setModal({ title: 'Submission Error', message: 'Error submitting application. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
      <div style={{ fontSize: 14, color: '#a09180', fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
    </div>
  );

  if (!club) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
      <div style={{ fontSize: 14, color: warm, fontFamily: "'DM Sans', sans-serif" }}>Club not found</div>
    </div>
  );

  const questions = Array.isArray(club.application_questions) ? club.application_questions : [];
  let positions = [];
  try { positions = Array.isArray(club.open_positions) ? club.open_positions : JSON.parse(club.open_positions || '[]'); } catch {}

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Back */}
          <button onClick={() => navigate(`/club/${id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
            <ArrowLeft size={15} /> Back to Club
          </button>

          {/* Header */}
          <div style={card}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: '#2a1f14', marginBottom: 4 }}>
              {isEditMode ? 'Edit Application' : 'Application Form'}
            </div>
            <div style={{ fontSize: 13, color: '#a09180' }}>
              {isEditMode ? 'Editing your application for' : 'Applying to'} <span style={{ color: '#4a3728', fontWeight: 500 }}>{club.name}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div style={card}>
            <div style={sectionTitle}>Contact Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>EMAIL ADDRESS *</label>
                <input type="email" value={applicationForm.email}
                  onChange={e => setApplicationForm(p => ({ ...p, email: e.target.value }))}
                  style={inputStyle} placeholder="you@queensu.ca" />
              </div>
              <div>
                <label style={labelStyle}>PHONE NUMBER *</label>
                <input type="tel" value={applicationForm.phone}
                  onChange={e => setApplicationForm(p => ({ ...p, phone: e.target.value }))}
                  style={inputStyle} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label style={labelStyle}>YEAR *</label>
                <select value={applicationForm.year}
                  onChange={e => setApplicationForm(p => ({ ...p, year: e.target.value }))}
                  style={inputStyle}>
                  <option value="">Select year</option>
                  {['1st Year','2nd Year','3rd Year','4th Year','5th Year','Graduate'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PROGRAM *</label>
                <input type="text" value={applicationForm.program}
                  onChange={e => setApplicationForm(p => ({ ...p, program: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Computer Science" />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          {positions.length > 0 && (
            <div style={card}>
              <div style={sectionTitle}>Role Selection</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>PRIMARY ROLE *</label>
                  <select value={applicationForm.position}
                    onChange={e => setApplicationForm(p => ({ ...p, position: e.target.value }))}
                    style={inputStyle}>
                    <option value="">Select a role</option>
                    {positions.map((pos, i) => (
                      <option key={i} value={typeof pos === 'object' ? pos.title : pos}>
                        {typeof pos === 'object' ? pos.title : pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SECOND CHOICE (OPTIONAL)</label>
                  <select value={applicationForm.secondRole}
                    onChange={e => setApplicationForm(p => ({ ...p, secondRole: e.target.value }))}
                    style={inputStyle}>
                    <option value="">Select a role</option>
                    {positions.map((pos, i) => (
                      <option key={i} value={typeof pos === 'object' ? pos.title : pos}>
                        {typeof pos === 'object' ? pos.title : pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Application Questions */}
          {questions.length > 0 && (
            <div style={card}>
              <div style={sectionTitle}>Application Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {questions.map((q, i) => {
                  const text = q.text || q.question || q.content || 'Question';
                  return (
                    <div key={q.id}>
                      <label style={{ ...labelStyle, marginBottom: 8, fontSize: 12, color: '#4a3728' }}>
                        {i + 1}. {text}
                      </label>
                      {q.type === 'file' ? (
                        <div>
                          <input type="file" id={`fq-${q.id}`} accept=".pdf"
                            onChange={e => handleFileAnswerChange(q.id, e.target.files[0])}
                            style={{ display: 'none' }} />
                          <label htmlFor={`fq-${q.id}`} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                            border: '1.5px dashed #e0d8cc', background: '#faf7f2',
                            transition: 'border-color .15s',
                          }}>
                            <Upload size={16} style={{ color: '#c4b89e', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: fileAnswers[q.id] || applicationForm.answers[q.id] ? '#2a1f14' : '#a09180' }}>
                              {fileAnswers[q.id]
                                ? fileAnswers[q.id].name
                                : applicationForm.answers[q.id]
                                ? applicationForm.answers[q.id].split('/').pop()
                                : 'Click to upload PDF'}
                            </span>
                          </label>
                          {(fileAnswers[q.id] || applicationForm.answers[q.id]) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                              <FileText size={14} style={{ color: '#16a34a' }} />
                              <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>
                                {fileAnswers[q.id] ? fileAnswers[q.id].name : applicationForm.answers[q.id].split('/').pop()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : q.type === 'short' ? (
                        <input type="text" value={applicationForm.answers[q.id] || ''}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          style={inputStyle} placeholder="Your answer…" />
                      ) : (
                        <textarea value={applicationForm.answers[q.id] || ''}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                          placeholder="Your answer…" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ ...card, marginBottom: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={saveDraft} disabled={saving}
                style={{ padding: '11px', borderRadius: 10, background: '#f5f0e8', color: '#4a3728', border: '1px solid #e0d8cc', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: '11px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: modal.type === 'success' ? '#f0fdf4' : modal.type === 'error' ? '#fdf3ed' : '#f0f4ff' }}>
              {modal.type === 'success'
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                : modal.type === 'error'
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={warm} strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f76f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>}
            </div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#2a1f14', marginBottom: 8 }}>{modal.title}</div>
            <div style={{ fontSize: 13, color: '#a09180', marginBottom: 24, lineHeight: 1.6 }}>{modal.message}</div>
            <button onClick={() => setModal(null)}
              style={{ padding: '9px 28px', borderRadius: 10, background: modal.type === 'success' ? '#16a34a' : modal.type === 'error' ? warm : '#4f76f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubApplication;
