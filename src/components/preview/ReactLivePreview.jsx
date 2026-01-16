import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { themes } from 'prism-react-renderer';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * React Live code preview component
 * @param {string} code - React code to render
 */
const ReactLivePreview = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
      <LiveProvider code={code} theme={isDark ? themes.vsDark : themes.github} scope={{ React, motion, Check, AlertCircle }}>
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-dark-bg bg-pattern-grid">
          <LivePreview />
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs p-2">
          <LiveError />
        </div>
        <div className="h-1/3 border-t border-light-border dark:border-dark-border overflow-auto bg-terminal-light dark:bg-dark-terminal">
          <LiveEditor 
            style={{ 
              fontFamily: 'monospace', 
              fontSize: 12, 
              color: isDark ? '#D4D4D4' : '#1A1A1A', 
              backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8' 
            }} 
          />
        </div>
      </LiveProvider>
    </div>
  );
};

export default ReactLivePreview;
