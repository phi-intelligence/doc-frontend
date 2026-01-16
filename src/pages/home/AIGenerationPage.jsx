import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Image, Video, Quote, FileText, Type, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AIGenerationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const cards = [
    {
      id: 'image-generation',
      title: 'Image Generation',
      description: 'Create stunning images from text descriptions using advanced AI models.',
      icon: Image,
      gradient: 'from-purple-500 to-pink-500',
      route: '/home/image-generation',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'video-generation',
      title: 'Video Generation',
      description: 'Generate videos from text prompts or images with AI-powered video creation.',
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500',
      route: '/chat', // Can be updated to a specific route later
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'quote-generation',
      title: 'Quote Generation',
      description: 'Create professional quotes and pricing documents automatically.',
      icon: Quote,
      gradient: 'from-emerald-500 to-teal-500',
      route: '/home/quote-generation',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'content-generation',
      title: 'Content Generation',
      description: 'Generate blog posts, articles, and marketing content with AI assistance.',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-500',
      route: '/home/content-generation',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'text-image-generation',
      title: 'Text Image Generation',
      description: 'Create images with text overlays, typography designs, and text-based graphics.',
      icon: Type,
      gradient: 'from-indigo-500 to-purple-500',
      route: '/home/text-image-generation',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home/design-studio')}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              AI Generation
            </h1>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={card.route}
                  className="group block h-full"
                >
                  <div className={`relative h-full rounded-xl border-2 transition-all duration-300 overflow-hidden
                                  ${isDark 
                                    ? 'bg-dark-surface border-dark-border hover:border-brand-accent-500/50 hover:shadow-lg hover:shadow-brand-accent-500/10' 
                                    : 'bg-white border-light-border hover:border-brand-accent-500 hover:shadow-lg'}`}>
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 
                                      bg-gradient-to-br ${card.color}
                                      group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isDark 
                        ? 'text-dark-text group-hover:text-brand-accent-400' 
                        : 'text-light-text group-hover:text-brand-accent-600'}`}>
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                        {card.description}
                      </p>

                      {/* Action indicator */}
                      <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark
                        ? 'text-brand-accent-400 group-hover:text-brand-accent-300'
                        : 'text-brand-accent-600 group-hover:text-brand-accent-700'}`}>
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 
                                    group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIGenerationPage;

