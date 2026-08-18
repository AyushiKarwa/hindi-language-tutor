/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface HistoryItem {
  date: string;
  xp: number;
}

interface ProgressChartProps {
  history: HistoryItem[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ history }) => {
  // Pad out the last 7 days of dates if they don't have records
  const getWeeklyData = (): HistoryItem[] => {
    const dataMap: Record<string, number> = {};
    history.forEach((h) => {
      dataMap[h.date] = h.xp;
    });

    const list: HistoryItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        date: dateStr,
        xp: dataMap[dateStr] || 0
      });
    }
    return list;
  };

  const weekData = getWeeklyData();
  const maxXP = Math.max(...weekData.map((d) => d.xp), 50); // Min scale of 50 XP

  // Chart bounds
  const width = 500;
  const height = 180;
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = weekData.map((d, index) => {
    const x = paddingLeft + (index / 6) * chartWidth;
    // Invert Y axis
    const y = paddingTop + chartHeight - (d.xp / maxXP) * chartHeight;
    return { x, y, label: d.xp, date: d.date };
  });

  // Construct SVG paths
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">XP Progress Trend</h3>
        </div>
        <span className="text-xs font-mono font-semibold text-green-500 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Weekly Track
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const labelValue = Math.round(maxXP * (1 - ratio));
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="monospace"
                  fill="#94a3b8"
                >
                  {labelValue}
                </text>
              </g>
            );
          })}

          {/* Glowing Area path */}
          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

          {/* Sharp Line path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactivity dots & values */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
                className="dark:stroke-slate-900 transition duration-150 group-hover:r-6"
              />
              
              {/* Highlight score number */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
                fill="#4338ca"
                className="opacity-0 group-hover:opacity-100 dark:fill-indigo-400 font-mono transition duration-150"
              >
                {p.label} XP
              </text>

              {/* Date labels on bottom */}
              <text
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                fill="#94a3b8"
                className="font-semibold"
              >
                {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
