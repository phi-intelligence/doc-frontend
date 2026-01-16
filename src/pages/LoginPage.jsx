import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, Github, Chrome } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Login Page - Email/OTP and Social Auth
 * Modern, clean design matching the application theme
 */
const LoginPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleOTPRequest = (e) => {
    e.preventDefault();
    // UI only - no implementation
    // This simulates OTP being sent successfully
    console.log('OTP requested for:', email);
    setOtpSent(true);
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    // UI only - no implementation
    console.log('OTP login:', { email, otp });
  };

  const handleSocialAuth = (provider) => {
    // UI only - no implementation
    console.log('Social auth:', provider);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'} transition-colors duration-300`}>
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/5'} rounded-full blur-[100px] animate-pulse`} />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'} border rounded-2xl shadow-xl p-6 sm:p-8`}
        >
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
              <img 
                src="/logophi_brown.png" 
                alt="Phi Docs Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.nextSibling.style.display = 'block'; 
                }} 
              />
              <Sparkles className={`w-full h-full ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'} hidden`} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Welcome back
            </h1>
            <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Sign in to continue to Phi Docs
            </p>
          </div>

          {/* Email Input Form */}
          {!otpSent ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleOTPRequest}
              className="space-y-4"
            >
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all ${isDark 
                      ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500 focus:ring-2 focus:ring-brand-accent-500/20' 
                      : 'bg-white border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500 focus:ring-2 focus:ring-brand-accent-500/20'
                      }`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isDark ? 'bg-brand-accent-600 hover:bg-brand-accent-500' : 'bg-brand-accent-500 hover:bg-brand-accent-600'} shadow-lg hover:shadow-xl`}
              >
                Send OTP
              </button>
            </motion.form>
          ) : (
            /* OTP Entry Form */
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleOTPSubmit}
              className="space-y-4"
            >
              <div>
                <p className={`text-sm mb-4 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  We've sent a 6-digit code to <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{email}</span>
                </p>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-4 py-4 border rounded-lg text-center text-3xl font-mono tracking-[0.5em] transition-all ${isDark 
                    ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500 focus:ring-2 focus:ring-brand-accent-500/20' 
                    : 'bg-white border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500 focus:ring-2 focus:ring-brand-accent-500/20'
                    }`}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium border transition-all ${isDark 
                    ? 'border-dark-border text-dark-text hover:bg-dark-sidebar' 
                    : 'border-light-border text-light-text hover:bg-gray-50'
                    }`}
                >
                  Change email
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isDark ? 'bg-brand-accent-600 hover:bg-brand-accent-500' : 'bg-brand-accent-500 hover:bg-brand-accent-600'} shadow-lg hover:shadow-xl`}
                >
                  Verify OTP
                </button>
              </div>

              <button
                type="button"
                onClick={handleOTPRequest}
                className={`w-full text-sm font-medium ${isDark ? 'text-brand-accent-400 hover:text-brand-accent-300' : 'text-brand-accent-600 hover:text-brand-accent-700'}`}
              >
                Resend OTP
              </button>
            </motion.form>
          )}

          {/* Divider */}
          {!otpSent && (
            <div className="relative my-6">
              <div className={`absolute inset-0 flex items-center ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                <div className={`w-full border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-dark-surface text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
                  Or continue with
                </span>
              </div>
            </div>
          )}

          {/* Social Auth Buttons */}
          {!otpSent && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialAuth('google')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-lg font-medium transition-all ${isDark 
                  ? 'border-dark-border text-dark-text hover:bg-dark-sidebar' 
                  : 'border-light-border text-light-text hover:bg-gray-50'
                  }`}
              >
                <Chrome className="w-5 h-5" />
                <span className="text-sm">Google</span>
              </button>
              <button
                onClick={() => handleSocialAuth('github')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-lg font-medium transition-all ${isDark 
                  ? 'border-dark-border text-dark-text hover:bg-dark-sidebar' 
                  : 'border-light-border text-light-text hover:bg-gray-50'
                  }`}
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub</span>
              </button>
            </div>
          )}

          {/* Sign up link */}
          <div className={`mt-6 text-center text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className={`font-semibold hover:underline ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-600'}`}>
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
