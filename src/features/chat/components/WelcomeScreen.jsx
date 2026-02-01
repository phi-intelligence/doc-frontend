import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, Sparkles,
  FileText, Presentation, FileSpreadsheet, FileImage, Image, Code, ScanLine,
  Globe, Plus, LayoutGrid, Wand2, ImagePlus, X, ZoomIn
} from 'lucide-react';
import TemplateCard from '../../../components/cards/TemplateCard';
import { listTemplates } from '../../../api/templates';

// Fallback AI Image Generation examples (used when API images not available)
const fallbackImageExamples = [
  {
    id: "fallback_1",
    title: "Product Photo",
    prompt: "Generate a professional product photo of a modern smartwatch on a marble surface with soft studio lighting",
    category: "E-commerce"
  },
  {
    id: "fallback_2",
    title: "Social Banner",
    prompt: "Create a vibrant social media banner for a tech startup with abstract geometric shapes and blue gradient",
    category: "Marketing"
  },
  {
    id: "fallback_3",
    title: "Blog Illustration",
    prompt: "Generate an illustration for a blog post about artificial intelligence with neural network visuals",
    category: "Content"
  },
  {
    id: "fallback_4",
    title: "Logo Concept",
    prompt: "Create a minimalist logo concept for a sustainable energy company with leaf and sun elements",
    category: "Branding"
  },
  {
    id: "fallback_5",
    title: "Corporate Background",
    prompt: "Generate a professional corporate team photo background with modern office setting",
    category: "Corporate"
  },
  {
    id: "fallback_6",
    title: "Data Infographic",
    prompt: "Create a clean infographic template about data analytics with charts and icons",
    category: "Data"
  }
];

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
  'web-artifacts-builder': [
    { icon: Code, label: "Landing Page", prompt: "Create a modern landing page for a SaaS product with hero, features, and CTA sections." },
    { icon: Code, label: "Dashboard", prompt: "Build a dashboard with charts and metrics for a business analytics app." },
    { icon: Code, label: "Portfolio", prompt: "Create a portfolio website with project gallery and contact form." },
    { icon: Code, label: "Game", prompt: "Build an interactive browser game with animations." },
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
  'web-artifacts-builder': { name: 'Web Design', subtitle: 'Create landing pages and web applications' },
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
  
  // All templates for general page
  const [allTemplates, setAllTemplates] = useState([]);
  const [loadingAllTemplates, setLoadingAllTemplates] = useState(false);
  
  // Gallery images for AI section
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  
  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

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

  // Fetch all templates for general page (no skill selected)
  useEffect(() => {
    if (!skill) {
      fetchAllTemplates();
      fetchGalleryImages();
    }
  }, [skill]);

  const fetchAllTemplates = async () => {
    setLoadingAllTemplates(true);
    try {
      const data = await listTemplates({ limit: 20 });
      setAllTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load all templates:', error);
      setAllTemplates([]);
    } finally {
      setLoadingAllTemplates(false);
    }
  };

  const fetchGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const response = await fetch('/api/gallery/ai-images?limit=6');
      if (response.ok) {
        const data = await response.json();
        setGalleryImages(data.images || []);
      } else {
        // Use fallback examples if API fails
        setGalleryImages(fallbackImageExamples);
      }
    } catch (error) {
      console.error('Failed to load gallery images:', error);
      // Use fallback examples
      setGalleryImages(fallbackImageExamples);
    } finally {
      setLoadingGallery(false);
    }
  };

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
            className="mx-auto w-40 h-40 md:w-48 md:h-48 mb-8 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-brand-accent-200/20 rounded-full blur-3xl animate-pulse" />
            <img
              src="/genX.png"
              alt="GendocX Logo"
              className="w-full h-full object-contain relative z-10 drop-shadow-lg"
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-light-sidebar border border-brand-accent-200 shadow-[inset_0_2px_4px_0_rgba(136,108,74,0.03),0_20px_40px_rgba(136,108,74,0.08)] rounded-[2rem] p-3 focus-within:border-brand-accent-400 transition-all duration-300">
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
                className="flex flex-col items-start p-5 bg-light-sidebar border border-brand-accent-100/50 rounded-2xl hover:border-brand-accent-400 transition-all group hover:shadow-[0_10px_30px_rgba(136,108,74,0.08)] active:scale-[0.98] text-left relative overflow-hidden"
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

        {/* ALL TEMPLATES GALLERY - For General Page (no skill selected) */}
        {!skill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 w-full max-w-5xl"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-5 h-5 text-brand-accent-500" />
                <h2 className="text-sm font-medium text-light-text">Start with a template</h2>
              </div>
              <button className="text-sm text-brand-accent-600 hover:text-brand-accent-700 font-medium flex items-center gap-1.5 transition-colors">
                View all templates
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="bg-brand-accent-50/40 rounded-xl p-6">
              {loadingAllTemplates ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[140px] animate-pulse">
                      <div className="aspect-[4/5] rounded-lg bg-brand-accent-100" />
                      <div className="mt-2.5">
                        <div className="h-4 bg-brand-accent-100 rounded w-3/4 mb-1" />
                        <div className="h-3 bg-brand-accent-50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* Blank Document Card */}
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-shrink-0 w-[140px] group focus:outline-none focus:ring-2 focus:ring-brand-accent-500/30 rounded-lg"
                  >
                    <div className="aspect-[4/5] rounded-lg border-2 border-dashed border-brand-accent-300 bg-white hover:border-brand-accent-500 hover:bg-brand-accent-50 transition-all flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-accent-100">
                      <Plus className="w-12 h-12 text-brand-accent-500 group-hover:text-brand-accent-600 transition-colors" />
                    </div>
                    <div className="mt-2.5 text-left">
                      <p className="text-sm font-medium text-light-text">Blank</p>
                      <p className="text-xs text-brand-accent-600">New Document</p>
                    </div>
                  </button>

                  {/* Template Cards */}
                  {allTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`flex-shrink-0 w-[140px] group text-left focus:outline-none focus:ring-2 focus:ring-brand-accent-500/30 rounded-lg ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-brand-accent-500' : ''
                      }`}
                    >
                      <div className={`aspect-[4/5] rounded-lg border bg-white overflow-hidden hover:shadow-lg hover:shadow-brand-accent-100 transition-all ${
                        selectedTemplate?.id === template.id 
                          ? 'border-brand-accent-500 shadow-lg shadow-brand-accent-200' 
                          : 'border-gray-200 hover:border-brand-accent-400'
                      }`}>
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url}
                            alt={template.name}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-brand-accent-50">
                            {template.file_type === 'xlsx' ? (
                              <FileSpreadsheet className="w-10 h-10 text-green-600" />
                            ) : template.file_type === 'pptx' ? (
                              <Presentation className="w-10 h-10 text-orange-500" />
                            ) : (
                              <FileText className="w-10 h-10 text-brand-accent-500" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <p className="text-sm font-medium text-light-text group-hover:text-brand-accent-700 truncate transition-colors">
                          {template.name}
                        </p>
                        <p className="text-xs text-brand-accent-600 truncate">
                          {template.file_type?.toUpperCase() || 'Document'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI GENERATED IMAGES SECTION - For General Page */}
        {!skill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 w-full max-w-5xl"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-brand-accent-500" />
                <h2 className="text-sm font-medium text-light-text">AI Generated Images</h2>
              </div>
              <button 
                onClick={() => onSend("Show me what kinds of images you can generate")}
                className="text-sm text-brand-accent-600 hover:text-brand-accent-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                Explore more
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Image Generation Examples Grid */}
            <div className="bg-gradient-to-br from-brand-accent-50/60 to-brand-accent-100/30 rounded-xl p-6 border border-brand-accent-100/50">
              {loadingGallery ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/2] rounded-xl bg-brand-accent-100" />
                      <div className="mt-2 h-4 bg-brand-accent-100 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {galleryImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setPreviewImage(image)}
                      className="group text-left focus:outline-none focus:ring-2 focus:ring-brand-accent-500/30 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-[3/2] rounded-xl overflow-hidden relative bg-brand-accent-100">
                        {image.image_url || image.thumbnail_url ? (
                          <img
                            src={image.image_url || image.thumbnail_url}
                            alt={image.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              // Hide broken image, show placeholder
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Placeholder shown when no image or image fails to load */}
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-accent-100 to-brand-accent-200 ${image.image_url || image.thumbnail_url ? 'hidden' : 'flex'}`}>
                          <Wand2 className="w-8 h-8 text-brand-accent-400" />
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                            <ZoomIn className="w-3.5 h-3.5" />
                            Preview
                          </div>
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-brand-accent-700 uppercase tracking-wide">
                          {image.category}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-light-text group-hover:text-brand-accent-700 truncate transition-colors">
                          {image.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Generate Custom Prompt */}
              <div className="mt-6 pt-5 border-t border-brand-accent-200/50">
                <button
                  onClick={() => onSend("Generate a custom image: ")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/80 hover:bg-white border border-brand-accent-200 hover:border-brand-accent-400 rounded-xl text-sm font-medium text-brand-accent-700 hover:text-brand-accent-800 transition-all group"
                >
                  <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Create Custom Image with AI
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
                      ? 'bg-brand-accent-500 text-white shadow-sm border border-brand-accent-600'
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
              <div className="flex flex-col items-center justify-center py-20 bg-brand-accent-50/50 rounded-[2rem] border border-dashed border-brand-accent-200">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-accent-400 mb-4" />
                <span className="text-xs font-bold text-brand-accent-600 tracking-widest uppercase">Initializing_Library...</span>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* Blank Option - First */}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex flex-col items-center justify-center p-5 bg-light-sidebar border border-brand-accent-100 rounded-[1.5rem] hover:border-brand-accent-400 transition-all group hover:shadow-xl active:scale-95"
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
              <div className="text-center py-20 bg-brand-accent-50/50 rounded-[2rem] border border-dashed border-brand-accent-200">
                <FileText className="w-12 h-12 mx-auto mb-4 text-brand-accent-200 opacity-50" />
                <p className="text-sm font-bold text-brand-accent-600 uppercase tracking-widest leading-relaxed"> No archetypes found <br /> in this domain </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={previewImage.image_url || previewImage.thumbnail_url}
                  alt={previewImage.title}
                  className="w-full max-h-[70vh] object-contain bg-gray-100"
                />
              </div>

              {/* Info Footer */}
              <div className="p-6 bg-white border-t border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {previewImage.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 bg-brand-accent-100 text-brand-accent-700 text-xs font-bold rounded-full uppercase">
                      {previewImage.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeScreen;
