import React from 'react';
import { ExternalLink, FileText, Info, Users, Phone, Briefcase, Tag, Globe, Image, BookOpen, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Content type icons and colors - enhanced with more types
const contentTypeConfig = {
  main: { icon: Globe, color: 'bg-blue-500', textColor: 'text-white', label: 'Homepage' },
  about: { icon: Info, color: 'bg-purple-500', textColor: 'text-white', label: 'About' },
  contact: { icon: Phone, color: 'bg-green-500', textColor: 'text-white', label: 'Contact' },
  team: { icon: Users, color: 'bg-orange-500', textColor: 'text-white', label: 'Team' },
  services: { icon: Briefcase, color: 'bg-cyan-500', textColor: 'text-white', label: 'Services' },
  careers: { icon: Users, color: 'bg-pink-500', textColor: 'text-white', label: 'Careers' },
  blog: { icon: BookOpen, color: 'bg-amber-500', textColor: 'text-white', label: 'Blog' },
  products: { icon: ShoppingBag, color: 'bg-indigo-500', textColor: 'text-white', label: 'Products' },
  gallery: { icon: Image, color: 'bg-rose-500', textColor: 'text-white', label: 'Gallery' },
  default: { icon: FileText, color: 'bg-gray-500', textColor: 'text-white', label: 'Page' },
};

/**
 * Gallery-style content card for scraped pages
 */
const ContentCard = ({ item, index }) => {
  const metadata = item.metadata || {};
  const contentType = metadata.content_type || 'default';
  const config = contentTypeConfig[contentType] || contentTypeConfig.default;
  const Icon = config.icon;
  const hasImage = metadata.image_url;

  // Truncate content for display
  const snippet = metadata.full_snippet || item.description || '';
  const truncatedSnippet = snippet.length > 150 ? snippet.slice(0, 150) + '...' : snippet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-2xl border border-light-border overflow-hidden group cursor-pointer transition-all duration-300"
    >
      {/* Image Section */}
      {hasImage ? (
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <img
            src={metadata.image_url}
            alt={item.title || 'Page preview'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-brand-accent-100', 'to-brand-accent-50');
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Content type badge - positioned on image */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.color} shadow-lg`}>
            <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
            <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
          </div>
        </div>
      ) : (
        /* No image - show colored header */
        <div className={`h-20 ${config.color} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
            <div className="absolute -left-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Icon className={`w-6 h-6 ${config.textColor}`} />
            <span className={`text-sm font-bold ${config.textColor}`}>{config.label}</span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h4 
          className="font-bold text-light-text text-sm leading-tight mb-2 line-clamp-2 group-hover:text-brand-accent-600 transition-colors"
          title={item.title}
        >
          {item.title || 'Untitled Page'}
        </h4>

        {/* URL */}
        {metadata.url && (
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-light-text-secondary hover:text-brand-accent-600 mb-2 max-w-full"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {(() => {
                try {
                  return new URL(metadata.url).pathname || '/';
                } catch {
                  return metadata.url;
                }
              })()}
            </span>
          </a>
        )}

        {/* Content snippet */}
        {truncatedSnippet && (
          <p className="text-xs text-light-text-secondary leading-relaxed line-clamp-3">
            {truncatedSnippet}
          </p>
        )}
      </div>
    </motion.div>
  );
};


/**
 * Gallery-style scraped content feed with 2-column grid
 */
const ScrapedContentFeed = ({ items = [] }) => {
  // Filter for content_card events
  const contentCards = items.filter(item => item.type === 'content_card');

  if (contentCards.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-accent-100 flex items-center justify-center">
            <Globe className="w-4 h-4 text-brand-accent-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-light-text">
              Scraped Content
            </h3>
            <p className="text-xs text-light-text-secondary">
              {contentCards.length} page{contentCards.length !== 1 ? 's' : ''} discovered
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2 pb-2">
        <AnimatePresence mode="popLayout">
          {contentCards.map((item, index) => (
            <ContentCard key={item.id || index} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Stats footer */}
      {contentCards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-light-border flex items-center justify-center gap-6 text-xs text-light-text-secondary"
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{contentCards.length} pages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" />
            <span>{contentCards.filter(c => c.metadata?.image_url).length} with images</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScrapedContentFeed;
