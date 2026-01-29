import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatCard - A card component to display dashboard statistics
 */
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'brand' }) => {
  const colorClasses = {
    brand: 'text-brand-accent-600 bg-brand-accent-50 border-brand-accent-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-5 rounded-2xl border border-light-border shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
          </div>
        )}
      </div>
      
      <div>
        <div className="text-sm font-medium text-light-text-secondary">{title}</div>
        <div className="text-2xl font-bold text-light-text mt-1">{value}</div>
      </div>
    </motion.div>
  );
};

export default StatCard;
