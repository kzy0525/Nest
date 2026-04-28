import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Heart, Edit, Plus, Users, LogOut, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  let navItems = [];
  if (user?.role === 'admin') {
    navItems = [
      { path: '/admin', icon: Home, label: 'Admin Dashboard' },
      { path: '/register-club', icon: Plus, label: 'Register Club' }
    ];
  } else if (user?.user_type === 'club') {
    navItems = [
      { path: '/club/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/search', icon: Compass, label: 'Browse Clubs' },
      { path: '/club/analytics', icon: Users, label: 'Analytics' },
      { path: '/club/profile', icon: Building2, label: 'Club Profile' }
    ];
  } else {
    navItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/search', icon: Compass, label: 'Search' },
      { path: '/favorites', icon: Heart, label: 'Favorites' },
      { path: '/hiring', icon: Edit, label: 'Hiring Dashboard' },
      { path: '/profile', icon: User, label: 'Profile' }
    ];
  }

  return (
    <div style={{
      width: 70, flexShrink: 0,
      background: '#f3ede3',
      borderRight: '1px solid #e8e0d4',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      height: '100vh', position: 'relative',
      paddingTop: 42, paddingBottom: 20, boxSizing: 'border-box',
    }}>
      {/* Logo — top */}
      <img
        src="/favicon.ico"
        alt="logo"
        style={{ width: 45, height: 45, objectFit: 'contain', flexShrink: 0 }}
      />

      {/* Nav icons — vertically centred */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <div
              key={item.path}
              title={item.label}
              onClick={() => navigate(item.path)}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#b5451b'; e.currentTarget.style.background = '#ede8df'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#c4b89e'; e.currentTarget.style.background = 'transparent'; } }}
              style={{
                width: 54, height: 54, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#ede8df' : 'transparent',
                color: active ? '#b5451b' : '#c4b89e',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <item.icon size={27}/>
            </div>
          );
        })}
      </div>

      {/* Logout — bottom */}
      {user?.role !== 'admin' && (
        <div
          title="Logout"
          onClick={handleLogout}
          style={{
            width: 54, height: 54, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c4b89e', cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#b5451b'; e.currentTarget.style.background = '#ede8df'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#c4b89e'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={27}/>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
