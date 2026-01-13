import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { RefreshCw } from 'lucide-react';

/**
 * Excel file preview component
 * @param {string} url - Excel file URL
 * @param {Function} onLoadComplete - Callback when loading completes
 */
const ExcelPreview = ({ url, onLoadComplete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndParseExcel = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
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
