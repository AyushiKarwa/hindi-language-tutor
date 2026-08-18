/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Coins, Award, Sparkles, LogOut, ShieldAlert, User as UserIcon, BookOpen, Trophy } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, isAdmin }) => {
  const { user, progress, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <span className="font-bold text-lg">H</span>
            </div>
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Namaste Hindi
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              id="nav-tab-courses"
              onClick={() => setCurrentTab('courses')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                currentTab === 'courses'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </div>
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => setCurrentTab('leaderboard')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                currentTab === 'leaderboard'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </div>
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setCurrentTab('profile')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                currentTab === 'profile'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <UserIcon className="w-4 h-4" />
                <span>My Profile</span>
              </div>
            </button>

            {isAdmin && (
              <button
                id="nav-tab-admin"
                onClick={() => setCurrentTab('admin')}
                className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
                  currentTab === 'admin'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Panel</span>
                </div>
              </button>
            )}
          </div>

          {/* Gamification Stats Row */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {progress && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-3 py-1.5 rounded-xl text-xs sm:text-sm">
                
                {/* Level Badge */}
                <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-bold" title="Your Level">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Lvl {progress.level}</span>
                </div>

                {/* Streak Badge */}
                <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 font-bold" title="Day Streak">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{progress.streak}</span>
                </div>

                {/* Coins Badge */}
                <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400 font-bold" title="Gold Coins">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>{progress.coins}</span>
                </div>

                {/* Total XP Badge */}
                <div className="hidden sm:flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold" title="Total XP">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>{progress.xp} XP</span>
                </div>
              </div>
            )}

            {/* Quick Profile Icon & Logout */}
            <div className="flex items-center space-x-2">
              <div className="relative group cursor-pointer" onClick={() => setCurrentTab('profile')}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-indigo-500/30 hover:border-indigo-500 transition duration-200"
                />
              </div>

              <button
                id="btn-logout"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Tab bar (Footer style or quick nav row) */}
      <div className="md:hidden flex justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-semibold ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('courses')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-semibold ${
            currentTab === 'courses' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Courses</span>
        </button>

        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-semibold ${
            currentTab === 'leaderboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Leagues</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-semibold ${
            currentTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
};
