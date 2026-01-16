import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Sparkles, Box, Camera, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DesignStudioPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cards = [
    {
      id: 'ai-generation',
      title: 'AI Generation',
      description: 'Create stunning designs, graphics, and visual content using AI-powered generation tools.',
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-500',
      route: '/home/ai-generation',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'product-design',
      title: 'Product Design',
      description: 'Design and prototype products with advanced tools and templates for your next project.',
      icon: Box,
      gradient: 'from-blue-500 to-cyan-500',
      route: '/home/product-design',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'photography',
      title: 'Photography',
      description: 'Professional product photography tools including flat lay, ghost mannequin, and staging.',
      icon: Camera,
      gradient: 'from-amber-500 to-orange-500',
      route: '/product-photography',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Palette className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Design Studio</h1>
        </div>

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

export default DesignStudioPage;

