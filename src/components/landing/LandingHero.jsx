import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LayoutDashboard, ChevronRight, Play, CheckCircle2 } from 'lucide-react';

/**
 * LandingHero - Professional business-oriented Hero section
 */
export default function LandingHero({
  videoSrc,
  isAuthenticated = false,
  isLoggingIn = false,
  loginError = null,
  onLogin,
  onGoDashboard,
}) {
  const [email, setEmail] = useState('admin@phidocs.local');
  const [password, setPassword] = useState('admin123');

  const canSubmit = useMemo(() => {
    if (isAuthenticated) return false;
    return Boolean(email.trim()) && Boolean(password);
  }, [email, password, isAuthenticated]);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-12 overflow-hidden bg-white">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-accent-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-50 border border-brand-accent-100 text-brand-accent-700 text-xs font-bold tracking-wider uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-600"></span>
              </span>
              AI-Powered Enterprise Document Automation
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-light-text tracking-tight leading-[1.1] mb-6">
              The Intelligent <br />
              <span className="text-brand-accent-600">Document Engine</span> <br />
              for Modern Business.
            </h1>
            
            <p className="text-xl text-light-text-secondary leading-relaxed mb-10 max-w-xl">
              Phi Docs automates the creation, editing, and management of legal, HR, financial, and sales documents with enterprise-grade precision and speed.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <button className="w-full sm:w-auto px-8 py-4 bg-brand-accent-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-100 transition-all flex items-center justify-center gap-2">
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-light-text border border-light-border rounded-2xl font-bold text-lg hover:bg-light-sidebar transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-light-border overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold text-light-text">Trusted by 2,000+ teams</div>
                <div className="text-light-text-secondary flex items-center gap-1">
                  Average rating 4.9/5 <span className="text-orange-400">★★★★★</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Login/Dashboard Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Glassmorphism card for login */}
            <div className="bg-white rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-light-border relative z-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent-50 rounded-full -mr-16 -mt-16 opacity-50" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-light-text mb-2">Workspace Access</h3>
                <p className="text-light-text-secondary text-sm mb-8">Secure login for corporate departments</p>

                {isAuthenticated ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-brand-accent-50 border border-brand-accent-100 rounded-3xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-accent-600 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-light-text">Authenticated</div>
                          <div className="text-xs text-light-text-secondary truncate">admin@phidocs.local</div>
                        </div>
                      </div>
                      <p className="text-sm text-light-text-secondary leading-relaxed">
                        Welcome back! Your departmental workspaces are ready for document processing.
                      </p>
                    </div>
                    <button
                      onClick={onGoDashboard}
                      className="w-full py-4 bg-brand-accent-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-100 transition-all flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Enter Dashboard
                    </button>
                  </div>
                ) : (
                  <form 
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (canSubmit) onLogin?.({ email, password });
                    }}
                  >
                    <div>
                      <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2 ml-1">Work Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-light-bg border border-light-border focus:border-brand-accent-500 focus:ring-4 focus:ring-brand-accent-500/5 transition-all outline-none text-light-text font-medium"
                        placeholder="name@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2 ml-1">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-light-bg border border-light-border focus:border-brand-accent-500 focus:ring-4 focus:ring-brand-accent-500/5 transition-all outline-none text-light-text font-medium"
                        placeholder="••••••••"
                      />
                    </div>

                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
                        {loginError}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={!canSubmit || isLoggingIn}
                      className="w-full py-4 bg-brand-accent-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoggingIn ? 'Verifying...' : 'Sign In to Workspace'}
                      {!isLoggingIn && <LogIn className="w-5 h-5" />}
                    </button>
                    
                    <div className="text-center text-xs text-light-text-secondary pt-2">
                      Professional access for enterprise partners
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Decorative background for the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-brand-accent-600 to-blue-600 rounded-[50px] opacity-10 blur-3xl z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
