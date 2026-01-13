import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * ToolCard - Reusable card component for displaying tools on the landing page
 * @param {string} title - Tool name
 * @param {string} description - Brief description of the tool
 * @param {React.Component} icon - Lucide icon component
 * @param {string} route - Navigation route when clicked
 * @param {string} category - Category label (optional)
 * @param {boolean} isExternal - Whether this opens a dedicated page vs chatbot
 * @param {boolean} featured - Whether to show featured styling (larger, gradient)
 */
const ToolCard = ({ 
  title, 
  description, 
  icon: Icon, 
  route, 
  category,
  isExternal = false,
  featured = false,
  delay = 0 
}) => {
  if (featured) {
    // Featured card - larger with gradient background
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="col-span-full"
      >
        <Link to={route} className="group block">
          <div className="relative bg-gradient-to-br from-brand-accent-500 to-brand-accent-700 
                          rounded-2xl p-8 overflow-hidden shadow-lg hover:shadow-xl 
                          transition-all duration-300 transform hover:scale-[1.01]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            <div className="relative flex items-center gap-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center
                              group-hover:bg-white/30 transition-colors duration-300">
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {title}
                </h3>
                
                {/* Description */}
                <p className="text-white/90 text-base leading-relaxed max-w-xl">
                  {description}
                </p>
              </div>
              
              {/* Action indicator */}
              <div className="flex items-center gap-2 text-white bg-white/20 px-5 py-2.5 rounded-full
                              group-hover:bg-white/30 transition-colors">
                <span className="font-medium">Start Chat</span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Standard card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        to={route}
        className="group block h-full"
      >
        <div className="relative h-full bg-white border border-light-border rounded-xl p-5 
                        hover:border-brand-accent-300 hover:shadow-medium transition-all duration-300
                        overflow-hidden">
          {/* Accent gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent-50/0 to-brand-accent-100/0 
                          group-hover:from-brand-accent-50/50 group-hover:to-brand-accent-100/30 
                          transition-all duration-300 pointer-events-none" />
          
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent-400 to-brand-accent-600 
                          transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          
          <div className="relative">
            {/* Icon */}
            <div className="w-12 h-12 bg-brand-accent-50 rounded-lg flex items-center justify-center mb-4
                            group-hover:bg-brand-accent-100 transition-colors duration-300">
              <Icon className="w-6 h-6 text-brand-accent-600" />
            </div>
            
            {/* Category badge */}
            {category && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider
                               text-brand-accent-600 bg-brand-accent-50 rounded-full mb-2">
                {category}
              </span>
            )}
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-light-text mb-2 group-hover:text-brand-accent-700 
                           transition-colors duration-200">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-light-text-secondary leading-relaxed mb-4">
              {description}
            </p>
            
            {/* Action indicator */}
            <div className="flex items-center gap-1 text-brand-accent-500 text-sm font-medium
                            group-hover:text-brand-accent-600 transition-colors">
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
