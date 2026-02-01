import React from 'react';
import { ExternalLink, FileText, Info, Users, Phone, Briefcase, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Content type icons and colors
const contentTypeConfig = {
  main: { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'Homepage' },
  about: { icon: Info, color: 'bg-purple-100 text-purple-600', label: 'About' },
  contact: { icon: Phone, color: 'bg-green-100 text-green-600', label: 'Contact' },
  team: { icon: Users, color: 'bg-orange-100 text-orange-600', label: 'Team' },
  services: { icon: Briefcase, color: 'bg-cyan-100 text-cyan-600', label: 'Services' },
  careers: { icon: Users, color: 'bg-pink-100 text-pink-600', label: 'Careers' },
  default: { icon: Tag, color: 'bg-gray-100 text-gray-600', label: 'Page' },
};

/**
 * Content card component for a single scraped page
 */
const ContentCard = ({ item, index }) => {
  const metadata = item.metadata || {};
  const contentType = metadata.content_type || 'default';
  const config = contentTypeConfig[contentType] || contentTypeConfig.default;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-light-surface rounded-2xl border border-light-border p-4 shadow-soft hover:shadow-medium transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-light-text truncate" title={item.title}>
            {item.title || 'Untitled Page'}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-light-border`}>
              {config.label}
            </span>
            {metadata.url && (
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-light-text-secondary hover:text-brand-accent-600 flex items-center gap-1 truncate max-w-[200px]"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{new URL(metadata.url).pathname || '/'}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="text-sm text-light-text-secondary leading-relaxed">
        {metadata.full_snippet || item.description || 'No content preview available'}
      </div>

      {/* Image Preview */}
      {metadata.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden bg-white border border-light-border">
          <img
            src={metadata.image_url}
            alt=""
            className="w-full h-32 object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
    </motion.div>
  );
};


/**
 * Scraped content feed showing live updates during scraping
 */
const ScrapedContentFeed = ({ items = [] }) => {
  // Filter for content_card events
  const contentCards = items.filter(item => item.type === 'content_card');

  if (contentCards.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-light-text-secondary uppercase tracking-wide mb-4">
        Scraped Content ({contentCards.length} pages)
      </h3>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {contentCards.map((item, index) => (
            <ContentCard key={item.id || index} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScrapedContentFeed;
