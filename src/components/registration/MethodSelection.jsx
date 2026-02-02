import React from 'react';
import { Globe, Edit3, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Method selection component for company registration.
 * Allows users to choose between website scanning or manual entry.
 */
const MethodSelection = ({ onSelectScan, onSelectManual }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4"
    >
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-brand-accent-50 border border-brand-accent-100 mb-8 shadow-xl shadow-brand-accent-900/5">
          <Sparkles className="w-10 h-10 text-brand-accent-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-light-text tracking-tighter mb-6">
          Initialize Organization
        </h1>
        <p className="text-xl text-light-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
          Select your preferred onboarding method to begin the digital transformation process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scan Website Option */}
        <motion.button
          onClick={onSelectScan}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          className="relative group flex flex-col h-full p-10 bg-white rounded-[40px] border border-light-border hover:border-brand-accent-300 text-left transition-all shadow-sm hover:shadow-2xl hover:shadow-brand-accent-900/10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-50 rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent-50 flex items-center justify-center border border-brand-accent-100 group-hover:bg-brand-accent-600 group-hover:border-brand-accent-600 transition-colors duration-300">
                <Globe className="w-8 h-8 text-brand-accent-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="w-10 h-10 rounded-full border border-light-border flex items-center justify-center group-hover:border-brand-accent-600 group-hover:bg-brand-accent-600 transition-all">
                <ArrowRight className="w-5 h-5 text-light-text-secondary group-hover:text-white transition-colors" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-light-text mb-3 tracking-tight">
              AI Website Scan
            </h3>
            <p className="text-light-text-secondary font-medium leading-relaxed mb-8 flex-grow">
              Our autonomous agents will crawl your public domain to extract brand assets, contact data, and corporate structure.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-4 py-1.5 bg-light-surface border border-light-border text-light-text-secondary text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-brand-accent-50 group-hover:text-brand-accent-700 group-hover:border-brand-accent-200 transition-colors">
                Auto-Discovery
              </span>
              <span className="px-4 py-1.5 bg-light-surface border border-light-border text-light-text-secondary text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-brand-accent-50 group-hover:text-brand-accent-700 group-hover:border-brand-accent-200 transition-colors">
                ~30 Seconds
              </span>
            </div>
          </div>
        </motion.button>

        {/* Manual Entry Option */}
        <motion.button
          onClick={onSelectManual}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          className="relative group flex flex-col h-full p-10 bg-white rounded-[40px] border border-light-border hover:border-brand-accent-300 text-left transition-all shadow-sm hover:shadow-2xl hover:shadow-brand-accent-900/10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
          
          <div className="relative z-10 flex flex-col h-full">
             <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-light-border flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-50 transition-all duration-300">
                <Edit3 className="w-8 h-8 text-light-text-secondary group-hover:text-green-600 transition-colors duration-300" />
              </div>
              <div className="w-10 h-10 rounded-full border border-light-border flex items-center justify-center group-hover:border-green-600 group-hover:bg-green-600 transition-all">
                <ArrowRight className="w-5 h-5 text-light-text-secondary group-hover:text-white transition-colors" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-light-text mb-3 tracking-tight">
              Manual Configuration
            </h3>
            <p className="text-light-text-secondary font-medium leading-relaxed mb-8 flex-grow">
              Manually input your organization's details. Recommended for pre-launch startups or internal divisions.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-4 py-1.5 bg-light-surface border border-light-border text-light-text-secondary text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-colors">
                Full Control
              </span>
              <span className="px-4 py-1.5 bg-light-surface border border-light-border text-light-text-secondary text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-colors">
                Granular Edit
              </span>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MethodSelection;
