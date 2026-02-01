import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Shield, Zap, Globe, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../auth/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import DepartmentFeatures from '../components/landing/DepartmentFeatures';
import WorkflowSection from '../components/landing/WorkflowSection';
import EditorShowcase from '../components/landing/EditorShowcase';

// Existing assets
import heroVideo from '../assets/hero.mp4';

/**
 * Redesigned LandingPage - Professional Business Focus
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, roleLogin, getRoles, loading: isLoggingIn, error: loginError } = useAuth();
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleLoginLoading, setRoleLoginLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getRoles().then(({ roles: r }) => {
      setRoles(r || []);
    }).finally(() => setRolesLoading(false));
  }, [getRoles]);

  const handleLogin = async ({ email, password }) => {
    await login({ email, password });
    navigate('/app/dashboard');
  };

  const handleGoDashboard = useCallback(() => {
    if (user?.module && ['hr', 'finance', 'legal', 'marketing'].includes(user.module)) {
      navigate(`/app/${user.module}`);
    } else {
      navigate('/app/dashboard');
    }
  }, [user?.module, navigate]);

  const handleRoleLogin = useCallback(async (moduleId, displayName) => {
    setRoleLoginLoading(true);
    try {
      const data = await roleLogin({ module: moduleId, display_name: displayName });
      const mod = data?.user?.module;
      if (mod && ['hr', 'finance', 'legal', 'marketing'].includes(mod)) {
        navigate(`/app/${mod}`);
      } else {
        navigate('/app/dashboard');
      }
    } catch {
      // error already set in AuthContext
    } finally {
      setRoleLoginLoading(false);
    }
  }, [roleLogin, navigate]);

  const navLinks = [
    { name: 'Solutions', href: '#features' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Editor', href: '#editor' },
    { name: 'Enterprise', href: '#enterprise' },
  ];

  return (
    <div className="min-h-screen bg-light-bg selection:bg-brand-accent-200 selection:text-brand-accent-900 font-sans text-light-text overflow-x-hidden">
      {/* Premium Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-2xl shadow-xl shadow-brand-accent-900/5' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Group */}
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-brand-accent-600/20 overflow-hidden relative border border-gray-100"
              >
                <img
                  src="/genX.png"
                  alt="GendocX"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none group-hover:text-brand-accent-600 transition-colors">
                  GENDOC<span className="text-brand-accent-600">X</span>
                </span>
                <span className="text-[10px] font-black text-brand-accent-600/50 tracking-[0.3em] uppercase leading-none mt-1.5">
                  Enterprise AI
                </span>
              </div>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-12 bg-white/40 backdrop-blur-md px-10 py-3 rounded-2xl border border-white/20 shadow-sm">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-xs font-black text-light-text-secondary uppercase tracking-widest hover:text-brand-accent-600 transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent-600 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="hidden md:flex items-center gap-3 px-8 py-3.5 bg-brand-accent-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent-700 shadow-2xl shadow-brand-accent-600/20 transition-all group"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="hidden md:flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-brand-accent-600 text-brand-accent-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent-50 transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    Register Company
                  </Link>
                  <Link
                    to="/chat"
                    className="hidden md:flex items-center gap-3 px-8 py-3.5 bg-brand-accent-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent-700 shadow-2xl shadow-brand-accent-600/20 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-xl bg-white border border-light-border text-light-text"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-light-border overflow-hidden"
            >
              <div className="px-4 py-8 space-y-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-black text-light-text uppercase tracking-widest border-b border-light-bg pb-4"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-5 bg-white border-2 border-brand-accent-600 text-brand-accent-600 rounded-2xl font-black text-sm uppercase tracking-widest"
                  >
                    <Building2 className="w-5 h-5" />
                    Register Company
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-5 bg-brand-accent-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* High-Impact Hero */}
        <LandingHero
          user={user}
          isAuthenticated={isAuthenticated}
          isLoggingIn={isLoggingIn}
          loginError={loginError}
          onLogin={handleLogin}
          onGoDashboard={handleGoDashboard}
          roles={roles}
          rolesLoading={rolesLoading}
          roleLoginLoading={roleLoginLoading}
          onRoleLogin={handleRoleLogin}
          showAdminForm={showAdminForm}
          onShowAdminForm={setShowAdminForm}
        />

        {/* Trust/Integration Strip */}
        <section className="py-20 bg-white border-y border-light-border relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center gap-12">
              <p className="text-[10px] font-black text-brand-accent-600/40 uppercase tracking-[0.4em]">Integrated Ecosystem</p>
              <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                 <span className="text-2xl md:text-3xl font-black tracking-tighter text-light-text flex items-center gap-2">
                   <Shield className="w-6 h-6" /> SAP
                 </span>
                 <span className="text-2xl md:text-3xl font-black tracking-tighter text-light-text flex items-center gap-2">
                   <Globe className="w-6 h-6" /> ORACLE
                 </span>
                 <span className="text-2xl md:text-3xl font-black tracking-tighter text-light-text flex items-center gap-2">
                   <Zap className="w-6 h-6" /> SALESFORCE
                 </span>
                 <span className="text-2xl md:text-3xl font-black tracking-tighter text-light-text flex items-center gap-2">
                   <Zap className="w-6 h-6" /> WORKDAY
                 </span>
              </div>
            </div>
          </div>
          {/* Subtle gradient overlays */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10" />
        </section>

        {/* Feature Sections */}
        <div id="features">
          <DepartmentFeatures />
        </div>

        <div id="editor">
          <EditorShowcase />
        </div>

        <div id="workflow">
          <WorkflowSection />
        </div>

        {/* Final Conversion Section */}
        <section id="enterprise" className="py-32 bg-light-surface relative">
           <div className="max-w-6xl mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#1A1A1B] rounded-[64px] p-12 lg:p-24 text-white text-center relative overflow-hidden shadow-2xl shadow-brand-accent-900/20"
              >
                 {/* Decorative background effects */}
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent-500 rounded-full blur-[150px] opacity-10 -mr-64 -mt-64" />
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[150px] opacity-10 -ml-64 -mb-64" />
                 
                 <div className="relative z-10 max-w-3xl mx-auto">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black tracking-[0.3em] uppercase mb-10"
                    >
                      Infrastructure Readiness
                    </motion.div>
                    <h3 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-none">
                       READY TO <br />
                       <span className="text-brand-accent-400">MODERNIZE?</span>
                    </h3>
                    <p className="text-xl text-white/60 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                       Join the global enterprises currently using GendocX to automate high-stakes documentation at scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                       <Link to="/chat" className="w-full sm:w-auto px-12 py-6 bg-brand-accent-500 text-white rounded-2xl font-black text-xl hover:bg-brand-accent-400 transition-all shadow-2xl shadow-brand-accent-600/30 group">
                          Get Started Now
                          <ArrowRight className="inline-block ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                       </Link>
                       <button className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-all backdrop-blur-md">
                          Contact Sales
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-light-sidebar py-32 border-t border-light-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
            <div className="col-span-2">
               <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-xl border border-gray-100">
                  <img src="/genX.png" alt="GendocX" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-black text-light-text tracking-tighter">GENDOCX</span>
               </div>
               <p className="text-lg text-light-text-secondary font-medium leading-relaxed max-w-xs">
                  Redefining enterprise document workflows with secure, domain-aware AI execution.
               </p>
            </div>
            <div>
               <h5 className="font-black text-xs uppercase tracking-[0.2em] text-light-text mb-8">Product</h5>
               <ul className="space-y-5 text-sm text-light-text-secondary font-bold">
                  <li><Link to="/chat" className="hover:text-brand-accent-600 transition-colors">Chat & Build</Link></li>
                  <li><Link to="/app/hr" className="hover:text-brand-accent-600 transition-colors">HR Module</Link></li>
                  <li><Link to="/app/finance" className="hover:text-brand-accent-600 transition-colors">Finance Module</Link></li>
                  <li><Link to="/app/legal" className="hover:text-brand-accent-600 transition-colors">Legal Module</Link></li>
               </ul>
            </div>
            <div>
               <h5 className="font-black text-xs uppercase tracking-[0.2em] text-light-text mb-8">Resources</h5>
               <ul className="space-y-5 text-sm text-light-text-secondary font-bold">
                  <li><button className="hover:text-brand-accent-600 transition-colors">API Docs</button></li>
                  <li><button className="hover:text-brand-accent-600 transition-colors">Security</button></li>
                  <li><button className="hover:text-brand-accent-600 transition-colors">Privacy</button></li>
                  <li><button className="hover:text-brand-accent-600 transition-colors">Support</button></li>
               </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-light-border flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-[10px] font-black text-light-text-secondary/40 tracking-[0.4em] uppercase">
                © 2025 GENDOCX — ALL RIGHTS RESERVED.
             </div>
             <div className="flex items-center gap-8">
                <div className="w-6 h-6 bg-light-border rounded-lg" />
                <div className="w-6 h-6 bg-light-border rounded-lg" />
                <div className="w-6 h-6 bg-light-border rounded-lg" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
