import React from 'react';
import { Shield, FileText, Search, BarChart3, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const InsurancePromptSuggestions = ({ onSelect }) => {
  const suggestions = [
    {
      icon: Shield,
      title: 'Generate Policy Document',
      description: 'Create a comprehensive insurance policy',
      prompt: 'Generate a comprehensive life insurance policy document for a new policyholder',
      color: 'cyan'
    },
    {
      icon: FileText,
      title: 'Create Claim Form',
      description: 'Generate a claim submission form',
      prompt: 'Create an insurance claim form for property damage',
      color: 'blue'
    },
    {
      icon: Search,
      title: 'Underwriting Report',
      description: 'Risk assessment report',
      prompt: 'Generate an underwriting risk assessment report for a new applicant',
      color: 'purple'
    },
    {
      icon: BarChart3,
      title: 'Claims Analysis',
      description: 'Analyze claims data',
      prompt: 'Create a claims analysis report showing trends and patterns',
      color: 'green'
    },
    {
      icon: Calendar,
      title: 'Renewal Notice',
      description: 'Policy renewal reminder',
      prompt: 'Generate a policy renewal notice letter',
      color: 'amber'
    },
    {
      icon: Users,
      title: 'Agent Report',
      description: 'Agent performance summary',
      prompt: 'Create a monthly agent performance report',
      color: 'rose'
    }
  ];

  const colorMap = {
    cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {suggestions.map((suggestion, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onSelect(suggestion.prompt)}
          className={`p-4 rounded-xl text-left transition-colors ${colorMap[suggestion.color]}`}
        >
          <suggestion.icon className="w-5 h-5 mb-2" />
          <h4 className="text-sm font-bold">{suggestion.title}</h4>
          <p className="text-xs opacity-70 mt-1">{suggestion.description}</p>
        </motion.button>
      ))}
    </div>
  );
};

export default InsurancePromptSuggestions;
