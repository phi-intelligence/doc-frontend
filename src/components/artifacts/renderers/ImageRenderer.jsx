import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Image renderer with zoom functionality
 */
const ImageRenderer = ({ artifact }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (artifact.url) {
        const img = new Image();
        img.src = artifact.url;
        img.onload = () => {
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head><title>${artifact.filename}</title></head>
              <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;">
                <img src="${artifact.url}" style="max-width:100%;max-height:100%;object-fit:contain;" />
              </body>
            </html>
          `);
        };
      }
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-gray-100'}`}>
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 artifact-scrollbar">
        <div
          className="relative"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease',
          }}
        >
          <img
            src={artifact.url}
            alt={artifact.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />
        </div>
      </div>
      
      <div className={`flex items-center justify-between gap-2 px-4 py-2 border-t ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-white'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'text-dark-text hover:bg-dark-sidebar'
                : 'text-light-text hover:bg-gray-100'
            }`}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-sm font-medium min-w-[60px] text-center ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'text-dark-text hover:bg-dark-sidebar'
                : 'text-light-text hover:bg-gray-100'
            }`}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleFullscreen}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? 'text-dark-text hover:bg-dark-sidebar'
              : 'text-light-text hover:bg-gray-100'
          }`}
          title="Open in new window"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ImageRenderer;

