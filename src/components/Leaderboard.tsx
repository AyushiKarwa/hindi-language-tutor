/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardUser } from '../types';
import { API } from '../lib/api';
import { Trophy, Medal, Flame, Search, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await API.getLeaderboard();
      setRankings(data);
    } catch (err) {
      console.error('Leaderboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const sortedRankings = [...rankings]
    .sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      return b.xp - a.xp;
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const filteredRankings = sortedRankings.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="font-sans font-extrabold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
              Global Namaste Leagues
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compete with global learners. Keep practicing Hindi to rise in the charts!
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchLeaderboard}
          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center justify-center self-start sm:self-auto"
          title="Refresh rankings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Sorting Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSortBy('xp')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              sortBy === 'xp'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sort by XP Points
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              sortBy === 'streak'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sort by Streaks
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learners..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-sans">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-sm">Retrieving league tables...</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredRankings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-sans border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm">No learners found matching your criteria.</p>
            </div>
          ) : (
            filteredRankings.map((r, idx) => {
              const isCurrentUser = user && r.id === user.id;
              
              // Rank graphic
              let rankBadge = null;
              if (r.rank === 1) {
                rankBadge = <Medal className="w-6 h-6 text-yellow-500" />;
              } else if (r.rank === 2) {
                rankBadge = <Medal className="w-6 h-6 text-slate-400" />;
              } else if (r.rank === 3) {
                rankBadge = <Medal className="w-6 h-6 text-amber-600" />;
              }

              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                    isCurrentUser
                      ? 'bg-indigo-50/55 dark:bg-indigo-950/25 border-indigo-500/40 ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left rank and profile */}
                  <div className="flex items-center space-x-3.5">
                    
                    {/* Rank indicator */}
                    <div className="w-8 flex items-center justify-center">
                      {rankBadge ? (
                        rankBadge
                      ) : (
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                          #{r.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"
                    />

                    {/* Name */}
                    <div>
                      <p className="text-sm font-sans font-bold text-slate-800 dark:text-slate-100 flex items-center">
                        {r.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 bg-indigo-600 text-white text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Rank {r.rank} in Academy
                      </p>
                    </div>

                  </div>

                  {/* Right metrics values */}
                  <div className="flex items-center space-x-5">
                    
                    {/* Streak details */}
                    <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 font-bold text-xs" title="Streak count">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{r.streak}d</span>
                    </div>

                    {/* XP details */}
                    <div className="text-right min-w-[70px]">
                      <p className="text-sm font-sans font-black text-indigo-600 dark:text-indigo-400">
                        {r.xp} <span className="text-[10px] font-normal text-slate-400">XP</span>
                      </p>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
