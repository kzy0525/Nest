import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Users, TrendingUp, Globe, Instagram, Mail, ArrowLeft, X, Plus, Minus, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubById, getReviews, addReview, isFavorited, addFavorite, removeFavorite } from '../lib/db';

const warm = '#b5451b';

const card = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #ede8df',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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

// ── Rating Form ───────────────────────────────────────────────
const RatingForm = ({ clubId, onRatingAdded, existingReviews, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [clubPosition, setClubPosition] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const alreadyReviewed = existingReviews.some(
    r => r.student_name.toLowerCase() === studentName.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !studentName || !reviewText) { setError('Please fill in all required fields.'); return; }
    if (alreadyReviewed) { setError('You have already reviewed this club.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const result = await addReview({ clubId, studentName, clubPosition, rating, reviewText });
      if (result.id) {
        setSubmitted(true);
        onRatingAdded();
        setTimeout(() => {
          onClose?.();
          setRating(0); setStudentName(''); setClubPosition(''); setReviewText(''); setSubmitted(false);
        }, 2000);
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>YOUR NAME *</label>
        <input value={studentName} onChange={e => setStudentName(e.target.value)} style={inputStyle} placeholder="Enter your name" />
        {studentName && alreadyReviewed && (
          <div style={{ marginTop: 7, padding: '8px 12px', background: '#fdf3ed', borderRadius: 8, border: '1px solid #f0c9b8', fontSize: 12, color: '#7a3318', fontFamily: "'DM Sans', sans-serif" }}>
            You've already reviewed this club.
          </div>
        )}
      </div>
      <div>
        <label style={labelStyle}>YOUR POSITION (OPTIONAL)</label>
        <input value={clubPosition} onChange={e => setClubPosition(e.target.value)} style={inputStyle} placeholder="e.g. Member, Executive" />
      </div>
      <div>
        <label style={labelStyle}>RATING *</label>
        <div style={{ display: 'flex', gap: 5 }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
              <Star size={22} style={{ color: s <= (hovered || rating) ? '#f59e0b' : '#e0d8cc', fill: s <= (hovered || rating) ? '#f59e0b' : 'none', transition: 'all .1s' }} />
            </button>
          ))}
        </div>
        {rating > 0 && <div style={{ fontSize: 11, color: '#a09180', marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>{rating} star{rating > 1 ? 's' : ''}</div>}
      </div>
      <div>
        <label style={labelStyle}>YOUR REVIEW *</label>
        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Share your experience…" />
      </div>
      {error && <div style={{ fontSize: 12, color: warm, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
      {submitted && (
        <div style={{ padding: '9px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534', fontFamily: "'DM Sans', sans-serif" }}>
          Rating submitted successfully!
        </div>
      )}
      <button type="submit" disabled={submitting || !rating || !studentName || submitted}
        style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: (submitting || !rating || !studentName || submitted) ? 0.5 : 1 }}>
        {submitting ? 'Submitting…' : submitted ? 'Submitted!' : 'Submit Rating'}
      </button>
    </form>
  );
};

// ── Main component ────────────────────────────────────────────
const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    getClubById(id).then(setClub).catch(console.error).finally(() => setLoading(false));
    getReviews(id).then(setReviews).catch(console.error);
    if (user) isFavorited(user.id, id).then(setFavorited).catch(console.error);
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) return;
    if (favorited) {
      setFavorited(false);
      await removeFavorite(user.id, id);
    } else {
      setFavorited(true);
      window.dispatchEvent(new CustomEvent('clubLiked', { detail: { club } }));
      await addFavorite(user.id, id);
    }
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
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
      <div style={{ fontSize: 14, color: warm, fontFamily: "'DM Sans', sans-serif" }}>Club not found</div>
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
  const maxDist = Math.max(...Object.values(dist), 1);

  let positions = [];
  try { positions = Array.isArray(club.open_positions) ? club.open_positions : JSON.parse(club.open_positions || '[]'); } catch {}

  const timeline = [
    { date: club.applications_open,    label: 'Applications Open',  color: '#4ade80' },
    { date: club.application_deadline, label: 'Applications Close', color: warm },
    { date: club.interview_start_date, label: 'Interviews Begin',   color: '#f59e0b' },
    { date: club.interview_end_date,   label: 'Interviews End',     color: '#f59e0b' },
    { date: club.results_released,     label: 'Results Released',   color: '#60a5fa' },
  ].filter(e => e.date);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Club profile card */}
            <div style={card}>
              {/* Backdrop */}
              <div style={{ height: 150, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                {club.backdrop
                  ? <img src={club.backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8dfd4, #d4c8b8)' }} />}
                <button onClick={handleFavorite} style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.88)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                  <Heart size={15} style={{ color: favorited ? warm : '#a09180', fill: favorited ? warm : 'none' }} />
                </button>
              </div>

              <div style={{ padding: '0 28px 28px', position: 'relative' }}>
                {/* Logo — position relative + zIndex so it sits in front of backdrop */}
                <div style={{ marginTop: -54, marginBottom: 14, position: 'relative', zIndex: 1 }}>
                  {club.logo
                    ? <img src={club.logo} alt={club.name} style={{ width: 108, height: 108, borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
                    : <div style={{ width: 108, height: 108, borderRadius: '50%', border: '3px solid #fff', background: warm, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: '#fff' }}>
                          {club.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                        </span>
                      </div>}
                </div>

                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#2a1f14', marginBottom: 4 }}>{club.name}</div>
                {club.slogan && <div style={{ fontSize: 14, color: '#a09180', marginBottom: 16, fontStyle: 'italic' }}>{club.slogan}</div>}

                {/* Stats */}
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

                {club.description && (
                  <p style={{ fontSize: 14, color: '#4a3728', lineHeight: 1.75, marginBottom: 20, margin: '0 0 20px' }}>{club.description}</p>
                )}

                {club.application_deadline && new Date(club.application_deadline) > new Date() && (
                  <button
                    onClick={() => navigate(`/club/${club.id}/apply`)}
                    style={{ padding: '10px 24px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                    Apply Now
                  </button>
                )}
              </div>
            </div>

            {/* Rating form */}
            {showRatingForm && (
              <div style={{ ...card, padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14' }}>Add Your Rating</div>
                  <button onClick={() => setShowRatingForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', padding: 0, display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
                <RatingForm
                  clubId={club.id}
                  onRatingAdded={() => getReviews(id).then(setReviews).catch(console.error)}
                  existingReviews={reviews}
                  onClose={() => setShowRatingForm(false)}
                />
              </div>
            )}

            {/* Reviews & Ratings */}
            <div style={{ ...card, padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: '#2a1f14' }}>Reviews & Ratings</div>
                {user?.user_type !== 'club' && (
                  <button
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, background: showRatingForm ? '#fdf3ed' : '#faf7f2', border: `1px solid ${showRatingForm ? '#f0c9b8' : '#e0d8cc'}`, color: showRatingForm ? warm : '#a09180', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {showRatingForm ? <Minus size={11} /> : <Plus size={11} />}
                    {showRatingForm ? 'Close' : 'Write a Review'}
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div style={{ fontSize: 13, color: '#a09180', fontStyle: 'italic' }}>No reviews yet{user?.user_type !== 'club' ? ' — be the first!' : '.'}</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {/* Overall score + distribution */}
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

                  {/* Individual reviews */}
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
            </div>

            {/* Open Positions */}
            {positions.length > 0 && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 14 }}>Open Positions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {positions.map((pos, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#faf7f2', borderRadius: 8, border: '1px solid #f0ebe3' }}>
                      <span style={{ fontSize: 13, color: '#2a1f14', fontWeight: 500 }}>
                        {typeof pos === 'object' ? pos.title : pos}
                      </span>
                      {typeof pos === 'object' && pos.spots != null && (
                        <span style={{ fontSize: 11, color: '#a09180', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {pos.spots} spot{pos.spots !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hiring Package */}
            {club.hiring_package && (
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
            {timeline.length > 0 && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: '#2a1f14', marginBottom: 18 }}>Hiring Timeline</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {timeline.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < timeline.length - 1 ? 18 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0, marginTop: 3 }} />
                        {i < timeline.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: '#e8e0d4', marginTop: 4 }} />
                        )}
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
              </div>
            )}

            {/* Edit Profile button — club owners only */}
            {user?.user_type === 'club' && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <button
                  onClick={() => navigate('/club/register')}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: warm, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Edit Club Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
