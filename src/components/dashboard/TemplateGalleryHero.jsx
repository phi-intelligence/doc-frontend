import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FileSpreadsheet, Presentation, Plus, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, Loader2 } from 'lucide-react';
import { getTemplateSamples, useTemplate } from '../../api/templates';
import { getFileUrl, getPreviewUrl } from '../../api/files';

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';

/**
 * GendocX Template Gallery Hero - Google Docs layout with GendocX brand theme.
 * Shows role-specific templates with thumbnails in a horizontal scrollable row.
 * Click templates to open them in the editor.
 *
 * @param {string} module - 'hr' | 'finance' | 'legal' | 'marketing'
 * @param {string} [title] - Section title
 * @param {string} editorPath - Path to editor (e.g., '/hr/editor')
 * @param {number} [limit] - Max templates to fetch (default 10)
 */
export default function TemplateGalleryHero({
  module,
  title = 'Start a new document',
  editorPath,
  limit = 10
}) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTemplateSamples(module, limit)
      .then((data) => {
        if (!cancelled) setTemplates(data.templates || []);
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [module, limit]);

  // Check scroll state
  useEffect(() => {
    const checkScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [templates, loading]);

  const [loadingTemplate, setLoadingTemplate] = useState(null);

  const handleTemplateClick = async (template) => {
    try {
      setLoadingTemplate(template.id);
      
      // Use the template to create a file in workspace
      const result = await useTemplate(template.id, template.file_type);
      
      if (result.file) {
        // Format the file object for the editor
        const fileObj = {
          filename: result.file,
          type: template.file_type?.toUpperCase() || result.file.split('.').pop().toUpperCase(),
          url: getFileUrl(result.file),
          previewUrl: getPreviewUrl(result.file),
          isOutput: false,
          isTemplate: true,
          templateName: template.name,
          uploadedAt: new Date().toISOString()
        };
        
        // Navigate to editor with the file pre-loaded
        navigate(editorPath, {
          state: {
            initialFiles: [fileObj],
            templateName: template.name,
            direct: true,
          }
        });
      }
    } catch (error) {
      console.error('Failed to use template:', error);
      // Fallback to old behavior
      navigate(`${editorPath}?direct=1&templateId=${encodeURIComponent(template.id)}`);
    } finally {
      setLoadingTemplate(null);
    }
  };

  const handleBlankDocument = () => {
    navigate(`${editorPath}?direct=1`);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 160; // card width + gap
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'docx':
      case 'doc':
        return <FileText className="w-10 h-10 text-brand-accent-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-10 h-10 text-green-600" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="w-10 h-10 text-orange-500" />;
      default:
        return <FileText className="w-10 h-10 text-brand-accent-400" />;
    }
  };

  const getCategoryLabel = (template) => {
    if (template.category) {
      // Format category: "hr-forms" -> "HR Forms"
      return template.category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // Fallback to file type
    return template.file_type?.toUpperCase() || 'Document';
  };

  const baseUrl = getBaseUrl();

  return (
    <div className="bg-brand-accent-50/40 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-light-text">{title}</h2>
        
        <div className="flex items-center gap-3">
          {/* Template Gallery Link */}
          <button 
            className="text-sm text-brand-accent-600 hover:text-brand-accent-700 font-medium flex items-center gap-1.5 transition-colors"
            onClick={() => navigate(`${editorPath}?direct=1&showGallery=1`)}
          >
            <LayoutGrid className="w-4 h-4" />
            Template gallery
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Scroll Arrows */}
          <div className="flex items-center gap-0.5 ml-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-full hover:bg-brand-accent-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-brand-accent-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-full hover:bg-brand-accent-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-brand-accent-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Blank Document Card */}
        <button
          onClick={handleBlankDocument}
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
        {loading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] animate-pulse">
              <div className="aspect-[4/5] rounded-lg bg-brand-accent-100" />
              <div className="mt-2.5">
                <div className="h-4 bg-brand-accent-100 rounded w-3/4 mb-1" />
                <div className="h-3 bg-brand-accent-50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              disabled={loadingTemplate === template.id}
              className="flex-shrink-0 w-[140px] group text-left focus:outline-none focus:ring-2 focus:ring-brand-accent-500/30 rounded-lg disabled:opacity-70"
            >
              <div className="aspect-[4/5] rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-brand-accent-400 hover:shadow-lg hover:shadow-brand-accent-100 transition-all relative">
                {template.thumbnail_url ? (
                  <img
                    src={baseUrl ? `${baseUrl}${template.thumbnail_url}` : template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-brand-accent-50">
                    {getFileIcon(template.file_type)}
                  </div>
                )}
                {/* Loading overlay */}
                {loadingTemplate === template.id && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-brand-accent-600 animate-spin" />
                  </div>
                )}
              </div>
              <div className="mt-2.5">
                <p className="text-sm font-medium text-light-text group-hover:text-brand-accent-700 truncate transition-colors">
                  {template.name}
                </p>
                <p className="text-xs text-brand-accent-600 truncate">
                  {getCategoryLabel(template)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
