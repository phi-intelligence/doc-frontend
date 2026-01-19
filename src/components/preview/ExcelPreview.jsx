import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { RefreshCw } from 'lucide-react';

/**
 * Excel file preview component
 * Handles standard XLSX files and falls back to PDF viewer if content is actually PDF
 * @param {string} url - Excel file URL
 * @param {Function} onLoadComplete - Callback when loading completes
 */
const ExcelPreview = ({ url, onLoadComplete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    const fetchAndParseExcel = async () => {
      setLoading(true);
      setIsPdf(false);
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Check for PDF magic number (%PDF)
        const header = new Uint8Array(arrayBuffer.slice(0, 4));
        const isPdfHeader = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;

        if (isPdfHeader) {
          console.warn('Detected PDF content in XLSX file, switching to PDF view');
          setIsPdf(true);
          setLoading(false);
          if (onLoadComplete) onLoadComplete();
          return;
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON (array of arrays for table display)  
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        setData(null);
      } finally {
        setLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
      }
    };

    fetchAndParseExcel();
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
            <p className="text-sm font-medium text-light-text">Loading Excel file...</p>
            <p className="text-xs text-light-text-secondary mt-1">Parsing spreadsheet data</p>
          </div>
        </div>
      </div>
    );
  }

  // Render as PDF if detected
  if (isPdf) {
    return (
      <div className="w-full h-full bg-white rounded-lg border border-light-border overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 bg-amber-50 text-amber-800 text-xs px-4 py-1 border-b border-amber-100 flex justify-center">
          Note: Document rendered as PDF preview
        </div>
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="w-full h-full border-0 pt-6"
          title="PDF Fallback Preview"
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-light-text-secondary bg-light-bg">No data found</div>;
  }

  return (
    <div className="h-full overflow-auto bg-white p-4 rounded-lg border border-light-border">
      <table className="min-w-full border-collapse">
        <thead className="bg-brand-accent-500 sticky top-0">
          <tr>
            {data[0].map((header, i) => (
              <th key={i} className="border border-light-border px-4 py-2.5 text-left font-semibold text-white">
                {header || `Column ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-light-border px-4 py-2 text-light-text">
                  {cell !== undefined && cell !== null ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelPreview;