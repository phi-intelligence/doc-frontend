import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';

/**
 * ChatWorkspaceHero - In-app hero for Document Chat page (no login; user is authenticated).
 * Reuses LandingHero visual style: headline, subtitle, gradient background, optional video.
 */
export default function ChatWorkspaceHero({ videoSrc = null }) {
  return (
    <section className="relative min-h-[50vh] flex items-center py-16 overflow-hidden bg-white rounded-3xl border border-light-border">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-accent-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-50 border border-brand-accent-100 text-brand-accent-700 text-xs font-bold tracking-wider uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-600" />
              </span>
              Document Chat
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-light-text tracking-tight leading-[1.15] mb-6">
              Create with AI. <br />
              <span className="text-brand-accent-600">Any document, any format.</span>
            </h1>

            <p className="text-lg text-light-text-secondary leading-relaxed mb-8 max-w-xl">
              Start the unified chat to create Word docs, spreadsheets, presentations, and more. Or pick a tool below to jump straight into a skill.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/chat"
                className="w-full sm:w-auto px-8 py-4 bg-brand-accent-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-100 transition-all flex items-center justify-center gap-2"
              >
                Open unified chat
                <ChevronRight className="w-5 h-5" />
              </Link>
              {videoSrc && (
                <button
                  type="button"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-light-text border border-light-border rounded-2xl font-bold text-lg hover:bg-light-sidebar transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch demo
                </button>
              )}
            </div>
          </motion.div>

          {/* Right: Optional video */}
          {videoSrc && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative rounded-2xl overflow-hidden border border-light-border shadow-xl aspect-video bg-gray-100"
            >
              <video
                src={videoSrc}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
                aria-hidden
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
