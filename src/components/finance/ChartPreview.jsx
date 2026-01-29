import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import ExcelPreview from '../preview/ExcelPreview';
import { getFileUrl } from '../../api/files';

/**
 * ChartPreview - Component for previewing Excel charts
 * Extracts and displays chart images from Excel files
 */
const ChartPreview = ({ document, onClose }) => {
  const [chartImages, setChartImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For now, just show Excel preview
    // In future, can extract chart images using xlsx library
    setLoading(false);
  }, [document]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent-500 mx-auto mb-2" />
          <p className="text-sm text-light-text-secondary">Loading charts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-light-text-secondary mx-auto mb-2" />
          <p className="text-sm text-light-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  // For Excel files, show full Excel preview
  if (document.type === 'XLSX' || document.filename.toLowerCase().endsWith('.xlsx')) {
    return (
      <div className="h-full">
        <ExcelPreview 
          url={getFileUrl(document.filename)}
          onLoadComplete={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-light-text-secondary">Chart preview not available for this file type</p>
    </div>
  );
};

export default ChartPreview;
