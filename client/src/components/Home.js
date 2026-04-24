import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubs, getFavorites, addFavorite, removeFavorite, getApplications } from '../lib/db';

const warm = '#b5451b';

const CLUB_COLORS = ['#8B1A1A','#7B1D1D','#1a3a6e','#1a2a1a','#1565C0','#4a3728','#1a2a3a','#8B0000','#2c3e50','#4a2c6a'];

const getClubColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CLUB_COLORS[Math.abs(hash) % CLUB_COLORS.length];
};

const getClubInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0, 3);

const STATUS_META = {
  'Incomplete': { label: 'Draft',        bg: '#fef3cd', color: '#8a6200' },
  'Submitted':  { label: 'Under Review', bg: '#e8f0fe', color: '#1a56db' },
  'Interview':  { label: 'Interview',    bg: '#e8f5e9', color: '#2e7d32' },
  'Accepted':   { label: 'Accepted',     bg: '#f0ebe3', color: warm },
  'Rejected':   { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchClubs(); }, []);

  useEffect(() => {
    if (!user) return;
    getFavorites(user.id).then(setFavorites).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = () => getApplications(user.id).then(setApplications).catch(console.error);
    load();
    window.addEventListener('applicationSaved', load);
    window.addEventListener('applicationSubmitted', load);
    return () => {
      window.removeEventListener('applicationSaved', load);
      window.removeEventListener('applicationSubmitted', load);
    };
  }, [user]);

  const fetchClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (e) {
      console.error('Error fetching clubs:', e);
    }
  };

  const isClubRecruiting = (club) => {
    if (!club.application_deadline) return false;
    return new Date(club.application_deadline) > new Date();
  };

  const hiringClubs = clubs.filter(isClubRecruiting);
  const carouselCount = Math.min(hiringClubs.length, 4);

  const nextCarousel = () => setCurrentCarouselIndex(prev => (prev + 1) % carouselCount);
  const prevCarousel = () => setCurrentCarouselIndex(prev => (prev - 1 + carouselCount) % carouselCount);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate('/search', { state: { searchTerm: searchTerm.trim() } });
    else navigate('/search');
  };

  const getFirstName = () => (user?.name || 'there').split(' ')[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getClubTags = (club) => {
    let tags = Array.isArray(club.category) ? [...club.category] : club.category ? [club.category] : [];
    if (tags.length < 2) {
      const n = club.name.toLowerCase();
      if ((n.includes('tech') || n.includes('technology')) && !tags.includes('Technology')) tags.push('Technology');
      if ((n.includes('business') || n.includes('consulting') || n.includes('startup')) && !tags.includes('Business')) tags.push('Business');
      if ((n.includes('cultural') || n.includes('vietnamese') || n.includes('arts')) && !tags.includes('Culture')) tags.push('Culture');
      if ((n.includes('engineering') || n.includes('hyperloop') || n.includes('science')) && !tags.includes('Science')) tags.push('Science');
      if ((n.includes('environmental') || n.includes('sustainability')) && !tags.includes('Environment')) tags.push('Environment');
      if ((n.includes('political') || n.includes('politics')) && !tags.includes('Politics')) tags.push('Politics');
      if ((n.includes('media') || n.includes('publications')) && !tags.includes('Media')) tags.push('Media');
    }
    if (tags.length === 0) tags.push('Technology');
    if (tags.length === 1) tags.push('Innovation');
    return tags.slice(0, 2);
  };

  const isFavorite = (clubId) => favorites.some(f => f.id === clubId);

  const handleFavorite = async (club) => {
    if (!user) return;
    if (isFavorite(club.id)) {
      setFavorites(prev => prev.filter(f => f.id !== club.id));
      await removeFavorite(user.id, club.id);
    } else {
      setFavorites(prev => [...prev, club]);
      window.dispatchEvent(new CustomEvent('clubLiked', { detail: { club } }));
      await addFavorite(user.id, club.id);
    }
  };

  const visibleClubs = hiringClubs.slice(currentCarouselIndex, currentCarouselIndex + 3);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: '#2a1f14', fontStyle: 'italic', marginBottom: 4 }}>
            {getGreeting()}, {getFirstName()}
          </div>
          <div style={{ fontSize: 13, color: '#a09180' }}>Discover opportunities and track your applications.</div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleQuickSearch} style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #e8e0d4', borderRadius: 12,
            padding: '10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', maxWidth: 560,
          }}>
            <span style={{ color: '#c4b89e', fontSize: 16 }}>⌕</span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search clubs and organizations…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#4a3728', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
            />
            {searchTerm && (
              <button type="submit" style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 8,
                background: warm, color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
              }}>Go</button>
            )}
          </div>
        </form>

        {/* Recommended / Hiring Now */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14' }}>Accepting Applications</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={prevCarousel}
                disabled={hiringClubs.length <= 3}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #e8e0d4',
                  background: '#fff', cursor: hiringClubs.length > 3 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hiringClubs.length > 3 ? '#4a3728' : '#c4b89e',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              ><ChevronLeft size={15} /></button>
              <button
                onClick={nextCarousel}
                disabled={hiringClubs.length <= 3}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #e8e0d4',
                  background: '#fff', cursor: hiringClubs.length > 3 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hiringClubs.length > 3 ? '#4a3728' : '#c4b89e',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              ><ChevronRight size={15} /></button>
            </div>
          </div>

          {hiringClubs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#c4b49a', fontSize: 13 }}>
              No clubs are currently accepting applications. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {visibleClubs.map(club => {
                const color = getClubColor(club.name);
                const fav = isFavorite(club.id);
                return (
                  <div key={club.id}
                    onClick={() => navigate(`/club/${club.id}`)}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                    style={{
                      background: '#fff', borderRadius: 16, overflow: 'hidden',
                      border: '1px solid #ede8df', cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ height: 110, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {club.logo
                        ? <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>{getClubInitials(club.name)}</span>
                      }
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: warm, color: '#fff', fontSize: 9, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif",
                      }}>Accepting</div>
                      <button
                        onClick={e => { e.stopPropagation(); handleFavorite(club); }}
                        style={{ position: 'absolute', bottom: 8, left: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                      >
                        <Heart size={15} style={{ color: fav ? warm : 'rgba(255,255,255,0.7)', fill: fav ? warm : 'none' }} />
                      </button>
                    </div>
                    <div style={{ padding: '13px 14px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                        {getClubTags(club).map(tag => (
                          <span key={tag} style={{ fontSize: 10, color: '#a0917e', background: '#f5f0e8', padding: '2px 7px', borderRadius: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{tag}</span>
                        ))}
                        <span style={{ fontSize: 10, color: '#c4b89e', marginLeft: 'auto', fontFamily: "'Space Grotesk', sans-serif" }}>{club.member_count || '—'} members</span>
                      </div>
                      <div style={{
                        fontFamily: "'Instrument Serif', serif", fontSize: 14,
                        color: '#2a1f14', lineHeight: 1.4, marginBottom: 12,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{club.name}</div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}`); }}
                        style={{
                          width: '100%', padding: '8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: warm, color: '#fff', border: 'none', cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >Apply Now</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Tracker */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14' }}>Application Tracker</div>
            <button
              onClick={() => navigate('/hiring')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: warm, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8df', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {applications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#c4b49a', marginBottom: 8, fontStyle: 'italic', fontFamily: "'Instrument Serif', serif" }}>No applications yet</div>
                <div style={{ fontSize: 12, color: '#c4b49a' }}>Click Apply on any club page to get started.</div>
              </div>
            ) : (
              <div>
                {applications.slice(0, 3).map((app, i, arr) => {
                  const meta = STATUS_META[app.status] || STATUS_META['Incomplete'];
                  const color = getClubColor(app.clubName || '');
                  return (
                    <div
                      key={app.id}
                      onClick={() => navigate('/hiring')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 18px', cursor: 'pointer',
                        borderBottom: i < arr.length - 1 ? '1px solid #f0ebe3' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#faf7f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, background: color,
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {app.clubLogo
                          ? <img src={app.clubLogo} alt={app.clubName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{(app.clubName || '').slice(0, 2).toUpperCase()}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#2a1f14', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.clubName}</div>
                        {app.position && <div style={{ fontSize: 11, color: '#a09180', marginTop: 1 }}>{app.position}</div>}
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: meta.bg, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.label}</span>
                      {app.dateSubmitted && <span style={{ fontSize: 11, color: '#c4b49a', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>{app.dateSubmitted}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14', marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: '🧭', label: 'Explore Clubs', desc: 'Browse all clubs and discover new opportunities', path: '/search' },
              { icon: '♡', label: 'Liked Clubs', desc: "View and revisit clubs you've saved", path: '/favorites' },
              { icon: '✓', label: 'Applications', desc: 'Track your progress and upcoming deadlines', path: '/hiring' },
            ].map(({ icon, label, desc, path }) => (
              <div
                key={path}
                onClick={() => navigate(path)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
                style={{
                  background: '#fff', borderRadius: 14, padding: '20px 18px',
                  border: '1px solid #ede8df', cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 12,
                }}>{icon}</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: '#2a1f14', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#a09180', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
