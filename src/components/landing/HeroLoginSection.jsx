import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LayoutDashboard } from 'lucide-react';

/**
 * HeroLoginSection
 * Full-viewport hero video background + right-side login panel.
 *
 * This component is intentionally auth-implementation-agnostic:
 * - If `onLogin` is provided, it will call it with { email, password }.
 * - If `isAuthenticated` is true, it shows a Dashboard CTA instead.
 */
export default function HeroLoginSection({
  videoSrc,
  isAuthenticated = false,
  isLoggingIn = false,
  loginError = null,
  onLogin,
  onGoDashboard,
  onScrollToContent
}) {
  // Demo defaults (editable) for frictionless login
  const [email, setEmail] = useState('admin@phidocs.local');
  const [password, setPassword] = useState('admin123');

  const canSubmit = useMemo(() => {
    if (isAuthenticated) return false;
    return Boolean(email.trim()) && Boolean(password);
  }, [email, password, isAuthenticated]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />

      <div className="relative h-full w-full px-4 sm:px-6 lg:px-10">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Right: login panel (push further right on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="lg:col-start-9 lg:col-span-4 lg:justify-self-end"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl lg:max-w-[420px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-white text-xl font-bold tracking-tight">Company Admin Login</h2>
                  <p className="text-white/70 text-sm mt-1">
                    Access dashboards for HR, Finance, Legal, and Docs.
                  </p>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="mt-6">
                  <div className="bg-emerald-500/15 border border-emerald-400/25 text-emerald-50 rounded-xl p-4 text-sm font-medium">
                    You’re logged in. Continue to your dashboard.
                  </div>
                  <button
                    type="button"
                    onClick={onGoDashboard}
                    className="mt-4 w-full btn-primary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Open Dashboard
                  </button>
                </div>
              ) : (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!canSubmit) return;
                    onLogin?.({ email: email.trim(), password });
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-2">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="admin@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-200 transition-stable"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 tracking-wider uppercase mb-2">
                      Password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-200 transition-stable"
                      autoComplete="current-password"
                    />
                  </div>

                  {loginError ? (
                    <div className="text-sm font-medium text-red-200 bg-red-500/15 border border-red-400/20 rounded-xl p-3">
                      {loginError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit || isLoggingIn}
                    className="w-full btn-primary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoggingIn ? 'Signing in…' : 'Sign In'}
                  </button>

                  <div className="text-[11px] font-semibold text-white/70">
                    Demo credentials prefilled — you can edit them if needed.
                  </div>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/60 font-bold tracking-widest uppercase">
                    Public tools remain available below
                  </span>
                  <button
                    type="button"
                    onClick={onScrollToContent}
                    className="text-[11px] font-bold text-white/80 hover:text-white underline underline-offset-4"
                  >
                    Scroll
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

