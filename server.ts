/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { DB } from './src/server/db';
import { COURSES } from './src/server/coursesData';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-hindi-tutor-key-2026';

app.use(express.json());

// Utility to verify JWT and attach user details
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is expired or invalid' });
  }
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Please provide all required fields' });
    return;
  }

  try {
    const newUser = await DB.createUser(name, email, password);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Registration successful! A verification code has been sent.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        verified: newUser.verified,
        verificationCode: newUser.verificationCode // Exposing code for easy copy/paste in UI
      },
      token
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Please specify email and password' });
    return;
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  // Verify password using bcryptjs
  const bcrypt = require('bcryptjs');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    message: 'Welcome back!',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified
    },
    token
  });
});

// Verify Email
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ error: 'Email and verification code are required' });
    return;
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(400).json({ error: 'User not found' });
    return;
  }

  if (user.verified) {
    res.json({ message: 'User is already verified' });
    return;
  }

  if (user.verificationCode === code) {
    DB.updateUser(user.id, { verified: true, verificationCode: undefined });
    res.json({ message: 'Email verified successfully!' });
  } else {
    res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
  }
});

// Resend verification code
app.post('/api/auth/resend-code', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  DB.updateUser(user.id, { verificationCode: newCode });

  res.json({
    message: 'A new verification code has been generated.',
    verificationCode: newCode
  });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'No user registered with this email' });
    return;
  }

  const resetToken = 'rst_' + Math.random().toString(36).substr(2, 9);
  DB.updateUser(user.id, { resetToken });

  res.json({
    message: 'Reset instructions have been set. Use the provided code to complete your reset.',
    resetToken // Exposing reset code for simple UI demonstration
  });
});

// Reset Password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    res.status(400).json({ error: 'Please supply all required parameters' });
    return;
  }

  const user = DB.getUserByEmail(email);
  if (!user || user.resetToken !== resetToken) {
    res.status(400).json({ error: 'Invalid email or password reset token' });
    return;
  }

  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  DB.updateUser(user.id, { password: passwordHash, resetToken: undefined });
  res.json({ message: 'Password has been reset successfully. You can now login.' });
});

// Get profile & stats for logged-in user
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const progress = DB.getProgress(user.id);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      verified: user.verified
    },
    progress
  });
});

// Edit Profile
app.post('/api/auth/edit-profile', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { name, avatar } = req.body;
  
  try {
    const updatedUser = DB.updateUser(req.user.id, {
      ...(name && { name }),
      ...(avatar && { avatar })
    });

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        verified: updatedUser.verified
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Old password and new password are required' });
    return;
  }

  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const bcrypt = require('bcryptjs');
  const valid = await bcrypt.compare(oldPassword, user.password || '');
  if (!valid) {
    res.status(400).json({ error: 'Incorrect current password' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  DB.updateUser(user.id, { password: passwordHash });
  res.json({ message: 'Password changed successfully' });
});


// ==========================================
// COURSE & LESSON ENDPOINTS
// ==========================================

// Get all courses & lessons
app.get('/api/courses', (req: Request, res: Response) => {
  res.json({ courses: COURSES });
});


// ==========================================
// PROGRESS & USER ACTION ENDPOINTS
// ==========================================

// Get user progress
app.get('/api/progress', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const progress = DB.getProgress(req.user.id);
  res.json({ progress });
});

// Add XP / Coins
app.post('/api/progress/add-xp', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { xp, coins } = req.body;
  
  const updatedProgress = DB.addXP(req.user.id, Number(xp || 0), Number(coins || 0));
  res.json({ progress: updatedProgress });
});

// Complete Lesson
app.post('/api/progress/complete-lesson', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { lessonId, courseId } = req.body;
  if (!lessonId || !courseId) {
    res.status(400).json({ error: 'Please supply lessonId and courseId' });
    return;
  }

  const updatedProgress = DB.completeLesson(req.user.id, lessonId, courseId);
  res.json({ progress: updatedProgress });
});

// Toggle Bookmark
app.post('/api/progress/toggle-bookmark', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { word, roman, english, category } = req.body;
  if (!word || !roman || !english || !category) {
    res.status(400).json({ error: 'Incomplete bookmark info' });
    return;
  }

  const bookmark = {
    id: 'bkm_' + Math.random().toString(36).substr(2, 9),
    word,
    roman,
    english,
    category,
    addedAt: new Date().toISOString()
  };

  const updatedProgress = DB.toggleBookmark(req.user.id, bookmark);
  res.json({ progress: updatedProgress });
});

// Update skill-specific scores (pronunciation, quiz, writing, etc.)
app.post('/api/progress/update-score', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { activityType, score } = req.body;
  
  if (!activityType || typeof score !== 'number') {
    res.status(400).json({ error: 'Invalid score payload' });
    return;
  }

  const updatedProgress = DB.updateProgressStats(req.user.id, activityType, score);
  res.json({ progress: updatedProgress });
});

// Get Leaderboard rankings
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const leaderboard = DB.getLeaderboard();
  res.json({ leaderboard });
});


// ==========================================
// VITE OR STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failure booting Express server:', err);
});
