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
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
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
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent-100 mb-6">
          <Globe className="w-8 h-8 text-brand-accent-600" />
        </div>
        <h1 className="text-3xl font-black text-light-text mb-3">
          Register Your Company
        </h1>
        <p className="text-light-text-secondary text-lg">
          Enter your company's website URL and we'll automatically extract your organization's profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="website-url" className="block text-sm font-bold text-light-text-secondary mb-2">
            Company Website
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="w-5 h-5 text-light-text-secondary/50" />
            </div>
            <input
              id="website-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="example.com"
              disabled={isLoading}
              className={`
                w-full pl-12 pr-4 py-4 text-lg
                bg-light-surface border rounded-2xl
                placeholder-light-text-secondary/50
                focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300
                transition-all
                ${error
                  ? 'border-status-error focus:border-status-error'
                  : 'border-light-border'
                }
                ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-status-error"
            >
              {error}
            </motion.p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={`
            w-full flex items-center justify-center gap-3
            px-8 py-4 rounded-2xl font-bold text-lg
            transition-all
            ${isLoading || !url.trim()
              ? 'bg-light-sidebar text-light-text-muted cursor-not-allowed'
              : 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Starting Scan...
            </>
          ) : (
            <>
              Start Scanning
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-light-text-secondary">
          We'll scan your website to extract company information, contact details, and more.
        </p>
      </form>

    </motion.div>
  );
};

export default UrlInputForm;
