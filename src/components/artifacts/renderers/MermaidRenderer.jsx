import React, { useRef, useEffect } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Mermaid chart renderer
 */
const MermaidRenderer = ({ content }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ref = useRef(null);

  useEffect(() => {
    // Initialize mermaid with theme
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [isDark]);

  useEffect(() => {
    if (ref.current && content) {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, content)
        .then(result => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
          }
        })
        .catch(err => {
          console.error('Mermaid error:', err);
          if (ref.current) {
            ref.current.innerHTML = `<div class="p-4 text-red-500">Invalid Mermaid Syntax: ${err.message}</div>`;
          }
        });
    }
  }, [content]);

  return (
    <div className={`h-full overflow-auto flex items-center justify-center p-4 artifact-scrollbar ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
      <div ref={ref} className="w-full h-full flex items-center justify-center" />
    </div>
  );
};

export default MermaidRenderer;

