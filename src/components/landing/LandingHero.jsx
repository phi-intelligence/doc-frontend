import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Users, DollarSign, Scale, Megaphone, Shield, HeartPulse, Sparkles } from 'lucide-react';

const MODULE_ICONS = { hr: Users, finance: DollarSign, legal: Scale, marketing: Megaphone, insurance: Shield, medical: HeartPulse, admin: Shield };

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
      <div className="relative flex items-center pt-10 pb-4">
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
      <div className="relative bg-white py-20 border-t border-light-border overflow-hidden">
         {/* Decorative background blur */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent-50/50 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-light-surface border border-light-border mb-8 shadow-sm">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white" />
                 </div>
                 <span className="text-xs font-bold text-light-text-secondary uppercase tracking-wider">Trusted by 500+ Enterprises</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-black text-light-text tracking-tighter leading-[0.9] mb-8">
                Intelligent <br />
                <span className="text-brand-accent-600">Access Control.</span>
              </h2>
              
              <p className="text-xl text-light-text-secondary leading-relaxed mb-12 max-w-lg font-medium">
                Secure, role-based entry points ensuring data isolation and compliance across your entire organization.
              </p>

              <div className="grid grid-cols-2 gap-8">
                 <div className="p-6 rounded-[24px] bg-light-bg border border-light-border">
                    <div className="text-4xl font-black text-light-text mb-2">SOC2</div>
                    <div className="text-xs font-bold text-light-text-secondary uppercase tracking-widest">Type II Certified</div>
                 </div>
                 <div className="p-6 rounded-[24px] bg-light-bg border border-light-border">
                    <div className="text-4xl font-black text-light-text mb-2">256-bit</div>
                    <div className="text-xs font-bold text-light-text-secondary uppercase tracking-widest">End-to-End Encryption</div>
                 </div>
              </div>
            </div>

            {/* Right: Login Panel */}
            <div className="relative">
              <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-brand-accent-900/5 border border-light-border relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-light-border/50">
                    <div>
                      <h3 className="text-2xl font-black text-light-text tracking-tight">Select Workspace</h3>
                      <p className="text-sm font-medium text-light-text-secondary">Choose your operational domain</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-accent-50 flex items-center justify-center border border-brand-accent-100">
                      <Shield className="w-6 h-6 text-brand-accent-600" />
                    </div>
                </div>

                {/* Body */}
                  {isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="p-6 bg-brand-accent-50 border border-brand-accent-100 rounded-3xl flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm text-brand-accent-600">
                            <Sparkles className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="font-bold text-lg text-brand-accent-900">Session Active</div>
                            <div className="text-xs font-medium text-brand-accent-700">Welcome back, {user?.display_name || 'User'}</div>
                          </div>
                      </div>
                      <button
                        onClick={onGoDashboard}
                        className="w-full py-5 bg-brand-accent-600 text-white rounded-2xl font-black text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20 transition-all flex items-center justify-center gap-2 group"
                      >
                        Launch Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : showAdminForm ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                      <button
                          type="button"
                          onClick={() => onShowAdminForm(false)}
                          className="flex items-center gap-2 text-xs font-bold text-light-text-secondary hover:text-brand-accent-600 transition-colors mb-2"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
                      </button>
                      
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (canSubmit) onLogin?.({ email, password });
                        }}
                      >
                        <div className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-light-text uppercase tracking-wider ml-1">Admin ID</label>
                             <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-light-surface border-2 border-transparent focus:border-brand-accent-500 focus:bg-white transition-all outline-none text-light-text font-bold text-sm"
                                placeholder="name@organization.com"
                              />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-light-text uppercase tracking-wider ml-1">Secure Key</label>
                             <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-light-surface border-2 border-transparent focus:border-brand-accent-500 focus:bg-white transition-all outline-none text-light-text font-bold text-sm"
                                placeholder="••••••••"
                              />
                          </div>
                        </div>
                        
                        {loginError && (
                          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            {loginError}
                          </div>
                        )}
                        
                        <button
                          type="submit"
                          disabled={!canSubmit || isLoggingIn}
                          className="w-full py-5 bg-brand-accent-600 text-white rounded-2xl font-black text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                          {isLoggingIn ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                              </>
                          ) : 'Access Console'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
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
                              className={`
                                group relative p-5 rounded-[24px] border transition-all duration-300 text-left disabled:opacity-50
                                ${isAdmin 
                                    ? 'col-span-2 bg-brand-accent-600 border-brand-accent-600 text-white hover:bg-brand-accent-700 hover:shadow-lg shadow-brand-accent-600/20' 
                                    : 'bg-white border-light-border hover:border-brand-accent-300 hover:shadow-lg hover:-translate-y-1'
                                }
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                    ${isAdmin 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-light-surface text-brand-accent-600 group-hover:bg-brand-accent-50'
                                    }
                                `}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className={`font-black text-sm ${isAdmin ? 'text-white' : 'text-light-text'}`}>
                                    {role.name}
                                  </div>
                                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isAdmin ? 'text-white/60' : 'text-light-text-secondary'}`}>
                                    {isAdmin ? 'System Root' : 'Department'}
                                  </div>
                                </div>
                                {isAdmin && <ChevronRight className="w-5 h-5 text-white/60 ml-auto" />}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  {roleLoginLoading && !showAdminForm && !isAuthenticated && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-[40px]">
                        <div className="w-10 h-10 border-4 border-brand-accent-100 border-t-brand-accent-600 rounded-full animate-spin mb-3" />
                        <div className="text-sm font-bold text-brand-accent-600">Initializing Workspace...</div>
                     </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
