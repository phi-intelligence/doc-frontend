import React, { useEffect, useState } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import * as LuckyExcel from 'luckyexcel';

const ExcelEditor = ({ file }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!file?.url) return;

        setLoading(true);

        // Fetch the file
        fetch(file.url)
            .then(res => res.blob())
            .then(blob => {
                // Use luckyexcel to parse the file
                LuckyExcel.transformExcelToLucky(blob, (exportJson, luckysheetfile) => {
                    if (exportJson.sheets == null || exportJson.sheets.length === 0) {
                        console.error('Failed to load excel sheets');
                        setLoading(false);
                        return;
                    }

                    setData(exportJson.sheets);
                    setLoading(false);
                });
            })
            .catch((err) => {
                console.error('Error loading excel file:', err);
                setLoading(false);
            });
    }, [file]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-white">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-brand-accent-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading spreadsheet...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Failed to load spreadsheet.
            </div>
        )
    }

    return (
        <div className="w-full h-full relative">
            <Workbook
                data={data}
                onChange={(d) => {
                    console.log('Sheet data changed:', d);
                }}
                showToolbar={true}
                showSheetTabs={true}
            />
        </div>
    );
};

export default ExcelEditor;
