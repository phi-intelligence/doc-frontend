import React, { useState, useEffect } from 'react';
import LuckyExcel from 'luckyexcel';
import { Workbook } from '@fortune-sheet/react';
import "@fortune-sheet/react/dist/index.css";
import { RefreshCw } from 'lucide-react';

/**
 * Excel file preview component using FortuneSheet
 * @param {string} url - Excel file URL
 * @param {Function} onLoadComplete - Callback when loading completes
 */
const ExcelPreview = ({ url, onLoadComplete }) => {
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndParseExcel = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Use LuckyExcel to transform the Excel file into FortuneSheet compatible data
        LuckyExcel.transformExcelToLucky(blob, (exportJson) => {
          if (exportJson.sheets.length === 0) {
            setError('No sheets found in this Excel file.');
            setLoading(false);
            if (onLoadComplete) onLoadComplete();
            return;
          }
          
          setSheetData(exportJson.sheets);
          setLoading(false);
          if (onLoadComplete) onLoadComplete();
        }, (err) => {
          console.error('LuckyExcel transformation failed:', err);
          setError('Failed to parse Excel file structure.');
          setLoading(false);
          if (onLoadComplete) onLoadComplete();
        });

      } catch (error) {
        console.error('Error fetching Excel:', error);
        setError('Failed to load Excel file.');
        setLoading(false);
        if (onLoadComplete) onLoadComplete();
      }
    };

    if (url) {
      fetchAndParseExcel();
    }
  }, [url, onLoadComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-light-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin text-brand-accent-500" />
            <div className="absolute inset-0 border-4 border-brand-accent-100 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-light-text">Loading Spreadsheet...</p>
            <p className="text-xs text-light-text-secondary mt-1">Rendering visualization</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 bg-light-bg">{error}</div>;
  }

  if (!sheetData) {
    return <div className="p-4 text-center text-light-text-secondary bg-light-bg">No data found</div>;
  }

  return (
    <div className="h-full w-full bg-white rounded-lg border border-light-border overflow-hidden">
      <Workbook 
        data={sheetData} 
        readOnly={true}
        showToolbar={false}
        showGrid={true}
        showContextmenu={false}
        rowHeaderWidth={60}
        columnHeaderHeight={24}
      />
    </div>
  );
};

export default ExcelPreview;
