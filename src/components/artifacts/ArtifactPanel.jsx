import React, { useState, memo } from 'react';
import { hasCodeView } from '../../utils/artifactUtils';
import ArtifactHeader from './ArtifactHeader';
import ArtifactTabs from './ArtifactTabs';
import ArtifactContent from './ArtifactContent';
import { useTheme } from '../../context/ThemeContext';

/**
 * Main artifact panel component with header, tabs, and content
 */
const ArtifactPanel = ({
  artifact,
  content,
  isLoading,
  currentPage = 1,
  setCurrentPage,
  totalPages = null,
  onLoadComplete
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('preview');
  const showTabs = artifact && hasCodeView(artifact.type);

  return (
    <div className={`h-full w-full max-w-full flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-white'} rounded-lg overflow-hidden border ${isDark ? 'border-dark-border' : 'border-light-border'} shadow-sm`}>
      <ArtifactHeader 
        artifact={artifact} 
        content={content}
      />
      {showTabs && (
        <ArtifactTabs activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <ArtifactContent
        artifact={artifact}
        content={content}
        activeTab={activeTab}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        onLoadComplete={onLoadComplete}
      />
    </div>
  );
};

export default memo(ArtifactPanel, (prevProps, nextProps) => {
  return (
    prevProps.artifact?.filename === nextProps.artifact?.filename &&
    prevProps.artifact?.url === nextProps.artifact?.url &&
    prevProps.content === nextProps.content &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages
  );
});

