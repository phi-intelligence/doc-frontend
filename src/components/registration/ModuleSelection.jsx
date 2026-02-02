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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-8 rounded-[32px] border text-left transition-all duration-300 overflow-hidden group
        ${selected
          ? 'border-brand-accent-500 bg-white shadow-xl shadow-brand-accent-500/10'
          : 'border-light-border bg-white hover:border-brand-accent-300 hover:shadow-lg'
        }
      `}
    >
      {/* Background Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity duration-500 ${selected ? 'bg-brand-accent-50 opacity-100' : 'bg-gray-50 opacity-0 group-hover:opacity-100'}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
           {/* Icon */}
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300
              ${selected ? 'bg-brand-accent-600 text-white shadow-lg shadow-brand-accent-600/20' : 'bg-light-surface text-light-text-secondary group-hover:bg-brand-accent-50 group-hover:text-brand-accent-600'}
            `}
          >
            <Icon className="w-7 h-7" />
          </div>

          {/* Selection Checkbox */}
          <div
            className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${selected
                ? 'bg-brand-accent-600 border-brand-accent-600 text-white scale-110'
                : 'bg-transparent border-light-border group-hover:border-brand-accent-400'
              }
            `}
          >
            {selected && <Check className="w-5 h-5" />}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-black text-light-text mb-2 tracking-tight group-hover:text-brand-accent-700 transition-colors">
          {module.name}
        </h3>
        <p className="text-light-text-secondary font-medium leading-relaxed mb-6 min-h-[48px]">
          {module.description}
        </p>

        {/* Features */}
        <div className="space-y-3 pt-6 border-t border-light-border/50">
          {module.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-bold text-light-text-secondary">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${selected ? 'bg-brand-accent-500' : 'bg-light-border group-hover:bg-brand-accent-400'}`}
              />
              {feature}
            </div>
          ))}
          {module.features.length > 4 && (
            <p className="text-xs font-bold text-brand-accent-600 pl-4.5 mt-2 uppercase tracking-wide">
              +{module.features.length - 4} more capabilities
            </p>
          )}
        </div>
      </div>
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
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-brand-accent-600 mb-6" />
        <p className="text-light-text-secondary font-medium">Loading workspace modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-status-error font-bold mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-light-surface rounded-xl font-bold text-light-text hover:bg-light-border transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-white border border-light-border text-light-text-secondary hover:text-brand-accent-600 hover:border-brand-accent-200 hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-black text-light-text tracking-tight mb-2">
              Workspace Configuration
            </h2>
            <p className="text-light-text-secondary font-medium max-w-xl">
              Activate the specific operational modules required for your organization.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-light-border shadow-sm">
          <span className="text-xs font-bold text-light-text uppercase tracking-wider">
            {selectedModules.size} Active
          </span>
          <div className="h-4 w-px bg-light-border" />
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700 uppercase tracking-wider"
          >
            All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-xs font-bold text-light-text-secondary hover:text-light-text uppercase tracking-wider"
          >
            None
          </button>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
      <div className="flex items-center gap-4 pt-8 border-t border-light-border">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl font-bold text-light-text-secondary bg-white border border-light-border hover:bg-light-surface hover:text-light-text transition-all disabled:opacity-50"
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        
        {selectedModules.size === 0 && (
           <p className="text-sm font-bold text-orange-500 animate-pulse mr-4">
              Select at least one module
           </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={selectedModules.size === 0 || isLoading}
          className={`
            flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-wide
            transition-all duration-300
            ${selectedModules.size === 0 || isLoading
              ? 'bg-light-border text-light-text-secondary cursor-not-allowed'
              : 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20 hover:scale-[1.01]'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finalizing...</span>
            </>
          ) : (
            <>
              <span>Launch Workspace</span>
              <Check className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ModuleSelection;
