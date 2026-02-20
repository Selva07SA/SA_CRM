import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, login as loginRequest } from '../services/crmApi';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'sa_crm_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await getProfile(token);
        setUser(response.data || null);
      } catch (error) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        setUser(null);
      }
    };

    if (token && !user) {
      loadProfile();
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginRequest(email, password);
      const jwt = response?.data?.token || '';
      const employee = response?.data?.employee || null;
      setToken(jwt);
      setUser(employee);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, jwt);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      setUser
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
