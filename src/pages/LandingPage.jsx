import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, FileText, Image, Code, Link2, Wand2 } from 'lucide-react';
import ToolsGrid from '../components/landing/ToolsGrid';
import { useTheme } from '../context/ThemeContext';

/**
 * Landing page with Halo AI-inspired theme aesthetic
 * Features: Theme-aware backgrounds, blue glow effects, glassmorphism, smooth animations
 */
const LandingPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg text-white' : 'bg-light-bg text-light-text'} relative overflow-hidden transition-colors duration-300`}>
      {/* Animated background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/10'} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute top-1/3 right-1/4 w-[600px] h-[600px] ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-400/8'} rounded-full blur-[100px] animate-pulse delay-1000`} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-white/10 backdrop-blur-md border-white/20 text-white/90' : 'bg-white/80 backdrop-blur-md border-light-border/50 text-light-text'} border rounded-full text-sm font-medium mb-8`}
            >
              <Zap className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-brand-accent-500'}`} />
              AI-Powered Document & Creative Tools
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-light-text'}`}
            >
              <span className="block">Where Documents</span>
              <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-cyan-400 via-blue-400 to-cyan-500' : 'from-brand-accent-500 via-brand-accent-600 to-brand-accent-500'}`}>
                Meet Intelligence
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}
            >
              From contracts to campaigns, DocFlies transforms how you create. Harness AI to craft professional documents, 
              generate stunning visuals, and automate your creative workflow—all in one unified workspace.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/signup"
                className={`group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 ${isDark ? 'bg-white text-dark-bg hover:bg-gray-100' : 'bg-brand-accent-500 text-white hover:bg-brand-accent-600'}`}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 backdrop-blur-md border rounded-lg font-semibold text-base transition-all ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30' : 'bg-white/60 text-light-text border-light-border/50 hover:bg-white/80 hover:border-light-border'}`}
              >
                Sign In
              </Link>
              <a
                href="#overview"
                className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 backdrop-blur-md border rounded-lg font-medium sm:font-semibold text-sm sm:text-base transition-all ${isDark ? 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white/40 text-light-text-secondary border-light-border/30 hover:bg-white/60 hover:border-light-border'}`}
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-light-text'}`}>
              We're DocFlies
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              We develop custom AI solutions for innovative companies. Transform your workflow with intelligent automation.
            </p>
          </motion.div>

          {/* Feature Cards - Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Document Tools Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`group relative p-8 backdrop-blur-md border rounded-2xl transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white/60 border-light-border/50 hover:bg-white/80 hover:border-light-border'}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? 'from-cyan-500/20 to-blue-500/20' : 'from-brand-accent-100 to-brand-accent-200'}`}>
                <FileText className={`w-8 h-8 ${isDark ? 'text-cyan-400' : 'text-brand-accent-600'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-light-text'}`}>Document Tools</h3>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                Professional documents in seconds, not hours. Create reports, spreadsheets, presentations, and PDFs with AI assistance.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-brand-accent-50 text-brand-accent-700'}`}>Reports</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-brand-accent-50 text-brand-accent-700'}`}>Spreadsheets</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-brand-accent-50 text-brand-accent-700'}`}>Presentations</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-brand-accent-50 text-brand-accent-700'}`}>PDFs</span>
              </div>
            </motion.div>

            {/* Digital Marketing Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className={`group relative p-8 backdrop-blur-md border rounded-2xl transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white/60 border-light-border/50 hover:bg-white/80 hover:border-light-border'}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? 'from-purple-500/20 to-pink-500/20' : 'from-purple-100 to-pink-100'}`}>
                <Wand2 className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-light-text'}`}>Digital Marketing</h3>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                AI-powered visuals that captivate. Generate images, design logos, create marketing materials, and build stunning web interfaces.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-purple-50 text-purple-700'}`}>Images</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-purple-50 text-purple-700'}`}>Logos</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-purple-50 text-purple-700'}`}>Marketing</span>
                <span className={`px-3 py-1 rounded-md text-sm ${isDark ? 'bg-white/10 text-dark-text-secondary' : 'bg-purple-50 text-purple-700'}`}>Web Design</span>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              to="/chat"
              className={`inline-flex items-center gap-2 px-8 py-4 backdrop-blur-md border rounded-lg font-semibold text-base transition-all ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30' : 'bg-white/60 text-light-text border-light-border/50 hover:bg-white/80 hover:border-light-border'}`}
            >
              Get in touch
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-light-text'}`}>What we do</h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              All your tools in one place. Choose a tool to get started and experience the power of AI-driven creation.
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="relative z-10">
            <ToolsGrid />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-12 backdrop-blur-md border rounded-3xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-light-border/50'}`}
          >
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-light-text'}`}>
              Ready to transform your workflow?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Join innovative companies using DocFlies to automate their creative processes and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 ${isDark ? 'bg-white text-dark-bg hover:bg-gray-100' : 'bg-brand-accent-500 text-white hover:bg-brand-accent-600'}`}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 px-8 py-4 backdrop-blur-md border rounded-lg font-semibold text-base transition-all ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30' : 'bg-white/60 text-light-text border-light-border/50 hover:bg-white/80 hover:border-light-border'}`}
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
