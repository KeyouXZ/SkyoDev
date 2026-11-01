'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { signIn, signUp } from '@/auth/action';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
  }

  function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn({ email: loginEmail, password: loginPassword });
      if (!result.success) {
        setError(result.error ?? 'Login failed');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  function handleRegister(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    startTransition(async () => {
      const result = await signUp({
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
      });
      if (!result.success) {
        setError(result.error ?? 'Registration failed');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#ddf1f7] flex items-center justify-center p-4 font-sans antialiased">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00a2be]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#00a2be]/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-widest text-[#00a2be] select-none drop-shadow-sm">
            NIRAGA
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Stock &amp; Inventory AI Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl backdrop-blur-md overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100 bg-white/50">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-150 ${
                tab === 'login'
                  ? 'text-[#00a2be] border-b-2 border-[#00a2be] bg-white/70'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-150 ${
                tab === 'register'
                  ? 'text-[#00a2be] border-b-2 border-[#00a2be] bg-white/70'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-7">
            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-11 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#00a2be] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0091ab] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 pt-1">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-[#00a2be] font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Last Name
                    </label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-11 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full rounded-xl border border-gray-200 bg-[#edf6fa] py-2.5 pl-10 pr-11 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#00a2be]/50 focus:ring-2 focus:ring-[#00a2be]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#00a2be] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0091ab] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-[#00a2be] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 select-none">
          v0.2.0 • NIRAGA • Stock &amp; Inventory AI
        </p>
      </div>
    </div>
  );
}
