import React, { useState, useEffect } from 'react';
import { Check, Users, DollarSign, Scale, Megaphone, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvailableModules } from '../../api/company';

// Module icon mapping
const moduleIcons = {
  users: Users,
  'dollar-sign': DollarSign,
  scale: Scale,
  megaphone: Megaphone,
};

/**
 * Module card component
 */
const ModuleCard = ({ module, selected, onToggle }) => {
  const Icon = moduleIcons[module.icon] || Users;

  return (
    <motion.button
      onClick={() => onToggle(module.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-6 rounded-2xl border text-left transition-all
        ${selected
          ? 'border-brand-accent-500 bg-brand-accent-50 shadow-lg shadow-brand-accent-500/10'
          : 'border-light-border bg-light-surface hover:border-light-border-hover hover:shadow-soft'
        }
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center
          transition-all
          ${selected
            ? 'bg-brand-accent-500 text-white'
            : 'bg-white border-2 border-light-border'
          }
        `}
      >
        {selected && <Check className="w-4 h-4" />}
      </div>

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center mb-4
          ${selected ? 'bg-brand-accent-500 text-white' : 'bg-white shadow-sm'}
        `}
        style={!selected ? { color: module.color } : {}}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-light-text mb-1">
        {module.name}
      </h3>
      <p className="text-sm text-light-text-secondary mb-4">
        {module.description}
      </p>

      {/* Features */}
      <ul className="space-y-1.5">
        {module.features.slice(0, 4).map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-light-text-secondary">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: selected ? '#427CCB' : module.color }}
            />
            {feature}
          </li>
        ))}
        {module.features.length > 4 && (
          <li className="text-xs text-light-text-secondary/60">
            +{module.features.length - 4} more features
          </li>
        )}
      </ul>
    </motion.button>
  );
};


/**
 * Module selection component for company registration
 */
const ModuleSelection = ({ onSubmit, onBack, isLoading = false }) => {
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await getAvailableModules();
        setModules(response.modules || []);

        // Default: all modules selected
        const allModuleIds = (response.modules || []).map(m => m.id);
        setSelectedModules(new Set(allModuleIds));
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setError('Failed to load available modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleToggle = (moduleId) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedModules(new Set(modules.map(m => m.id)));
  };

  const handleSelectNone = () => {
    setSelectedModules(new Set());
  };

  const handleSubmit = () => {
    if (selectedModules.size === 0) {
      return;
    }
    onSubmit(Array.from(selectedModules));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent-500 mb-4" />
        <p className="text-light-text-secondary">Loading modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-light-surface rounded-lg text-light-text hover:bg-light-border"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-light-text-secondary hover:text-light-text hover:bg-light-surface transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className={onBack ? '' : 'text-center w-full'}>
          <h2 className="text-2xl font-black text-light-text mb-1">
            Select Your Modules
          </h2>
          <p className="text-light-text-secondary">
            Choose which departments and features to enable for your organization
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-light-text-secondary">
          {selectedModules.size} of {modules.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-brand-accent-600 hover:text-brand-accent-700 font-medium"
          >
            Select All
          </button>
          <span className="text-light-text-secondary">|</span>
          <button
            onClick={handleSelectNone}
            className="text-sm text-light-text-secondary hover:text-light-text font-medium"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            selected={selectedModules.has(module.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="px-6 py-4 rounded-2xl font-bold text-light-text-secondary bg-light-surface hover:bg-light-border transition-all disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={selectedModules.size === 0 || isLoading}
          className={`
            flex-1 flex items-center justify-center gap-3
            px-8 py-4 rounded-2xl font-bold text-lg
            transition-all
            ${selectedModules.size === 0 || isLoading
              ? 'bg-light-border text-light-text-secondary cursor-not-allowed'
              : 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Completing Registration...
            </>
          ) : (
            <>
              Complete Registration
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {selectedModules.size === 0 && (
        <p className="text-center text-sm text-orange-600">
          Please select at least one module to continue
        </p>
      )}
    </motion.div>
  );
};

export default ModuleSelection;
