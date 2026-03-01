import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { User } from '../types';
import { apiFetch, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string, role?: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (file: File) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      authStorage.clearUser();
      setUser(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    apiFetch<{ user: User }>('/auth/me')
      .then((data) => {
        if (!mounted) return;
        setUser(data.user);
        authStorage.setUser(data.user);
      })
      .catch(() => {
        authStorage.clearToken();
        authStorage.clearUser();
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: string = 'mother',
    inviteCode?: string
  ) => {
    const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, role, inviteCode })
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authStorage.clearToken();
    authStorage.clearUser();
  }, []);

  const updateAvatar = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const data = await apiFetch<{ user: User }>('/profile/avatar', {
      method: 'PUT',
      body: formData
    });
    authStorage.setUser(data.user);
    setUser(data.user);
  }, []);

  const updateName = useCallback(async (name: string) => {
    const data = await apiFetch<{ user: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    authStorage.setUser(data.user);
    setUser(data.user);
  }, []);

  const updatePhone = useCallback(async (phone: string) => {
    const data = await apiFetch<{ user: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify({ phone })
    });
    authStorage.setUser(data.user);
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateAvatar, updateName, updatePhone }),
    [user, isLoading, login, register, logout, updateAvatar, updateName, updatePhone]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
