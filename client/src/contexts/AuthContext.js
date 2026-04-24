import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { getProfile } from '../lib/db';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        enrichUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        enrichUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const enrichUser = async (authUser) => {
    try {
      const profile = await getProfile(authUser.id);
      setUser({ ...authUser, ...profile });
    } catch {
      // Profile may not exist yet immediately after signup — retry once
      setTimeout(async () => {
        try {
          const profile = await getProfile(authUser.id);
          setUser({ ...authUser, ...profile });
        } catch {
          setUser(authUser);
        }
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await getProfile(data.user.id);
    const enriched = { ...data.user, ...profile };
    setUser(enriched);
    return enriched;
  };

  const register = async ({ name, email, password, school, user_type }) => {
    const role = user_type === 'club' ? 'club' : 'student';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, school, role, user_type } },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const profile = await getProfile(user.id);
    setUser(prev => ({ ...prev, ...profile }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
