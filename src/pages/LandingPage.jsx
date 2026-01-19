import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Terminal, Box } from 'lucide-react';
import ToolsGrid from '../components/landing/ToolsGrid';
import phiCover from '../assets/phi.jpeg';
import heroVideo from '../assets/hero.mp4';
import docxLogo from '../assets/docx.png';
import pptxLogo from '../assets/pptx.png';
import xlsxLogo from '../assets/xlsx.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-light-bg/80 backdrop-blur-md border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logophi_brown.png"
                alt="DocFlies"
                className="w-10 h-10 object-contain"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-xl font-semibold text-light-text tracking-tight">
                Phi <span className="text-brand-accent-600">Docs</span>
              </span>
            </div>

            {/* Quick action */}
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent-500 text-white 
                         rounded-lg font-medium text-sm hover:bg-brand-accent-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start Chat
            </Link>
          </div>
        </div>
      </header>

      {/* Video Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        {/* Overlay for better button visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            {/* Content removed per request */}
          </motion.div>
        </div>
      </section>

      {/* Core Documents Section - Medium Cards */}
      <section id="documents" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* DOCX Card */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative bg-light-bg rounded-3xl p-8 border border-light-border hover:border-brand-accent-300 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <Link to="/chat?skill=docx" state={{ forceNew: true }} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 transition-transform group-hover:scale-110">
                  <img src={docxLogo} alt="Word" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-light-text mb-3">MS Word (DOCX)</h3>
                <p className="text-sm text-light-text-secondary mb-6 leading-relaxed">
                  Draft contracts, resumes, and formal reports with pixel-perfect formatting.
                </p>
                <div className="mt-auto px-6 py-2 bg-white border border-light-border rounded-full text-sm font-medium text-brand-accent-600 group-hover:bg-brand-accent-500 group-hover:text-white transition-colors">
                  Start Processing
                </div>
              </Link>
            </motion.div>

            {/* PPTX Card */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative bg-light-bg rounded-3xl p-8 border border-light-border hover:border-brand-accent-300 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <Link to="/chat?skill=pptx" state={{ forceNew: true }} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 transition-transform group-hover:scale-110">
                  <img src={pptxLogo} alt="PowerPoint" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-light-text mb-3">MS Presentation (PPTX)</h3>
                <p className="text-sm text-light-text-secondary mb-6 leading-relaxed">
                  Design structured pitch decks and visual presentations from plain text.
                </p>
                <div className="mt-auto px-6 py-2 bg-white border border-light-border rounded-full text-sm font-medium text-brand-accent-600 group-hover:bg-brand-accent-500 group-hover:text-white transition-colors">
                  Generate Slides
                </div>
              </Link>
            </motion.div>

            {/* XLSX Card */}
            <motion.div
              whileHover={{ y: -10 }}
              className="group relative bg-light-bg rounded-3xl p-8 border border-light-border hover:border-brand-accent-300 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <Link to="/chat?skill=xlsx" state={{ forceNew: true }} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 transition-transform group-hover:scale-110">
                  <img src={xlsxLogo} alt="Excel" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-light-text mb-3">MS Spreadsheet (XLSX)</h3>
                <p className="text-sm text-light-text-secondary mb-6 leading-relaxed">
                  Automate data sheets, complex formulas, and quarterly financial reports.
                </p>
                <div className="mt-auto px-6 py-2 bg-white border border-light-border rounded-full text-sm font-medium text-brand-accent-600 group-hover:bg-brand-accent-500 group-hover:text-white transition-colors">
                  Analyze Data
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Remaining Tools Grid */}
      <section id="tools" className="py-20 lg:py-32 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ToolsGrid />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-light-border py-8">
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
                Phi Docs AI — Powered by Gemini
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

export default LandingPage;
