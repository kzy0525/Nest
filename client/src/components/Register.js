import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const accent = '#b5451b';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', school: '', user_type: 'student'
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.school) {
      setError('Please fill in all required fields'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long'); return;
    }
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions'); return;
    }
    setIsLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, school: formData.school, user_type: formData.user_type });
      setSuccess(true);
      setTimeout(() => navigate(formData.user_type === 'club' ? '/club/dashboard' : '/'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1px solid #e0d8cc', background: '#fff',
    color: '#2a1f14', fontSize: 13, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  };

  const labelStyle = {
    fontSize: 10, color: '#a09180', marginBottom: 6,
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em',
    display: 'block'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left panel */}
      <div style={{
        flex: 1, background: '#f2ebe0',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden', padding: 48
      }}>
        {/* Radial arcs */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
          viewBox="0 0 620 600" preserveAspectRatio="xMidYMid slice">
          <circle cx="310" cy="600" r="420" fill="none" stroke="#b5451b" strokeWidth="1.5"/>
          <circle cx="310" cy="600" r="340" fill="none" stroke="#b5451b" strokeWidth="1"/>
          <circle cx="310" cy="600" r="260" fill="none" stroke="#7a4a2a" strokeWidth="0.8"/>
          <circle cx="310" cy="600" r="180" fill="none" stroke="#7a4a2a" strokeWidth="0.8"/>
          <circle cx="310" cy="600" r="100" fill="none" stroke="#b5451b" strokeWidth="1"/>
          <line x1="310" y1="0" x2="310" y2="600" stroke="#b5451b" strokeWidth="0.6" opacity="0.5"/>
          <line x1="-100" y1="350" x2="720" y2="350" stroke="#7a4a2a" strokeWidth="0.4" opacity="0.5"/>
        </svg>

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 55% 55% at 50% 48%, #f2ebe0 30%, rgba(242,235,224,0.3) 80%, transparent 100%)'
        }}/>

        {/* Logotype + tagline */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 112, color: '#2a1f14',
            lineHeight: 1, letterSpacing: '-1px', fontStyle: 'italic'
          }}>nest</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#a09180',
            marginTop: 10, lineHeight: 1.6, maxWidth: 260
          }}>All your campus opportunities,<br/>in one place</div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: '0 0 33.333%', flexShrink: 0,
        background: '#faf7f2',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px', overflowY: 'auto',
        borderLeft: '1px solid #e8e0d4'
      }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: '#2a1f14', marginBottom: 6 }}>
          Create account
        </div>
        <div style={{ fontSize: 14, color: '#a09180', marginBottom: 28 }}>
          Join nest to discover campus clubs
        </div>

        {success && (
          <div style={{
            background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.25)',
            color: '#2e7d32', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18
          }}>Account created! Redirecting…</div>
        )}

        {error && (
          <div style={{
            background: 'rgba(181,69,27,0.08)', border: '1px solid rgba(181,69,27,0.25)',
            color: accent, padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18
          }}>{error}</div>
        )}

        {/* Role toggle */}
        <div style={{ marginBottom: 18 }}>
          <div style={labelStyle}>I AM A</div>
          <div style={{ display: 'flex', background: '#f0ebe3', borderRadius: 10, padding: 3, border: '1px solid #e0d8cc' }}>
            {['Student', 'Club'].map(r => (
              <button key={r} type="button" onClick={() => setFormData(p => ({ ...p, user_type: r.toLowerCase() }))} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: formData.user_type === r.toLowerCase() ? '#fff' : 'transparent',
                color: formData.user_type === r.toLowerCase() ? '#2a1f14' : '#a09180',
                fontWeight: formData.user_type === r.toLowerCase() ? 600 : 400,
                fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: formData.user_type === r.toLowerCase() ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all .15s'
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{formData.user_type === 'club' ? 'CLUB NAME' : 'FULL NAME'}</label>
          <input
            type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder={formData.user_type === 'club' ? 'Your club name' : 'Your full name'}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>EMAIL</label>
          <input
            type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="your.email@queensu.ca" style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
              placeholder="At least 6 characters" style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', padding: 0, display: 'flex' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>CONFIRM PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder="Repeat your password" style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a09180', padding: 0, display: 'flex' }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* School */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>SCHOOL</label>
          <input
            type="text" name="school" value={formData.school} onChange={handleChange}
            placeholder="e.g., Queen's University" style={inputStyle}
          />
        </div>

        {/* Terms */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <input
            type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)}
            style={{ accentColor: accent, width: 14, height: 14, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#a09180' }}>
            I agree to the{' '}
            <span style={{ color: accent, cursor: 'pointer', fontWeight: 500 }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: accent, cursor: 'pointer', fontWeight: 500 }}>Privacy Policy</span>
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit} disabled={isLoading}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: accent, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 16px rgba(181,69,27,0.28)',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>

        {/* Login link */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#b8a898' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: accent, fontWeight: 500, textDecoration: 'none' }}>Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
