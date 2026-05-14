import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { STORAGE_KEY, getApiError } from '../api/client';
import { getAvatarUrlFromUploadResponse, normalizeUser } from '../utils/avatar';

const AuthContext = createContext(null);

function readStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }
  try {
    const stored = JSON.parse(raw);
    return {
      token: stored?.token || null,
      user: normalizeUser(stored?.user),
    };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading, setLoading] = useState(() => Boolean(readStoredAuth().token));
  const authRef = useRef(auth);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  const persistAuth = useCallback((value) => {
    const nextAuth = {
      token: value?.token || null,
      user: normalizeUser(value?.user),
    };

    setAuth(nextAuth);
    if (nextAuth.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
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
  }, [auth.token, persistAuth]);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    const nextAuth = { token: data?.token || null, user: normalizeUser(data?.user) };
    persistAuth(nextAuth);
    return nextAuth;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    const nextAuth = { token: data?.token || null, user: normalizeUser(data?.user) };
    persistAuth(nextAuth);
    return nextAuth;
  }, [persistAuth]);

  const refreshProfile = useCallback(async () => {
    if (!auth.token) {
      return null;
    }
    const user = await authApi.me();
    const normalizedUser = normalizeUser(user);
    persistAuth({ token: auth.token, user: normalizedUser });
    return normalizedUser;
  }, [auth.token, persistAuth]);

  const updateProfile = useCallback(async (payload) => {
    const user = await authApi.updateProfile(payload);
    const normalizedUser = normalizeUser(user);
    persistAuth({ token: auth.token, user: normalizedUser });
    return normalizedUser;
  }, [auth.token, persistAuth]);

  const uploadAvatar = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await authApi.uploadAvatar(formData);

    const avatarUrl = getAvatarUrlFromUploadResponse(result);
    const currentAuth = authRef.current;
    const updatedUser = normalizeUser({
      ...(currentAuth.user || {}),
      avatarUrl: avatarUrl || currentAuth.user?.avatarUrl || '',
      avatarUpdatedAt: Date.now(),
    });

    persistAuth({ token: currentAuth.token, user: updatedUser });
    return updatedUser;
  }, [persistAuth]);

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
    uploadAvatar,
    getApiError,
  }), [auth.token, auth.user, loading, login, register, logout, refreshProfile, updateProfile, uploadAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
