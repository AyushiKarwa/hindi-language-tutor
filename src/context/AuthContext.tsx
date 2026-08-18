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
  loginAsGuest: (name?: string) => void;
  quickDemoLogin: (role: 'learner' | 'admin') => Promise<void>;
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
    const isLoggedOut = localStorage.getItem('hindi_tutor_logged_out');
    const token = localStorage.getItem('hindi_tutor_token');

    // If user explicitly logged out and hasn't logged back in, show login page
    if (isLoggedOut === 'true' && !token) {
      setLoading(false);
      return;
    }

    if (token) {
      try {
        const data = await API.getMe();
        setUser(data.user);
        setProgress(data.progress);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Session restoration from server failed, using local/guest session');
      }
    }

    // Default to instant direct access (no login barrier)
    const localUserRaw = localStorage.getItem('hindi_tutor_user');
    const localProgressRaw = localStorage.getItem('hindi_tutor_progress');
    
    let activeUser: User = localUserRaw ? JSON.parse(localUserRaw) : DEFAULT_GUEST_USER;
    let activeProgress: UserProgress = localProgressRaw ? JSON.parse(localProgressRaw) : DEFAULT_GUEST_PROGRESS;

    // Reset if user has stale hardcoded test progress
    if (activeProgress && (activeProgress.xp === 120 || activeProgress.streak === 3)) {
      activeProgress = { ...DEFAULT_GUEST_PROGRESS, userId: activeUser.id };
    }

    localStorage.setItem('hindi_tutor_user', JSON.stringify(activeUser));
    localStorage.setItem('hindi_tutor_progress', JSON.stringify(activeProgress));
    
    setUser(activeUser);
    setProgress(activeProgress);
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    localStorage.removeItem('hindi_tutor_logged_out');
    try {
      const data = await API.login(email, password);
      localStorage.setItem('hindi_tutor_token', data.token);
      localStorage.setItem('hindi_tutor_user', JSON.stringify(data.user));
      setUser(data.user);
      
      const meData = await API.getMe();
      setProgress(meData.progress);
      localStorage.setItem('hindi_tutor_progress', JSON.stringify(meData.progress));
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    localStorage.removeItem('hindi_tutor_logged_out');
    try {
      const data = await API.register(name, email, password);
      localStorage.setItem('hindi_tutor_token', data.token);
      localStorage.setItem('hindi_tutor_user', JSON.stringify(data.user));
      setUser(data.user);
      
      const meData = await API.getMe();
      setProgress(meData.progress);
      localStorage.setItem('hindi_tutor_progress', JSON.stringify(meData.progress));
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = (name: string = 'Namaste Learner') => {
    localStorage.removeItem('hindi_tutor_logged_out');
    const guestUser: User = {
      ...DEFAULT_GUEST_USER,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    };
    const guestProgress = { ...DEFAULT_GUEST_PROGRESS, userId: guestUser.id };

    localStorage.setItem('hindi_tutor_user', JSON.stringify(guestUser));
    localStorage.setItem('hindi_tutor_progress', JSON.stringify(guestProgress));
    
    setUser(guestUser);
    setProgress(guestProgress);
  };

  const quickDemoLogin = async (role: 'learner' | 'admin') => {
    if (role === 'admin') {
      try {
        await login('ayushikarwa2019@gmail.com', 'admin123');
      } catch {
        const adminUser: User = {
          id: 'usr_admin_ayushi',
          name: 'Ayushi Karwa',
          email: 'ayushikarwa2019@gmail.com',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ayushi',
          verified: true,
          createdAt: new Date().toISOString()
        };
        const adminProgress = { ...DEFAULT_GUEST_PROGRESS, userId: adminUser.id, xp: 250, level: 3, streak: 5 };
        localStorage.removeItem('hindi_tutor_logged_out');
        localStorage.setItem('hindi_tutor_user', JSON.stringify(adminUser));
        localStorage.setItem('hindi_tutor_progress', JSON.stringify(adminProgress));
        setUser(adminUser);
        setProgress(adminProgress);
      }
    } else {
      try {
        await login('learner@namaste.dev', 'namaste123');
      } catch {
        loginAsGuest('Namaste Learner');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('hindi_tutor_token');
    localStorage.removeItem('hindi_tutor_user');
    localStorage.setItem('hindi_tutor_logged_out', 'true');
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
      loginAsGuest,
      quickDemoLogin,
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
