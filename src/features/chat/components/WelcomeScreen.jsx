import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, Sparkles,
  FileText, Presentation, FileSpreadsheet, FileImage, Image, Code, ScanLine,
  Globe
} from 'lucide-react';
import TemplateCard from '../../../components/cards/TemplateCard';

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

// Template categories for tab navigation
const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'business', label: 'Business' },
  { id: 'design', label: 'Design' },
  { id: 'education', label: 'Education' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'technology', label: 'Technology' }
];

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
 * @param {boolean} webModeEnabled - Whether web scraping mode is enabled
 * @param {Function} onToggleWebMode - Callback to toggle web mode
 */
const WelcomeScreen = ({
  onSend,
  onUpload,
  fileInputRef,
  isUploading,
  skill = null,
  webModeEnabled = false,
  onToggleWebMode = () => { }
}) => {
  const [val, setVal] = useState("");

  // Template state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates when component mounts or skill/category changes
  useEffect(() => {
    if (skill && ['docx', 'pptx', 'xlsx'].includes(skill)) {
      fetchTemplates(skill, selectedCategory);
    }
  }, [skill, selectedCategory]);

  const fetchTemplates = async (fileType, category) => {
    setLoadingTemplates(true);
    try {
      const categoryParam = category === 'all' ? '' : `&category=${category}`;
      const response = await fetch(`/templates?file_type=${fileType}${categoryParam}`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template) => {
    if (selectedTemplate?.id === template.id) {
      // Deselect if clicking same template
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(template);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val.trim() && !selectedTemplate) return;

    // Pass both message and template ID to parent
    onSend(val, selectedTemplate?.id);
    setVal("");
    setSelectedTemplate(null);
  };

  // Get skill-specific or default suggestions
  const suggestions = skillSuggestions[skill] || skillSuggestions.default;
  const info = skillInfo[skill] || skillInfo.default;

  // Only show templates for document skills
  const showTemplates = skill && ['docx', 'pptx', 'xlsx'].includes(skill);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto bg-light-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex flex-col items-center"
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
        <div className="w-full max-w-2xl relative">
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

            {/* Web Scraping Button */}
            <button
              type="button"
              onClick={onToggleWebMode}
              className={`p-1.5 rounded transition-all ${webModeEnabled
                ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md hover:from-blue-600 hover:to-cyan-600'
                : 'text-light-text-secondary hover:text-light-text hover:bg-white'
                }`}
              title={webModeEnabled ? "Web mode ON - Will scrape URLs" : "Enable web scraping"}
            >
              <Globe className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Reply..."
              className="flex-1 py-1.5 bg-transparent border-none outline-none text-light-text placeholder-light-text-muted text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!val.trim() && !selectedTemplate}
              className="p-2 bg-brand-accent-500 text-white rounded hover:bg-brand-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Selected Template Indicator */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 px-3 py-2 bg-brand-accent-50 border border-brand-accent-200 rounded-lg text-sm text-brand-accent-700"
            >
              <FileText className="w-4 h-4" />
              <span>Using template: <strong>{selectedTemplate.name}</strong></span>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="ml-auto text-brand-accent-600 hover:text-brand-accent-800 font-bold"
                title="Clear template"
              >
                ✕
              </button>
            </motion.div>
          )}
        </div>

        {/* Quick Suggestions - Compact */}
        <div className="mt-6 w-full max-w-2xl">
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

        {/* TEMPLATES SECTION - NEW */}
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 w-full border-t border-light-border pt-8"
          >
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-light-text mb-1">Templates</h2>
              <p className="text-sm text-light-text-secondary">
                Start from a professional template or create from scratch
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 border-b border-light-border overflow-x-auto">
              {TEMPLATE_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${selectedCategory === category.id
                    ? 'text-brand-accent-600 border-brand-accent-600'
                    : 'text-light-text-secondary border-transparent hover:text-light-text hover:border-light-border'
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-accent-500" />
                <span className="ml-3 text-light-text-secondary">Loading templates...</span>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {templates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                ))}

                {/* Blank Option */}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-light-border rounded-xl hover:border-brand-accent-300 transition-all group"
                >
                  <div className="w-full aspect-[3/4] bg-light-bg rounded-lg flex items-center justify-center mb-2">
                    <FileText className="w-12 h-12 text-light-text-secondary group-hover:text-brand-accent-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-light-text">Blank Document</p>
                  <p className="text-xs text-light-text-secondary">Start from scratch</p>
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-light-text-secondary">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No templates available for this category</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
