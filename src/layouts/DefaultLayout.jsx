import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

/**
 * Default layout for landing and auth pages
 * Minimal chrome with navigation and footer
 */
const DefaultLayout = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg' : 'bg-light-bg'} transition-colors duration-300`}>
      {/* Minimal Header */}
      {!isAuthPage && (
        <header className={`sticky top-0 z-50 ${isDark ? 'bg-dark-bg/80 border-dark-border' : 'bg-light-bg/80 border-light-border'} backdrop-blur-md border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12">
                  <img
                    src="/logophi_brown.png"
                    alt="Phi Docs"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                  <Sparkles className={`w-full h-full ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'} hidden`} />
                </div>
                <span className={`font-display font-semibold text-xl sm:text-2xl tracking-tight uppercase ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Phi Docs
                </span>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all ${isDark 
                    ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface border border-dark-border' 
                    : 'text-light-text-secondary hover:text-light-text hover:bg-white border border-light-border'
                    }`}
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl ${isDark 
                    ? 'bg-brand-accent-600 text-white hover:bg-brand-accent-500' 
                    : 'bg-brand-accent-500 text-white hover:bg-brand-accent-600'
                    }`}
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Sign Up</span>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-light-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logophi_brown.png"
                alt="DocFlies"
                className="w-6 h-6 object-contain"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-sm text-light-text-secondary">
                DocFlies AI — Powered by Gemini
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-light-text-secondary">
              <Link to="/chat" className="hover:text-brand-accent-600 transition-colors">
                Chat
              </Link>
              <a href="#tools" className="hover:text-brand-accent-600 transition-colors">
                Tools
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DefaultLayout;

