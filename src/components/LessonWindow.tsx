/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson, Exercise } from '../types';
import { API } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AudioPlayer } from './AudioPlayer';
import { HindiSpeechEngine } from './HindiSpeechEngine';
import { Sparkles, Trophy, ArrowRight, Check, X, HelpCircle, Volume2, AlertCircle, BookOpen, Star, Coins } from 'lucide-react';

interface LessonWindowProps {
  lesson: Lesson;
  courseId: string;
  onClose: () => void;
}

export const LessonWindow: React.FC<LessonWindowProps> = ({ lesson, courseId, onClose }) => {
  const { updateProgressState } = useAuth();
  
  // Exercise indexing state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  
  // Sentence building builder state
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  
  // Matching exercise state
  const [matchingSelections, setMatchingSelections] = useState<{ hindi?: string; english?: string }>({});
  const [completedMatches, setCompletedMatches] = useState<string[]>([]); // "hindi:english"

  // Checking state
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Scoring / Final view state
  const [scoreEarned, setScoreEarned] = useState(0); // Cumulative correctly-answered
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const currentExercise: Exercise = lesson.exercises[currentIdx];

  const handleOptionSelect = (option: string) => {
    if (hasChecked) return;
    setSelectedOption(option);
  };

  const handleWordTap = (word: string) => {
    if (hasChecked) return;
    if (builtWords.includes(word)) {
      setBuiltWords(builtWords.filter((w) => w !== word));
    } else {
      setBuiltWords([...builtWords, word]);
    }
  };

  const handleMatchTap = (type: 'hindi' | 'english', value: string) => {
    if (hasChecked) return;

    const newSelections = { ...matchingSelections, [type]: value };
    setMatchingSelections(newSelections);

    if (newSelections.hindi && newSelections.english) {
      // Find pair inside currentExercise.pairs
      const matchExists = currentExercise.pairs?.some(
        (p) => p.hindi === newSelections.hindi && p.english === newSelections.english
      );

      if (matchExists) {
        setCompletedMatches([...completedMatches, `${newSelections.hindi}:${newSelections.english}`]);
      }
      // Reset selections
      setMatchingSelections({});
    }
  };

  const handleCheckAnswer = () => {
    if (hasChecked) return;

    let correct = false;

    switch (currentExercise.type) {
      case 'flashcard':
      case 'reading':
        correct = true; // Reading pass or clicking card is always positive progress
        break;

      case 'multiple-choice':
      case 'listening':
        correct = selectedOption === currentExercise.correctAnswer;
        break;

      case 'fill-in-the-blanks':
      case 'writing':
        const cleanInput = textInput.trim().toLowerCase();
        const cleanAnswer = typeof currentExercise.correctAnswer === 'string'
          ? currentExercise.correctAnswer.trim().toLowerCase()
          : '';
        correct = cleanInput === cleanAnswer;
        break;

      case 'translation':
        const userTrans = textInput.trim().toLowerCase();
        correct = userTrans === (currentExercise.correctAnswer as string).toLowerCase().trim();
        break;

      case 'sentence-building':
        const constructed = builtWords.join(' ');
        correct = constructed === currentExercise.correctAnswer;
        break;

      case 'matching':
        const totalPairs = currentExercise.pairs?.length || 0;
        correct = completedMatches.length === totalPairs;
        break;

      case 'speaking':
        // Evaluated inside its sub-component, clicking "Next" moves on
        correct = true;
        break;

      default:
        correct = false;
    }

    setIsCorrect(correct);
    if (correct) {
      setScoreEarned((prev) => prev + 1);
    }
    setHasChecked(true);
  };

  const handleNextQuestion = async () => {
    // Reset answers states
    setSelectedOption('');
    setTextInput('');
    setBuiltWords([]);
    setCompletedMatches([]);
    setMatchingSelections({});
    setHasChecked(false);
    setIsCorrect(false);

    if (currentIdx < lesson.exercises.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed lesson completely! Let's submit rewards
      setSavingProgress(true);
      try {
        // Compute average quiz accuracy (excluding flashcards/speaking which are auto-correct)
        const quizPercent = Math.round((scoreEarned / lesson.exercises.length) * 100);
        
        // Save cumulative quiz score
        await API.updateScore('quiz', quizPercent);

        // Complete lesson, awarding XP and coins
        await API.addXP(lesson.xpReward, lesson.coinsReward);
        const finalProgress = await API.completeLesson(lesson.id, courseId);
        
        updateProgressState(finalProgress);
        setLessonCompleted(true);
      } catch (err) {
        console.error('Error finalising lesson progress:', err);
      } finally {
        setSavingProgress(false);
      }
    }
  };

  // Skip speaking exercise safely
  const handleSkipSpeaking = () => {
    setIsCorrect(true);
    setHasChecked(true);
  };

  const progressPct = Math.round(((currentIdx) / lesson.exercises.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col transition-colors duration-200">
      
      {/* Upper Navigation Header */}
      <header className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-sans font-bold text-sm flex items-center"
        >
          &larr; Exit Lesson
        </button>

        {/* Progress gauge */}
        <div className="flex-1 max-w-md mx-6">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
          <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
          <span>{currentIdx + 1}/{lesson.exercises.length}</span>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col justify-between overflow-y-auto">
        
        {!lessonCompleted ? (
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            
            {/* Question title / category prompt */}
            <div>
              <span className="text-[10px] font-mono font-black bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
                Exercise Style: {currentExercise.type}
              </span>
              <h2 className="font-sans font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 mt-3 leading-tight">
                {currentExercise.question}
              </h2>
            </div>

            {/* Devanagari card showcase */}
            {currentExercise.hindiQuestion && (
              <div className="p-6 bg-indigo-50/40 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                <span className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400">SPELLING / NATIVE</span>
                <span className="font-sans font-extrabold text-4xl text-indigo-700 dark:text-indigo-400">
                  {currentExercise.hindiQuestion}
                </span>
                
                {/* Embedded TTS Audio */}
                {currentExercise.audioText && (
                  <AudioPlayer text={currentExercise.audioText} />
                )}
              </div>
            )}

            {/* ========================================== */}
            {/* EXERCISE SPECIFIC LAYOUTS */}
            {/* ========================================== */}

            {/* 1. Flashcard detail */}
            {currentExercise.type === 'flashcard' && (
              <div className="space-y-3">
                <div className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
                  <p className="text-xs text-slate-400 font-mono">English Definition:</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                    "{currentExercise.correctAnswer}"
                  </p>
                  {currentExercise.hint && (
                    <p className="text-xs text-slate-400 mt-2 italic">
                      💡 {currentExercise.hint}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 2. Reading Passage layout */}
            {currentExercise.type === 'reading' && currentExercise.passage && (
              <div className="space-y-4">
                <div className="p-5 bg-amber-50/10 border border-amber-500/20 rounded-2xl text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {currentExercise.passage}
                </div>
                {currentExercise.audioText && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Hear paragraph read:</span>
                    <AudioPlayer text={currentExercise.audioText} />
                  </div>
                )}
              </div>
            )}

            {/* 3. Multiple Choice options */}
            {(currentExercise.type === 'multiple-choice' || currentExercise.type === 'listening') && currentExercise.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {currentExercise.options.map((opt, idx) => {
                  const isSel = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasChecked}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-sans font-bold transition-all ${
                        isSel
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="mr-3 text-indigo-400 text-xs font-mono">{idx + 1}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. Text Input type (Fill in blanks, Writing, Translation) */}
            {(currentExercise.type === 'fill-in-the-blanks' || currentExercise.type === 'writing' || currentExercise.type === 'translation') && (
              <div className="space-y-3">
                <input
                  type="text"
                  disabled={hasChecked}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your Hindi / English answer spelling here..."
                  className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
                {currentExercise.hint && (
                  <p className="text-xs text-slate-400 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Hint: {currentExercise.hint}
                  </p>
                )}
              </div>
            )}

            {/* 5. Sentence Building words pool */}
            {currentExercise.type === 'sentence-building' && currentExercise.options && (
              <div className="space-y-4">
                {/* Active construction bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[50px] flex flex-wrap gap-2 items-center">
                  {builtWords.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Tap word chips to construct sentence...</span>
                  ) : (
                    builtWords.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleWordTap(w)}
                        className="bg-indigo-600 text-white font-sans font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-sm hover:bg-indigo-700 transition"
                      >
                        {w}
                      </span>
                    ))
                  )}
                </div>

                {/* Pool words to tap */}
                <div className="flex flex-wrap gap-2.5">
                  {currentExercise.options.map((opt, idx) => {
                    const isUsed = builtWords.includes(opt);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isUsed || hasChecked}
                        onClick={() => handleWordTap(opt)}
                        className={`px-4 py-2 border rounded-xl font-sans text-xs font-bold transition ${
                          isUsed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 border-slate-200/50 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Matching pair rows */}
            {currentExercise.type === 'matching' && currentExercise.pairs && (
              <div className="grid grid-cols-2 gap-4">
                
                {/* Hindi items column */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase text-slate-400">Hindi Column</p>
                  {currentExercise.pairs.map((p) => {
                    const isMatched = completedMatches.some((m) => m.startsWith(p.hindi));
                    const isSel = matchingSelections.hindi === p.hindi;
                    return (
                      <button
                        key={p.hindi}
                        type="button"
                        disabled={isMatched || hasChecked}
                        onClick={() => handleMatchTap('hindi', p.hindi)}
                        className={`w-full p-3 border rounded-xl font-sans text-xs font-bold text-left transition ${
                          isMatched
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-500 border-green-300/30 cursor-not-allowed'
                            : isSel
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.hindi}
                      </button>
                    );
                  })}
                </div>

                {/* English translations column */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase text-slate-400">English Translation</p>
                  {currentExercise.pairs.map((p) => {
                    const isMatched = completedMatches.some((m) => m.endsWith(p.english));
                    const isSel = matchingSelections.english === p.english;
                    return (
                      <button
                        key={p.english}
                        type="button"
                        disabled={isMatched || hasChecked}
                        onClick={() => handleMatchTap('english', p.english)}
                        className={`w-full p-3 border rounded-xl font-sans text-xs font-bold text-left transition ${
                          isMatched
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-500 border-green-300/30 cursor-not-allowed'
                            : isSel
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.english}
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

            {/* 7. Pronunciation speaking module */}
            {currentExercise.type === 'speaking' && (
              <div className="space-y-3">
                <HindiSpeechEngine
                  expectedText={currentExercise.hindiQuestion || ''}
                  expectedRoman={currentExercise.correctAnswer as string}
                />
                
                {/* Skippable trigger */}
                {!hasChecked && (
                  <button
                    type="button"
                    onClick={handleSkipSpeaking}
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline block mx-auto pt-2"
                  >
                    Skip Speaking practice module &rarr;
                  </button>
                )}
              </div>
            )}

            {/* ========================================== */}
            {/* ACTION FOOTER EVALUATION */}
            {/* ========================================== */}
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              
              {/* Checked Feedback Banner */}
              {hasChecked && (
                <div
                  className={`p-4 rounded-2xl flex items-start space-x-3 transition animate-in slide-in-from-bottom-2 duration-200 ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}
                >
                  {isCorrect ? (
                    <Check className="w-5 h-5 shrink-0 text-green-500 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  )}
                  
                  <div>
                    <h4 className="font-sans font-black text-sm">{isCorrect ? 'Stellar work! Correct.' : 'Incorrect Answer'}</h4>
                    {currentExercise.explanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentExercise.explanation}</p>
                    )}
                    
                    {/* Display correct solution when wrong */}
                    {!isCorrect && (
                      <p className="text-xs font-sans font-semibold mt-1.5">
                        Correct Answer: <strong className="underline">{String(currentExercise.correctAnswer)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verify Trigger buttons */}
              {!hasChecked ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition duration-150"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-slate-800 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-900 text-white font-sans font-extrabold text-sm rounded-2xl active:scale-[0.98] transition duration-150 flex items-center justify-center space-x-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>
        ) : (
          /* ========================================== */
          /* LESSON GRADUATION / COMPLETE PANEL */
          /* ========================================== */
          <div className="py-12 text-center space-y-6 max-w-sm mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/20">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <h2 className="font-sans font-black text-2xl text-slate-800 dark:text-slate-100">Congratulations!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                You graduated from <strong className="text-slate-800 dark:text-slate-200">{lesson.title}</strong> perfectly!
              </p>
            </div>

            {/* XP and Coins details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 p-5 rounded-3xl">
              <div className="text-center">
                <p className="text-[10px] font-mono text-slate-400 uppercase">XP Awarded</p>
                <p className="text-2xl font-sans font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center mt-1">
                  <Star className="w-5 h-5 text-indigo-500 mr-1 fill-indigo-500" />
                  +{lesson.xpReward}
                </p>
              </div>

              <div className="text-center border-l border-slate-200/50 dark:border-slate-800">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Coins Collected</p>
                <p className="text-2xl font-sans font-black text-yellow-600 dark:text-yellow-400 flex items-center justify-center mt-1">
                  <Coins className="w-5 h-5 text-yellow-500 mr-1" />
                  +{lesson.coinsReward}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition duration-150"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
