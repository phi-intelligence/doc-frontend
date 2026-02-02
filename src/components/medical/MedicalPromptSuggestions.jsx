import React from 'react';
import { Stethoscope, FileText, Pill, TestTube, ClipboardList, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicalPromptSuggestions = ({ onSelect }) => {
  const suggestions = [
    {
      icon: Stethoscope,
      title: 'Consultation Note',
      description: 'Initial visit documentation',
      prompt: 'Generate a consultation note for a patient presenting with symptoms',
      color: 'rose'
    },
    {
      icon: ClipboardList,
      title: 'Progress Note',
      description: 'Follow-up SOAP note',
      prompt: 'Create a SOAP progress note for a follow-up visit',
      color: 'blue'
    },
    {
      icon: Pill,
      title: 'Prescription',
      description: 'Medication order',
      prompt: 'Generate a prescription document for medication',
      color: 'purple'
    },
    {
      icon: FileText,
      title: 'Referral Letter',
      description: 'Specialist referral',
      prompt: 'Create a referral letter to a specialist',
      color: 'green'
    },
    {
      icon: TestTube,
      title: 'Lab Order',
      description: 'Laboratory test request',
      prompt: 'Generate a lab order for diagnostic tests',
      color: 'amber'
    },
    {
      icon: UserPlus,
      title: 'Discharge Summary',
      description: 'Hospital discharge',
      prompt: 'Create a comprehensive discharge summary',
      color: 'cyan'
    }
  ];

  const colorMap = {
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
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

export default MedicalPromptSuggestions;
