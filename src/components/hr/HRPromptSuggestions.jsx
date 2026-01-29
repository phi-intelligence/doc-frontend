import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserCheck, CreditCard, Shield, ClipboardList } from 'lucide-react';

/**
 * HRPromptSuggestions - Component displaying HR-specific prompt suggestions
 */
const HRPromptSuggestions = ({ onSelect }) => {
  const suggestions = [
    {
      icon: FileText,
      text: "Generate offer letter for new employee",
      color: "blue"
    },
    {
      icon: UserCheck,
      text: "Create employment contract",
      color: "green"
    },
    {
      icon: CreditCard,
      text: "Generate employee ID card",
      color: "purple"
    },
    {
      icon: Shield,
      text: "Create non-disclosure agreement",
      color: "orange"
    },
    {
      icon: ClipboardList,
      text: "Generate onboarding checklist",
      color: "indigo"
    }
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-light-text-secondary mb-3">Quick Actions:</p>
      {suggestions.map((suggestion, idx) => {
        const Icon = suggestion.icon;
        return (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect && onSelect(suggestion.text)}
            className="w-full text-left p-3 bg-light-bg border border-light-border hover:border-brand-accent-300 rounded-lg text-sm text-light-text hover:bg-brand-accent-50 transition-all flex items-center gap-3 group"
          >
            <div className={`p-2 rounded-lg transition-colors ${
              suggestion.color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' :
              suggestion.color === 'green' ? 'bg-green-50 group-hover:bg-green-100' :
              suggestion.color === 'purple' ? 'bg-purple-50 group-hover:bg-purple-100' :
              suggestion.color === 'orange' ? 'bg-orange-50 group-hover:bg-orange-100' :
              'bg-indigo-50 group-hover:bg-indigo-100'
            }`}>
              <Icon className={`w-4 h-4 ${
                suggestion.color === 'blue' ? 'text-blue-600' :
                suggestion.color === 'green' ? 'text-green-600' :
                suggestion.color === 'purple' ? 'text-purple-600' :
                suggestion.color === 'orange' ? 'text-orange-600' :
                'text-indigo-600'
              }`} />
            </div>
            <span className="flex-1">{suggestion.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default HRPromptSuggestions;
