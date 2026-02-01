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
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent-100 mb-6 shadow-lg shadow-brand-accent-100/50">
          <Sparkles className="w-8 h-8 text-brand-accent-600" />
        </div>
        <h1 className="text-3xl font-black text-light-text mb-3">
          Register Your Company
        </h1>
        <p className="text-light-text-secondary text-lg">
          Choose how you'd like to set up your organization profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scan Website Option */}
        <motion.button
          onClick={onSelectScan}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="relative group p-8 bg-light-surface rounded-3xl border border-light-border hover:border-brand-accent-500 text-left transition-all shadow-soft hover:shadow-lg"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-brand-accent-500" />
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-accent-500 to-brand-accent-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-accent-500/20">
            <Globe className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-light-text mb-2">
            Scan Website
          </h3>
          <p className="text-light-text-secondary mb-4">
            We'll automatically extract your company information from your website.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-brand-accent-50 text-brand-accent-700 text-xs font-medium rounded-full border border-brand-accent-100">
              Auto-detect logo
            </span>
            <span className="px-3 py-1 bg-brand-accent-50 text-brand-accent-700 text-xs font-medium rounded-full border border-brand-accent-100">
              Extract contacts
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-light-border">
            <p className="text-xs text-light-text-secondary">
              Best for companies with an existing website
            </p>
          </div>
        </motion.button>

        {/* Manual Entry Option */}
        <motion.button
          onClick={onSelectManual}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="relative group p-8 bg-light-surface rounded-3xl border border-light-border hover:border-status-success text-left transition-all shadow-soft hover:shadow-lg"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-status-success" />
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-status-success to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
            <Edit3 className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-light-text mb-2">
            Enter Manually
          </h3>
          <p className="text-light-text-secondary mb-4">
            Fill in your company details yourself with full control over every field.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-50 text-status-success text-xs font-medium rounded-full border border-green-100">
              Full control
            </span>
            <span className="px-3 py-1 bg-green-50 text-status-success text-xs font-medium rounded-full border border-green-100">
              No website needed
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-light-border">
            <p className="text-xs text-light-text-secondary">
              Best for new companies or those without a website
            </p>
          </div>
        </motion.button>
      </div>

      <p className="text-center text-sm text-light-text-secondary mt-8">
        You can always edit your company profile later from settings
      </p>
    </motion.div>
  );

};

export default MethodSelection;
