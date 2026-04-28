import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Search, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, upsertProfile, uploadAvatar, getApplications, getClubs, getFavorites } from '../lib/db';

const CLUB_COLORS = ['#1565C0','#1a3a6e','#1a2a3a','#2e7d32','#4a1942','#7a3a18','#5c3317','#0d4731'];
const getClubColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return CLUB_COLORS[Math.abs(h) % CLUB_COLORS.length];
};

const STATUS_META = {
  'Incomplete': { label: 'Incomplete',   bg: '#fef3cd', color: '#8a6200' },
  'Submitted':  { label: 'Under Review', bg: '#e8f0fe', color: '#1a56db' },
  'Interview':  { label: 'Interview',    bg: '#e8f5e9', color: '#2e7d32' },
  'Accepted':   { label: 'Accepted',     bg: '#f0ebe3', color: '#b5451b' },
  'Rejected':   { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

const T = {
  bg: '#faf7f2', sidebar: '#f3ede3', card: '#fff',
  accent: '#b5451b', heading: '#2a1f14',
  muted: '#a09180', faint: '#c4b49a',
  border: '#e8e0d4', borderLight: '#f0ebe3',
};

const inputBase = {
  border: 'none',
  borderBottom: `1px solid ${T.border}`,
  background: 'transparent',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  color: T.heading,
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState({
    name: '', program: '', year: '', school: '',
    pronouns: '', avatar: null, bio: '', goals: '', currentClubs: [],
  });
  const [editForm, setEditForm] = useState({ name: '', program: '', year: '', school: '', pronouns: '', bio: '', goals: '' });
  const [editingSection, setEditingSection] = useState(null);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [newClubForm, setNewClubForm] = useState({ role: '', joinDate: '' });
  const [editingClub, setEditingClub] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(profile => {
      const meta = user.user_metadata || {};
      const p = {
        name: profile.name || meta.name || '',
        program: profile.program || '',
        year: profile.year || '',
        school: profile.school || meta.school || '',
        pronouns: profile.pronouns || '',
        avatar: profile.avatar_url || null,
        bio: profile.bio || '',
        goals: profile.goals || '',
        currentClubs: profile.current_clubs || [],
      };
      setUserProfile(p);
      setEditForm({ name: p.name, program: p.program, year: p.year, school: p.school, pronouns: p.pronouns, bio: p.bio, goals: p.goals });
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = () => getApplications(user.id).then(setApplications).catch(console.error);
    load();
    window.addEventListener('clubApplicationAdded', load);
    window.addEventListener('applicationSaved', load);
    window.addEventListener('applicationSubmitted', load);
    return () => {
      window.removeEventListener('clubApplicationAdded', load);
      window.removeEventListener('applicationSaved', load);
      window.removeEventListener('applicationSubmitted', load);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getFavorites(user.id).then(setFavorites).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!showAddClubModal) return;
    getClubs().then(setAvailableClubs).catch(console.error);
  }, [showAddClubModal]);

  const handleEditSection = (section) => {
    setEditingSection(section);
    setEditForm({ name: userProfile.name, program: userProfile.program, year: userProfile.year, school: userProfile.school, pronouns: userProfile.pronouns, bio: userProfile.bio, goals: userProfile.goals });
  };

  const handleSaveSection = async () => {
    const updates = { name: editForm.name, program: editForm.program, year: editForm.year, school: editForm.school, pronouns: editForm.pronouns, bio: editForm.bio, goals: editForm.goals };
    setUserProfile(prev => ({ ...prev, ...updates }));
    setEditingSection(null);
    await upsertProfile(user.id, updates);
  };

  const handleCancelEdit = () => {
    setEditForm({ name: userProfile.name, program: userProfile.program, year: userProfile.year, school: userProfile.school, pronouns: userProfile.pronouns, bio: userProfile.bio, goals: userProfile.goals });
    setEditingSection(null);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    setIsUploadingProfilePicture(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setUserProfile(prev => ({ ...prev, avatar: url }));
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (e) {
      console.error('Error uploading profile picture:', e);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const handleAddClub = () => {
    setShowAddClubModal(true);
    setSearchQuery('');
    setSelectedClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const handleClubSelect = (club) => {
    setSelectedClub(club);
    setSearchQuery(club.name);
  };

  const handleSubmitClub = async () => {
    if (!selectedClub || !newClubForm.role || !newClubForm.joinDate) return;
    const newClub = { id: Date.now(), name: selectedClub.name, logo: selectedClub.logo || null, role: newClubForm.role, joinDate: newClubForm.joinDate };
    const updatedClubs = [...userProfile.currentClubs, newClub];
    setUserProfile(prev => ({ ...prev, currentClubs: updatedClubs }));
    await upsertProfile(user.id, { current_clubs: updatedClubs });
    setShowAddClubModal(false);
    setSearchQuery('');
    setSelectedClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const handleRemoveClub = async (clubId) => {
    const updatedClubs = userProfile.currentClubs.filter(c => c.id !== clubId);
    setUserProfile(prev => ({ ...prev, currentClubs: updatedClubs }));
    await upsertProfile(user.id, { current_clubs: updatedClubs });
    setShowDropdown(null);
  };

  const handleEditClub = (club) => {
    setEditingClub(club);
    setNewClubForm({ role: club.role, joinDate: club.joinDate });
    setShowDropdown(null);
  };

  const handleUpdateClub = async () => {
    if (!editingClub || !newClubForm.role || !newClubForm.joinDate) return;
    const updatedClubs = userProfile.currentClubs.map(c =>
      c.id === editingClub.id ? { ...c, role: newClubForm.role, joinDate: newClubForm.joinDate } : c
    );
    setUserProfile(prev => ({ ...prev, currentClubs: updatedClubs }));
    await upsertProfile(user.id, { current_clubs: updatedClubs });
    setEditingClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const handleCancelClubEdit = () => {
    setEditingClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const toggleDropdown = (clubId) => {
    setShowDropdown(showDropdown === clubId ? null : clubId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const filteredClubs = availableClubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !userProfile.currentClubs.some(uc => uc.name === club.name)
  );

  const initials = userProfile.name
    ? userProfile.name.split(' ').map(w => w[0]).join('').slice(0, 2)
    : '?';

  const buildNotifications = () => {
    const now = new Date();
    const items = [];

    // Application activity
    applications.forEach(app => {
      items.push({
        key: `app-${app.id}`,
        type: 'applied',
        message: <><span style={{ color: T.heading }}>Applied to </span><span style={{ color: T.accent, fontWeight: 500 }}>{app.clubName}</span></>,
        date: app.dateSubmitted || null,
        dot: T.accent,
        sortMs: app.dateSubmitted ? new Date(app.dateSubmitted).getTime() : 0,
      });
    });

    // Favorited club date events
    favorites.forEach(club => {
      const open = club.applications_open ? new Date(club.applications_open) : null;
      const deadline = club.application_deadline ? new Date(club.application_deadline) : null;
      const results = club.results_released ? new Date(club.results_released) : null;

      // Currently recruiting
      if (deadline && deadline > now && (!open || open <= now)) {
        const daysLeft = Math.ceil((deadline - now) / 86400000);
        items.push({
          key: `rec-${club.id}`,
          type: 'recruiting',
          message: <><span style={{ color: T.accent, fontWeight: 500 }}>{club.name}</span><span style={{ color: T.heading }}> is now accepting applications</span></>,
          date: `Closes ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${daysLeft <= 7 ? ` · ${daysLeft}d left` : ''}`,
          dot: '#2e7d32',
          sortMs: deadline.getTime(),
        });
      }
      // Opening soon (within 30 days)
      else if (open && open > now && (open - now) < 30 * 86400000) {
        items.push({
          key: `open-${club.id}`,
          type: 'opening',
          message: <><span style={{ color: T.accent, fontWeight: 500 }}>{club.name}</span><span style={{ color: T.heading }}> opens applications on {open.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>,
          date: null,
          dot: '#1a56db',
          sortMs: open.getTime(),
        });
      }

      // Results releasing soon (within 14 days)
      if (results && results > now && (results - now) < 14 * 86400000) {
        items.push({
          key: `res-${club.id}`,
          type: 'results',
          message: <><span style={{ color: T.accent, fontWeight: 500 }}>{club.name}</span><span style={{ color: T.heading }}> releases results on {results.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>,
          date: null,
          dot: '#f59e0b',
          sortMs: results.getTime(),
        });
      }
    });

    // Recruiting/opening first (soonest deadline), then applied (most recent first)
    return items.sort((a, b) => {
      const priority = { recruiting: 0, opening: 1, results: 2, applied: 3 };
      if (priority[a.type] !== priority[b.type]) return priority[a.type] - priority[b.type];
      if (a.type === 'applied') return b.sortMs - a.sortMs;
      return a.sortMs - b.sortMs;
    });
  };

  const notifications = buildNotifications();

  return (
    <div style={{ display: 'flex', height: '100%', background: T.bg, overflow: 'hidden' }}>

      {/* ── Left profile sidebar ── */}
      <div style={{
        flex: '0 0 33.333%', background: T.sidebar, borderRight: `1px solid ${T.border}`,
        padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: 25,
        flexShrink: 0, overflowY: 'auto',
      }}>

        {/* Avatar + name + pronouns + edit button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8c4a0, #c4906a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: '#fff', fontStyle: 'italic' }}>
                  {initials}
                </span>
              )}
            </div>
            <label style={{ position: 'absolute', bottom: 0, right: 0, cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} disabled={isUploadingProfilePicture} />
              <div style={{
                width: 33, height: 33, borderRadius: '50%', background: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}>
                {isUploadingProfilePicture
                  ? <div style={{ width: 15, height: 15, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  : <Camera size={15} color="#fff" />}
              </div>
            </label>
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            {editingSection === 'basic' ? (
              <input
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{ ...inputBase, fontFamily: "'Instrument Serif', serif", fontSize: 23, color: T.heading, textAlign: 'center', width: '100%', marginBottom: 8 }}
              />
            ) : (
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25, color: T.heading }}>{userProfile.name || 'Your Name'}</div>
            )}
            {editingSection === 'basic' ? (
              <input
                value={editForm.pronouns}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                placeholder="Pronouns (optional)"
                style={{ ...inputBase, fontSize: 14, textAlign: 'center', width: '100%' }}
              />
            ) : (
              userProfile.pronouns && (
                <div style={{ fontSize: 14, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>{userProfile.pronouns}</div>
              )
            )}
          </div>

          {/* Edit Profile / Save-Cancel */}
          {editingSection === 'basic' ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSaveSection} style={{
                fontSize: 14, padding: '8px 18px', borderRadius: 20,
                background: T.accent, color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
              }}>Save</button>
              <button onClick={handleCancelEdit} style={{
                fontSize: 14, padding: '8px 18px', borderRadius: 20, background: 'transparent',
                color: T.muted, border: `1px solid ${T.border}`, cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => handleEditSection('basic')} style={{
              fontSize: 14, padding: '8px 20px', borderRadius: 20,
              background: T.accent, color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
            }}>Edit Profile</button>
          )}
        </div>

        <div style={{ height: 1, background: T.border }} />

        {/* Year / Program / School */}
        {editingSection === 'basic' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <select
              value={editForm.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              style={{ ...inputBase, fontSize: 16 }}
            >
              <option value="">Select year</option>
              {['1st Year','2nd Year','3rd Year','4th Year','5th Year','Graduate'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <input
              value={editForm.program}
              onChange={(e) => handleInputChange('program', e.target.value)}
              placeholder="Program"
              style={{ ...inputBase, fontSize: 16 }}
            />
            <input
              value={editForm.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              placeholder="School"
              style={{ ...inputBase, fontSize: 16 }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Year', userProfile.year], ['Program', userProfile.program], ['School', userProfile.school]].map(([label, txt]) =>
              txt ? (
                <div key={label}>
                  <div style={{ fontSize: 13, color: T.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 3 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 16, color: T.heading }}>{txt}</div>
                </div>
              ) : null
            )}
          </div>
        )}

        <div style={{ height: 1, background: T.border }} />

        {/* About / Bio / Goals */}
        <div>
          <div style={{
            fontSize: 13, color: T.muted, fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
          }}>ABOUT</div>
          {editingSection === 'about' ? (
            <div>
              <textarea
                value={editForm.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
                style={{
                  width: '100%', fontSize: 15, color: T.heading, lineHeight: 1.6,
                  border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px',
                  background: '#fff', outline: 'none', resize: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <div style={{ marginTop: 13 }}>
                <div style={{
                  fontSize: 13, color: T.muted, fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
                }}>GOALS</div>
                <textarea
                  value={editForm.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  rows={2}
                  placeholder="What are you looking for?"
                  style={{
                    width: '100%', fontSize: 15, color: T.heading, lineHeight: 1.6,
                    border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px',
                    background: '#fff', outline: 'none', resize: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 13 }}>
                <button onClick={handleSaveSection} style={{
                  fontSize: 14, padding: '6px 15px', borderRadius: 8,
                  background: T.accent, color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
                }}>Save</button>
                <button onClick={handleCancelEdit} style={{
                  fontSize: 14, padding: '6px 15px', borderRadius: 8, background: 'transparent',
                  color: T.muted, border: `1px solid ${T.border}`, cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div onClick={() => handleEditSection('about')} style={{ cursor: 'text' }}>
              <div style={{ fontSize: 15, color: T.heading, lineHeight: 1.6 }}>
                {userProfile.bio || <span style={{ color: T.faint, fontStyle: 'italic' }}>Add a bio…</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: '0 0 66.667%', overflow: 'auto', padding: '35px 35px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>

          {/* Current Clubs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: T.heading }}>Current Clubs</div>
              <button onClick={handleAddClub} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 14, padding: '6px 15px', borderRadius: 8,
                background: T.accent, color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
              }}>
                <Plus size={15} /> Add Club
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {userProfile.currentClubs.length === 0 ? (
                <div style={{
                  background: T.card, borderRadius: 15, border: `1px solid ${T.border}`,
                  padding: 25, textAlign: 'center', color: T.faint, fontSize: 16,
                }}>
                  No clubs yet — add one to get started!
                </div>
              ) : userProfile.currentClubs.map((club) => (
                <div key={club.id} style={{
                  display: 'flex', alignItems: 'center', gap: 15, padding: '16px 20px',
                  background: T.card, borderRadius: 15, border: `1px solid ${T.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {(() => {
                    const logo = club.logo || availableClubs.find(c => c.name === club.name)?.logo;
                    return (
                      <div style={{
                        width: 45, height: 45, borderRadius: 11, background: getClubColor(club.name),
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      }}>
                        {logo
                          ? <img src={logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{club.name.slice(0, 2).toUpperCase()}</span>
                        }
                      </div>
                    );
                  })()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      onClick={() => navigate(`/club/${club.id}`)}
                      style={{ fontSize: 16, fontWeight: 500, color: T.heading, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {club.name}
                    </div>
                    {club.role && (
                      <div style={{ fontSize: 13, color: T.accent, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{club.role}</div>
                    )}
                    {club.joinDate && (
                      <div style={{ fontSize: 13, color: T.faint, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Member since {formatDate(club.joinDate)}</div>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => toggleDropdown(club.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.faint, fontSize: 20, padding: '4px 6px', lineHeight: 1 }}
                    >···</button>
                    {showDropdown === club.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', background: '#fff',
                        border: `1px solid ${T.border}`, borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: 100,
                      }}>
                        <button
                          onClick={() => handleEditClub(club)}
                          style={{ display: 'block', width: '100%', padding: '10px 18px', textAlign: 'left', fontSize: 15, color: T.heading, background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}`, fontFamily: "'DM Sans', sans-serif" }}
                        >Edit</button>
                        <button
                          onClick={() => handleRemoveClub(club.id)}
                          style={{ display: 'block', width: '100%', padding: '10px 18px', textAlign: 'left', fontSize: 15, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        >Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currently Applying For */}
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: T.heading, marginBottom: 13 }}>Currently Applying For</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {applications.length === 0 ? (
                <div style={{
                  background: T.card, borderRadius: 15, border: `1px solid ${T.border}`,
                  padding: 25, textAlign: 'center',
                }}>
                  <div style={{ color: T.faint, fontSize: 16, marginBottom: 13 }}>No applications yet.</div>
                  <button
                    onClick={() => navigate('/search')}
                    style={{ fontSize: 14, padding: '8px 18px', borderRadius: 10, background: T.accent, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                  >Browse Clubs</button>
                </div>
              ) : applications.map((app) => {
                const meta = STATUS_META[app.status] || STATUS_META['Incomplete'];
                return (
                  <div key={app.id} style={{
                    display: 'flex', alignItems: 'center', gap: 15, padding: '16px 20px',
                    background: T.card, borderRadius: 15, border: `1px solid ${T.border}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{
                      width: 45, height: 45, borderRadius: 11, background: getClubColor(app.clubName || ''),
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {app.clubLogo
                        ? <img src={app.clubLogo} alt={app.clubName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{(app.clubName || '').slice(0, 2).toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={() => navigate(`/club/${app.clubId}`)}
                        style={{ fontSize: 16, fontWeight: 500, color: T.heading, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >{app.clubName}</div>
                      {app.position && (
                        <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                          {app.position}{app.secondRole ? `, ${app.secondRole}` : ''}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 13, padding: '3px 10px', borderRadius: 20,
                      background: meta.bg, color: meta.color,
                      fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: T.heading, marginBottom: 13 }}>Notifications</div>
            <div style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.border}`, padding: '20px 23px' }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: 15, color: T.faint, fontStyle: 'italic' }}>No notifications yet.</div>
              ) : notifications.slice(0, 8).map((n, i, arr) => (
                <div key={n.key} style={{
                  display: 'flex', gap: 13, alignItems: 'flex-start',
                  paddingBottom: i < arr.length - 1 ? 15 : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                  marginBottom: i < arr.length - 1 ? 15 : 0,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 15 }}>{n.message}</div>
                  {n.date && (
                    <span style={{ fontSize: 13, color: T.faint, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, whiteSpace: 'nowrap' }}>{n.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Club Modal ── */}
      {showAddClubModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 30, width: '100%', maxWidth: 525, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 23, color: T.heading }}>Add Club</div>
              <button onClick={() => setShowAddClubModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={23} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 18 }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
              <input
                type="text"
                placeholder="Search for a club..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedClub(null); }}
                style={{ width: '100%', paddingLeft: 40, paddingRight: 15, paddingTop: 10, paddingBottom: 10, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 16, color: T.heading, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {!selectedClub && searchQuery && (
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 18 }}>
                {filteredClubs.map((club) => (
                  <div
                    key={club.id}
                    onClick={() => handleClubSelect(club)}
                    style={{ padding: '13px 15px', border: `1px solid ${T.border}`, borderRadius: 10, cursor: 'pointer', marginBottom: 8 }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.heading }}>{club.name}</div>
                    <div style={{ fontSize: 14, color: T.muted, marginTop: 3 }}>{club.description?.substring(0, 60)}…</div>
                  </div>
                ))}
                {filteredClubs.length === 0 && (
                  <div style={{ textAlign: 'center', color: T.faint, fontSize: 16, padding: '10px 0' }}>No clubs found</div>
                )}
              </div>
            )}

            {selectedClub && (
              <div>
                <div style={{ padding: '13px 15px', background: T.borderLight, borderRadius: 10, marginBottom: 18 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: T.heading }}>{selectedClub.name}</div>
                  <div style={{ fontSize: 14, color: T.muted, marginTop: 3 }}>{selectedClub.description?.substring(0, 80)}…</div>
                </div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontSize: 14, color: T.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Your Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Member, Executive, Developer"
                    value={newClubForm.role}
                    onChange={(e) => setNewClubForm(prev => ({ ...prev, role: e.target.value }))}
                    style={{ width: '100%', padding: '10px 13px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 16, color: T.heading, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, color: T.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Member Since</label>
                  <input
                    type="date"
                    value={newClubForm.joinDate}
                    onChange={(e) => setNewClubForm(prev => ({ ...prev, joinDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 13px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 16, color: T.heading, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 13 }}>
                  <button
                    onClick={handleSubmitClub}
                    disabled={!newClubForm.role || !newClubForm.joinDate}
                    style={{ flex: 1, padding: 11, borderRadius: 10, background: !newClubForm.role || !newClubForm.joinDate ? '#d4c9be' : T.accent, color: '#fff', border: 'none', cursor: !newClubForm.role || !newClubForm.joinDate ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 16 }}
                  >Add Club</button>
                  <button
                    onClick={() => setShowAddClubModal(false)}
                    style={{ padding: '11px 20px', borderRadius: 10, background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 16 }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Club Modal ── */}
      {editingClub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 30, width: '100%', maxWidth: 525, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 23, color: T.heading }}>Edit Club</div>
              <button onClick={handleCancelClubEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={23} />
              </button>
            </div>
            <div style={{ padding: '13px 15px', background: T.borderLight, borderRadius: 10, marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: T.heading }}>{editingClub.name}</div>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 14, color: T.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Your Role</label>
              <input
                type="text"
                placeholder="e.g. Member, Executive, Developer"
                value={newClubForm.role}
                onChange={(e) => setNewClubForm(prev => ({ ...prev, role: e.target.value }))}
                style={{ width: '100%', padding: '10px 13px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 16, color: T.heading, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, color: T.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Member Since</label>
              <input
                type="date"
                value={newClubForm.joinDate}
                onChange={(e) => setNewClubForm(prev => ({ ...prev, joinDate: e.target.value }))}
                style={{ width: '100%', padding: '10px 13px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 16, color: T.heading, outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div style={{ display: 'flex', gap: 13 }}>
              <button
                onClick={handleUpdateClub}
                disabled={!newClubForm.role || !newClubForm.joinDate}
                style={{ flex: 1, padding: 11, borderRadius: 10, background: !newClubForm.role || !newClubForm.joinDate ? '#d4c9be' : T.accent, color: '#fff', border: 'none', cursor: !newClubForm.role || !newClubForm.joinDate ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 16 }}
              >Update Club</button>
              <button
                onClick={handleCancelClubEdit}
                style={{ padding: '11px 20px', borderRadius: 10, background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 16 }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
