/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Flame } from 'lucide-react';

interface LearningCalendarProps {
  dates: string[]; // YYYY-MM-DD
}

export const LearningCalendar: React.FC<LearningCalendarProps> = ({ dates }) => {
  // Generate the last 21 days for a compact dashboard grid
  const getPastDays = () => {
    const arr = [];
    for (let i = 20; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d);
    }
    return arr;
  };

  const days = getPastDays();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">Learning Calendar</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Last 3 weeks</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Weekday headers */}
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, idx) => (
          <span key={idx} className="text-[10px] font-mono text-slate-400 font-bold uppercase">
            {w}
          </span>
        ))}

        {/* Days grid */}
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const hasPracticed = dates.includes(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div
              key={idx}
              className="group relative flex flex-col items-center justify-center py-1"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition duration-200 ${
                  hasPracticed
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/10'
                    : isToday
                    ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-black'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-200/40 dark:border-slate-800/40'
                }`}
              >
                {hasPracticed ? (
                  <Flame className="w-4 h-4 fill-white" />
                ) : (
                  <span>{day.getDate()}</span>
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 pointer-events-none transition duration-150 z-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap">
                {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {hasPracticed ? ' - Practiced! 🔥' : ' - No activity'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs font-sans">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60" />
          <span className="text-slate-500 dark:text-slate-400">Idle</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-slate-500 dark:text-slate-400">Active Day</span>
        </div>
      </div>
    </div>
  );
};
