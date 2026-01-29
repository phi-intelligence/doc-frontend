import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * SectionCard - A prominent card for department workspaces
 */
const SectionCard = ({ to, title, description, icon: Icon, stats, color = 'brand' }) => {
  const colorClasses = {
    brand: {
      bg: 'bg-brand-accent-50',
      border: 'border-brand-accent-100',
      text: 'text-brand-accent-600',
      hoverBg: 'group-hover:bg-brand-accent-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-600',
      hoverBg: 'group-hover:bg-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-600',
      hoverBg: 'group-hover:bg-orange-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-600'
    }
  };

  const classes = colorClasses[color] || colorClasses.brand;

  return (
    <motion.div
      whileHover={{ y: -6, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className="group relative bg-white rounded-3xl border border-light-border overflow-hidden transition-all duration-300 h-full flex flex-col"
    >
      {/* Decorative accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 ${classes.bg} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="p-8 relative flex-1 flex flex-col">
        <div className={`w-14 h-14 rounded-2xl ${classes.bg} border ${classes.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-7 h-7 ${classes.text}`} />
        </div>
        
        <h3 className="text-2xl font-bold text-light-text mb-3 tracking-tight">{title}</h3>
        <p className="text-light-text-secondary text-sm leading-relaxed mb-6">
          {description}
        </p>

        {stats && (
          <div className="grid grid-cols-2 gap-4 mt-auto py-4 border-y border-light-border/50">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-xs font-medium text-light-text-secondary uppercase tracking-wider">{stat.label}</div>
                <div className="text-lg font-bold text-light-text">{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Link 
        to={to} 
        className={`w-full p-4 bg-light-sidebar ${classes.hoverBg} group-hover:text-white ${classes.text} font-bold text-sm transition-colors flex items-center justify-center gap-2`}
      >
        Enter Workspace
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
};

export default SectionCard;
