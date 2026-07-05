/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, UserProgress, Achievement, Badge, Certificate, Bookmark, LeaderboardUser } from '../types';
import { COURSES } from './coursesData';

const DB_FILE = path.join(process.cwd(), 'db_store.json');

interface Schema {
  users: User[];
  progress: Record<string, UserProgress>;
}

// Default accomplishments template
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Complete your first lesson', icon: 'Footprints', progress: 0, maxProgress: 1 },
  { id: 'streak-3', title: 'Consistent Learner', description: 'Maintain a 3-day learning streak', icon: 'Flame', progress: 0, maxProgress: 3 },
  { id: 'xp-100', title: 'XP Collector', description: 'Earn a total of 100 XP', icon: 'Award', progress: 0, maxProgress: 100 },
  { id: 'coins-50', title: 'Coin Hoarder', description: 'Accumulate 50 learning coins', icon: 'Coins', progress: 0, maxProgress: 50 },
  { id: 'pronunciation-champ', title: 'Fluent Speaker', description: 'Log a pronunciation practice score of 90% or above', icon: 'Mic', progress: 0, maxProgress: 1 },
  { id: 'quiz-master', title: 'Perfect Quizzer', description: 'Complete 3 quizzes with a score of 100%', icon: 'Sparkles', progress: 0, maxProgress: 3 }
];

const INITIAL_PROGRESS = (userId: string): UserProgress => ({
  userId,
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
  achievements: [...DEFAULT_ACHIEVEMENTS],
  badges: [],
  certificates: []
});

function loadDB(): Schema {
  if (!fs.existsSync(DB_FILE)) {
    const initial: Schema = { users: [], progress: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db_store.json, resetting', err);
    return { users: [], progress: {} };
  }
}

function saveDB(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to db_store.json', err);
  }
}

export const DB = {
  // --- USERS MANAGEMENT ---
  getUsers(): User[] {
    return loadDB().users;
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async createUser(name: string, email: string, passwordPlain: string): Promise<User> {
    const db = loadDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      verified: false,
      verificationCode,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.progress[newUser.id] = INITIAL_PROGRESS(newUser.id);
    saveDB(db);

    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User {
    const db = loadDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) {
      throw new Error('User not found');
    }
    db.users[idx] = { ...db.users[idx], ...updates };
    saveDB(db);
    return db.users[idx];
  },

  // --- PROGRESS MANAGEMENT ---
  getProgress(userId: string): UserProgress {
    const db = loadDB();
    if (!db.progress[userId]) {
      db.progress[userId] = INITIAL_PROGRESS(userId);
      saveDB(db);
    }
    return db.progress[userId];
  },

  saveProgress(userId: string, progress: UserProgress) {
    const db = loadDB();
    db.progress[userId] = progress;
    saveDB(db);
  },

  updateProgressStats(
    userId: string, 
    activityType: 'pronunciation' | 'quiz' | 'writing' | 'reading' | 'listening', 
    score: number
  ): UserProgress {
    const progress = this.getProgress(userId);
    const scoreKey = `${activityType}Score` as keyof UserProgress;
    
    const currentVal = progress[scoreKey] as number;
    if (currentVal === 0) {
      (progress[scoreKey] as number) = score;
    } else {
      (progress[scoreKey] as number) = Math.round((currentVal + score) / 2);
    }

    // Process achievement tracking
    if (activityType === 'pronunciation' && score >= 90) {
      const idx = progress.achievements.findIndex(a => a.id === 'pronunciation-champ');
      if (idx !== -1 && progress.achievements[idx].progress === 0) {
        progress.achievements[idx].progress = 1;
        progress.achievements[idx].unlockedAt = new Date().toISOString();
        progress.badges.push({
          id: 'badge-pronunciation',
          title: 'Orator',
          description: 'Pronounced Hindi with >90% precision',
          icon: 'Mic',
          unlockedAt: new Date().toISOString()
        });
      }
    }

    if (activityType === 'quiz' && score === 100) {
      const idx = progress.achievements.findIndex(a => a.id === 'quiz-master');
      if (idx !== -1 && progress.achievements[idx].progress < 3) {
        progress.achievements[idx].progress += 1;
        if (progress.achievements[idx].progress === 3) {
          progress.achievements[idx].unlockedAt = new Date().toISOString();
          progress.badges.push({
            id: 'badge-quiz',
            title: 'Quiz Scholar',
            description: 'Acquired 3 perfect scores on lesson quizzes',
            icon: 'Sparkles',
            unlockedAt: new Date().toISOString()
          });
        }
      }
    }

    this.saveProgress(userId, progress);
    return progress;
  },

  addXP(userId: string, xpAmount: number, coinsAmount: number): UserProgress {
    const progress = this.getProgress(userId);
    progress.xp += xpAmount;
    progress.coins += coinsAmount;

    // Check level up (every 100 XP is a level)
    const oldLevel = progress.level;
    progress.level = Math.floor(progress.xp / 100) + 1;
    if (progress.level > oldLevel) {
      progress.badges.push({
        id: `badge-lvl-${progress.level}`,
        title: `Level ${progress.level} Achiever`,
        description: `Passed milestone level ${progress.level}!`,
        icon: 'TrendingUp',
        unlockedAt: new Date().toISOString()
      });
    }

    // Streak and history handling
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Manage XP history chart
    const historyIdx = progress.xpHistory.findIndex(h => h.date === todayStr);
    if (historyIdx !== -1) {
      progress.xpHistory[historyIdx].xp += xpAmount;
    } else {
      progress.xpHistory.push({ date: todayStr, xp: xpAmount });
    }
    // Limit to last 7 days of history
    if (progress.xpHistory.length > 7) {
      progress.xpHistory.shift();
    }

    // Manage learning calendar (dates user practiced)
    if (!progress.learningCalendar.includes(todayStr)) {
      progress.learningCalendar.push(todayStr);
    }

    // Handle Streak update
    if (progress.lastActive) {
      const lastActiveDate = new Date(progress.lastActive);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        progress.streak += 1;
      } else if (diffDays > 1) {
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }
    progress.lastActive = todayStr;

    // Achievements update
    // 1. first-steps
    const stepsIdx = progress.achievements.findIndex(a => a.id === 'first-steps');
    if (stepsIdx !== -1 && progress.achievements[stepsIdx].progress === 0) {
      progress.achievements[stepsIdx].progress = 1;
      progress.achievements[stepsIdx].unlockedAt = new Date().toISOString();
      progress.badges.push({
        id: 'badge-first',
        title: 'Pioneer',
        description: 'Completed your first Hindi learning exercise',
        icon: 'Footprints',
        unlockedAt: new Date().toISOString()
      });
    }

    // 2. streak-3
    const streakIdx = progress.achievements.findIndex(a => a.id === 'streak-3');
    if (streakIdx !== -1 && progress.streak >= 3 && progress.achievements[streakIdx].progress < 3) {
      progress.achievements[streakIdx].progress = 3;
      progress.achievements[streakIdx].unlockedAt = new Date().toISOString();
      progress.badges.push({
        id: 'badge-streak',
        title: 'Consistent Guru',
        description: 'Achieved an impressive 3-day streak',
        icon: 'Flame',
        unlockedAt: new Date().toISOString()
      });
    }

    // 3. xp-100
    const xpIdx = progress.achievements.findIndex(a => a.id === 'xp-100');
    if (xpIdx !== -1 && progress.xp >= 100 && progress.achievements[xpIdx].progress < 100) {
      progress.achievements[xpIdx].progress = Math.min(progress.xp, 100);
      if (progress.achievements[xpIdx].progress === 100) {
        progress.achievements[xpIdx].unlockedAt = new Date().toISOString();
        progress.badges.push({
          id: 'badge-xp',
          title: 'Century XP',
          description: 'Collected over 100 learning XP points',
          icon: 'Award',
          unlockedAt: new Date().toISOString()
        });
      }
    } else if (xpIdx !== -1 && progress.achievements[xpIdx].progress < 100) {
      progress.achievements[xpIdx].progress = progress.xp;
    }

    // 4. coins-50
    const coinIdx = progress.achievements.findIndex(a => a.id === 'coins-50');
    if (coinIdx !== -1 && progress.coins >= 50 && progress.achievements[coinIdx].progress < 50) {
      progress.achievements[coinIdx].progress = Math.min(progress.coins, 50);
      if (progress.achievements[coinIdx].progress === 50) {
        progress.achievements[coinIdx].unlockedAt = new Date().toISOString();
        progress.badges.push({
          id: 'badge-coins',
          title: 'Wealthy Student',
          description: 'Saved 50 or more Hindi learning coins',
          icon: 'Coins',
          unlockedAt: new Date().toISOString()
        });
      }
    } else if (coinIdx !== -1 && progress.achievements[coinIdx].progress < 50) {
      progress.achievements[coinIdx].progress = progress.coins;
    }

    this.saveProgress(userId, progress);
    return progress;
  },

  completeLesson(userId: string, lessonId: string, courseId: string): UserProgress {
    const progress = this.getProgress(userId);
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Check if the whole course is completed!
    const course = COURSES.find(c => c.id === courseId);
    if (course) {
      const allLessonsInCourseCompleted = course.lessons.every(l => progress.completedLessons.includes(l.id));
      if (allLessonsInCourseCompleted && !progress.completedCourses.includes(courseId)) {
        progress.completedCourses.push(courseId);
        
        // Generate Certificate
        const user = this.getUserById(userId);
        const name = user ? user.name : 'Learner';
        const cert: Certificate = {
          id: 'cert_' + Math.random().toString(36).substr(2, 9),
          courseId,
          courseName: course.title,
          issuedTo: name,
          issuedAt: new Date().toISOString(),
          grade: 100
        };
        progress.certificates.push(cert);
        progress.badges.push({
          id: `badge-cert-${courseId}`,
          title: `${course.title} Graduate`,
          description: `Successfully graduated from ${course.title}!`,
          icon: 'Award',
          unlockedAt: new Date().toISOString()
        });
      }
    }

    this.saveProgress(userId, progress);
    return progress;
  },

  // --- BOOKMARKS ---
  toggleBookmark(userId: string, bookmark: Bookmark): UserProgress {
    const progress = this.getProgress(userId);
    const existingIdx = progress.bookmarks.findIndex(b => b.word === bookmark.word);
    
    if (existingIdx !== -1) {
      progress.bookmarks.splice(existingIdx, 1);
    } else {
      progress.bookmarks.push(bookmark);
    }
    
    this.saveProgress(userId, progress);
    return progress;
  },

  // --- LEADERBOARD ---
  getLeaderboard(): LeaderboardUser[] {
    const db = loadDB();
    const leaderboard: LeaderboardUser[] = db.users.map(u => {
      const prog = db.progress[u.id] || INITIAL_PROGRESS(u.id);
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        xp: prog.xp,
        streak: prog.streak
      };
    });

    return leaderboard
      .sort((a, b) => b.xp - a.xp)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }
};
