import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Loading skeleton for artifact preview
 */
const ArtifactSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`animate-pulse p-6 space-y-3 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
      <div className={`h-4 rounded ${isDark ? 'bg-dark-surface' : 'bg-gray-200'} w-3/4`} />
      <div className={`h-4 rounded ${isDark ? 'bg-dark-surface' : 'bg-gray-200'} w-1/2`} />
      <div className={`h-4 rounded ${isDark ? 'bg-dark-surface' : 'bg-gray-200'} w-5/6`} />
      <div className={`h-4 rounded ${isDark ? 'bg-dark-surface' : 'bg-gray-200'} w-2/3`} />
      <div className={`h-4 rounded ${isDark ? 'bg-dark-surface' : 'bg-gray-200'} w-4/5`} />
    </div>
  );
};

export default ArtifactSkeleton;

