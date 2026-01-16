import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Excel file renderer with table view
 */
const ExcelRenderer = ({ artifact, onLoadComplete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndParseExcel = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(artifact.url);
        if (!response.ok) {
          throw new Error('Failed to fetch Excel file');
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON (array of arrays for table display)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
      }
    };

    if (artifact?.url) {
      fetchAndParseExcel();
    }
  }, [artifact?.url, onLoadComplete]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <RefreshCw className={`w-12 h-12 animate-spin ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Loading Excel file...</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Parsing spreadsheet data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-full flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Error loading Excel file</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
        <p>No data found in spreadsheet</p>
      </div>
    );
  }

  return (
    <div className={`h-full w-full max-w-full overflow-x-auto overflow-y-auto artifact-scrollbar ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
      <div className="p-4">
        <table className={`border-collapse ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <thead className={`sticky top-0 z-10 ${isDark ? 'bg-brand-accent-600' : 'bg-brand-accent-500'}`}>
          <tr>
            {data[0]?.map((header, i) => (
              <th
                key={i}
                className={`border px-4 py-2.5 text-left font-semibold text-white whitespace-nowrap ${isDark ? 'border-dark-border' : 'border-light-border'}`}
              >
                {header || `Column ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0
                ? isDark ? 'bg-dark-surface' : 'bg-white'
                : isDark ? 'bg-dark-sidebar' : 'bg-gray-50'
              }
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`border px-4 py-2 whitespace-nowrap ${isDark ? 'border-dark-border text-dark-text-secondary' : 'border-light-border text-light-text-secondary'}`}
                >
                  {cell !== undefined && cell !== null ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ExcelRenderer;

