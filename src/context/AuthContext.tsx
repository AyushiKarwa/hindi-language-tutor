/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProgress } from '../types';
import { API } from '../lib/api';

interface AuthContextType {
  user: User | null;
  progress: UserProgress | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProgressState: (newProgress: UserProgress) => void;
  refreshMe: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    const token = localStorage.getItem('hindi_tutor_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await API.getMe();
      setUser(data.user);
      setProgress(data.progress);
    } catch (err) {
      console.error('Session restoration failed:', err);
      // Clear token if invalid or expired
      localStorage.removeItem('hindi_tutor_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await API.login(email, password);
      localStorage.setItem('hindi_tutor_token', data.token);
      setUser(data.user);
      // Fetch fresh progress
      const meData = await API.getMe();
      setProgress(meData.progress);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await API.register(name, email, password);
      localStorage.setItem('hindi_tutor_token', data.token);
      setUser(data.user);
      // Fetch fresh progress
      const meData = await API.getMe();
      setProgress(meData.progress);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hindi_tutor_token');
    setUser(null);
    setProgress(null);
  };

  const updateProgressState = (newProgress: UserProgress) => {
    setProgress(newProgress);
  };

  const refreshMe = async () => {
    try {
      const meData = await API.getMe();
      setUser(meData.user);
      setProgress(meData.progress);
    } catch (err) {
      console.error('Error refreshing session:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      progress,
      loading,
      login,
      register,
      logout,
      updateProgressState,
      refreshMe,
      setUser
    }}>
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
