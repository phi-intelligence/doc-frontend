import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';

/**
 * ToolCard - Enhanced card component for displaying tools on the landing page
 * @param {string} title - Tool name
 * @param {string} description - Brief description of the tool
 * @param {React.Component} icon - Lucide icon component
 * @param {string} route - Navigation route when clicked
 * @param {string} gradient - Category gradient (e.g., 'from-blue-50 to-blue-100')
 * @param {string} iconColor - Icon color (e.g., 'text-blue-600')
 * @param {Array<string>} tags - Feature tags
 * @param {Array<string>} examples - Usage examples (featured cards only)
 * @param {boolean} isExternal - Whether this opens a dedicated page vs chatbot
 * @param {boolean} featured - Whether to show featured styling
 */
const ToolCard = ({
  title,
  description,
  icon: Icon,
  route,
  gradient,
  iconColor,
  tags,
  examples,
  isExternal = false,
  featured = false,
  delay = 0
}) => {
  if (featured) {
    // Featured card - Unified Assistant with examples
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="col-span-full"
      >
        <Link to={route} className="group block">
          <div className={`relative bg-gradient-to-br ${gradient || 'from-brand-accent-500 to-brand-accent-700'} 
                          rounded-2xl p-8 overflow-hidden shadow-lg hover:shadow-xl 
                          transition-all duration-300 transform hover:scale-[1.01]`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative">
              <div className="flex items-start gap-6 mb-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center
                                group-hover:bg-white/30 transition-colors duration-300 flex-shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 text-base leading-relaxed max-w-2xl">
                    {description}
                  </p>
                </div>

                {/* Action indicator */}
                <div className="flex items-center gap-2 text-white bg-white/20 px-5 py-2.5 rounded-full
                                group-hover:bg-white/30 transition-colors flex-shrink-0">
                  <span className="font-medium">Start Chat</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Examples */}
              {examples && examples.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
                  <p className="text-xs font-medium text-white/80 mb-3">Example Requests:</p>
                  <div className="space-y-2">
                    {examples.map((example, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-white/70 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/90 italic">"{example}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Standard card with category-specific styling
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        to={route}
        className="group block h-full"
      >
        <div className="relative h-full bg-white border border-light-border rounded-xl p-5 
                        hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Gradient background (subtle) */}
          {gradient && (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 
                            group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`} />
          )}

          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r 
                          ${gradient ? gradient.replace('from-', 'from-').replace('to-', 'to-') : 'from-brand-accent-400 to-brand-accent-600'} 
                          transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />

          <div className="relative">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4
                            bg-gradient-to-br ${gradient || 'from-gray-50 to-gray-100'}
                            group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${iconColor || 'text-brand-accent-600'}`} />
            </div>

            {/* Title */}
            <h3 className={`text-lg font-semibold text-light-text mb-2 
                           group-hover:${iconColor?.replace('text-', 'text-') || 'text-brand-accent-700'} 
                           transition-colors duration-200`}>
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-light-text-secondary leading-relaxed mb-4">
              {description}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white/80 border border-light-border rounded-md 
                               text-xs font-medium text-light-text-secondary
                               group-hover:border-current group-hover:bg-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action indicator */}
            <div className={`flex items-center gap-1 text-sm font-medium
                            ${iconColor?.replace('600', '500') || 'text-brand-accent-500'}
                            group-hover:${iconColor?.replace('600', '700') || 'text-brand-accent-700'} 
                            transition-colors`}>
              <span>{isExternal ? 'Open Tool' : 'Start Chat'}</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
