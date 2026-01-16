import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '../../../context/ThemeContext';
import { getLanguageFromType } from '../../../utils/artifactUtils';

/**
 * Code renderer with syntax highlighting
 */
const CodeRenderer = ({ code, language, fileType }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const lang = language || getLanguageFromType(fileType);

  if (!code) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-dark-bg text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
        <p>No code content available</p>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto artifact-scrollbar ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
      <Highlight
        theme={isDark ? themes.nightOwl : themes.github}
        code={code}
        language={lang}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={`h-full p-4 font-mono text-sm ${isDark ? 'bg-dark-surface' : 'bg-gray-50'}`}>
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({ line })}
                className={`table-row ${isDark ? 'hover:bg-dark-sidebar' : 'hover:bg-gray-100'}`}
              >
                <span className={`table-cell text-right pr-4 select-none w-12 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeRenderer;

