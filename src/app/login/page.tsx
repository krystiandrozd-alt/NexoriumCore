'use client';

// TelEnvIQ - Login Page
// Premium styled login with Supabase Auth

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Loader2, LogIn, AlertCircle, Map } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard/environments';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Redirect to the intended page
      router.push(redirectTo);
      router.refresh();
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <motion.div
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
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
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
            <span className="text-xl font-semibold text-white">TelEnv IQ</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
            <p className="text-[#8B95A5] text-sm">
              Sign in to access your environment intelligence
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
