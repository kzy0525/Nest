import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createClub, updateClub, getClubByName } from '../lib/db';

const warm = '#b5451b';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid #e0d8cc', background: '#fff',
  color: '#2a1f14', fontSize: 13, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, color: '#a09180', marginBottom: 6,
  fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em',
  display: 'block',
};

const sectionCard = {
  background: '#fff', borderRadius: 16, border: '1px solid #ede8df',
  padding: '24px 28px', marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const sectionTitle = {
  fontFamily: "'Instrument Serif', serif", fontSize: 20,
  color: '#2a1f14', marginBottom: 18,
};

const CATEGORIES = ['Technology','Business','Arts','Sports','Community','Health','Culture','Social','Innovation','Media','Academic','Environment','Politics','Science'];

const ClubRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [existingClubId, setExistingClubId] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [existingBackdropUrl, setExistingBackdropUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: '', description: '', categories: [], contact_email: '',
    website: '', instagram: '', slogan: '', member_count: '',
    applications_open: '', application_deadline: '',
    interview_start_date: '', interview_end_date: '',
    second_round_start_date: '', second_round_end_date: '',
    results_released: '', isHiring: false, hasInterviews: false,
  });

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'short' });
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({ title: '', spots: '' });

  useEffect(() => {
    if (!user?.name) return;
    getClubByName(user.name).then(club => {
      if (!club) return;
      setExistingClubId(club.id);
      setFormData({
        name:                   club.name || '',
        description:            club.description || '',
        categories:             Array.isArray(club.category) ? club.category : [],
        contact_email:          club.contact_email || '',
        website:                club.website || '',
        instagram:              club.instagram || '',
        slogan:                 club.slogan || '',
        applications_open:      club.applications_open || '',
        application_deadline:   club.application_deadline || '',
        interview_start_date:   club.interview_start_date || '',
        interview_end_date:     club.interview_end_date || '',
        second_round_start_date:'',
        second_round_end_date:  '',
        results_released:       club.results_released || '',
        isHiring:               club.is_hiring || false,
        hasInterviews:          club.has_interviews || false,
        member_count:           club.member_count != null ? String(club.member_count) : '',
      });
      if (Array.isArray(club.application_questions)) setQuestions(club.application_questions);
      if (Array.isArray(club.open_positions)) setPositions(club.open_positions);
      if (club.logo) setExistingLogoUrl(club.logo);
      if (club.backdrop) setExistingBackdropUrl(club.backdrop);
    }).catch(console.error);
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    setQuestions(prev => [...prev, { id: Date.now(), ...newQuestion }]);
    setNewQuestion({ text: '', type: 'short' });
  };

  const handleAddPosition = () => {
    if (!newPosition.title.trim() || !newPosition.spots.trim()) return;
    setPositions(prev => [...prev, { id: Date.now(), title: newPosition.title, spots: parseInt(newPosition.spots) || 0 }]);
    setNewPosition({ title: '', spots: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.description || formData.categories.length === 0) {
      setError('Club name, description, and at least one category are required.');
      return;
    }
    setLoading(true);
    try {
      const clubData = {
        name: formData.name, description: formData.description,
        category: formData.categories, contact_email: formData.contact_email,
        website: formData.website, instagram: formData.instagram,
        slogan: formData.slogan, applications_open: formData.applications_open,
        application_deadline: formData.application_deadline,
        interview_start_date: formData.interview_start_date,
        interview_end_date: formData.interview_end_date,
        results_released: formData.results_released,
        application_questions: questions, open_positions: positions,
        is_hiring: formData.isHiring, has_interviews: formData.hasInterviews,
        member_count: parseInt(formData.member_count) || 0,
        logo: existingLogoUrl || null,
        backdrop: existingBackdropUrl || null,
      };
      if (existingClubId) {
        await updateClub(existingClubId, clubData, logoFile, backdropFile);
      } else {
        await createClub(clubData, logoFile, backdropFile);
      }
      setSuccess(true);
      setTimeout(() => navigate('/club/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to save club profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Back + heading */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate('/club/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', fontSize: 12, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 16, padding: 0 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 700, color: '#2a1f14', marginBottom: 4 }}>{existingClubId ? 'Edit Club Profile' : 'Club Profile'}</div>
          <div style={{ fontSize: 13, color: '#a09180' }}>{existingClubId ? 'Update your club info, deadlines, and application questions.' : 'Set up your club to start receiving applications from students.'}</div>
        </div>

        {success && (
          <div style={{ background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.25)', color: '#2e7d32', padding: '10px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
            Club profile created! Redirecting to dashboard…
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(181,69,27,0.08)', border: '1px solid rgba(181,69,27,0.25)', color: warm, padding: '10px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Basic Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>CLUB NAME *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your club name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>SLOGAN</label>
                <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} placeholder="Your club's tagline" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>NUMBER OF MEMBERS</label>
                <input type="number" name="member_count" value={formData.member_count} onChange={handleChange} placeholder="e.g. 50" min="0" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>DESCRIPTION *</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe your club's mission, activities, and what makes it unique"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Images */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Club Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'CLUB LOGO',     file: logoFile,     existingUrl: existingLogoUrl,     onChange: e => { setLogoFile(e.target.files[0]); setExistingLogoUrl(null); },     id: 'logo-upload' },
                { label: 'CLUB BACKDROP', file: backdropFile, existingUrl: existingBackdropUrl, onChange: e => { setBackdropFile(e.target.files[0]); setExistingBackdropUrl(null); }, id: 'backdrop-upload' },
              ].map(({ label, file, existingUrl, onChange, id }) => (
                <div key={id}>
                  <label style={labelStyle}>{label}</label>
                  <label htmlFor={id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, borderRadius: 12, cursor: 'pointer',
                    border: '1.5px dashed #e0d8cc', overflow: 'hidden',
                    background: '#faf7f2', transition: 'all .15s',
                    padding: existingUrl ? 0 : '28px 20px',
                    position: 'relative', minHeight: 90,
                  }}>
                    {existingUrl ? (
                      <>
                        <img src={existingUrl} alt={label} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(42,31,20,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(42,31,20,0.45)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(42,31,20,0)'}
                        >
                          <span style={{ color: '#fff', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, opacity: 0, transition: 'opacity .2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                          >Click to replace</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={20} style={{ color: file ? warm : '#c4b89e' }} />
                        <span style={{ fontSize: 12, color: file ? warm : '#a09180', fontWeight: file ? 500 : 400 }}>
                          {file ? file.name : 'Click to upload'}
                        </span>
                        <span style={{ fontSize: 11, color: '#c4b89e' }}>PNG, JPG up to 10MB</span>
                      </>
                    )}
                    <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Categories</div>
            <label style={labelStyle}>SELECT ALL THAT APPLY *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => {
                const active = formData.categories.includes(cat);
                return (
                  <button
                    key={cat} type="button" onClick={() => toggleCategory(cat)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'Space Grotesk', sans-serif", transition: 'all .15s',
                      border: active ? 'none' : '1px solid #e0d8cc',
                      background: active ? warm : '#fff',
                      color: active ? '#fff' : '#a09180',
                      fontWeight: active ? 600 : 400,
                    }}
                  >{cat}</button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Contact & Social</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>CONTACT EMAIL</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="club@university.ca" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WEBSITE</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourclub.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>INSTAGRAM</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@yourclub" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Hiring */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Hiring</div>

            {/* Toggle */}
            <div
              onClick={() => setFormData(p => ({ ...p, isHiring: !p.isHiring }))}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: formData.isHiring ? 24 : 0 }}
            >
              <div style={{
                width: 40, height: 22, borderRadius: 11, transition: 'background .2s',
                background: formData.isHiring ? warm : '#e0d8cc', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: formData.isHiring ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}/>
              </div>
              <span style={{ fontSize: 13, color: '#2a1f14' }}>Currently accepting applications</span>
            </div>

            {formData.isHiring && (
              <>
                {/* Positions */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>OPEN POSITIONS</label>
                  {positions.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#faf7f2', borderRadius: 10, border: '1px solid #ede8df', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: '#2a1f14', fontWeight: 500 }}>{p.title}</span>
                        <span style={{ fontSize: 11, color: '#a09180', marginLeft: 8 }}>{p.spots} spot{p.spots !== 1 ? 's' : ''}</span>
                      </div>
                      <button type="button" onClick={() => setPositions(prev => prev.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b89e', display: 'flex' }}>
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <input type="text" value={newPosition.title} onChange={e => setNewPosition(p => ({ ...p, title: e.target.value }))} placeholder="Position title" style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" value={newPosition.spots} onChange={e => setNewPosition(p => ({ ...p, spots: e.target.value }))} placeholder="Spots" min="1" style={{ ...inputStyle, width: 80 }} />
                    <button type="button" onClick={handleAddPosition} style={{ padding: '0 16px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>APPLICATION TIMELINE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ ...labelStyle, marginTop: 4 }}>OPENS</label>
                      <input type="date" name="applications_open" value={formData.applications_open} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, marginTop: 4 }}>CLOSES</label>
                      <input type="date" name="application_deadline" value={formData.application_deadline} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, marginTop: 4 }}>RESULTS RELEASED</label>
                      <input type="date" name="results_released" value={formData.results_released} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* Interviews toggle */}
                <div style={{ marginBottom: formData.hasInterviews ? 20 : 0 }}>
                  <div
                    onClick={() => setFormData(p => ({ ...p, hasInterviews: !p.hasInterviews }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: formData.hasInterviews ? 16 : 0 }}
                  >
                    <div style={{
                      width: 40, height: 22, borderRadius: 11, transition: 'background .2s',
                      background: formData.hasInterviews ? warm : '#e0d8cc', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: 3, left: formData.hasInterviews ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }}/>
                    </div>
                    <span style={{ fontSize: 13, color: '#2a1f14' }}>Conducting interviews</span>
                  </div>

                  {formData.hasInterviews && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { label: '1ST ROUND START', name: 'interview_start_date' },
                        { label: '1ST ROUND END',   name: 'interview_end_date' },
                        { label: '2ND ROUND START (optional)', name: 'second_round_start_date' },
                        { label: '2ND ROUND END (optional)',   name: 'second_round_end_date' },
                      ].map(({ label, name }) => (
                        <div key={name}>
                          <label style={labelStyle}>{label}</label>
                          <input type="date" name={name} value={formData[name] || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Application Questions */}
          {formData.isHiring && (
            <div style={sectionCard}>
              <div style={sectionTitle}>Application Questions</div>

              {questions.map(q => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#faf7f2', borderRadius: 10, border: '1px solid #ede8df', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#2a1f14' }}>{q.text}</div>
                    <div style={{ fontSize: 11, color: '#a09180', marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>{q.type === 'short' ? 'Short answer' : q.type === 'file' ? 'File upload' : 'Long answer'}</div>
                  </div>
                  <button type="button" onClick={() => setQuestions(prev => prev.filter(x => x.id !== q.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b89e', display: 'flex' }}>
                    <X size={15} />
                  </button>
                </div>
              ))}

              <div style={{ border: '1.5px dashed #e0d8cc', borderRadius: 12, padding: '16px 18px', marginTop: 8 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>QUESTION</label>
                  <input
                    type="text" value={newQuestion.text}
                    onChange={e => setNewQuestion(p => ({ ...p, text: e.target.value }))}
                    placeholder="Enter your question"
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>ANSWER TYPE</label>
                    <select value={newQuestion.type} onChange={e => setNewQuestion(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                      <option value="short">Short Answer</option>
                      <option value="long">Long Answer</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  <button
                    type="button" onClick={handleAddQuestion}
                    style={{ padding: '11px 18px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 32 }}>
            <button
              type="button" onClick={() => navigate('/club/dashboard')}
              style={{ padding: '11px 22px', borderRadius: 10, border: '1px solid #e0d8cc', background: '#fff', color: '#a09180', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: warm, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(181,69,27,0.28)' }}
            >
              {loading ? 'Saving…' : existingClubId ? 'Save Changes' : 'Create Club Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ClubRegistration;
