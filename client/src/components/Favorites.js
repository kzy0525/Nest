import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, removeFavorite } from '../lib/db';

const warm = '#b5451b';

const CLUB_COLORS = ['#8B1A1A','#7B1D1D','#1a3a6e','#1a2a1a','#1565C0','#4a3728','#1a2a3a','#8B0000','#2c3e50','#4a2c6a'];

const getClubColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CLUB_COLORS[Math.abs(hash) % CLUB_COLORS.length];
};

const getClubInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0, 3);

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    getFavorites(user.id).then(setFavorites).catch(console.error);
  }, [user]);

  const handleUnlike = async (clubId) => {
    if (!user) return;
    setFavorites(prev => prev.filter(c => c.id !== clubId));
    await removeFavorite(user.id, clubId);
  };

  const isClubRecruiting = (club) => {
    if (!club.application_deadline) return false;
    return new Date(club.application_deadline) > new Date();
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

  if (favorites.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ padding: '20px 26px 0', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 700, color: '#2a1f14' }}>
            Liked Clubs
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <Heart size={48} style={{ color: '#e8e0d4' }} />
          <div style={{ fontSize: 16, color: '#a09180', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>No liked clubs yet</div>
          <div style={{ fontSize: 13, color: '#c4b49a', fontFamily: "'DM Sans', sans-serif" }}>Explore clubs and tap the heart to save them here.</div>
          <button
            onClick={() => navigate('/search')}
            style={{
              marginTop: 8, fontSize: 12, padding: '9px 20px', borderRadius: 10,
              background: warm, color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}
          >
            Explore Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '20px 26px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 700, color: '#2a1f14' }}>
            Liked Clubs
          </span>
          <span style={{ fontSize: 12, color: '#c4b49a', fontFamily: "'Space Grotesk', sans-serif" }}>
            {favorites.length} saved
          </span>
        </div>
      </div>

      {/* Club grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 26px 26px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {favorites.map(club => {
            const recruiting = isClubRecruiting(club);
            const color = getClubColor(club.name);
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

                {/* Image area */}
                <div style={{ height: 143, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>
                      {getClubInitials(club.name)}
                    </span>
                  )}
                  {recruiting && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: warm, color: '#fff', fontSize: 9, fontWeight: 600,
                      padding: '3px 8px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif",
                    }}>Accepting</div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleUnlike(club.id); }}
                    style={{ position: 'absolute', bottom: 8, left: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >
                    <Heart size={15} style={{ color: warm, fill: warm }} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '13px 14px 14px' }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                    {getClubTags(club).map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, color: '#a0917e', background: '#f5f0e8',
                        padding: '2px 7px', borderRadius: 4,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>{tag}</span>
                    ))}
                    <span style={{ fontSize: 10, color: '#c4b89e', marginLeft: 'auto', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {club.member_count || '—'} members
                    </span>
                  </div>

                  <div style={{
                    fontFamily: "'Instrument Serif', serif", fontSize: 21,
                    color: '#2a1f14', lineHeight: 1.4, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{club.name}</div>

                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}`); }}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: recruiting ? warm : 'transparent',
                      color: recruiting ? '#fff' : '#c4b89e',
                      border: recruiting ? 'none' : '1px solid #e8e0d4',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {recruiting ? 'Apply Now' : 'Recruiting Closed'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
