/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserProgress, Course, LeaderboardUser } from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('hindi_tutor_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const API = {
  // Auth calls
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data as { message: string; user: User; token: string };
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data as { message: string; user: User; token: string };
  },

  async verifyEmail(email: string, code: string) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data as { message: string };
  },

  async resendCode(email: string) {
    const res = await fetch(`${API_BASE}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Resend failed');
    return data as { message: string; verificationCode?: string };
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Forgot password request failed');
    return data as { message: string; resetToken?: string };
  },

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetToken, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reset password failed');
    return data as { message: string };
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data as { user: User; progress: UserProgress };
  },

  async editProfile(name: string, avatar: string) {
    const res = await fetch(`${API_BASE}/auth/edit-profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to edit profile');
    return data as { message: string; user: User };
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data as { message: string };
  },

  // Courses
  async getCourses() {
    const res = await fetch(`${API_BASE}/courses`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load courses');
    return data.courses as Course[];
  },

  // Progress
  async getProgress() {
    const res = await fetch(`${API_BASE}/progress`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch progress');
    return data.progress as UserProgress;
  },

  async addXP(xp: number, coins: number) {
    const res = await fetch(`${API_BASE}/progress/add-xp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ xp, coins })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add XP');
    return data.progress as UserProgress;
  },

  async completeLesson(lessonId: string, courseId: string) {
    const res = await fetch(`${API_BASE}/progress/complete-lesson`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lessonId, courseId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to complete lesson');
    return data.progress as UserProgress;
  },

  async toggleBookmark(word: string, roman: string, english: string, category: string) {
    const res = await fetch(`${API_BASE}/progress/toggle-bookmark`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ word, roman, english, category })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle bookmark');
    return data.progress as UserProgress;
  },

  async updateScore(activityType: 'pronunciation' | 'quiz' | 'writing' | 'reading' | 'listening', score: number) {
    const res = await fetch(`${API_BASE}/progress/update-score`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ activityType, score })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save score');
    return data.progress as UserProgress;
  },

  // Leaderboard
  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch leaderboard');
    return data.leaderboard as LeaderboardUser[];
  }
};
