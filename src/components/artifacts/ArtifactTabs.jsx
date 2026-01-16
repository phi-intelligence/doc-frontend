import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Tab switcher for Preview/Code views
 */
const ArtifactTabs = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex border-b ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-white'}`}>
      <button
        onClick={() => onTabChange('preview')}
        className={`px-4 py-2 text-sm font-medium transition-all relative ${
          activeTab === 'preview'
            ? isDark
              ? 'text-brand-accent-400'
              : 'text-brand-accent-600'
            : isDark
            ? 'text-dark-text-secondary hover:text-dark-text'
            : 'text-light-text-secondary hover:text-light-text'
        }`}
      >
        Preview
        {activeTab === 'preview' && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDark ? 'bg-brand-accent-400' : 'bg-brand-accent-600'
            }`}
          />
        )}
      </button>
      <button
        onClick={() => onTabChange('code')}
        className={`px-4 py-2 text-sm font-medium transition-all relative ${
          activeTab === 'code'
            ? isDark
              ? 'text-brand-accent-400'
              : 'text-brand-accent-600'
            : isDark
            ? 'text-dark-text-secondary hover:text-dark-text'
            : 'text-light-text-secondary hover:text-light-text'
        }`}
      >
        Code
        {activeTab === 'code' && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              isDark ? 'bg-brand-accent-400' : 'bg-brand-accent-600'
            }`}
          />
        )}
      </button>
    </div>
  );
};

export default ArtifactTabs;

