/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../lib/api';
import { Mail, Lock, User as UserIcon, Sparkles, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthWindowProps {
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthWindow: React.FC<AuthWindowProps> = ({ onSuccess }) => {
  const { login, register, loginDemoLearner } = useAuth();

  // Mode controllers
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Verification/Reset states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    clearMessages();
    setLoading(true);

    try {
      await loginDemoLearner();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed. Please try logging in manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email.');
      return;
    }

    setLoading(true);

    try {
      const data = await API.forgotPassword(email.trim());
      setSuccessMsg(`Instructions generated! Reset code: ${data.resetToken}`);
      setResetToken(data.resetToken || '');
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetToken.trim() || !newPassword) {
      setErrorMsg('Please enter both the reset code and a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await API.resetPassword(email.trim(), resetToken.trim(), newPassword);
      setSuccessMsg('Password successfully updated! You can now log in.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid reset code or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors duration-200">
      
      {/* Dynamic Form Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        
        <h3 className="font-sans font-extrabold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'register' && 'Create Your Account'}
          {mode === 'forgot' && 'Reset Your Password'}
          {mode === 'reset' && 'Set New Password'}
        </h3>
        
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          {mode === 'login' && 'Sign in to access your Hindi courses and saved progress.'}
          {mode === 'register' && 'Join Namaste Hindi to track your learning journey and earn XP.'}
          {mode === 'forgot' && 'Enter your email to receive a password reset code.'}
          {mode === 'reset' && 'Enter your reset code and set your new password.'}
        </p>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium mb-4 flex items-start space-x-2">
          <span className="font-black">❌</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-900/60 rounded-xl text-xs text-green-700 dark:text-green-300 font-semibold mb-4">
          <p className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500 shrink-0" />
            {successMsg}
          </p>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. LOGIN FORM */}
      {/* ========================================== */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase font-bold">Password</label>
              <button
                type="button"
                onClick={() => { clearMessages(); setMode('forgot'); }}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans font-bold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="chk-remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500/30"
            />
            <label htmlFor="chk-remember" className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In &rarr;</span>}
          </button>

          {/* Single Demo Option: Demo Learner */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-sans font-bold text-xs rounded-xl border border-purple-200/50 dark:border-purple-800/50 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Try Demo Learner Account</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================== */}
      {/* 2. REGISTER FORM */}
      {/* ========================================== */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account &rarr;</span>}
          </button>
        </form>
      )}

      {/* ========================================== */}
      {/* 3. FORGOT PASSWORD FORM */}
      {/* ========================================== */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Registered Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl transition flex items-center justify-center cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Generate Reset Code</span>}
          </button>

          <button
            type="button"
            onClick={() => { clearMessages(); setMode('login'); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 block text-center mx-auto cursor-pointer"
          >
            &larr; Back to Login
          </button>
        </form>
      )}

      {/* ========================================== */}
      {/* 4. RESET PASSWORD FORM */}
      {/* ========================================== */}
      {mode === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Reset Code</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="rst_xxxx"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl transition flex items-center justify-center cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password &rarr;</span>}
          </button>
        </form>
      )}

      {/* Mode Switchers */}
      {(mode === 'login' || mode === 'register') && (
        <div className="text-center pt-5 border-t border-slate-100 dark:border-slate-800 mt-5 text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              New to Namaste Hindi?{' '}
              <button
                type="button"
                onClick={() => { clearMessages(); setMode('register'); }}
                className="text-indigo-600 dark:text-indigo-400 font-sans font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { clearMessages(); setMode('login'); }}
                className="text-indigo-600 dark:text-indigo-400 font-sans font-bold hover:underline cursor-pointer"
              >
                Log In instead
              </button>
            </p>
          )}
        </div>
      )}

    </div>
  );
};
