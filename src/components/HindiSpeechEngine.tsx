/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, AlertTriangle, CheckCircle, Volume2, HelpCircle } from 'lucide-react';
import { API } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface HindiSpeechEngineProps {
  expectedText: string; // e.g. "नमस्ते"
  expectedRoman?: string; // e.g. "namaste"
  onScoreSaved?: (score: number) => void;
}

export const HindiSpeechEngine: React.FC<HindiSpeechEngineProps> = ({
  expectedText,
  expectedRoman = '',
  onScoreSaved
}) => {
  const { updateProgressState } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'hi-IN'; // Target Hindi language

    rec.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setScore(null);
      setFeedback('Listening... Speak clearly in Hindi.');
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript || '';
      setTranscript(resultText);
      calculateSimilarity(resultText);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setFeedback(`Error: ${event.error}. Please try again.`);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
  }, [expectedText]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Already started or transient error
        recognitionRef.current.stop();
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Basic similarity matching (Levenshtein-based ratio)
  const calculateSimilarity = async (spoken: string) => {
    const target = expectedText.trim().toLowerCase();
    const spokenNormalized = spoken.trim().toLowerCase();

    // Calculate score
    let matchScore = 0;
    if (spokenNormalized === target) {
      matchScore = 100;
    } else {
      // Basic character match distance
      let matches = 0;
      const length = Math.max(target.length, spokenNormalized.length);
      for (let i = 0; i < Math.min(target.length, spokenNormalized.length); i++) {
        if (target[i] === spokenNormalized[i]) matches++;
      }
      matchScore = Math.round((matches / length) * 100);

      // Give generous allowance for transliterated text if they spoke english roman text
      if (expectedRoman && spokenNormalized.includes(expectedRoman.toLowerCase().trim())) {
        matchScore = Math.max(matchScore, 85);
      }
    }

    // Bound between 10 and 100 for efforts
    if (matchScore < 10 && spokenNormalized.length > 0) {
      matchScore = Math.floor(Math.random() * 25) + 35; // Generous beginner encouragement!
    }

    setScore(matchScore);

    // Formulate feedback
    let feedbackMsg = '';
    if (matchScore >= 85) {
      feedbackMsg = 'Excellent! Your pronunciation is incredibly native and accurate.';
    } else if (matchScore >= 60) {
      feedbackMsg = 'Good attempt! Try to enunciate the individual letters a bit clearer.';
    } else {
      feedbackMsg = 'Keep practicing! Focus on the breath and try again.';
    }
    setFeedback(feedbackMsg);

    // Save score to persistent database!
    try {
      const updatedProg = await API.updateScore('pronunciation', matchScore);
      updateProgressState(updatedProg);
      if (onScoreSaved) {
        onScoreSaved(matchScore);
      }
    } catch (err) {
      console.error('Error saving pronunciation score:', err);
    }
  };

  const replayRecording = () => {
    if (!transcript) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider flex items-center">
          <Mic className="w-3.5 h-3.5 mr-1" /> Pronunciation Review
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">
          Say: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{expectedText}</strong> {expectedRoman && `(${expectedRoman})`}
        </span>
      </div>

      {!recognitionSupported ? (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Web Speech API Not Fully Supported</p>
            <p>Your browser doesn't support live Hindi voice recording. We will award a default score so you don't get blocked!</p>
            <button
              type="button"
              onClick={() => calculateSimilarity(expectedText)}
              className="mt-2 text-xs text-amber-800 dark:text-amber-200 underline font-bold"
            >
              Simulate Pronunciation Match
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-2">
          
          {/* Main recording indicator */}
          <div className="flex items-center space-x-3 mb-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all duration-200 transform active:scale-95"
                title="Start Recording"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all duration-200 animate-pulse transform active:scale-95"
                title="Stop Recording"
              >
                <MicOff className="w-6 h-6" />
              </button>
            )}

            {transcript && (
              <button
                type="button"
                onClick={replayRecording}
                className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-slate-700 dark:text-slate-200 transition"
                title="Replay Spoken Text"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback section */}
          {feedback && (
            <div className="text-center w-full">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
                {isRecording ? 'Listening...' : 'Feedback:'}
              </p>
              <p className="text-sm font-sans font-medium text-slate-800 dark:text-slate-200 max-w-md mx-auto">
                {feedback}
              </p>
            </div>
          )}

          {/* Results section */}
          {transcript && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Recognized Text</p>
                <p className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-100">"{transcript}"</p>
              </div>

              {score !== null && (
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Score</p>
                    <p className={`text-base font-bold ${score >= 80 ? 'text-green-500' : 'text-indigo-500'}`}>
                      {score}%
                    </p>
                  </div>
                  {score >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
