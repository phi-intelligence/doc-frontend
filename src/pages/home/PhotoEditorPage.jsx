import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Image as ImageIcon } from 'lucide-react';

const PhotoEditorPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ImageIcon className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Photo Editor</h1>
        </div>
        <div className={`rounded-xl p-8 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'} border`}>
          <p className={`text-lg ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Photo Editor content will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorPage;

