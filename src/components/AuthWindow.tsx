/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../lib/api';
import { Mail, Lock, User as UserIcon, Sparkles, RefreshCw, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthWindowProps {
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export const AuthWindow: React.FC<AuthWindowProps> = ({ onSuccess }) => {
  const { login, register, loginAsGuest, quickDemoLogin } = useAuth();

  // Mode controllers
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Verification/Reset states
  const [verificationCode, setVerificationCode] = useState('');
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
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please double check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const data = await register(name, email, password);
      
      // Auto-populate verification code in helper text for preview comfort!
      if (data.user?.verificationCode) {
        setSuccessMsg(`Account created! Your verification code is: ${data.user.verificationCode}`);
      } else {
        setSuccessMsg('Account created! Please enter verification code.');
      }
      setMode('verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try using another email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      await API.verifyEmail(email, verificationCode);
      setSuccessMsg('Email successfully verified! Logging in...');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearMessages();
    try {
      const data = await API.resendCode(email);
      if (data.verificationCode) {
        setSuccessMsg(`A new code was generated: ${data.verificationCode}`);
      } else {
        setSuccessMsg('A new verification code has been generated!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Resend code failed.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const data = await API.forgotPassword(email);
      setSuccessMsg(`Instructions sent! Your password-reset code is: ${data.resetToken}`);
      setResetToken(data.resetToken || '');
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Forgot request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      await API.resetPassword(email, resetToken, newPassword);
      setSuccessMsg('Password successfully updated! You can now log in.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect token or email.');
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
          {mode === 'register' && 'Start Learning Hindi'}
          {mode === 'forgot' && 'Reset Your Password'}
          {mode === 'reset' && 'Apply New Password'}
          {mode === 'verify' && 'Verify Your Email'}
        </h3>
        
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          {mode === 'login' && "Sign in to access your custom stats and courses."}
          {mode === 'register' && "Join global Namaste leagues and earn XP rewards."}
          {mode === 'forgot' && "Specify your email to generate a restoration code."}
          {mode === 'reset' && "Enter your restoration code and a secure password."}
          {mode === 'verify' && `Input the 6-digit pin sent to ${email}`}
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
      {/* AUTH MODE FORM HANDLERS */}
      {/* ========================================== */}

      {/* 1. Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl text-xs space-y-1">
            <p className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span>💡 Pre-configured Demo Accounts:</span>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('learner@namaste.dev');
                  setPassword('namaste123');
                }}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-[11px] text-indigo-600 dark:text-indigo-400 font-mono hover:bg-indigo-50 transition"
              >
                learner@namaste.dev (Fill)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('ayushikarwa2019@gmail.com');
                  setPassword('admin123');
                }}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg text-[11px] text-amber-600 dark:text-amber-400 font-mono hover:bg-amber-50 transition"
              >
                Admin (Fill)
              </button>
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
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In &rarr;</span>}
          </button>

          {/* Quick 1-Click Access / Skip Login Section */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800/80 space-y-2">
            <p className="text-[10px] uppercase font-mono font-bold text-center text-slate-400">Quick 1-Click Access</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickDemoLogin('learner');
                  onSuccess();
                }}
                className="py-2 px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-sans font-bold text-xs rounded-xl border border-purple-200/50 dark:border-purple-800/50 transition flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Learner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  quickDemoLogin('admin');
                  onSuccess();
                }}
                className="py-2 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-sans font-bold text-xs rounded-xl border border-amber-200/50 dark:border-amber-800/50 transition flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Demo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                loginAsGuest('Namaste Learner');
                onSuccess();
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>🚀 Enter Tutor Directly (Skip Login)</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Register Form */}
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
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Create Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Assemble Account &rarr;</span>}
          </button>
        </form>
      )}

      {/* 3. Verification Code verification Form */}
      {mode === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Enter Verification Code</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-Digit PIN"
                maxLength={6}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-sans font-extrabold text-xs rounded-xl active:scale-[0.98] transition flex items-center justify-center"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Pin Code</span>}
          </button>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-sans font-semibold hover:underline"
            >
              Didn't receive code? Resend PIN
            </button>
          </div>
        </form>
      )}

      {/* 4. Forgot Password Email submission Form */}
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
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl transition flex items-center justify-center"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Generate Restoration Code</span>}
          </button>

          <button
            type="button"
            onClick={() => { clearMessages(); setMode('login'); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 block text-center mx-auto"
          >
            &larr; Back to Login
          </button>
        </form>
      )}

      {/* 5. Reset Password Form */}
      {mode === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Restoration Code</label>
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
            <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">New Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-xl transition flex items-center justify-center"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Reset Password &rarr;</span>}
          </button>
        </form>
      )}

      {/* Toggle mode footnotes */}
      {(mode === 'login' || mode === 'register') && (
        <div className="text-center pt-5 border-t border-slate-100 dark:border-slate-800 mt-5 text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              New to Namaste Hindi?{' '}
              <button
                type="button"
                onClick={() => { clearMessages(); setMode('register'); }}
                className="text-indigo-600 dark:text-indigo-400 font-sans font-bold hover:underline"
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
                className="text-indigo-600 dark:text-indigo-400 font-sans font-bold hover:underline"
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
