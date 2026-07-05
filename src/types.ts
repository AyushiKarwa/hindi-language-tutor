/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserSettings {
  theme: 'light' | 'dark';
  dailyGoal: number; // in XP
  emailNotifications: boolean;
  soundEffects: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  issuedTo: string;
  issuedAt: string;
  grade: number;
}

export interface Bookmark {
  id: string;
  word: string;
  roman: string;
  english: string;
  category: string;
  addedAt: string;
}

export interface UserProgress {
  userId: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  lastActive: string | null;
  completedCourses: string[]; // Course IDs
  completedLessons: string[]; // Lesson IDs
  pronunciationScore: number; // cumulative average
  quizScore: number; // cumulative average
  writingScore: number; // cumulative average
  readingScore: number; // cumulative average
  listeningScore: number; // cumulative average
  xpHistory: { date: string; xp: number }[]; // for progress graphs
  learningCalendar: string[]; // Dates with activity (YYYY-MM-DD)
  bookmarks: Bookmark[];
  settings: UserSettings;
  achievements: Achievement[];
  badges: Badge[];
  certificates: Certificate[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  verified: boolean;
  verificationCode?: string;
  resetToken?: string;
  createdAt: string;
}

// Course structures
export type LessonDifficulty = 'Beginner' | 'Basic' | 'Grammar' | 'Conversation' | 'Advanced';

export interface Flashcard {
  word: string;
  hindi: string;
  roman: string;
  english: string;
  image?: string;
  audioText: string;
}

export interface Exercise {
  id: string;
  type: 'flashcard' | 'multiple-choice' | 'fill-in-the-blanks' | 'translation' | 'sentence-building' | 'matching' | 'listening' | 'writing' | 'speaking' | 'reading';
  question: string;
  hindiQuestion?: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string | string[]; // Can be array for matching or sentence building
  pairs?: { hindi: string; english: string }[]; // for matching
  passage?: string; // for reading
  explanation?: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  exercises: Exercise[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: LessonDifficulty;
  lessons: Lesson[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  rank?: number;
}
