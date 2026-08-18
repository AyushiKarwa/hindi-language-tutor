/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, Play, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'slow'>('normal');
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setVoiceAvailable(false);
    }
  }, []);

  const speak = () => {
    if (!('speechSynthesis' in window)) return;

    // Cancel current speech if running
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) => v.lang.includes('hi') || v.lang.includes('HI') || v.name.toLowerCase().includes('hindi')
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'hi-IN'; // Fallback language code
    }

    // Configure speed
    utterance.rate = speed === 'slow' ? 0.55 : 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Pre-load voices (Chrome requires this trigger event)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={speak}
        className={`p-3 rounded-full flex items-center justify-center transition ${
          isPlaying
            ? 'bg-indigo-600 text-white animate-pulse shadow-md shadow-indigo-500/20'
            : 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400'
        }`}
        title="Hear Pronunciation"
      >
        <Volume2 className="w-5 h-5" />
      </button>

      {/* Speed Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setSpeed('normal')}
          className={`px-2.5 py-1 rounded-md transition ${
            speed === 'normal'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          1.0x
        </button>
        <button
          type="button"
          onClick={() => setSpeed('slow')}
          className={`px-2.5 py-1 rounded-md transition ${
            speed === 'slow'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          0.5x
        </button>
      </div>

      {!voiceAvailable && (
        <span className="flex items-center text-[10px] text-amber-500 font-mono">
          <AlertCircle className="w-3 h-3 mr-0.5" /> TTS Unavailable
        </span>
      )}
    </div>
  );
};
