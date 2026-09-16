'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAdminSession, clearAdminSession } from '@/lib/auth';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setUser(session);
    } else if (pathname !== '/login') {
      router.push('/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  const logout = () => {
    clearAdminSession();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
