import React, { useRef, useEffect } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

/**
 * Mermaid chart preview component
 * @param {string} chart - Mermaid chart code
 */
const MermaidPreview = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.render(`mermaid-${Date.now()}`, chart).then(result => {
        ref.current.innerHTML = result.svg;
      }).catch(err => {
        console.error("Mermaid error:", err);
        ref.current.innerHTML = "Invalid Mermaid Syntax";
      });
    }
  }, [chart]);

  return <div ref={ref} className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-white" />;
};

export default MermaidPreview;
