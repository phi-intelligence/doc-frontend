import React, { useState } from 'react';
import { 
  Building2, Globe, Mail, Phone, MapPin, Edit2, Check, X, 
  ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, ChevronRight,
  FileText, Info, Users, Briefcase, BookOpen, ExternalLink, Tag,
  Hash, Link2, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Social media icons mapping
const socialIcons = {
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

// Content type configuration
const contentTypeConfig = {
  main: { icon: Globe, color: 'bg-blue-500', label: 'Homepage' },
  about: { icon: Info, color: 'bg-purple-500', label: 'About' },
  contact: { icon: Phone, color: 'bg-green-500', label: 'Contact' },
  team: { icon: Users, color: 'bg-orange-500', label: 'Team' },
  services: { icon: Briefcase, color: 'bg-cyan-500', label: 'Services' },
  careers: { icon: Users, color: 'bg-pink-500', label: 'Careers' },
  blog: { icon: BookOpen, color: 'bg-amber-500', label: 'Blog' },
  default: { icon: FileText, color: 'bg-gray-500', label: 'Page' },
};

/**
 * Editable text field component
 */
const EditableField = ({ value, onChange, placeholder, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="flex-1 px-3 py-2 border border-brand-accent-500 rounded-xl focus:outline-none text-sm resize-none"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-brand-accent-500 rounded-xl focus:outline-none"
            autoFocus
          />
        )}
        <button
          onClick={handleSave}
          className="p-2 rounded-lg bg-brand-accent-500 text-white hover:bg-brand-accent-600"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg bg-light-surface text-light-text-secondary hover:bg-light-border"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1">
        {value ? (
          multiline ? (
            <p className="text-light-text leading-relaxed">{value}</p>
          ) : (
            <span className="text-light-text">{value}</span>
          )
        ) : (
          <span className="text-light-text-secondary/50 italic">{placeholder}</span>
        )}
      </div>
      <button
        onClick={() => {
          setEditValue(value || '');
          setIsEditing(true);
        }}
        className="p-1.5 rounded-lg text-light-text-secondary opacity-0 group-hover:opacity-100 hover:bg-light-surface transition-all"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Editable list field component for emails, phones, addresses
 */
const EditableListField = ({ label, icon: Icon, items = [], onChange, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(items.length > 0 ? items : ['']);

  const handleSave = () => {
    onChange(editItems.filter(item => item.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditItems(items.length > 0 ? items : ['']);
    setIsEditing(false);
  };

  const handleAdd = () => {
    setEditItems([...editItems, '']);
  };

  const handleRemove = (index) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleChange = (index, value) => {
    setEditItems(editItems.map((item, i) => i === index ? value : item));
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-bold text-light-text-secondary">{label}</label>
        {editItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="w-4 h-4 text-light-text-secondary/50" />
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-white border border-light-border rounded-xl text-sm focus:outline-none focus:border-brand-accent-500"
              />
            </div>
            {editItems.length > 1 && (
              <button
                onClick={() => handleRemove(index)}
                className="p-2 rounded-lg text-light-text-secondary hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 text-sm text-brand-accent-600 hover:text-brand-accent-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <div className="flex-1" />
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-sm text-light-text-secondary hover:bg-light-surface"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-sm bg-brand-accent-500 text-white hover:bg-brand-accent-600"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-light-text-secondary">{label}</label>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded text-light-text-secondary opacity-0 group-hover:opacity-100 hover:bg-light-surface"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-light-text">
              <Icon className="w-4 h-4 text-light-text-secondary" />
              {item}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 text-sm text-light-text-secondary/50 hover:text-brand-accent-600"
        >
          <Plus className="w-4 h-4" />
          Add {label.toLowerCase()}
        </button>
      )}
    </div>
  );
};

/**
 * Stats bar showing extracted data counts
 */
const StatsBar = ({ profile, pages = [] }) => {
  const emailCount = profile?.contact_info?.emails?.length || 0;
  const phoneCount = profile?.contact_info?.phones?.length || 0;
  const socialCount = profile?.social_links ? Object.keys(profile.social_links).length : 0;
  const pageCount = pages?.length || profile?.scraped_pages || 0;

  const stats = [
    { label: 'Pages Scraped', value: pageCount, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { label: 'Emails Found', value: emailCount, icon: Mail, color: 'text-green-600 bg-green-100' },
    { label: 'Phone Numbers', value: phoneCount, icon: Phone, color: 'text-orange-600 bg-orange-100' },
    { label: 'Social Links', value: socialCount, icon: Link2, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl border border-light-border p-3 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-light-text">{stat.value}</div>
            <div className="text-xs text-light-text-secondary">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Scraped page card in the gallery
 */
const ScrapedPageCard = ({ page, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentType = page.content_type || 'default';
  const config = contentTypeConfig[contentType] || contentTypeConfig.default;
  const Icon = config.icon;

  // Truncate content for preview
  const contentPreview = page.content?.slice(0, 200) || '';
  const hasMoreContent = page.content?.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-light-border overflow-hidden hover:border-brand-accent-300 transition-all"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-light-surface text-light-text-secondary">
              {config.label}
            </span>
          </div>
          <h4 className="font-bold text-light-text text-sm truncate">
            {page.title || 'Untitled Page'}
          </h4>
          {page.url && (
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">{new URL(page.url).pathname}</span>
            </a>
          )}
        </div>
        <div className="flex-shrink-0 text-light-text-secondary">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-light-border pt-3">
              <p className="text-sm text-light-text-secondary leading-relaxed">
                {contentPreview}
                {hasMoreContent && '...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Scraped Pages Gallery Section
 */
const ScrapedPagesGallery = ({ pages = [] }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!pages || pages.length === 0) return null;

  const displayedPages = showAll ? pages : pages.slice(0, 4);
  const hasMore = pages.length > 4;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-light-text-secondary uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Scraped Pages ({pages.length})
        </h4>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700"
          >
            {showAll ? 'Show Less' : `Show All (${pages.length})`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedPages.map((page, index) => (
          <ScrapedPageCard key={page.url || index} page={page} index={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Services section extracted from services pages
 */
const ServicesSection = ({ pages = [] }) => {
  const servicesPages = pages?.filter(p => p.content_type === 'services') || [];
  
  if (servicesPages.length === 0) return null;

  // Extract service keywords from content
  const serviceContent = servicesPages.map(p => p.content).join(' ');
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-light-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
        <Briefcase className="w-4 h-4" />
        Services Detected
      </h4>
      <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
        <p className="text-sm text-cyan-800 leading-relaxed">
          {serviceContent.slice(0, 300)}
          {serviceContent.length > 300 && '...'}
        </p>
      </div>
    </div>
  );
};

/**
 * Profile preview component showing extracted/entered company data
 */
const ProfilePreview = ({ profile, pages = [], onEdit, onContinue, onBack }) => {
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || '');

  const handleSaveName = () => {
    if (onEdit && editedName.trim()) {
      onEdit({ ...profile, name: editedName.trim() });
    }
    setEditingName(false);
  };

  const handleUpdateField = (field, value) => {
    if (onEdit) {
      onEdit({ ...profile, [field]: value });
    }
  };

  const handleUpdateContactInfo = (field, value) => {
    if (onEdit) {
      onEdit({
        ...profile,
        contact_info: {
          ...profile.contact_info,
          [field]: value
        }
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-light-text-secondary">No profile data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4"
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-white border border-light-border text-light-text-secondary hover:text-brand-accent-600 hover:border-brand-accent-200 hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-black text-light-text tracking-tight">
              Entity Review
            </h2>
            <p className="text-light-text-secondary font-medium mt-1">
              Verify extracted intelligence before finalizing your workspace.
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Analysis Complete</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-8">
        <StatsBar profile={profile} pages={pages} />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Core Info */}
        <div className="xl:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-[32px] border border-light-border p-8 shadow-sm">
            {/* Logo and Name */}
            <div className="flex flex-col sm:flex-row items-start gap-8 mb-8 pb-8 border-b border-light-border/50">
              {/* Logo */}
              <div className="flex-shrink-0 w-32 h-32 rounded-[24px] bg-light-surface flex items-center justify-center overflow-hidden border border-light-border shadow-inner p-4">
                {profile.logo_url || profile.logo_path || profile.logo_base64 ? (
                  <img
                    src={profile.logo_url || profile.logo_path || profile.logo_base64}
                    alt={profile.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-light-text-secondary/30" />
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0 pt-2">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-4 py-3 text-2xl font-black bg-white border-2 border-brand-accent-500 rounded-xl focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-3 rounded-xl bg-brand-accent-500 text-white hover:bg-brand-accent-600 shadow-lg shadow-brand-accent-500/20"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditedName(profile.name || '');
                        setEditingName(false);
                      }}
                      className="p-3 rounded-xl bg-light-surface text-light-text-secondary hover:bg-light-border"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group mb-2">
                    <h3 className="text-3xl font-black text-light-text tracking-tight truncate">
                      {profile.name || 'Unknown Company'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditedName(profile.name || '');
                        setEditingName(true);
                      }}
                      className="p-2 rounded-lg text-light-text-secondary opacity-0 group-hover:opacity-100 hover:bg-light-surface hover:text-brand-accent-600 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {profile.tagline && (
                  <p className="text-lg text-light-text-secondary font-medium mb-3 italic">"{profile.tagline}"</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-accent-50 text-brand-accent-700 text-sm font-bold border border-brand-accent-100 hover:bg-brand-accent-100 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {profile.website}
                    </a>
                  )}
                  {profile.industry && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-light-surface text-light-text-secondary text-sm font-bold border border-light-border">
                       <Tag className="w-3.5 h-3.5" />
                       {profile.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                About Organization
              </h4>
              <div className="bg-light-surface/50 rounded-2xl p-4 border border-light-border/50">
                <EditableField
                  value={profile.description}
                  onChange={(value) => handleUpdateField('description', value)}
                  placeholder="Add a detailed description about your company..."
                  multiline
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-light-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Communication Channels
                 </h4>
                 
                 <EditableListField
                    label="Email Addresses"
                    icon={Mail}
                    items={profile.contact_info?.emails || []}
                    onChange={(items) => handleUpdateContactInfo('emails', items)}
                    placeholder="email@company.com"
                  />

                  <EditableListField
                    label="Phone Numbers"
                    icon={Phone}
                    items={profile.contact_info?.phones || []}
                    onChange={(items) => handleUpdateContactInfo('phones', items)}
                    placeholder="+1 (555) 123-4567"
                  />
              </div>
              
              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-light-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Locations
                 </h4>
                  <EditableListField
                    label="Addresses"
                    icon={MapPin}
                    items={profile.contact_info?.addresses || []}
                    onChange={(items) => handleUpdateContactInfo('addresses', items)}
                    placeholder="123 Main St, City, State"
                  />
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-light-border/50">
              <h4 className="text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Social Footprint
              </h4>
              <div className="flex flex-wrap gap-3">
                {profile.social_links && Object.entries(profile.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-light-border text-light-text font-medium hover:border-brand-accent-300 hover:text-brand-accent-600 hover:shadow-md transition-all text-sm capitalize group"
                  >
                    <span className="text-light-text-secondary group-hover:text-brand-accent-600 transition-colors">
                      {socialIcons[platform] || <Globe className="w-4 h-4" />}
                    </span>
                    {platform}
                    <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity ml-1" />
                  </a>
                ))}
                {(!profile.social_links || Object.keys(profile.social_links).length === 0) && (
                  <p className="text-light-text-secondary/50 text-sm italic px-4 py-2">No social links detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <ServicesSection pages={pages} />
        </div>

        {/* Right Column - Scraped Pages Gallery */}
        <div className="xl:col-span-1 space-y-6">
           <div className="bg-white rounded-[32px] border border-light-border p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-light-text flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-accent-600" />
                  Source Data
                </h4>
                <span className="px-2 py-1 rounded-lg bg-light-surface text-xs font-bold text-light-text-secondary border border-light-border">
                  {pages?.length || 0} Pages
                </span>
              </div>
              
              {pages && pages.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {pages.map((page, index) => (
                    <ScrapedPageCard key={page.url || index} page={page} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 rounded-2xl bg-light-surface/50 border border-dashed border-light-border">
                  <div className="w-16 h-16 rounded-full bg-light-surface flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-light-text-secondary/30" />
                  </div>
                  <p className="text-sm font-medium text-light-text-secondary">
                    No source pages available for preview.
                  </p>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8 pt-8 border-t border-light-border">
        {onBack && (
          <button
            onClick={onBack}
            className="px-8 py-4 rounded-2xl font-bold text-light-text-secondary bg-white border border-light-border hover:bg-light-surface hover:text-light-text transition-all"
          >
            Go Back
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onContinue}
          className="flex items-center gap-3 px-10 py-4 bg-brand-accent-600 text-white rounded-2xl font-black text-lg uppercase tracking-wide hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20 hover:shadow-brand-accent-600/30 hover:scale-[1.01] transition-all"
        >
          Confirm Intelligence
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProfilePreview;
