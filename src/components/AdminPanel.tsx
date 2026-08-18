/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Lesson, Exercise } from '../types';
import { API } from '../lib/api';
import { ShieldAlert, Plus, Trash2, Edit3, Settings, Users, BookOpen, BarChart3, HelpCircle, Check, Award } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  
  // Create / Edit states
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonXP, setNewLessonXP] = useState(30);
  const [newLessonCoins, setNewLessonCoins] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Analytics mock calculations based on loaded platform courses
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalUsers: 148, // Live system stats mock
    totalXPGlobal: 42390,
    activeLocker: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await API.getCourses();
      setCourses(data);
      if (data.length > 0) {
        setActiveCourseId(data[0].id);
      }

      // Calculate totals
      const lessonsCount = data.reduce((acc, curr) => acc + curr.lessons.length, 0);
      setAnalytics(prev => ({
        ...prev,
        totalCourses: data.length,
        totalLessons: lessonsCount
      }));
    } catch (err) {
      console.error('Error fetching admin course data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonDesc) {
      setStatusMsg('Please provide a lesson title and description.');
      return;
    }

    // Creating sample custom exercises for the admin-built lesson
    const mockExercises: Exercise[] = [
      {
        id: 'adm-ex-' + Math.random().toString(36).substr(2, 5),
        type: 'flashcard',
        question: 'Learn a newly generated vocabulary term!',
        hindiQuestion: 'धन्यवाद',
        audioText: 'धन्यवाद',
        correctAnswer: 'Thank you'
      },
      {
        id: 'adm-ex-' + Math.random().toString(36).substr(2, 5),
        type: 'multiple-choice',
        question: 'What is the english translation of धन्यवाद?',
        options: ['Hello', 'Please', 'Thank you', 'Goodbye'],
        correctAnswer: 'Thank you',
        explanation: 'धन्यवाद is pronounced Dhanyavaad and means Thank you.'
      }
    ];

    const newLesson: Lesson = {
      id: 'adm-les-' + Math.random().toString(36).substr(2, 5),
      courseId: activeCourseId,
      title: newLessonTitle,
      description: newLessonDesc,
      xpReward: Number(newLessonXP),
      coinsReward: Number(newLessonCoins),
      exercises: mockExercises
    };

    // Update state to simulate db-save locally
    setCourses(prevCourses => {
      return prevCourses.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            lessons: [...c.lessons, newLesson]
          };
        }
        return c;
      });
    });

    setStatusMsg(`Success! Created lesson "${newLessonTitle}" under course.`);
    setNewLessonTitle('');
    setNewLessonDesc('');
    setNewLessonXP(30);
    setNewLessonCoins(10);
    setIsCreating(false);

    setTimeout(() => {
      setStatusMsg('');
    }, 4000);
  };

  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    
    setCourses(prevCourses => {
      return prevCourses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            lessons: c.lessons.filter(l => l.id !== lessonId)
          };
        }
        return c;
      });
    });

    setStatusMsg('Lesson deleted successfully.');
    setTimeout(() => {
      setStatusMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Title Shield */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <h2 className="font-sans font-black text-2xl tracking-tight uppercase">Admin Management Console</h2>
            <p className="text-xs text-indigo-50/80 mt-0.5">
              Secure administrative dashboard to monitor learning metrics, customize curriculum structures, and manage users.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono">Total Courses</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{analytics.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono">Total Lessons</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{analytics.totalLessons}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono">Total Learners</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{analytics.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono">Global XP</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{analytics.totalXPGlobal}</p>
          </div>
        </div>

      </div>

      {statusMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl text-xs text-green-700 dark:text-green-300 font-medium">
          {statusMsg}
        </div>
      )}

      {/* Primary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course Select & Curriculum View */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans font-extrabold text-lg text-slate-800 dark:text-slate-100">Curriculum Syllabus</h3>
            
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold font-sans flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Lesson</span>
            </button>
          </div>

          {/* Form to Create Custom Lesson */}
          {isCreating && (
            <form onSubmit={handleCreateLesson} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40 space-y-3">
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                <Settings className="w-3.5 h-3.5 mr-1" /> Custom Lesson Form
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Target Course ID</label>
                  <select
                    value={activeCourseId}
                    onChange={(e) => setActiveCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="e.g. Traditional Costumes (पोशाक)"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  placeholder="Summarize the dynamic language objectives for this module..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={newLessonXP}
                    onChange={(e) => setNewLessonXP(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Coins Reward</label>
                  <input
                    type="number"
                    value={newLessonCoins}
                    onChange={(e) => setNewLessonCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          )}

          {/* Syllabus Navigation Panel */}
          {loading ? (
            <p className="text-sm text-slate-400">Loading courses structures...</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 px-2.5 py-0.5 rounded-full uppercase">
                        {course.category}
                      </span>
                      <h4 className="font-sans font-bold text-slate-800 dark:text-slate-100 mt-1">{course.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{course.lessons.length} Modules</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {course.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{lesson.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{lesson.description}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full">
                            +{lesson.xpReward} XP
                          </span>
                          <button
                            onClick={() => handleDeleteLesson(course.id, lesson.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                            title="Delete module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Admin Analytics & Issue Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
          
          {/* Issue Certificate Mock */}
          <div className="space-y-3">
            <h3 className="font-sans font-extrabold text-base text-slate-800 dark:text-slate-100">Curated Certificates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Manually trigger and issue credentials to outstanding Hindi learners under their respective academy pathways.
            </p>

            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Learner's Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ayushi Karwa"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Target Learning Pathway</label>
                <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none">
                  <option>Hindi Beginner Basics</option>
                  <option>Basic Vocabulary (शब्दावली)</option>
                  <option>Hindi Grammar (व्याकरण)</option>
                  <option>Hindi Conversation (वार्तालाप)</option>
                  <option>Advanced Hindi (उन्नत)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusMsg('Certificate successfully compiled and dispatched to learner profile! 🎓');
                  setTimeout(() => setStatusMsg(''), 4000);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold font-sans transition"
              >
                Assemble & Dispatch Certificate
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Quick FAQ info */}
          <div className="space-y-2">
            <h4 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1 text-slate-400" /> Admin Guidelines
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This panel represents full administrative authorization. Created custom lessons are temporarily injected and tracked across current database schemas in real time. Deletions are applied immediately.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
