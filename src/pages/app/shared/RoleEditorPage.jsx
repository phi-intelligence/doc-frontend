import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Presentation, FileSpreadsheet, FileImage, Sparkles, RefreshCw, ChevronLeft } from 'lucide-react';
import { useSession } from '../../../hooks/useSession';
import TemplateCard from '../../../components/cards/TemplateCard';
import UnifiedSectionEditor from './UnifiedSectionEditor';
import apiClient from '../../../api/index';

const DOC_TYPES = [
  { id: 'docx', label: 'Word / Docs', icon: FileText, fileType: 'docx' },
  { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, fileType: 'xlsx' },
  { id: 'pptx', label: 'PowerPoint', icon: Presentation, fileType: 'pptx' },
  { id: 'pdf', label: 'PDF / Report', icon: FileImage, fileType: 'pdf' },
];

const MODULE_CONFIG = {
  hr: {
    name: 'Human Resources',
    suggestions: [
      'Draft an employment contract for a Senior Engineer',
      'Generate an offer letter from the candidate details',
      'Create an employee ID card using the uploaded photo',
      'Produce a Non-Disclosure Agreement (NDA)',
      'Summarize the resume and extract key skills',
    ],
    backTo: '/app/hr',
  },
  finance: {
    name: 'Finance',
    suggestions: [
      'Generate a quarterly budget report',
      'Create an expense reimbursement form',
      'Build a revenue forecast spreadsheet',
      'Analyze the uploaded invoice and extract data',
      'Draft a financial audit summary',
    ],
    backTo: '/app/finance',
  },
  legal: {
    name: 'Legal & Compliance',
    suggestions: [
      'Draft a standard NDA for contractors',
      'Create a service agreement template',
      'Analyze the contract for risk factors',
      'Generate a compliance checklist',
      'Extract key terms from the uploaded document',
    ],
    backTo: '/app/legal',
  },
  marketing: {
    name: 'Marketing',
    suggestions: [
      'Create a campaign brief for product launch',
      'Generate social media content calendar',
      'Draft a press release template',
      'Build a competitive analysis report',
      'Design a marketing proposal deck',
    ],
    backTo: '/app/marketing',
  },
  insurance: {
    name: 'Insurance',
    suggestions: [
      'Generate a comprehensive insurance policy document',
      'Create a claim submission form for property damage',
      'Draft an underwriting risk assessment report',
      'Build a policy renewal notice letter',
      'Produce an agent performance report',
    ],
    backTo: '/app/insurance',
  },
  medical: {
    name: 'Medical',
    suggestions: [
      'Create a patient consultation note (SOAP format)',
      'Generate a prescription document for medication',
      'Draft a referral letter to a specialist',
      'Build a hospital discharge summary',
      'Create a lab order form for diagnostic tests',
    ],
    backTo: '/app/medical',
  },
  general: {
    name: 'Document Editor',
    suggestions: [
      'Draft a freelance service agreement',
      'Create a pitch deck structure',
      'Build a budget spreadsheet',
      'Extract data from an invoice image',
    ],
    backTo: '/app/chat',
  },
};

/**
 * RoleEditorPage - Welcome-style entry for module editors.
 * Supports:
 *   - ?direct=1 — skip Welcome and open UnifiedSectionEditor directly.
 *   - ?templateId=... — open editor with template pre-selected (implies editor phase).
 *
 * @param {string} module - hr | finance | legal | marketing | general
 * @param {string} sectionKey - Section key override (defaults to module)
 */
export default function RoleEditorPage({ module: moduleProp = 'general', sectionKey: sectionKeyProp }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { createNewSession } = useSession();

  const direct = searchParams.get('direct') === '1' || location.state?.direct;
  const templateIdFromUrl = searchParams.get('templateId') || undefined;

  // Get location state (for employee context, initialFiles)
  const employee = location.state?.employee || null;
  const initialFiles = location.state?.initialFiles || [];
  const templateName = location.state?.templateName || null;

  const moduleKey = (moduleProp || 'general').toLowerCase();
  const sectionKey = sectionKeyProp || moduleKey;
  const config = MODULE_CONFIG[moduleKey] || MODULE_CONFIG.general;

  // Determine initial phase
  const initialPhase = useMemo(() => {
    if (templateIdFromUrl || direct) return 'editor';
    if (initialFiles.length > 0 || employee) return 'editor';
    // Check if returning from workspace with a file
    if (location.state?.returnedFile || location.state?.savedFile) return 'editor';
    return 'welcome';
  }, [templateIdFromUrl, direct, initialFiles.length, employee, location.state]);

  const [phase, setPhase] = useState(initialPhase);
  const [templateId, setTemplateId] = useState(templateIdFromUrl || null);
  // Only set initial message if using templateId from URL (not when file is already loaded)
  const [initialMessage, setInitialMessage] = useState(
    templateIdFromUrl && initialFiles.length === 0 ? `Use template: ${templateIdFromUrl}` : null
  );
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [category, setCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch templates when doc type selected
  useEffect(() => {
    if (!selectedDocType || !['docx', 'xlsx', 'pptx', 'pdf'].includes(selectedDocType)) {
      setTemplates([]);
      return;
    }
    setLoadingTemplates(true);
    const params = new URLSearchParams();
    params.set('file_type', selectedDocType);
    params.set('section', moduleKey);
    if (category !== 'all') params.set('category', category);

    apiClient
      .get(`/templates?${params}`)
      .then((res) => setTemplates(res.data?.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [selectedDocType, category, moduleKey]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const message = (prompt || '').trim() || (selectedTemplate ? `Use template: ${selectedTemplate.name}` : '');
    if (!message && !selectedTemplate?.id) return;

    setIsSubmitting(true);
    try {
      await createNewSession();
      setTemplateId(selectedTemplate?.id || null);
      setInitialMessage(message || (selectedTemplate?.id ? `Use template: ${selectedTemplate.name}` : ''));
      setPhase('editor');
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  // Back handler from editor
  const handleBack = () => {
    if (direct || templateIdFromUrl) {
      navigate(config.backTo);
    } else {
      setPhase('welcome');
    }
  };

  // Editor phase
  if (phase === 'editor') {
    return (
      <UnifiedSectionEditor
        sectionName={config.name}
        sectionKey={sectionKey}
        suggestions={config.suggestions}
        backTo={config.backTo}
        initialFiles={initialFiles}
        templateId={templateId}
        initialMessage={initialMessage}
        employee={employee}
        skillHint={sectionKey}
        onBack={handleBack}
      />
    );
  }

  // Welcome phase
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'contracts-ndas', label: 'Contracts & NDAs' },
    { id: 'hr-forms', label: 'HR Forms' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'pitch-decks', label: 'Pitch Decks' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start min-h-screen bg-light-bg selection:bg-brand-accent-100 selection:text-brand-accent-900">
      <div className="w-full max-w-6xl flex flex-col items-center px-6 py-12 md:py-20">
        {/* Navigation & Branding */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-brand-accent-900/10 p-2 border border-brand-accent-100">
              <img src="/genX.png" alt="GendocX" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-tighter text-light-text leading-none uppercase">
                {config.name} <span className="text-brand-accent-600">EDITOR</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-brand-accent-600/50 tracking-[0.3em] uppercase leading-none">
                  Enterprise AI
                </span>
                <div className="w-1 h-1 rounded-full bg-brand-accent-200" />
                <button
                  onClick={() => navigate(config.backTo)}
                  className="text-[10px] font-black text-light-text-secondary hover:text-brand-accent-600 transition-colors uppercase tracking-[0.2em]"
                >
                  Return to Module
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPhase('editor')}
              className="px-6 py-3 bg-white border border-brand-accent-100 text-brand-accent-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-accent-50 hover:border-brand-accent-200 transition-all shadow-sm active:scale-95"
            >
              Skip to Workspace
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-600/5 border border-brand-accent-600/10 text-brand-accent-600 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Next-Gen Automation
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-light-text mb-6 tracking-tighter leading-tight">
            What are we <span className="text-brand-accent-600">building</span> today?
          </h2>
          <p className="text-lg text-light-text-secondary font-medium leading-relaxed opacity-80">
            Automate high-stakes documentation with domain-aware AI. Select your format, provide a brief, or use a certified template.
          </p>
        </div>

        {/* Doc type cards - Refined Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl mb-12">
          {DOC_TYPES.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDocType(selectedDocType === doc.id ? null : doc.id)}
              className={`group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${
                selectedDocType === doc.id
                  ? 'border-brand-accent-600 bg-white shadow-2xl shadow-brand-accent-600/10 -translate-y-1'
                  : 'border-transparent bg-white/50 hover:bg-white hover:border-brand-accent-200 hover:shadow-xl'
              }`}
            >
              {selectedDocType === doc.id && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-brand-accent-600 flex items-center justify-center rounded-bl-3xl">
                  <RefreshCw className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${
                selectedDocType === doc.id ? 'bg-brand-accent-50' : 'bg-light-bg group-hover:bg-brand-accent-50/50'
              }`}>
                <doc.icon className={`w-10 h-10 ${selectedDocType === doc.id ? 'text-brand-accent-600' : 'text-light-text-secondary/60'}`} />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${
                selectedDocType === doc.id ? 'text-brand-accent-600' : 'text-light-text-secondary'
              }`}>{doc.label}</span>
            </button>
          ))}
        </div>

        {/* Integrated Prompt Experience */}
        <div className="w-full max-w-3xl mb-16 relative">
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="bg-white border-2 border-brand-accent-100 rounded-[2.5rem] p-3 shadow-2xl shadow-brand-accent-900/5 focus-within:border-brand-accent-400 focus-within:shadow-brand-accent-900/10 transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="pl-5 text-brand-accent-400">
                  <FileText className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe your ${selectedDocType || 'document'}... (e.g. "Draft a ${config.name} report for Q1")`}
                  className="flex-1 py-6 bg-transparent border-none outline-none text-lg text-light-text placeholder-light-text-muted/50 font-bold"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={(!prompt.trim() && !selectedTemplate) || isSubmitting}
                  className="mr-2 p-5 bg-brand-accent-600 text-white rounded-[1.8rem] hover:bg-brand-accent-700 disabled:opacity-30 transition-all active:scale-95 shadow-xl shadow-brand-accent-600/20 group"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-brand-accent-600/5 blur-[100px] -z-10 rounded-full scale-110" />
        </div>

        {/* Templates Section */}
        {selectedDocType && (
          <div className="w-full max-w-5xl border-t border-brand-accent-100 pt-16 overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h3 className="text-xl font-black text-light-text tracking-tight uppercase">
                  Professional <span className="text-brand-accent-600">Templates</span>
                </h3>
                <p className="text-xs text-light-text-secondary font-bold mt-1 uppercase tracking-widest opacity-60">
                  Industry-standard structures for {selectedDocType}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                      category === c.id
                        ? 'bg-brand-accent-600 text-white shadow-lg shadow-brand-accent-600/20'
                        : 'bg-white text-light-text-secondary border border-brand-accent-100 hover:border-brand-accent-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-brand-accent-100 border-t-brand-accent-600 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-brand-accent-600 uppercase tracking-widest">Indexing Templates</span>
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    isSelected={selectedTemplate?.id === t.id}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-brand-accent-100">
                <p className="text-sm font-bold text-light-text-secondary/60 uppercase tracking-widest">No templates found in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        <div className="w-full max-w-5xl mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-brand-accent-100" />
            <p className="text-[10px] font-black text-brand-accent-500 uppercase tracking-[0.4em] opacity-80 whitespace-nowrap">
              Operational Suggestions
            </p>
            <div className="h-[1px] flex-1 bg-brand-accent-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.suggestions.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(text)}
                className="group flex items-start gap-4 p-5 bg-white border border-brand-accent-100 rounded-[1.8rem] hover:border-brand-accent-400 hover:shadow-xl transition-all text-left relative overflow-hidden"
              >
                <div className="p-2 rounded-xl bg-brand-accent-50 text-brand-accent-600 group-hover:bg-brand-accent-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-light-text-secondary group-hover:text-light-text transition-colors leading-snug">
                  {text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Brand */}
        <div className="mt-32 opacity-20 grayscale flex flex-col items-center gap-4">
          <img src="/genX.png" alt="GendocX" className="h-12 object-contain" />
          <p className="text-[8px] font-black tracking-[0.5em] uppercase">Enterprise Document Intelligence</p>
        </div>
      </div>
    </div>
  );
}
