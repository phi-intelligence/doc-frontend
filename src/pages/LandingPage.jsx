import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, FileText, Image } from 'lucide-react';
import ToolsGrid from '../components/landing/ToolsGrid';

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
              <span className="text-xl font-semibold text-light-text">
                <span className="text-brand-accent-600">Doc</span>Flies
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent-50/50 via-light-bg to-brand-accent-100/30" />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23886C4A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent-100 
                            rounded-full text-sm font-medium text-brand-accent-700 mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Document & Creative Tools
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-light-text mb-6 leading-tight">
              Your Complete
              <span className="block text-transparent bg-clip-text bg-gradient-to-r 
                               from-brand-accent-500 to-brand-accent-700">
                AI Workspace
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-light-text-secondary mb-8 max-w-2xl mx-auto">
              Create documents, generate images, design marketing materials, and automate workflows
              with powerful AI tools—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                           bg-brand-accent-500 text-white rounded-lg font-semibold text-base
                           hover:bg-brand-accent-600 transition-all shadow-soft hover:shadow-medium"
              >
                Start Creating
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#tools"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 
                           bg-white text-light-text border border-light-border rounded-lg 
                           font-semibold text-base hover:border-brand-accent-300 transition-all"
              >
                Explore Tools
              </a>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Documents Feature */}
            <div className="text-center p-6 bg-gradient-to-br from-brand-accent-50 to-brand-accent-100/50 rounded-2xl border border-brand-accent-100">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-brand-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-light-text mb-2">Document Tools</h3>
              <p className="text-sm text-light-text-secondary mb-3">
                Create professional documents with AI assistance
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-brand-accent-700">
                <span className="px-2 py-1 bg-white/60 rounded-md">Reports</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">Spreadsheets</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">Presentations</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">PDFs</span>
              </div>
            </div>

            {/* Design & Creative Feature */}
            <div className="text-center p-6 bg-gradient-to-br from-brand-accent-50 to-brand-accent-100/50 rounded-2xl border border-brand-accent-100">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image className="w-8 h-8 text-brand-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-light-text mb-2">Digital Marketing</h3>
              <p className="text-sm text-light-text-secondary mb-3">
                AI-powered visual content and brand assets
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-brand-accent-700">
                <span className="px-2 py-1 bg-white/60 rounded-md">Images</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">Logos</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">Marketing</span>
                <span className="px-2 py-1 bg-white/60 rounded-md">Web Design</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-light-text mb-3">
              All Your Tools in One Place
            </h2>
            <p className="text-light-text-secondary max-w-2xl mx-auto">
              Choose a tool to get started. Document tools open in the chat interface,
              while marketing tools have dedicated visual editors.
            </p>
          </motion.div>

          {/* Tools Grid */}
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

export default LandingPage;
