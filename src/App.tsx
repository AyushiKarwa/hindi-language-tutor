/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { API } from './lib/api';
import { Course, Lesson, Bookmark } from './types';

// Child components
import { Navbar } from './components/Navbar';
import { AuthWindow } from './components/AuthWindow';
import { LearningCalendar } from './components/LearningCalendar';
import { ProgressChart } from './components/ProgressChart';
import { CertificatesPanel } from './components/CertificatesPanel';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { LessonWindow } from './components/LessonWindow';
import { AudioPlayer } from './components/AudioPlayer';

// Icons
import {
  Sparkles, Award, Flame, BookOpen, Clock, Play, CheckCircle, Search, Trash2, ShieldAlert,
  Volume2, Settings, User as UserIcon, LogOut, ArrowRight, Star, Heart, Bookmark as BookIcon,
  Moon, Sun, Compass, CheckSquare, BarChart, KeyRound, Check
} from 'lucide-react';

function AppContent() {
  const { user, progress, loading, logout, updateProgressState, refreshMe } = useAuth();
  
  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Courses states
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Active learning module overlay
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string>('');

  // Editable profile and password changing states
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Bookmark explorer search filter
  const [bookmarkSearch, setBookmarkSearch] = useState('');

  // Initialize theme
  useEffect(() => {
    if (progress?.settings?.theme) {
      const isDark = progress.settings.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [progress?.settings?.theme]);

  // Load all platform courses
  const fetchAllCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await API.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed loading database courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllCourses();
      setProfileName(user.name);
      setProfileAvatar(user.avatar);
    }
  }, [user]);

  // Handle Edit Profile
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const data = await API.editProfile(profileName, profileAvatar);
      await refreshMe();
      setProfileMessage('Success! Profile details updated.');
    } catch (err: any) {
      setProfileMessage(`Error: ${err.message}`);
    }
    setTimeout(() => setProfileMessage(''), 4000);
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      await API.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setPasswordMessage('Success! Password has been updated.');
    } catch (err: any) {
      setPasswordMessage(`Error: ${err.message}`);
    }
    setTimeout(() => setPasswordMessage(''), 4000);
  };

  // Toggle Theme settings
  const toggleTheme = async () => {
    if (!progress) return;
    const nextTheme = progress.settings.theme === 'dark' ? 'light' : 'dark';
    const updatedSettings = { ...progress.settings, theme: nextTheme };
    const updatedProgress = { ...progress, settings: updatedSettings };
    
    // Save to local storage & state first for instantaneous feel
    updateProgressState(updatedProgress);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');

    try {
      // Proxy saving setting
      await API.addXP(0, 0); // Triggers db-update flow safely
    } catch (err) {
      console.error('Error syncing setting theme:', err);
    }
  };

  // Delete Bookmark
  const handleRemoveBookmark = async (b: Bookmark) => {
    try {
      const updatedProg = await API.toggleBookmark(b.word, b.roman, b.english, b.category);
      updateProgressState(updatedProg);
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  // General Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-sm">Resuming learning session...</p>
      </div>
    );
  }

  // ==========================================
  // 1. LANDING PAGE (NOT AUTHENTICATED VIEW)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
        
        {/* Decorative Top Background */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

        <header className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <span className="font-bold text-lg">H</span>
              </div>
              <span className="font-sans font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Namaste Hindi
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Devanagari Language Academy</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center space-x-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-purple-200/40 dark:border-purple-800/40">
              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              <span>Full-Stack Hindi Learning Platform</span>
            </span>

            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl text-zinc-800 dark:text-white tracking-tight leading-none">
              Speak Hindi with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Absolute Precision
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
              Ditch the generic word-matching apps. Namaste Hindi integrates Browser Web Speech verification, text-to-speech audio speeds, structured courses (Beginner, Basic, Grammar, Conversation, and Advanced), and leagues gamification.
            </p>

            <div className="grid grid-cols-3 gap-4 border-y border-zinc-200/60 dark:border-zinc-800 py-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <p className="font-black text-xl text-purple-600 dark:text-purple-400">5+</p>
                <p className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">Course Tracks</p>
              </div>
              <div className="text-center lg:text-left border-x border-zinc-200/50 dark:border-zinc-800 px-4">
                <p className="font-black text-xl text-indigo-600 dark:text-indigo-400">10+</p>
                <p className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">Lesson styles</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-black text-xl text-green-600 dark:text-green-400">100%</p>
                <p className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">Persistent Progress</p>
              </div>
            </div>
          </div>

          {/* Form Widget Column */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthWindow onSuccess={refreshMe} />
          </div>

        </main>

        <footer className="py-6 border-t border-zinc-200/50 dark:border-zinc-800 text-center text-xs text-zinc-400 font-mono">
          <p>&copy; 2026 Namaste Hindi language Tutor. Built for excellence in Devanagari studies.</p>
        </footer>

      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED DASHBOARD APPLICATION
  // ==========================================
  const isAdmin = user.email.toLowerCase() === 'ayushikarwa2019@gmail.com';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 pb-12 transition-colors duration-200">
      
      {/* Sticky Premium Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ========================================== */}
        {/* 2. DASHBOARD VIEW */}
        {/* ========================================== */}
        {currentTab === 'dashboard' && progress && (
          <div className="space-y-6">
            
            {/* Welcome banner card */}
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              {/* Abs decorative gradient glow circle */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Namaste, {user.name}
                  </span>
                  <h2 className="font-sans font-black text-2xl sm:text-3xl tracking-tight mt-2.5">
                    Ready for today's Hindi quest?
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
                    Your current learning focus is active. Continue practicing Swar, Vyanjan, and conversational structures to double your leagues rank!
                  </p>
                </div>

                {/* Continue button */}
                <button
                  onClick={() => setCurrentTab('courses')}
                  className="bg-white hover:bg-zinc-100 text-purple-600 font-sans font-extrabold text-sm px-6 py-3 rounded-2xl shadow-md transition self-start md:self-auto flex items-center space-x-1"
                >
                  <span>Continue Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Daily Streak */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-xl text-orange-600 dark:text-orange-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-mono">Daily Streak</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{progress.streak} days</p>
                </div>
              </div>

              {/* Accumulating XP */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-xl text-purple-600 dark:text-purple-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-mono">Accumulated XP</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{progress.xp} XP</p>
                </div>
              </div>

              {/* Course Level */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-mono">Current Level</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Level {progress.level}</p>
                </div>
              </div>

              {/* Completed Modules */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-xl text-green-600 dark:text-green-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-mono">Completed Lessons</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    {progress.completedLessons.length} Modules
                  </p>
                </div>
              </div>

            </div>

            {/* Middle Row Splits: Progress Trend and Goals tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Trends chart */}
              <div className="lg:col-span-2 space-y-6">
                <ProgressChart history={progress.xpHistory} />
                <LearningCalendar dates={progress.learningCalendar} />
              </div>

              {/* Goals and Quick achievements sidebar */}
              <div className="space-y-6">
                
                {/* Daily Goal meter */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <h3 className="font-sans font-bold text-base text-zinc-800 dark:text-zinc-100">Daily Quest Goal</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Set to <strong className="text-zinc-700 dark:text-zinc-300">{progress.settings.dailyGoal} XP</strong> in settings.
                  </p>

                  {/* Progress Gauge */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-mono font-bold text-zinc-500 mb-1">
                      <span>XP Earned Today</span>
                      <span>{Math.min(progress.xp, progress.settings.dailyGoal)} / {progress.settings.dailyGoal} XP</span>
                    </div>

                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((progress.xp / progress.settings.dailyGoal) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badges Preview panel */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="font-sans font-bold text-base text-zinc-800 dark:text-zinc-100">Recent Badges</h3>
                    <button
                      onClick={() => setCurrentTab('profile')}
                      className="text-xs text-purple-600 dark:text-purple-400 font-sans font-bold hover:underline"
                    >
                      All Badges
                    </button>
                  </div>

                  {progress.badges.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No badges unlocked yet. Keep practicing!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {progress.badges.slice(-4).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center space-x-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-xl text-xs font-sans font-bold"
                          title={badge.description}
                        >
                          <Star className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                          <span>{badge.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* 3. COURSES SYLLABUS LIST VIEW */}
        {/* ========================================== */}
        {currentTab === 'courses' && progress && (
          <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
              <div>
                <h2 className="font-sans font-black text-2xl text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Hindi Learning Pathways
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Select a modular course track to access interactive drills, matching matrices, spelling spelling check, and live audio pronunciations.
                </p>
              </div>

              {/* Course Filters */}
              <div className="flex flex-wrap gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                {['All', 'Beginner', 'Basic', 'Grammar', 'Conversation', 'Advanced'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sans transition ${
                      activeCategory === cat
                        ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {coursesLoading ? (
              <div className="py-24 text-center text-zinc-400 font-sans">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Synthesizing courses track from curriculum...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses
                  .filter((c) => activeCategory === 'All' || c.category === activeCategory)
                  .map((course) => {
                    const completedInCourse = course.lessons.filter((l) =>
                      progress.completedLessons.includes(l.id)
                    ).length;
                    const completionPct = course.lessons.length > 0
                      ? Math.round((completedInCourse / course.lessons.length) * 100)
                      : 0;

                    return (
                      <div
                        key={course.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm space-y-4 hover:border-purple-400 dark:hover:border-purple-800 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-black bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider">
                              Pathway: {course.category}
                            </span>
                            <h3 className="font-sans font-black text-lg text-zinc-800 dark:text-zinc-100 mt-2">
                              {course.title}
                            </h3>
                          </div>

                          {/* Completion Percent badge */}
                          <div className="text-right">
                            <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{completionPct}%</p>
                            <p className="text-[9px] uppercase font-mono text-zinc-400 font-semibold">Done</p>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                          {course.description}
                        </p>

                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>

                        {/* Lessons Accordion Panel inside card */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Course syllabus:</p>
                          {course.lessons.map((lesson) => {
                            const isCompleted = progress.completedLessons.includes(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800/40 rounded-2xl hover:bg-purple-50/10 transition-colors"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-xs font-sans font-bold text-zinc-700 dark:text-zinc-300 flex items-center">
                                    {lesson.title}
                                    {isCompleted && (
                                      <span className="ml-1.5 text-green-500 font-bold" title="Completed">✓</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 leading-none max-w-sm font-medium line-clamp-1">{lesson.description}</p>
                                </div>

                                <button
                                  onClick={() => {
                                    setActiveCourseId(course.id);
                                    setActiveLesson(lesson);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-sans transition ${
                                    isCompleted
                                      ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                                  }`}
                                >
                                  {isCompleted ? 'Re-practice' : 'Start drill'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

          </div>
        )}

        {/* ========================================== */}
        {/* 4. LEADERBOARD / RANKS VIEW */}
        {/* ========================================== */}
        {currentTab === 'leaderboard' && (
          <Leaderboard />
        )}

        {/* ========================================== */}
        {/* 5. PROFILE & SETTINGS VIEW */}
        {/* ========================================== */}
        {currentTab === 'profile' && progress && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Stats & Edit Profile */}
            <div className="space-y-6">
              
              {/* Profile Card details */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full mx-auto border-2 border-purple-500 bg-zinc-50"
                />

                <h3 className="font-sans font-extrabold text-xl text-zinc-800 dark:text-zinc-100 mt-3">{user.name}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>

                {/* Subheading stats summary badge list */}
                <div className="mt-4 flex justify-center space-x-2 text-xs">
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl font-bold">
                    Level {progress.level}
                  </span>
                  <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl font-bold">
                    {progress.streak} days streak
                  </span>
                </div>
              </div>

              {/* Edit details form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
                <h4 className="font-sans font-extrabold text-sm text-zinc-800 dark:text-zinc-100 mb-4">Edit Student Details</h4>
                
                {profileMessage && (
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 text-[11px] text-zinc-600 rounded-xl mb-3">
                    {profileMessage}
                  </p>
                )}

                <form onSubmit={handleEditProfile} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Avatar seed link</label>
                    <input
                      type="text"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-sans font-bold text-xs rounded-xl"
                  >
                    Update Profile
                  </button>
                </form>
              </div>

              {/* Change password form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
                <h4 className="font-sans font-extrabold text-sm text-zinc-800 dark:text-zinc-100 mb-4">Modify Security Password</h4>
                
                {passwordMessage && (
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 text-[11px] text-zinc-600 rounded-xl mb-3">
                    {passwordMessage}
                  </p>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-sans font-bold text-xs rounded-xl"
                  >
                    Apply New Password
                  </button>
                </form>
              </div>

            </div>

            {/* Right Columns splits: Settings toggles, Certificates and Bookmarks */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Skill Specific Proficiency Stats */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
                <h3 className="font-sans font-extrabold text-base text-zinc-800 dark:text-zinc-100 mb-4">Cumulative Pathway Scorecard</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Pronouncing</p>
                    <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">{progress.pronunciationScore || 0}%</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Quizzing</p>
                    <p className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{progress.quizScore || 0}%</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Writing</p>
                    <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">{progress.writingScore || 0}%</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Reading</p>
                    <p className="text-xl font-bold mt-1 text-orange-600 dark:text-orange-400">{progress.readingScore || 0}%</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Listening</p>
                    <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">{progress.listeningScore || 0}%</p>
                  </div>

                </div>
              </div>

              {/* 2. System Customization preferences */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-sans font-extrabold text-base text-zinc-800 dark:text-zinc-100">Preferences & Customization</h3>

                <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-xs">
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">Visual Theme Selector</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Toggle between modern Light mode or Cosmic Dark mode.</p>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="p-2 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-purple-600 dark:text-purple-400 rounded-xl transition flex items-center space-x-1.5 font-bold"
                  >
                    {progress.settings.theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-purple-500" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Certificate graduation showcase */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-sans font-extrabold text-base text-zinc-800 dark:text-zinc-100">Official Graduations</h3>
                <CertificatesPanel certificates={progress.certificates} />
              </div>

              {/* 4. Bookmarks explorer */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-sans font-extrabold text-base text-zinc-800 dark:text-zinc-100">Saved Vocabulary Bookmarks</h3>
                  
                  <input
                    type="text"
                    value={bookmarkSearch}
                    onChange={(e) => setBookmarkSearch(e.target.value)}
                    placeholder="Search favorites..."
                    className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  />
                </div>

                {progress.bookmarks.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No bookmarks saved yet. Click the bookmark icon during learning sessions.</p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {progress.bookmarks
                      .filter(b => b.word.toLowerCase().includes(bookmarkSearch.toLowerCase()) || b.english.toLowerCase().includes(bookmarkSearch.toLowerCase()))
                      .map((b) => (
                        <div key={b.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between text-xs font-medium">
                          <div>
                            <span className="font-sans font-extrabold text-sm text-zinc-800 dark:text-zinc-100">{b.word}</span>{' '}
                            <span className="text-[10px] text-zinc-400 font-mono">({b.roman})</span>
                            <p className="text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">&rarr; {b.english}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <AudioPlayer text={b.word} />
                            <button
                              onClick={() => handleRemoveBookmark(b)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded-lg transition"
                              title="Delete bookmark"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* 6. ADMIN PANEL VIEW */}
        {/* ========================================== */}
        {currentTab === 'admin' && isAdmin && (
          <AdminPanel />
        )}

      </main>

      {/* ========================================== */}
      {/* ACTIVE LESSON MODAL OVERLAY */}
      {/* ========================================== */}
      {activeLesson && (
        <LessonWindow
          lesson={activeLesson}
          courseId={activeCourseId}
          onClose={() => {
            setActiveLesson(null);
            setActiveCourseId('');
            fetchAllCourses(); // Reload progress completed counts
            refreshMe(); // Reload global stats
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
