'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Feather, Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace(searchParams.get('next') || '/');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-7 text-center">
          <span className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-glow shadow-xl shadow-brand-500/30">
            <Feather className="h-6 w-6 text-white" strokeWidth={2.2} />
            <span className="animate-pulse-ring absolute inset-0 rounded-2xl border-2 border-brand-400" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Wasel <span className="text-brand-500">Blog Studio</span>
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            Sign in to your workspace.
          </p>
        </div>

        <form onSubmit={submit} className="glass-strong rounded-4xl p-6">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Email
            </span>
            <span className="relative block">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-hairline bg-white/80 py-2.5 pl-10 pr-3.5 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </span>
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Password
            </span>
            <span className="relative block">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-hairline bg-white/80 py-2.5 pl-10 pr-3.5 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </span>
          </label>

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-rose-600 ring-1 ring-rose-100"
            >
              {error}
            </motion.p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-glow px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-[0.99] disabled:opacity-70"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" strokeWidth={2.2} /> Sign in
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-400">
          Accounts are provisioned by an administrator.
          <br />
          There is no public sign-up.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
