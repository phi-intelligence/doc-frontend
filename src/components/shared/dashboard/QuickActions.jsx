import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

/**
 * QuickActions - A grid of quick action buttons for dashboards
 */
const QuickActions = ({
  title = 'Quick Actions',
  actions = [],
  columns = 2,
  className = ''
}) => {
  if (actions.length === 0) return null;

  const colorClasses = {
    brand: 'bg-brand-accent-50 border-brand-accent-100 text-brand-accent-600 hover:bg-brand-accent-100',
    blue: 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100',
    orange: 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100',
    red: 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100',
  };

  return (
    <div className={`bg-white rounded-2xl border border-light-border p-5 ${className}`}>
      <h3 className="text-sm font-bold text-light-text mb-4">{title}</h3>

      <div className={`grid grid-cols-${columns} gap-3`}>
        {actions.map((action, index) => {
          const Icon = action.icon || Plus;
          const color = action.color || 'brand';

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                p-4 rounded-xl border transition-all text-left
                ${colorClasses[color]}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/50`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{action.label}</div>
                  {action.description && (
                    <div className="text-xs opacity-70 truncate">{action.description}</div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
