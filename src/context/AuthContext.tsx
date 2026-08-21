/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProgress } from '../types';
import { API } from '../lib/api';

const DEFAULT_GUEST_USER: User = {
  id: 'usr_demo_learner',
  name: 'Namaste Learner',
  email: 'learner@namaste.dev',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NamasteLearner',
  verified: true,
  createdAt: new Date().toISOString()
};

const DEFAULT_GUEST_PROGRESS: UserProgress = {
  userId: 'usr_demo_learner',
  xp: 0,
  coins: 0,
  level: 1,
  streak: 0,
  lastActive: null,
  completedCourses: [],
  completedLessons: [],
  pronunciationScore: 0,
  quizScore: 0,
  writingScore: 0,
  readingScore: 0,
  listeningScore: 0,
  xpHistory: [
    { date: new Date().toISOString().split('T')[0], xp: 0 }
  ],
  learningCalendar: [],
  bookmarks: [],
  settings: {
    theme: 'light',
    dailyGoal: 50,
    emailNotifications: true,
    soundEffects: true
  },
  achievements: [
    { id: 'first-steps', title: 'First Steps', description: 'Complete your first lesson', icon: 'Footprints', progress: 0, maxProgress: 1 },
    { id: 'streak-3', title: 'Consistent Learner', description: 'Maintain a 3-day learning streak', icon: 'Flame', progress: 0, maxProgress: 3 },
    { id: 'xp-100', title: 'XP Collector', description: 'Earn a total of 100 XP', icon: 'Award', progress: 0, maxProgress: 100 },
    { id: 'coins-50', title: 'Coin Hoarder', description: 'Accumulate 50 learning coins', icon: 'Coins', progress: 0, maxProgress: 50 },
    { id: 'pronunciation-champ', title: 'Fluent Speaker', description: 'Log a pronunciation practice score of 90% or above', icon: 'Mic', progress: 0, maxProgress: 1 },
    { id: 'quiz-master', title: 'Perfect Quizzer', description: 'Complete 3 quizzes with a score of 100%', icon: 'Sparkles', progress: 0, maxProgress: 3 }
  ],
  badges: [],
  certificates: []
};

interface AuthContextType {
  user: User | null;
  progress: UserProgress | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  loginDemoLearner: () => Promise<void>;
  quickDemoLogin?: (role?: 'learner' | 'admin') => Promise<void>;
  loginAsGuest?: (name?: string) => void;
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
      setUser(null);
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      const data = await API.getMe();
      setUser(data.user);
      setProgress(data.progress);
    } catch (err) {
      console.warn('Session expired or invalid, logging out');
      localStorage.removeItem('hindi_tutor_token');
      localStorage.removeItem('hindi_tutor_user');
      localStorage.removeItem('hindi_tutor_progress');
      setUser(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await API.login(email, password);
    localStorage.setItem('hindi_tutor_token', data.token);
    localStorage.setItem('hindi_tutor_user', JSON.stringify(data.user));
    setUser(data.user);
    
    try {
      const meData = await API.getMe();
      setProgress(meData.progress);
      localStorage.setItem('hindi_tutor_progress', JSON.stringify(meData.progress));
    } catch {
      // Local progress already initialized
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await API.register(name, email, password);
    localStorage.setItem('hindi_tutor_token', data.token);
    localStorage.setItem('hindi_tutor_user', JSON.stringify(data.user));
    setUser(data.user);
    
    try {
      const meData = await API.getMe();
      setProgress(meData.progress);
      localStorage.setItem('hindi_tutor_progress', JSON.stringify(meData.progress));
    } catch {
      // Local progress already initialized
    }
    return data;
  };

  const loginDemoLearner = async () => {
    await login('learner@namaste.dev', 'namaste123');
  };

  const quickDemoLogin = async (_role?: 'learner' | 'admin') => {
    await loginDemoLearner();
  };

  const loginAsGuest = (_name?: string) => {
    loginDemoLearner();
  };

  const logout = () => {
    localStorage.removeItem('hindi_tutor_token');
    localStorage.removeItem('hindi_tutor_user');
    localStorage.removeItem('hindi_tutor_progress');
    setUser(null);
    setProgress(null);
  };

  const updateProgressState = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('hindi_tutor_progress', JSON.stringify(newProgress));
  };

  const refreshMe = async () => {
    try {
      const meData = await API.getMe();
      setUser(meData.user);
      setProgress(meData.progress);
      localStorage.setItem('hindi_tutor_user', JSON.stringify(meData.user));
      localStorage.setItem('hindi_tutor_progress', JSON.stringify(meData.progress));
    } catch (err) {
      console.warn('Refresh session fallback to active state');
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
      loginDemoLearner,
      quickDemoLogin,
      loginAsGuest,
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
