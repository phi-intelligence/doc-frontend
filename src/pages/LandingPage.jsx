import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import DepartmentFeatures from '../components/landing/DepartmentFeatures';
import WorkflowSection from '../components/landing/WorkflowSection';

// Existing assets
import heroVideo from '../assets/hero.mp4';

/**
 * Redesigned LandingPage - Professional Business Focus
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading: isLoggingIn, error: loginError } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async ({ email, password }) => {
    await login({ email, password });
    navigate('/app/dashboard');
  };

  const headerCta = useMemo(() => {
    if (isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => navigate('/app/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent-600 text-white rounded-xl font-bold text-sm hover:bg-brand-accent-700 shadow-md shadow-brand-accent-100 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Go to Dashboard
        </button>
      );
    }
    return (
      <Link
        to="/chat"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent-600 text-white rounded-xl font-bold text-sm hover:bg-brand-accent-700 shadow-md shadow-brand-accent-100 transition-all"
      >
        Get Started
      </Link>
    );
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white selection:bg-brand-accent-100 selection:text-brand-accent-900">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent-100">
                <img
                  src="/logophi_brown.png"
                  alt="Phi"
                  className="w-7 h-7 object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-light-text tracking-tighter leading-none">
                  PHI <span className="text-brand-accent-600">DOCS</span>
                </span>
                <span className="text-[10px] font-bold text-light-text-secondary tracking-[0.2em] uppercase leading-none mt-1">
                  Enterprise AI
                </span>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-bold text-light-text-secondary hover:text-brand-accent-600 transition-colors">Solutions</a>
              <a href="#workflow" className="text-sm font-bold text-light-text-secondary hover:text-brand-accent-600 transition-colors">How it Works</a>
              <a href="#enterprise" className="text-sm font-bold text-light-text-secondary hover:text-brand-accent-600 transition-colors">Enterprise</a>
              <a href="#pricing" className="text-sm font-bold text-light-text-secondary hover:text-brand-accent-600 transition-colors">Pricing</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {headerCta}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* High-Impact Hero */}
        <LandingHero
          videoSrc={heroVideo}
          isAuthenticated={isAuthenticated}
          isLoggingIn={isLoggingIn}
          loginError={loginError}
          onLogin={handleLogin}
          onGoDashboard={() => navigate('/app/dashboard')}
        />

        {/* Feature Sections */}
        <div id="features">
          <DepartmentFeatures />
        </div>

        <div id="workflow">
          <WorkflowSection />
        </div>

        {/* Brand/Trust Section */}
        <section className="py-16 border-y border-light-border bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-bold text-light-text-secondary uppercase tracking-[0.3em] mb-10">Integration Ecosystem</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <span className="text-2xl font-black tracking-tighter text-light-text">ORACLE</span>
               <span className="text-2xl font-black tracking-tighter text-light-text">SAP</span>
               <span className="text-2xl font-black tracking-tighter text-light-text">SALESFORCE</span>
               <span className="text-2xl font-black tracking-tighter text-light-text">WORKDAY</span>
               <span className="text-2xl font-black tracking-tighter text-light-text">MICROSOFT</span>
            </div>
          </div>
        </section>

        {/* Final Conversion Section */}
        <section id="enterprise" className="py-24 bg-white">
           <div className="max-w-5xl mx-auto px-4">
              <div className="bg-light-text rounded-[48px] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent-600 rounded-full blur-[120px] opacity-20 -mr-48 -mt-48" />
                 <div className="relative z-10">
                    <h3 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight">Ready to modernize your <br /> document infrastructure?</h3>
                    <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                       Join hundreds of forward-thinking enterprises using Phi Docs to automate high-stakes documentation.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                       <Link to="/chat" className="px-10 py-5 bg-brand-accent-600 text-white rounded-2xl font-bold text-xl hover:bg-brand-accent-700 transition-all shadow-xl shadow-brand-accent-600/20">
                          Get Started Now
                       </Link>
                       <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-xl hover:bg-white/20 transition-all">
                          Contact Sales
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-white py-20 border-t border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-accent-600 rounded-lg flex items-center justify-center">
                  <img src="/logophi_brown.png" alt="Phi" className="w-5 h-5 brightness-0 invert" />
                </div>
                <span className="text-lg font-black text-light-text tracking-tighter">PHI DOCS</span>
               </div>
               <p className="text-sm text-light-text-secondary leading-relaxed max-w-xs">
                  Automating enterprise document workflows with secure, sandboxed AI execution. Part of the Phi Systems ecosystem.
               </p>
            </div>
            <div>
               <h5 className="font-bold text-light-text mb-6">Product</h5>
               <ul className="space-y-4 text-sm text-light-text-secondary font-medium">
                  <li><Link to="/chat" className="hover:text-brand-accent-600">Chat & Build</Link></li>
                  <li><Link to="/app/hr" className="hover:text-brand-accent-600">HR Module</Link></li>
                  <li><Link to="/app/finance" className="hover:text-brand-accent-600">Finance Module</Link></li>
                  <li><Link to="/app/legal" className="hover:text-brand-accent-600">Legal Module</Link></li>
               </ul>
            </div>
            <div>
               <h5 className="font-bold text-light-text mb-6">Company</h5>
               <ul className="space-y-4 text-sm text-light-text-secondary font-medium">
                  <li><button className="hover:text-brand-accent-600">About Us</button></li>
                  <li><button className="hover:text-brand-accent-600">Privacy Policy</button></li>
                  <li><button className="hover:text-brand-accent-600">Terms of Service</button></li>
                  <li><button className="hover:text-brand-accent-600">Contact</button></li>
               </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-light-border flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="text-xs font-bold text-light-text-secondary tracking-widest uppercase">
                © 2025 PHI SYSTEMS INC. ALL RIGHTS RESERVED.
             </div>
             <div className="flex items-center gap-6">
                {/* Social placeholders */}
                <div className="w-5 h-5 bg-light-border rounded-full" />
                <div className="w-5 h-5 bg-light-border rounded-full" />
                <div className="w-5 h-5 bg-light-border rounded-full" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
