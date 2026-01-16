import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Building2 } from 'lucide-react';

const BusinessProfilePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Business Profile</h1>
        </div>
        <div className={`rounded-xl p-8 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'} border`}>
          <p className={`text-lg ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Business profile content will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;

