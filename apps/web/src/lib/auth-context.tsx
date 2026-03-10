'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, logout as firebaseLogout, getIdToken, type FirebaseUser } from '@salescareerhub/auth/client';
import type { User } from '@salescareerhub/types';

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
      const token = await getIdToken();
      if (!token) {
        setDbUser(null);
        return;
      }
      const res = await fetch('/api/auth/me', {
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
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchDbUser();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
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
