import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  FileText,
  Presentation,
  FileSpreadsheet,
  FileImage,
  Sparkles,
  RefreshCw,
  Users,
  BarChart3,
  Scale,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
import TemplateCard from '../../components/cards/TemplateCard';
import { useSession } from '../../hooks/useSession';
import UnifiedSectionEditor from './shared/UnifiedSectionEditor';
import apiClient from '../../api/index';

const DOC_TYPES = [
  { id: 'docx', label: 'Word / Docs', icon: FileText, fileType: 'docx' },
  { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, fileType: 'xlsx' },
  { id: 'pptx', label: 'PowerPoint', icon: Presentation, fileType: 'pptx' },
  { id: 'pdf', label: 'PDF / Report', icon: FileImage, fileType: 'pdf' },
];

const DOC_CHAT_SUGGESTIONS = [
  'Draft a freelance service agreement for a web development project.',
  'Create a pitch deck structure for a new AI startup.',
  'Build a budget spreadsheet for a marketing campaign.',
  'I need to extract data from an invoice image.',
];

const departmentLinks = [
  { to: '/app/hr/editor?direct=1', label: 'HR Editor', icon: Users, description: 'HR documents and contracts' },
  { to: '/app/finance/editor?direct=1', label: 'Finance Editor', icon: BarChart3, description: 'Reports and spreadsheets' },
  { to: '/app/legal/editor?direct=1', label: 'Legal Editor', icon: Scale, description: 'Legal and compliance docs' },
  { to: '/app/marketing/editor?direct=1', label: 'Marketing Editor', icon: Megaphone, description: 'Campaigns and content' },
];

/**
 * ChatWorkspacePage - Document Chat: prompt page first, then 3-pane editor.
 * Phase 1: Doc types, prompt bar, templates, suggestions.
 * Phase 2: UnifiedSectionEditor (sectionKey=general) with initialMessage sent.
 */
export default function ChatWorkspacePage() {
  const { createNewSession } = useSession();
  const [phase, setPhase] = useState('prompt');
  const [initialMessage, setInitialMessage] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [category, setCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDocType || !['docx', 'xlsx', 'pptx', 'pdf'].includes(selectedDocType)) {
      setTemplates([]);
      return;
    }
    setLoadingTemplates(true);
    const categoryParam = category === 'all' ? '' : `&category=${category}`;
    apiClient
      .get(`/templates?file_type=${selectedDocType}${categoryParam}`)
      .then((res) => setTemplates(res.data?.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, [selectedDocType, category]);

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

  if (phase === 'editor') {
    return (
      <UnifiedSectionEditor
        sectionName="Document Chat"
        sectionKey="general"
        suggestions={DOC_CHAT_SUGGESTIONS}
        backTo="/app/chat"
        initialFiles={[]}
        templateId={templateId}
        initialMessage={initialMessage}
      />
    );
  }

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'contracts-ndas', label: 'Contracts & NDAs' },
    { id: 'hr-forms', label: 'HR Forms' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'pitch-decks', label: 'Pitch Decks' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 overflow-y-auto bg-light-bg">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light-text mb-2 tracking-tight">
            Document Chat
          </h1>
          <p className="text-base text-light-text-secondary max-w-xl mx-auto">
            Start from a prompt, then refine in the editor. Choose a document type, add a brief, or pick a template.
          </p>
        </div>

        {/* Doc type cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
          {DOC_TYPES.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDocType(selectedDocType === doc.id ? null : doc.id)}
              className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                selectedDocType === doc.id
                  ? 'border-brand-accent-500 bg-brand-accent-50 shadow-lg'
                  : 'border-light-border bg-white hover:border-brand-accent-200'
              }`}
            >
              <doc.icon className="w-10 h-10 text-brand-accent-600 mb-3" />
              <span className="text-sm font-bold text-light-text">{doc.label}</span>
            </button>
          ))}
        </div>

        {/* Prompt bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mb-8">
          <div className="flex flex-col gap-3 bg-light-sidebar border border-brand-accent-200 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create or paste a brief..."
                className="flex-1 px-5 py-4 bg-transparent border-none outline-none text-base text-light-text placeholder-light-text-muted font-medium rounded-xl"
                autoFocus
              />
              <button
                type="submit"
                disabled={(!prompt.trim() && !selectedTemplate) || isSubmitting}
                className="p-3.5 bg-brand-accent-600 text-white rounded-2xl hover:bg-brand-accent-700 disabled:opacity-30 transition-all active:scale-95 shadow-lg"
              >
                {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>

        {/* Templates (when doc type selected) */}
        {selectedDocType && (
          <div className="w-full max-w-4xl border-t border-light-border pt-8">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap ${
                    category === c.id ? 'bg-brand-accent-500 text-white' : 'bg-light-sidebar text-light-text-secondary hover:bg-brand-accent-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-accent-500" />
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-light-text-secondary text-center py-8">No templates in this category.</p>
            )}
          </div>
        )}

        {/* Suggestions */}
        <div className="w-full max-w-4xl mt-10">
          <p className="text-[10px] font-bold text-brand-accent-500 uppercase mb-4 text-center tracking-widest opacity-70">
            Suggestions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_CHAT_SUGGESTIONS.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(text)}
                className="flex items-start gap-3 p-4 bg-light-sidebar border border-brand-accent-100 rounded-2xl hover:border-brand-accent-300 text-left transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-accent-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-light-text">{text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Jump to workspace editors */}
        <div className="w-full max-w-4xl mt-16 pt-12 border-t border-light-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-accent-50">
              <Users className="w-6 h-6 text-brand-accent-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-light-text">Jump to workspace editors</h2>
              <p className="text-sm text-light-text-secondary">
                Open department-specific 3-pane editors directly
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group block p-5 bg-white border border-light-border rounded-2xl hover:shadow-lg hover:border-brand-accent-200 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand-accent-50 group-hover:bg-brand-accent-100 transition-colors">
                      <Icon className="w-5 h-5 text-brand-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-light-text mb-1">{item.label}</h3>
                      <p className="text-xs text-light-text-secondary mb-2">{item.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent-600">
                        Open <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
