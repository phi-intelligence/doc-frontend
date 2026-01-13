import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { themes } from 'prism-react-renderer';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

/**
 * React Live code preview component
 * @param {string} code - React code to render
 */
const ReactLivePreview = ({ code }) => {
  return (
    <div className="flex flex-col h-full bg-white border rounded-lg overflow-hidden">
      <LiveProvider code={code} theme={themes.github} scope={{ React, motion, Check, AlertCircle }}>
        <div className="flex-1 p-6 overflow-auto bg-gray-50 bg-pattern-grid">
          <LivePreview />
        </div>
        <div className="bg-red-50 text-red-600 text-xs p-2">
          <LiveError />
        </div>
        <div className="h-1/3 border-t border-light-border overflow-auto bg-terminal-light">
          <LiveEditor style={{ fontFamily: 'monospace', fontSize: 12, color: '#1A1A1A', backgroundColor: '#F8F8F8' }} />
        </div>
      </LiveProvider>
    </div>
  );
};

export default ReactLivePreview;
