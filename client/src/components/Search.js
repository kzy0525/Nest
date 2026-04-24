import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubs, getFavorites, addFavorite, removeFavorite } from '../lib/db';

const warm = '#b5451b';

const CLUB_COLORS = ['#8B1A1A','#7B1D1D','#1a3a6e','#1a2a1a','#1565C0','#4a3728','#1a2a3a','#8B0000','#2c3e50','#4a2c6a'];

const getClubColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CLUB_COLORS[Math.abs(hash) % CLUB_COLORS.length];
};

const getClubInitials = (name) => name.split(' ').map(w => w[0]).join('').substring(0, 3);

const CATEGORIES = ['All','Academic','Arts','Business','Culture','Community','Sports','Health','Environment','Innovation','Science','Technology','Politics','Media','Social'];

const SearchPage = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    hiringNow: false, ratingRange: '', memberCountRange: '', acceptanceRateRange: ''
  });
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => { fetchClubs(); }, []);
  useEffect(() => { if (user) loadFavorites(); }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden) fetchClubs(); };
    const handleFocus = () => fetchClubs();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (location.state?.searchTerm) setSearchTerm(location.state.searchTerm);
    fetchClubs();
  }, [location.pathname]);

  useEffect(() => { filterClubs(); }, [clubs, selectedCategories, searchTerm, sortBy, selectedFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setShowSortDropdown(false);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setShowFilterDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favClubs = await getFavorites(user.id);
      setFavorites(favClubs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterClubs = () => {
    let filtered = [...clubs];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(club => {
        if (Array.isArray(club.category))
          return club.category.some(cat => cat && selectedCategories.some(s => cat.toLowerCase() === s.toLowerCase()));
        return club.category && selectedCategories.some(s => club.category.toLowerCase() === s.toLowerCase());
      });
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(club => {
        const catText = Array.isArray(club.category) ? club.category.join(' ') : (club.category || '');
        return club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               catText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (selectedFilters.hiringNow) {
      filtered = filtered.filter(club => {
        if (!club.application_deadline) return false;
        return new Date(club.application_deadline) > new Date();
      });
    }
    if (selectedFilters.ratingRange) {
      const [min, max] = selectedFilters.ratingRange.split('-').map(Number);
      filtered = filtered.filter(club => { const r = club.rating || 0; return r >= min && r <= max; });
    }
    if (selectedFilters.memberCountRange) {
      const [min, max] = selectedFilters.memberCountRange.split('-').map(Number);
      filtered = filtered.filter(club => { const m = club.member_count || 0; return m >= min && m <= max; });
    }
    if (selectedFilters.acceptanceRateRange) {
      const [min, max] = selectedFilters.acceptanceRateRange.split('-').map(Number);
      filtered = filtered.filter(club => { const r = club.acceptance_rate || 100; return r >= min && r <= max; });
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating-high-low': return (b.rating || 0) - (a.rating || 0);
        case 'rating-low-high': return (a.rating || 0) - (b.rating || 0);
        case 'members-high-low': return (b.member_count || 0) - (a.member_count || 0);
        case 'members-low-high': return (a.member_count || 0) - (b.member_count || 0);
        case 'name-z-a': return b.name.localeCompare(a.name);
        default: return a.name.localeCompare(b.name);
      }
    });
    setFilteredClubs(filtered);
  };

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

  const isFavorite = (clubId) => favorites.some(f => f.id === clubId);

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

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating-high-low': return 'Rating ↓';
      case 'rating-low-high': return 'Rating ↑';
      case 'members-high-low': return 'Members ↓';
      case 'members-low-high': return 'Members ↑';
      case 'name-z-a': return 'Name Z–A';
      default: return '↕ Sort';
    }
  };

  const getActiveFiltersCount = () => {
    let c = 0;
    if (selectedFilters.hiringNow) c++;
    if (selectedFilters.ratingRange) c++;
    if (selectedFilters.memberCountRange) c++;
    if (selectedFilters.acceptanceRateRange) c++;
    return c;
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const ctrlBtnStyle = {
    background: '#fff', border: '1px solid #e8e0d4', color: '#a0917e',
    fontSize: 12, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
        <div style={{ fontSize: 14, color: '#a09180', fontFamily: "'DM Sans', sans-serif" }}>Loading clubs…</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div style={{ padding: '20px 26px 0', flexShrink: 0 }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 700, color: '#2a1f14' }}>
            Discover your community
          </span>
        </div>

        {/* Search + Sort + Filter */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #e8e0d4', borderRadius: 12,
            padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <span style={{ color: '#c4b89e', fontSize: 14 }}>⌕</span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search clubs and organizations…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#4a3728', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }} ref={sortDropdownRef}>
            <button style={ctrlBtnStyle} onClick={() => setShowSortDropdown(v => !v)}>
              {getSortLabel()}
            </button>
            {showSortDropdown && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 200,
                background: '#fff', border: '1px solid #e8e0d4', borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)', zIndex: 20, overflow: 'hidden'
              }}>
                {[
                  ['rating-high-low','Rating: High to Low'],['rating-low-high','Rating: Low to High'],
                  ['members-high-low','Members: High to Low'],['members-low-high','Members: Low to High'],
                  ['name-asc','Name: A to Z'],['name-z-a','Name: Z to A']
                ].map(([val, label]) => (
                  <button key={val} onClick={() => { setSortBy(val); setShowSortDropdown(false); }} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                    border: 'none', background: sortBy === val ? '#faf7f2' : '#fff',
                    color: sortBy === val ? warm : '#4a3728',
                    fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    fontWeight: sortBy === val ? 600 : 400
                  }}>{label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Filter dropdown */}
          <div style={{ position: 'relative' }} ref={filterDropdownRef}>
            <button style={ctrlBtnStyle} onClick={() => setShowFilterDropdown(v => !v)}>
              ⋮ Filter
              {getActiveFiltersCount() > 0 && (
                <span style={{ background: warm, color: '#fff', fontSize: 10, borderRadius: 20, padding: '1px 6px', marginLeft: 4 }}>
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 260,
                background: '#fff', border: '1px solid #e8e0d4', borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)', zIndex: 20, padding: 16
              }}>
                <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 12 }}>FILTERS</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a3728', marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedFilters.hiringNow} onChange={() => setSelectedFilters(p => ({ ...p, hiringNow: !p.hiringNow }))} style={{ accentColor: warm }}/>
                  Accepting applications
                </label>
                {[
                  { key: 'ratingRange', label: 'Rating', opts: [['','Any'],['0-1','0–1'],['1-2','1–2'],['2-3','2–3'],['3-4','3–4'],['4-5','4–5']] },
                  { key: 'memberCountRange', label: 'Members', opts: [['','Any'],['0-25','0–25'],['26-50','26–50'],['51-100','51–100'],['101-1000','100+']] },
                  { key: 'acceptanceRateRange', label: 'Acceptance rate', opts: [['','Any'],['1-25','1–25%'],['26-50','26–50%'],['51-75','51–75%'],['76-100','76–100%']] },
                ].map(({ key, label, opts }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: 6 }}>{label.toUpperCase()}</div>
                    <select value={selectedFilters[key]} onChange={e => setSelectedFilters(p => ({ ...p, [key]: e.target.value }))} style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e0d8cc',
                      background: '#faf7f2', color: '#4a3728', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none'
                    }}>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                {getActiveFiltersCount() > 0 && (
                  <button onClick={() => setSelectedFilters({ hiringNow: false, ratingRange: '', memberCountRange: '', acceptanceRateRange: '' })}
                    style={{ fontSize: 12, color: warm, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding: '14px 26px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const active = cat === 'All' ? selectedCategories.length === 0 : selectedCategories.includes(cat);
            return (
              <button key={cat} onClick={() => { if (cat === 'All') setSelectedCategories([]); else handleCategoryToggle(cat); }} style={{
                fontSize: 11, padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
                background: active ? warm : '#fff',
                color: active ? '#fff' : '#a0917e',
                border: active ? 'none' : '1px solid #e8e0d4',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s'
              }}>{cat}</button>
            );
          })}
        </div>
      </div>

      {/* Club grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 26px' }}>
        {filteredClubs.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 14, color: '#a09180' }}>No clubs found. Try adjusting your search or filters.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {filteredClubs.map(club => {
              const recruiting = isClubRecruiting(club);
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
                    transition: 'all 0.2s'
                  }}>

                  {/* Image area */}
                  <div style={{ height: 110, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>
                        {getClubInitials(club.name)}
                      </span>
                    )}
                    {recruiting && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: warm, color: '#fff', fontSize: 9, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif"
                      }}>Accepting</div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleFavorite(club); }}
                      style={{
                        position: 'absolute', bottom: 8, left: 10,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1
                      }}>
                      <Heart size={15} style={{ color: fav ? warm : 'rgba(255,255,255,0.7)', fill: fav ? warm : 'none' }}/>
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '13px 14px 14px' }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                      {getClubTags(club).map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, color: '#a0917e', background: '#f5f0e8',
                          padding: '2px 7px', borderRadius: 4,
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}>{tag}</span>
                      ))}
                      <span style={{ fontSize: 10, color: '#c4b89e', marginLeft: 'auto', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {club.member_count || '—'} members
                      </span>
                    </div>

                    <div style={{
                      fontFamily: "'Instrument Serif', serif", fontSize: 14,
                      color: '#2a1f14', lineHeight: 1.4, marginBottom: 12,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>{club.name}</div>

                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}`); }}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: recruiting ? warm : 'transparent',
                        color: recruiting ? '#fff' : '#c4b89e',
                        border: recruiting ? 'none' : '1px solid #e8e0d4',
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                      }}>
                      {recruiting ? 'Apply Now' : 'Recruiting Closed'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
