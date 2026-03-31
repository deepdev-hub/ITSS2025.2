import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { STORAGE_KEY, getApiError } from '../api/client';

const AuthContext = createContext(null);

function readStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading, setLoading] = useState(Boolean(readStoredAuth().token));

  const persistAuth = useCallback((value) => {
    setAuth(value);
    if (value?.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!auth.token) {
        setLoading(false);
        return;
      }
      try {
        const user = await authApi.me();
        persistAuth({ token: auth.token, user });
      } catch {
        persistAuth({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    persistAuth(data);
    return data;
  }, [persistAuth]);

  const refreshProfile = useCallback(async () => {
    if (!auth.token) {
      return null;
    }
    const user = await authApi.me();
    persistAuth({ token: auth.token, user });
    return user;
  }, [auth.token, persistAuth]);

  const updateProfile = useCallback(async (payload) => {
    const user = await authApi.updateProfile(payload);
    persistAuth({ token: auth.token, user });
    return user;
  }, [auth.token, persistAuth]);

  const logout = useCallback(() => {
    persistAuth({ token: null, user: null });
  }, [persistAuth]);

  const value = useMemo(() => ({
    token: auth.token,
    user: auth.user,
    isAuthenticated: Boolean(auth.token && auth.user),
    loading,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    getApiError,
  }), [auth.token, auth.user, loading, login, register, logout, refreshProfile, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
