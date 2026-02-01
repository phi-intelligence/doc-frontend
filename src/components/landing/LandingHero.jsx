import React, { useMemo, useState } from 'react';
import { ChevronRight, Play, Users, DollarSign, Scale, Megaphone, Shield, Sparkles } from 'lucide-react';

const MODULE_ICONS = { hr: Users, finance: DollarSign, legal: Scale, marketing: Megaphone, admin: Shield };

/**
 * LandingHero - Professional business-oriented Hero section with two-column layout
 * Left: Text content, CTAs, chat input | Right: Large hero visual
 */
export default function LandingHero({
  user = null,
  isAuthenticated = false,
  isLoggingIn = false,
  loginError = null,
  onLogin,
  onGoDashboard,
  roles = [],
  rolesLoading = false,
  roleLoginLoading = false,
  onRoleLogin,
  showAdminForm = false,
  onShowAdminForm,
}) {
  const [email, setEmail] = useState('admin@gendocx.local');
  const [password, setPassword] = useState('admin123');

  const canSubmit = useMemo(() => {
    if (isAuthenticated) return false;
    return Boolean(email.trim()) && Boolean(password);
  }, [email, password, isAuthenticated]);

  const adminRole = { id: 'admin', name: 'Administrator', description: 'Full access to all departments', color: '#427CCB' };
  const roleCards = useMemo(() => [adminRole, ...roles], [roles]);

  return (
    <section className="relative flex flex-col overflow-hidden bg-light-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-accent-400/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-accent-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Hero Area - Two Column Layout */}
      <div className="relative flex items-center pt-16 pb-8">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column - Brand Name */}
            <div className="relative z-10 order-2 lg:order-1 flex flex-col justify-center">
              {/* Brand Name */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-light-text tracking-tighter leading-none">
                GENDOC<span className="text-brand-accent-600">X</span>
              </h1>
            </div>

            {/* Right Column - Hero Visual */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center lg:justify-end">
              {/* Main Logo */}
              <div className="relative z-10 w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[650px] lg:h-[650px] flex items-center justify-center">
                <img 
                  src="/genX.png" 
                  alt="GendocX Logo" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login / Role Section */}
      <div className="relative bg-white py-24 border-t border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-50 border border-brand-accent-100 text-brand-accent-700 text-xs font-bold tracking-wider uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-600"></span>
                </span>
                Active Deployments
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold text-light-text tracking-tight leading-[1] mb-8">
                Automate High-Stakes <br />
                <span className="text-brand-accent-600">Documentation.</span>
              </h2>
              
              <p className="text-xl text-light-text-secondary leading-relaxed mb-10 max-w-xl font-medium">
                Our specialized AI engines handle the heavy lifting, allowing your team to focus on strategic decision-making.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-black text-light-text">99.8%</div>
                  <div className="text-sm font-bold text-light-text-secondary uppercase tracking-widest">Accuracy</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-black text-light-text">15x</div>
                  <div className="text-sm font-bold text-light-text-secondary uppercase tracking-widest">Efficiency</div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-light-bg rounded-3xl border border-light-border inline-flex">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-light-bg bg-brand-accent-100 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="pr-4">
                  <div className="font-bold text-light-text text-lg">2,500+ Enterprise Teams</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="w-3 h-3 text-brand-accent-500 fill-brand-accent-500" />)}
                    <span className="text-xs font-bold text-brand-accent-700 ml-1">TOP RATED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Login Panel */}
            <div className="relative">
              <div className="bg-white rounded-[48px] p-12 shadow-[0_40px_80px_-15px_rgba(26,26,27,0.1)] border border-light-border relative z-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-light-text mb-2">Workspace</h3>
                      <p className="text-light-text-secondary font-medium">Select your department module</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-brand-accent-600 flex items-center justify-center shadow-2xl shadow-brand-accent-600/20">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-8">
                      <div className="p-8 bg-brand-accent-50/50 border border-brand-accent-100 rounded-[32px]">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white border border-brand-accent-200 flex items-center justify-center shadow-lg">
                            <Megaphone className="w-8 h-8 text-brand-accent-600" />
                          </div>
                          <div>
                            <div className="font-black text-xl text-light-text">Welcome Back</div>
                            <div className="text-brand-accent-700 font-bold uppercase tracking-widest text-xs mt-1">
                              {user?.display_name || user?.module_name || 'Verified User'}
                            </div>
                          </div>
                        </div>
                        <p className="text-light-text-secondary font-medium leading-relaxed">
                          Your departmental dashboard is live. Continue your recent document workflows.
                        </p>
                      </div>
                      <button
                        onClick={onGoDashboard}
                        className="w-full py-6 bg-brand-accent-600 text-white rounded-[24px] font-black text-xl hover:bg-brand-accent-700 shadow-2xl shadow-brand-accent-600/20 transition-all flex items-center justify-center gap-3 group"
                      >
                        Enter Dashboard
                      </button>
                    </div>
                  ) : showAdminForm ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-light-text">Admin Access</h4>
                        <button
                          type="button"
                          onClick={() => onShowAdminForm(false)}
                          className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700 border-b-2 border-brand-accent-600/20"
                        >
                          Cancel
                        </button>
                      </div>
                      <form
                        className="space-y-6"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (canSubmit) onLogin?.({ email, password });
                        }}
                      >
                        <div className="space-y-4">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-8 py-5 rounded-[20px] bg-light-bg border-2 border-transparent focus:border-brand-accent-500 focus:bg-white transition-all outline-none text-light-text font-bold"
                            placeholder="Administrator Email"
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-8 py-5 rounded-[20px] bg-light-bg border-2 border-transparent focus:border-brand-accent-500 focus:bg-white transition-all outline-none text-light-text font-bold"
                            placeholder="Password"
                          />
                        </div>
                        {loginError && (
                          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl text-center">
                            {loginError}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={!canSubmit || isLoggingIn}
                          className="w-full py-6 bg-brand-accent-600 text-white rounded-[24px] font-black text-xl hover:bg-brand-accent-700 shadow-2xl shadow-brand-accent-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isLoggingIn ? 'Verifying...' : 'Sign In'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {roleCards.map((role) => {
                          const Icon = MODULE_ICONS[role.id] || Users;
                          const isAdmin = role.id === 'admin';
                          return (
                            <button
                              key={role.id}
                              type="button"
                              disabled={!isAdmin && roleLoginLoading}
                              onClick={() => {
                                if (isAdmin) {
                                  onShowAdminForm?.(true);
                                } else {
                                  onRoleLogin?.(role.id);
                                }
                              }}
                              className="group p-6 rounded-[28px] bg-light-bg border-2 border-transparent hover:border-brand-accent-500 hover:bg-white transition-all text-left disabled:opacity-50 shadow-sm"
                            >
                              <div className="flex flex-col gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform">
                                  <Icon className="w-7 h-7 text-brand-accent-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-black text-lg text-light-text">{role.name || role.id}</div>
                                  <div className="text-xs text-light-text-secondary font-bold mt-1 uppercase tracking-wider">{role.id} Module</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {roleLoginLoading && (
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-brand-accent-600">
                          Securing Session...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}