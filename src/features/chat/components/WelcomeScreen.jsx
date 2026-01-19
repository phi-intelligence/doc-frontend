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

// File-type specific template categories
const FILE_TYPE_CATEGORIES = {
  docx: [
    { id: 'all', label: 'All Templates' },
    { id: 'contracts-ndas', label: 'Contracts & NDAs' },
    { id: 'hr-forms', label: 'HR Forms' },
    { id: 'project-proposals', label: 'Project Proposals' },
    { id: 'meeting-minutes', label: 'Meeting Minutes' },
    { id: 'compliance-policies', label: 'Compliance Policies' }
  ],
  xlsx: [
    { id: 'all', label: 'All Templates' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'financial-forecasts', label: 'Financial Forecasts' },
    { id: 'project-trackers', label: 'Project Trackers' },
    { id: 'inventory-sheets', label: 'Inventory Sheets' },
    { id: 'sales-reports', label: 'Sales Reports' }
  ],
  pdf: [
    { id: 'all', label: 'All Templates' },
    { id: 'company-reports', label: 'Company Reports' },
    { id: 'policy-manuals', label: 'Policy Manuals' },
    { id: 'legal-agreements', label: 'Legal Agreements' },
    { id: 'user-guides', label: 'User Guides' },
    { id: 'marketing-brochures', label: 'Marketing Brochures' }
  ],
  pptx: [
    { id: 'all', label: 'All Templates' },
    { id: 'pitch-decks', label: 'Pitch Decks' },
    { id: 'marketing-plans', label: 'Marketing Plans' },
    { id: 'training-slides', label: 'Training Slides' },
    { id: 'product-demos', label: 'Product Demos' },
    { id: 'quarterly-reviews', label: 'Quarterly Reviews' }
  ]
};

// Fallback categories (for backward compatibility)
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

  // Reset category when skill changes
  useEffect(() => {
    if (skill && ['docx', 'pptx', 'xlsx', 'pdf'].includes(skill)) {
      setSelectedCategory('all');
    }
  }, [skill]);

  // Fetch templates when component mounts or skill/category changes
  useEffect(() => {
    if (skill && ['docx', 'pptx', 'xlsx', 'pdf'].includes(skill)) {
      fetchTemplates(skill, selectedCategory);
    }
  }, [skill, selectedCategory]);

  const fetchTemplates = async (fileType, category) => {
    setLoadingTemplates(true);
    try {
      const categoryParam = category === 'all' ? '' : `&category=${category}`;
      const response = await fetch(`/api/templates?file_type=${fileType}${categoryParam}`);
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
  const showTemplates = skill && ['docx', 'pptx', 'xlsx', 'pdf'].includes(skill);

  // Get file-type specific categories or fallback to default
  const categories = FILE_TYPE_CATEGORIES[skill] || TEMPLATE_CATEGORIES;

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 overflow-y-auto bg-light-bg scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex flex-col items-center"
      >
        {/* Hero Section - Pro Visuals */}
        <div className="mb-10 text-center relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto w-24 h-24 mb-6 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-brand-accent-200/20 rounded-full blur-2xl animate-pulse" />
            <img
              src="/logophi_brown.png"
              alt="Phi Docs Logo"
              className="w-full h-full object-contain relative z-10"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
            />
            <Sparkles className="w-full h-full text-brand-accent-500 hidden" />
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-light-text mb-4 tracking-tight leading-tight">
            {skill ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-accent-400 via-brand-accent-600 to-brand-accent-900">{info.name}</span>
            ) : (
              <>The Future of <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-accent-400 via-brand-accent-600 to-brand-accent-900">Intelligence</span></>
            )}
          </h1>
          <p className="text-base md:text-lg text-light-text-secondary max-w-xl mx-auto font-medium leading-relaxed opacity-80">
            {info.subtitle}
          </p>
        </div>

        {/* Central Input - Recessed Command Center (Unified Style) */}
        <div className="w-full max-w-3xl relative mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white border border-brand-accent-200 shadow-[inset_0_2px_4px_0_rgba(136,108,74,0.03),0_20px_40px_rgba(136,108,74,0.08)] rounded-[2rem] p-3 focus-within:border-brand-accent-400 transition-all duration-300">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={skill ? `Execute doc command for ${info.name}...` : "Command the AI to build something extraordinary..."}
                className="flex-1 px-5 py-4 bg-transparent border-none outline-none text-base text-light-text placeholder-light-text-muted/50 font-medium"
                autoFocus
              />
              <button
                type="submit"
                disabled={!val.trim() && !selectedTemplate}
                className="p-3.5 bg-brand-accent-600 text-white rounded-2xl hover:bg-brand-accent-700 disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-brand-accent-200 group"
              >
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 pt-1 border-t border-brand-accent-50/50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  ATTACH_FILES
                </button>

                <div className="w-[1px] h-4 bg-brand-accent-100 mx-2" />

                <button
                  type="button"
                  onClick={onToggleWebMode}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${webModeEnabled
                    ? 'text-white bg-brand-accent-600 shadow-sm'
                    : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50'
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  LIVE_SURF
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-brand-accent-400/60 tracking-widest uppercase">
                <Sparkles className="w-3 h-3" />
                Phi_Docs_Core_v2.5
              </div>
            </div>
          </form>

          {/* Selected Template Indicator - Floating Badge */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-brand-accent-900 text-white rounded-full text-xs font-bold shadow-xl border border-white/10 z-20"
            >
              <FileText className="w-3.5 h-3.5 text-brand-accent-400" />
              <span className="opacity-80">TEMPLATE:</span>
              <span>{selectedTemplate.name.toUpperCase()}</span>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="ml-2 hover:text-red-400 transition-colors"
                title="Clear template"
              >
                ✕
              </button>
            </motion.div>
          )}
        </div>

        {/* Quick Suggestions - Premium Grid */}
        <div className="w-full max-w-4xl">
          <p className="text-[10px] font-bold text-brand-accent-500 uppercase mb-5 text-center tracking-[0.2em] opacity-60">Engine suggestions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSend(item.prompt)}
                className="flex flex-col items-start p-5 bg-white border border-brand-accent-100/50 rounded-2xl hover:border-brand-accent-400 transition-all group hover:shadow-[0_10px_30px_rgba(136,108,74,0.08)] active:scale-[0.98] text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Send className="w-3 h-3 text-brand-accent-400" />
                </div>
                <div className="p-3 bg-brand-accent-50 rounded-xl mb-4 group-hover:bg-brand-accent-600 transition-colors">
                  <item.icon className="w-5 h-5 text-brand-accent-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[14px] font-bold text-light-text mb-1">{item.label}</span>
                <span className="text-[11px] text-light-text-secondary line-clamp-2 leading-relaxed opacity-70 font-medium">
                  {item.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATES SECTION - Premium Browser */}
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 w-full border-t border-brand-accent-100/50 pt-10"
          >
            {/* Section Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-light-text mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-accent-500 rounded-full" />
                  Blueprint Library
                </h2>
                <p className="text-sm font-medium text-light-text-secondary opacity-70">
                  Select a professional framework to accelerate your creation
                </p>
              </div>

              {/* Category Tabs - Glassmorphism style */}
              <div className="flex gap-1 p-1 bg-brand-accent-50/50 rounded-xl overflow-x-auto scrollbar-hide border border-brand-accent-100/50">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 text-[11px] font-bold transition-all whitespace-nowrap rounded-lg uppercase tracking-wider ${selectedCategory === category.id
                      ? 'bg-white text-brand-accent-700 shadow-sm border border-brand-accent-100'
                      : 'text-light-text-secondary hover:text-brand-accent-600'
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid - Responsive & Polished */}
            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-[2rem] border border-dashed border-brand-accent-200">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-accent-400 mb-4" />
                <span className="text-xs font-bold text-brand-accent-600 tracking-widest uppercase">Initializing_Library...</span>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* Blank Option - First */}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex flex-col items-center justify-center p-5 bg-white border border-brand-accent-100 rounded-[1.5rem] hover:border-brand-accent-400 transition-all group hover:shadow-xl active:scale-95"
                >
                  <div className="w-full aspect-[3/4] bg-brand-accent-50/30 rounded-xl flex flex-col items-center justify-center mb-4 border border-dashed border-brand-accent-200 group-hover:bg-brand-accent-50 transition-colors">
                    <div className="w-12 h-16 border-2 border-brand-accent-200 rounded relative overflow-hidden group-hover:border-brand-accent-400 transition-colors">
                      <div className="absolute top-2 left-2 right-2 h-0.5 bg-brand-accent-100" />
                      <div className="absolute top-4 left-2 right-4 h-0.5 bg-brand-accent-100" />
                      <div className="absolute top-6 left-2 right-3 h-0.5 bg-brand-accent-100" />
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-light-text">BLANK_DOCTYPE</p>
                  <p className="text-[10px] text-light-text-secondary opacity-60 font-bold uppercase tracking-tight">Pure Canvas</p>
                </button>

                {templates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/30 rounded-[2rem] border border-dashed border-brand-accent-200">
                <FileText className="w-12 h-12 mx-auto mb-4 text-brand-accent-200 opacity-50" />
                <p className="text-sm font-bold text-brand-accent-600 uppercase tracking-widest leading-relaxed"> No archetypes found <br /> in this domain </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
