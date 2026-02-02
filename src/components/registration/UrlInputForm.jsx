import React, { useState } from 'react';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * URL input form for company registration
 */
const UrlInputForm = ({ onSubmit, isLoading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (value) => {
    if (!value.trim()) {
      return 'Please enter a website URL';
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(value)) {
      return 'Please enter a valid website URL';
    }

    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSubmit(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-brand-accent-50 border border-brand-accent-100 mb-8 shadow-xl shadow-brand-accent-900/5">
          <Globe className="w-10 h-10 text-brand-accent-600" />
        </div>
        <h1 className="text-4xl font-black text-light-text mb-4 tracking-tight">
          Target Domain
        </h1>
        <p className="text-xl text-light-text-secondary font-medium max-w-xl mx-auto">
          Enter your organization's primary domain. Our agents will recursively map the site structure.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-light-border shadow-xl shadow-brand-accent-900/5 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div>
            <label htmlFor="website-url" className="block text-sm font-black text-light-text uppercase tracking-widest mb-4">
              Organization URL
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Globe className="w-6 h-6 text-light-text-secondary/50 group-focus-within:text-brand-accent-600 transition-colors" />
              </div>
              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://example.com"
                disabled={isLoading}
                className={`
                  w-full pl-16 pr-6 py-6 text-xl font-medium
                  bg-light-bg border-2 rounded-2xl
                  placeholder-light-text-secondary/40
                  focus:outline-none focus:bg-white focus:border-brand-accent-500 focus:shadow-lg focus:shadow-brand-accent-500/10
                  transition-all duration-300
                  ${error
                    ? 'border-status-error focus:border-status-error bg-red-50/30'
                    : 'border-transparent hover:border-light-border'
                  }
                  ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              />
              {/* Status Indicator */}
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                {isLoading && <Loader2 className="w-6 h-6 animate-spin text-brand-accent-500" />}
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-bold text-status-error flex items-center gap-2 pl-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-status-error" />
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={`
              w-full flex items-center justify-center gap-3
              px-8 py-6 rounded-2xl font-black text-lg uppercase tracking-wide
              transition-all duration-300
              ${isLoading || !url.trim()
                ? 'bg-light-bg text-light-text-muted cursor-not-allowed border border-light-border'
                : 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/30 hover:scale-[1.01]'
              }
            `}
          >
            {isLoading ? (
              <>
                <span>Initializing Scraper Agents</span>
              </>
            ) : (
              <>
                Start Analysis
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

          <div className="pt-6 border-t border-light-border/50 text-center">
             <div className="inline-flex items-center gap-6 text-xs font-bold text-light-text-secondary uppercase tracking-wider opacity-60">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> SSL Secure</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Deep Crawl</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Metadata Extraction</span>
             </div>
          </div>
        </form>
      </div>

    </motion.div>
  );
};

export default UrlInputForm;
