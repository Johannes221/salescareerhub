'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  dbUser: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = async () => {
    try {
      const { getIdToken } = await import('@/lib/auth/client');
      const token = await getIdToken();
      if (!token) {
        setDbUser(null);
        return;
      }
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.data);
      } else {
        setDbUser(null);
      }
    } catch {
      setDbUser(null);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    void import('@/lib/auth/client').then(({ onAuthChange }) => {
      unsubscribe = onAuthChange(async (user) => {
        setFirebaseUser(user);
        if (user) {
          await fetchDbUser();
        } else {
          setDbUser(null);
        }
        setLoading(false);
      });
    }).catch(() => {
      setFirebaseUser(null);
      setDbUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const { logout: firebaseLogout } = await import('@/lib/auth/client');
    await firebaseLogout();
    setDbUser(null);
    setFirebaseUser(null);
  };

  const refreshUser = async () => {
    await fetchDbUser();
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
