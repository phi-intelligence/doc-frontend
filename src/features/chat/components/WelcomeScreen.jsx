import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, Sparkles,
  FileText, Presentation, FileSpreadsheet, FileImage, Image, Code, ScanLine
} from 'lucide-react';

// Skill-specific suggestions
const skillSuggestions = {
  docx: [
    { icon: FileText, label: "Draft Contract", prompt: "Draft a freelance service agreement for a web development project." },
    { icon: FileText, label: "Write Resume", prompt: "Create a professional resume for a software engineer." },
    { icon: FileText, label: "Business Proposal", prompt: "Write a business proposal for a consulting engagement." },
    { icon: FileText, label: "Meeting Minutes", prompt: "Create a meeting minutes template with action items." },
  ],
  xlsx: [
    { icon: FileSpreadsheet, label: "Budget Template", prompt: "Create a budget spreadsheet for a marketing campaign." },
    { icon: FileSpreadsheet, label: "Sales Report", prompt: "Generate a quarterly sales report with charts." },
    { icon: FileSpreadsheet, label: "Invoice Template", prompt: "Create a professional invoice template with formulas." },
    { icon: FileSpreadsheet, label: "Project Tracker", prompt: "Build a project task tracker with status indicators." },
  ],
  pptx: [
    { icon: Presentation, label: "Pitch Deck", prompt: "Create a pitch deck structure for a new AI startup." },
    { icon: Presentation, label: "Quarterly Review", prompt: "Design a quarterly business review presentation." },
    { icon: Presentation, label: "Product Demo", prompt: "Create slides for a product feature demonstration." },
    { icon: Presentation, label: "Training Deck", prompt: "Build a training presentation for new employees." },
  ],
  pdf: [
    { icon: FileImage, label: "Fill PDF Form", prompt: "Help me fill out this PDF form with my details." },
    { icon: FileImage, label: "Merge PDFs", prompt: "Merge multiple PDF documents into one." },
    { icon: FileImage, label: "Extract Text", prompt: "Extract all text content from this PDF document." },
    { icon: FileImage, label: "Create PDF", prompt: "Create a professional PDF report with charts." },
  ],
  imagegen: [
    { icon: Image, label: "Product Photo", prompt: "Generate a professional product photo for an e-commerce listing." },
    { icon: Image, label: "Social Banner", prompt: "Create a social media banner for a tech brand." },
    { icon: Image, label: "Illustration", prompt: "Generate an illustration for a blog post about AI." },
    { icon: Image, label: "Logo Concept", prompt: "Create logo concept ideas for a coffee shop." },
  ],
  'frontend-design': [
    { icon: Code, label: "Landing Page", prompt: "Create a React landing page component for a SaaS product." },
    { icon: Code, label: "Dashboard", prompt: "Build a dashboard component with charts and metrics." },
    { icon: Code, label: "Form Component", prompt: "Create a multi-step form component with validation." },
    { icon: Code, label: "Card Grid", prompt: "Design a responsive card grid for a portfolio site." },
  ],
  'handwritten-ocr': [
    { icon: ScanLine, label: "Extract Notes", prompt: "Extract text from my handwritten meeting notes." },
    { icon: ScanLine, label: "Digitize Form", prompt: "Digitize this handwritten form into a document." },
    { icon: ScanLine, label: "Convert Letter", prompt: "Convert this handwritten letter to typed text." },
    { icon: ScanLine, label: "Transcribe", prompt: "Transcribe my handwritten notes into a Word document." },
  ],
  // Default suggestions for unified mode (no skill)
  default: [
    { icon: FileText, label: "Draft a Contract", prompt: "Draft a freelance service agreement for a web development project." },
    { icon: Presentation, label: "Create Pitch Deck", prompt: "Create a pitch deck structure for a new AI startup." },
    { icon: FileSpreadsheet, label: "Analyze Budget", prompt: "Create a budget spreadsheet for a marketing campaign." },
    { icon: FileImage, label: "Extract Invoice", prompt: "I need to extract data from an invoice image." },
  ]
};

// Skill display names and subtitles
const skillInfo = {
  docx: { name: 'Word Documents', subtitle: 'Create and edit professional documents' },
  xlsx: { name: 'Excel Spreadsheets', subtitle: 'Work with data, formulas, and charts' },
  pptx: { name: 'Presentations', subtitle: 'Design slides and pitch decks' },
  pdf: { name: 'PDF Processing', subtitle: 'Create, edit, and extract from PDFs' },
  imagegen: { name: 'Image Generation', subtitle: 'Create AI-generated images' },
  'frontend-design': { name: 'Frontend Design', subtitle: 'Generate React components and UI' },
  'handwritten-ocr': { name: 'Handwritten OCR', subtitle: 'Extract text from handwritten content' },
  default: { name: 'Phi Docs', subtitle: 'What would you like to create today?' }
};

/**
 * Welcome screen component shown when no conversations exist
 * @param {Function} onSend - Callback when message is sent
 * @param {Function} onUpload - Callback when upload button is clicked
 * @param {Object} fileInputRef - Ref to file input element
 * @param {boolean} isUploading - Whether file upload is in progress
 * @param {string} skill - Optional skill hint from URL (e.g., 'docx', 'xlsx')
 */
const WelcomeScreen = ({ onSend, onUpload, fileInputRef, isUploading, skill = null }) => {
  const [val, setVal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      onSend(val);
    }
  };

  // Get skill-specific or default suggestions
  const suggestions = skillSuggestions[skill] || skillSuggestions.default;
  const info = skillInfo[skill] || skillInfo.default;

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
            {skill ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent-400 to-brand-accent-600">{info.name}</span>
            ) : (
              <>Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent-400 to-brand-accent-600">Phi Docs</span></>
            )}
          </h1>
          <p className="text-sm text-light-text-secondary max-w-md mx-auto">
            {info.subtitle}
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
