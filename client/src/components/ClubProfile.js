import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, TrendingUp, Globe, Instagram, Mail, Edit2, X, Plus, Upload, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubByName, updateClub, getReviews } from '../lib/db';

const warm = '#b5451b';

const card = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  border: '1px solid #e0d8cc', background: '#faf7f2',
  color: '#2a1f14', fontSize: 13, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: '0.06em', display: 'block', marginBottom: 5,
};

const CATEGORIES = ['Technology','Business','Arts','Sports','Community','Health','Culture','Social','Innovation','Media','Academic','Environment','Politics','Science'];

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 22 && m > 0) break;
      opts.push({
        value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        label: `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`,
      });
    }
  }
  return opts;
})();

const calcSlotCount = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.floor(diff / 15) + 1 : 0;
};

const ClubProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoInputRef = useRef();
  const backdropInputRef = useRef();

  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', categories: [], contact_email: '',
    website: '', instagram: '', slogan: '', member_count: '', acceptance_rate: '',
    applications_open: '', application_deadline: '',
    interview_start_date: '', interview_end_date: '',
    results_released: '', isHiring: false, hasInterviews: false,
  });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'short' });
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({ title: '', spots: '' });
  const [interviewSlots, setInterviewSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(null);

  useEffect(() => {
    if (!user?.name) return;
    getClubByName(user.name)
      .then(c => {
        setClub(c);
        if (c) {
          getReviews(c.id).then(setReviews).catch(console.error);
          populateForm(c);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const populateForm = (c) => {
    let pos = [];
    try { pos = Array.isArray(c.open_positions) ? c.open_positions : JSON.parse(c.open_positions || '[]'); } catch {}
    setFormData({
      name: c.name || '',
      description: c.description || '',
      categories: Array.isArray(c.category) ? c.category : [],
      contact_email: c.contact_email || '',
      website: c.website || '',
      instagram: c.instagram || '',
      slogan: c.slogan || '',
      member_count: c.member_count != null ? String(c.member_count) : '',
      acceptance_rate: c.acceptance_rate != null ? String(c.acceptance_rate) : '',
      applications_open: c.applications_open || '',
      application_deadline: c.application_deadline || '',
      interview_start_date: c.interview_start_date || '',
      interview_end_date: c.interview_end_date || '',
      results_released: c.results_released || '',
      isHiring: c.is_hiring || false,
      hasInterviews: c.has_interviews || false,
    });
    setPositions(pos);
    if (Array.isArray(c.application_questions)) setQuestions(c.application_questions);
    setInterviewSlots(Array.isArray(c.interview_slots) ? c.interview_slots : []);
  };

  const handleStartEdit = () => {
    if (club) populateForm(club);
    setLogoFile(null); setBackdropFile(null);
    setLogoPreview(null); setBackdropPreview(null);
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null); setBackdropFile(null);
    setLogoPreview(null); setBackdropPreview(null);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || formData.categories.length === 0) {
      setError('Name, description, and at least one category are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const clubData = {
        name: formData.name, description: formData.description,
        category: formData.categories, contact_email: formData.contact_email,
        website: formData.website, instagram: formData.instagram,
        slogan: formData.slogan,
        applications_open: formData.applications_open || null,
        application_deadline: formData.application_deadline || null,
        interview_start_date: formData.interview_start_date || null,
        interview_end_date: formData.interview_end_date || null,
        results_released: formData.results_released || null,
        application_questions: questions,
        open_positions: positions,
        interview_slots: interviewSlots,
        is_hiring: formData.isHiring,
        has_interviews: formData.hasInterviews,
        member_count: parseInt(formData.member_count) || 0,
        acceptance_rate: parseFloat(formData.acceptance_rate) || 0,
        logo: club.logo || null,
        backdrop: club.backdrop || null,
      };
      await updateClub(club.id, clubData, logoFile, backdropFile);
      const updated = await getClubByName(user.name);
      setClub(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBackdropChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackdropFile(file);
    setBackdropPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleAddPosition = () => {
    if (!newPosition.title.trim()) return;
    setPositions(prev => [...prev, { id: Date.now(), title: newPosition.title, spots: parseInt(newPosition.spots) || 0 }]);
    setNewPosition({ title: '', spots: '' });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    setQuestions(prev => [...prev, { id: Date.now(), ...newQuestion }]);
    setNewQuestion({ text: '', type: 'short' });
  };

  const handleAddSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) return;
    const [sh, sm] = newSlot.startTime.split(':').map(Number);
    const [eh, em] = newSlot.endTime.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) return;
    const generated = [];
    let h = sh, m = sm;
    const stamp = Date.now();
    while (h < eh || (h === eh && m <= em)) {
      generated.push({ id: `${stamp}-${h}-${m}`, date: newSlot.date, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
      m += 15;
      if (m >= 60) { h++; m -= 60; }
    }
    setInterviewSlots(prev => [...prev, ...generated]);
    setNewSlot(p => ({ ...p, startTime: '', endTime: '' }));
  };

  const renderStars = (r, size = 15) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={size} style={{ color: i < r ? '#f59e0b' : '#e0d8cc', fill: i < r ? '#f59e0b' : 'none' }} />
  ));

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
      <div style={{ fontSize: 14, color: '#a09180', fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
    </div>
  );

  if (!club) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, color: warm, fontFamily: "'DM Sans', sans-serif" }}>No club profile found.</div>
      <button onClick={() => navigate('/club/register')} style={{ padding: '9px 18px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        Set Up Profile
      </button>
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
  const maxDist = Math.max(...Object.values(dist), 1);

  const displayPositions = (() => {
    const src = isEditing ? positions : club.open_positions;
    try { return Array.isArray(src) ? src : JSON.parse(src || '[]'); } catch { return []; }
  })();

  const timelineEntries = [
    { key: 'applications_open',    label: 'Applications Open',  color: '#4ade80' },
    { key: 'application_deadline', label: 'Applications Close', color: warm },
    { key: 'interview_start_date', label: 'Interviews Begin',   color: '#f59e0b' },
    { key: 'interview_end_date',   label: 'Interviews End',     color: '#f59e0b' },
    { key: 'results_released',     label: 'Results Released',   color: '#60a5fa' },
  ];

  const timeline = timelineEntries
    .map(e => ({ ...e, date: isEditing ? formData[e.key] : club[e.key] }))
    .filter(e => e.date);

  const currentLogo = logoPreview || club.logo;
  const currentBackdrop = backdropPreview || club.backdrop;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
      <input ref={backdropInputRef} type="file" accept="image/*" onChange={handleBackdropChange} style={{ display: 'none' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 50, fontWeight: 700, color: '#2a1f14' }}>Club Profile</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isEditing ? (
              <>
                {error && <span style={{ fontSize: 12, color: warm }}>{error}</span>}
                <button onClick={handleCancel} style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', color: '#a09180', border: '1px solid #e0d8cc', cursor: 'pointer', fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" }}>Discard</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button onClick={handleStartEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                <Edit2 size={13} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Main club card */}
            <div style={card}>
              {/* Backdrop */}
              <div style={{ height: 150, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                {currentBackdrop
                  ? <img src={currentBackdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8dfd4, #d4c8b8)' }} />}
                {isEditing && (
                  <button
                    onClick={() => backdropInputRef.current?.click()}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fff' }}>
                    <Upload size={20} />
                    <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Change Backdrop</span>
                  </button>
                )}
              </div>

              <div style={{ padding: '0 28px 28px', position: 'relative' }}>
                {/* Logo */}
                <div style={{ marginTop: -54, marginBottom: 14, position: 'relative', zIndex: 1, display: 'inline-block' }}>
                  {currentLogo
                    ? <img src={currentLogo} alt={club.name} style={{ width: 108, height: 108, borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'block' }} />
                    : <div style={{ width: 108, height: 108, borderRadius: '50%', border: '3px solid #fff', background: warm, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: '#fff' }}>
                          {(formData.name || club.name).split(' ').map(w => w[0]).join('').slice(0, 3)}
                        </span>
                      </div>}
                  {isEditing && (
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: '50%', background: warm, border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={12} color="#fff" />
                    </button>
                  )}
                </div>

                {/* Name */}
                {isEditing ? (
                  <input
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    style={{ ...inputStyle, fontFamily: "'Instrument Serif', serif", fontSize: 22, marginBottom: 8 }}
                    placeholder="Club name"
                  />
                ) : (
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#2a1f14', marginBottom: 4 }}>{club.name}</div>
                )}

                {/* Slogan */}
                {isEditing ? (
                  <input
                    value={formData.slogan}
                    onChange={e => setFormData(p => ({ ...p, slogan: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 16, fontSize: 13 }}
                    placeholder="Slogan (optional)"
                  />
                ) : (
                  club.slogan && <div style={{ fontSize: 14, color: '#a09180', marginBottom: 16, fontStyle: 'italic' }}>{club.slogan}</div>
                )}

                {/* Stats */}
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>MEMBERS</label>
                      <input type="number" value={formData.member_count} onChange={e => setFormData(p => ({ ...p, member_count: e.target.value }))} style={inputStyle} placeholder="0" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>ACCEPTANCE RATE (%)</label>
                      <input type="number" value={formData.acceptance_rate} onChange={e => setFormData(p => ({ ...p, acceptance_rate: e.target.value }))} style={inputStyle} placeholder="0" />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
                    {club.member_count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4a3728' }}>
                        <Users size={14} style={{ color: '#a09180' }} />
                        <span><strong>{club.member_count}</strong> members</span>
                      </div>
                    )}
                    {club.acceptance_rate > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4a3728' }}>
                        <TrendingUp size={14} style={{ color: '#a09180' }} />
                        <span><strong>{club.acceptance_rate}%</strong> acceptance rate</span>
                      </div>
                    )}
                    {reviews.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4a3728' }}>
                        <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span><strong>{avgRating}</strong> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    placeholder="Club description"
                  />
                ) : (
                  club.description && <p style={{ fontSize: 14, color: '#4a3728', lineHeight: 1.75, margin: 0 }}>{club.description}</p>
                )}
              </div>
            </div>

            {/* Categories (edit mode) */}
            {isEditing && (
              <div style={{ ...card, padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(cat => {
                    const selected = formData.categories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        background: selected ? warm : '#faf7f2',
                        color: selected ? '#fff' : '#a09180',
                        border: selected ? `1px solid ${warm}` : '1px solid #e0d8cc',
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: selected ? 600 : 400,
                      }}>{cat}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Application Questions (edit mode) */}
            {isEditing && (
              <div style={{ ...card, padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Application Questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {questions.map((q, i) => (
                    <div key={q.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 13px', background: '#faf7f2', borderRadius: 9, border: '1px solid #f0ebe3' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#2a1f14' }}>{q.text}</div>
                        <div style={{ fontSize: 10, color: '#a09180', marginTop: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {q.type === 'file' ? 'File upload' : q.type === 'long' ? 'Long answer' : 'Short answer'}
                        </div>
                      </div>
                      <button onClick={() => setQuestions(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b49a', padding: 2, display: 'flex', flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div style={{ fontSize: 13, color: '#a09180', fontStyle: 'italic' }}>No questions yet.</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newQuestion.text}
                    onChange={e => setNewQuestion(p => ({ ...p, text: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddQuestion()}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Add a question…"
                  />
                  <select
                    value={newQuestion.type}
                    onChange={e => setNewQuestion(p => ({ ...p, type: e.target.value }))}
                    style={{ ...inputStyle, width: 'auto', flexShrink: 0 }}>
                    <option value="short">Short</option>
                    <option value="long">Long</option>
                    <option value="file">File</option>
                  </select>
                  <button onClick={handleAddQuestion} style={{ padding: '9px 13px', borderRadius: 9, background: warm, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Interview Slots (edit mode) */}
            {isEditing && (
              <div style={{ ...card, padding: '22px 26px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 16 }}>Interview Slots</div>

                {/* Existing slots — compact tag grid */}
                {interviewSlots.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {interviewSlots.map((slot, i) => (
                      <div key={slot.id || i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#faf7f2', borderRadius: 20, border: '1px solid #e0d8cc', fontSize: 12, color: '#4a3728' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(slot.time)}
                        </span>
                        <button onClick={() => setInterviewSlots(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b49a', display: 'flex', padding: 0, lineHeight: 1 }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {interviewSlots.length === 0 && (
                  <div style={{ fontSize: 13, color: '#a09180', fontStyle: 'italic', marginBottom: 16 }}>No slots added yet.</div>
                )}

                {/* Add block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="date" value={newSlot.date}
                    onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={newSlot.startTime}
                      onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      <option value="">From</option>
                      {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span style={{ fontSize: 12, color: '#a09180', flexShrink: 0 }}>to</span>
                    <select
                      value={newSlot.endTime}
                      onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      <option value="">To</option>
                      {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {newSlot.startTime && newSlot.endTime && calcSlotCount(newSlot.startTime, newSlot.endTime) > 0 && (
                      <span style={{ fontSize: 11, color: '#a09180', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap' }}>
                        {calcSlotCount(newSlot.startTime, newSlot.endTime)} slots
                      </span>
                    )}
                    <button
                      onClick={handleAddSlot}
                      style={{ padding: '9px 14px', borderRadius: 9, background: warm, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ ...card, padding: '24px 28px' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14', marginBottom: 22 }}>Reviews & Ratings</div>
              {reviews.length === 0 ? (
                <div style={{ fontSize: 13, color: '#a09180', fontStyle: 'italic' }}>No reviews yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 52, color: '#2a1f14', lineHeight: 1 }}>{avgRating}</div>
                    <div style={{ display: 'flex', gap: 3, margin: '8px 0 4px' }}>{renderStars(Math.round(avgRating), 18)}</div>
                    <div style={{ fontSize: 12, color: '#a09180', marginBottom: 20 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[5,4,3,2,1].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#a09180', width: 8, fontFamily: "'Space Grotesk', sans-serif", textAlign: 'right' }}>{s}</span>
                          <div style={{ flex: 1, height: 6, background: '#f0ebe3', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(dist[s] / maxDist) * 100}%`, height: '100%', background: warm, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#c4b89e', width: 14, fontFamily: "'Space Grotesk', sans-serif" }}>{dist[s]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {reviews.length > 3 && (
                      <button onClick={() => setShowAllReviews(!showAllReviews)} style={{ fontSize: 11, color: warm, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {showAllReviews ? 'Show less' : `View all ${reviews.length} reviews`}
                      </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {(showAllReviews ? reviews : reviews.slice(0, 3)).map(review => (
                        <div key={review.id} style={{ borderTop: '1px solid #f0ebe3', paddingTop: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#2a1f14' }}>{review.student_name}</div>
                              {review.club_position && <div style={{ fontSize: 11, color: '#a09180' }}>{review.club_position}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 2 }}>{renderStars(review.rating, 13)}</div>
                          </div>
                          <p style={{ fontSize: 13, color: '#4a3728', lineHeight: 1.65, margin: 0 }}>{review.review_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Contact & Social */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Contact & Social</div>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div>
                    <label style={labelStyle}>EMAIL</label>
                    <input value={formData.contact_email} onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))} style={inputStyle} placeholder="contact@club.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>WEBSITE</label>
                    <input value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} style={inputStyle} placeholder="https://…" />
                  </div>
                  <div>
                    <label style={labelStyle}>INSTAGRAM</label>
                    <input value={formData.instagram} onChange={e => setFormData(p => ({ ...p, instagram: e.target.value }))} style={inputStyle} placeholder="@handle" />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {club.contact_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Mail size={14} style={{ color: '#a09180', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#4a3728' }}>{club.contact_email}</span>
                    </div>
                  )}
                  {club.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Globe size={14} style={{ color: '#a09180', flexShrink: 0 }} />
                      <a href={club.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#4a3728', textDecoration: 'none' }}>{club.website}</a>
                    </div>
                  )}
                  {club.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Instagram size={14} style={{ color: '#a09180', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#4a3728' }}>{club.instagram}</span>
                    </div>
                  )}
                  {!club.contact_email && !club.website && !club.instagram && (
                    <span style={{ fontSize: 13, color: '#a09180' }}>No contact info listed</span>
                  )}
                </div>
              )}
            </div>

            {/* Open Positions */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Open Positions</div>
              {isEditing ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {positions.map((pos, i) => (
                      <div key={pos.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#faf7f2', borderRadius: 8, border: '1px solid #f0ebe3' }}>
                        <span style={{ flex: 1, fontSize: 13, color: '#2a1f14' }}>{typeof pos === 'object' ? pos.title : pos}</span>
                        {typeof pos === 'object' && pos.spots != null && (
                          <span style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif" }}>{pos.spots} spots</span>
                        )}
                        <button onClick={() => setPositions(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b49a', display: 'flex', padding: 2 }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={newPosition.title} onChange={e => setNewPosition(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, flex: 1 }} placeholder="Position title" />
                    <input type="number" value={newPosition.spots} onChange={e => setNewPosition(p => ({ ...p, spots: e.target.value }))} style={{ ...inputStyle, width: 64, flexShrink: 0 }} placeholder="Spots" />
                    <button onClick={handleAddPosition} style={{ padding: '9px 12px', borderRadius: 9, background: warm, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : displayPositions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayPositions.map((pos, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#faf7f2', borderRadius: 8, border: '1px solid #f0ebe3' }}>
                      <span style={{ fontSize: 13, color: '#2a1f14', fontWeight: 500 }}>{typeof pos === 'object' ? pos.title : pos}</span>
                      {typeof pos === 'object' && pos.spots != null && (
                        <span style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif" }}>{pos.spots} spot{pos.spots !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#a09180' }}>No open positions listed</span>
              )}
            </div>

            {/* Hiring Package */}
            {!isEditing && club.hiring_package && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Hiring Package</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#faf7f2', borderRadius: 10, border: '1px solid #f0ebe3' }}>
                  <div style={{ width: 36, height: 36, background: '#fde8e0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} style={{ color: warm }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2a1f14' }}>Hiring Package</div>
                    <div style={{ fontSize: 11, color: '#a09180' }}>Roles & requirements</div>
                  </div>
                  <a href={club.hiring_package} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', borderRadius: 8, background: warm, color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap' }}>
                    View PDF
                  </a>
                </div>
              </div>
            )}

            {/* Hiring Timeline */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: isEditing ? 14 : 18 }}>Hiring Timeline</div>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {timelineEntries.map(({ key, label }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label.toUpperCase()}</label>
                      <input type="date" value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}
                </div>
              ) : timeline.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {timeline.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < timeline.length - 1 ? 18 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0, marginTop: 3 }} />
                        {i < timeline.length - 1 && <div style={{ width: 1, flex: 1, background: '#e8e0d4', marginTop: 4 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14' }}>
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif" }}>{entry.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#a09180' }}>No hiring timeline set</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
