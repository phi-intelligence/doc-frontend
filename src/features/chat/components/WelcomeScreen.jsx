import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, Sparkles,
  FileText, Presentation, FileSpreadsheet, FileImage
} from 'lucide-react';

/**
 * Welcome screen component shown when no conversations exist
 * @param {Function} onSend - Callback when message is sent
 * @param {Function} onUpload - Callback when upload button is clicked
 * @param {Object} fileInputRef - Ref to file input element
 * @param {boolean} isUploading - Whether file upload is in progress
 */
const WelcomeScreen = ({ onSend, onUpload, fileInputRef, isUploading }) => {
  const [val, setVal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      onSend(val);
    }
  };

  const suggestions = [
    { icon: FileText, label: "Draft a Contract", prompt: "Draft a freelance service agreement for a web development project." },
    { icon: Presentation, label: "Create Pitch Deck", prompt: "Create a pitch deck structure for a new AI startup." },
    { icon: FileSpreadsheet, label: "Analyze Budget", prompt: "Create a budget spreadsheet for a marketing campaign." },
    { icon: FileImage, label: "Extract Invoice", prompt: "I need to extract data from an invoice image." },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto bg-light-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        {/* Hero Section - Compact */}
        <div className="mb-6 text-center">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <img src="/logophi_brown.png" alt="Phi Docs Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
            <Sparkles className="w-full h-full text-brand-accent-500 hidden" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-light-text mb-2">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent-400 to-brand-accent-600">Phi Docs</span>
          </h1>
          <p className="text-sm text-light-text-secondary max-w-md mx-auto">
            What would you like to create today?
          </p>
        </div>

        {/* Central Input - Minimal Design */}
        <div className="w-full relative">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-light-sidebar border border-light-border rounded-lg px-2 py-2 focus-within:border-light-border-hover transition-colors">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 text-brand-accent-500 hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach files"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              className="p-1.5 text-light-text-secondary hover:text-light-text hover:bg-white rounded transition-all"
              title="Recent prompts"
            >
              <Clock className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Reply..."
              className="flex-1 py-1.5 bg-transparent border-none outline-none text-light-text placeholder-light-text-muted text-sm"
              autoFocus
            />
            <div className="hidden md:flex items-center gap-1 text-[11px] text-light-text-muted px-2">
              <span>Phi Docs</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <button
              type="submit"
              disabled={!val.trim()}
              className="p-2 bg-brand-accent-500 text-white rounded hover:bg-brand-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Suggestions - Compact */}
        <div className="mt-6 w-full">
          <p className="text-[11px] font-medium text-light-text-muted uppercase mb-3 text-center">Or try one of these</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSend(item.prompt)}
                className="flex flex-col items-center justify-center p-3 bg-white border border-light-border rounded-lg hover:border-brand-accent-300 transition-all group"
              >
                <div className="p-2 bg-brand-accent-50 rounded-lg mb-2 group-hover:bg-brand-accent-100 transition-colors">
                  <item.icon className="w-4 h-4 text-brand-accent-500" />
                </div>
                <span className="text-[12px] font-medium text-light-text">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
