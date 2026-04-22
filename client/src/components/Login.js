import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const accent = '#b5451b';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        if (response.data.user.role === 'admin') navigate('/admin');
        else if (response.data.user.user_type === 'club') navigate('/club/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            fontFamily: "'Instrument Serif', serif", fontSize: 56, color: '#2a1f14',
            lineHeight: 1, letterSpacing: '-1px', fontStyle: 'italic'
          }}>nest</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#a09180',
            marginTop: 10, lineHeight: 1.6, maxWidth: 260
          }}>All your campus opportunities,<br/>in one place</div>
        </div>

        {/* Footer rule */}
        <div style={{
          position: 'absolute', bottom: 48, left: 48, right: 48,
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 2
        }}>
          <div style={{ height: 1, flex: 1, background: 'rgba(181,69,27,0.2)' }}/>
          <span style={{
            fontSize: 10, color: '#b8a090',
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.1em'
          }}>QUEEN'S UNIVERSITY</span>
          <div style={{ height: 1, flex: 1, background: 'rgba(181,69,27,0.2)' }}/>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 380, flexShrink: 0,
        background: '#faf7f2',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
        borderLeft: '1px solid #e8e0d4'
      }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: '#2a1f14', marginBottom: 5 }}>
          Welcome back
        </div>
        <div style={{ fontSize: 13, color: '#a09180', marginBottom: 28 }}>
          Sign in to continue to nest
        </div>

        {error && (
          <div style={{
            background: 'rgba(181,69,27,0.08)', border: '1px solid rgba(181,69,27,0.25)',
            color: accent, padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18
          }}>{error}</div>
        )}

        {/* Role toggle */}
        <div style={{ marginBottom: 22 }}>
          <div style={labelStyle}>I AM A</div>
          <div style={{ display: 'flex', background: '#f0ebe3', borderRadius: 10, padding: 3, border: '1px solid #e0d8cc' }}>
            {['Student', 'Club'].map(r => (
              <button key={r} onClick={() => setUserType(r.toLowerCase())} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: userType === r.toLowerCase() ? '#fff' : 'transparent',
                color: userType === r.toLowerCase() ? '#2a1f14' : '#a09180',
                fontWeight: userType === r.toLowerCase() ? 600 : 400,
                fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: userType === r.toLowerCase() ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all .15s'
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>EMAIL</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email" style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>PASSWORD</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password" style={inputStyle}
          />
        </div>

        {/* Remember / Forgot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a09180', cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: accent }}/>
            Remember me
          </label>
          <span style={{ fontSize: 12, color: accent, cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
        </div>

        {/* Sign in */}
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
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        {/* Register */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#b8a898' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: accent, fontWeight: 500, textDecoration: 'none' }}>Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
