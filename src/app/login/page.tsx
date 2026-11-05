'use client';

// Nexorium Core - Login Page
// Premium styled login backed by Neon Auth (email/password and GitHub).
// Access is invite-only: there is no sign-up form; accounts are created by an administrator.

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, LogIn, AlertCircle, Map } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';

const DEFAULT_AFTER_LOGIN_PATH = '/dashboard/environments';

/** Only same-origin paths are accepted as a post-login destination. */
function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_AFTER_LOGIN_PATH;
  }
  return value;
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get('redirect'));
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'password' | 'github' | null>(null);

  // Already signed in: go straight to the destination
  useEffect(() => {
    if (session?.user) {
      router.replace(redirectTo);
    }
  }, [session, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading('password');

    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password.');
        setLoading(null);
        return;
      }

      // Redirect to the intended page
      router.push(redirectTo);
      router.refresh();
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(null);
    }
  };

  const handleGitHub = async () => {
    setError(null);
    setLoading('github');

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: `${window.location.origin}${redirectTo}`,
      });

      if (socialError) {
        setError(socialError.message || 'GitHub sign-in failed. Please try again.');
        setLoading(null);
      }
      // On success the browser is redirected to GitHub.
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(null);
    }
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#8B95A5] mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/50 focus:border-[#5B5FEF]/50 transition-all"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#8B95A5] mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/50 focus:border-[#5B5FEF]/50 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading !== null}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading === 'password' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign in
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs uppercase tracking-wider text-[#4A5568]">or</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      {/* GitHub sign-in */}
      <button
        type="button"
        onClick={handleGitHub}
        disabled={loading !== null}
        className="w-full py-3 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white font-medium hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading === 'github' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <GitHubMark className="w-5 h-5" />
        )}
        Continue with GitHub
      </button>

      <p className="mt-6 text-center text-xs text-[#4A5568]">
        Access is invite-only. Contact your administrator for an account.
      </p>
    </>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-5">
      <div className="h-[76px] bg-white/[0.02] rounded-lg animate-pulse" />
      <div className="h-[76px] bg-white/[0.02] rounded-lg animate-pulse" />
      <div className="h-[52px] bg-white/[0.02] rounded-lg animate-pulse" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1220]" />

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#5B5FEF]/12 rounded-full blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7C3AED]/10 rounded-full blur-[150px]"
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B5FEF] to-[#7C3AED] flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Nexorium Core</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
            <p className="text-[#8B95A5] text-sm">
              Sign in to the control plane for non-production architecture
            </p>
          </div>

          {/* Login Form with Suspense for useSearchParams */}
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[#8B95A5] hover:text-white transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#5B5FEF]/20 to-[#7C3AED]/20 rounded-2xl blur-xl opacity-50 -z-10" />
      </motion.div>
    </div>
  );
}
