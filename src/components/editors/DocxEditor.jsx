import React, { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import { Save, FileText } from 'lucide-react';

const DocxEditor = ({ file }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!file?.url) return;
        setLoading(true);

        const filename = file.filename;
        if (!filename) {
            setLoading(false);
            return;
        }

        // Use backend HTML conversion for high fidelity
        fetch(`/api/files/${filename}/html`)
            .then(res => {
                if (!res.ok) throw new Error("Conversion failed");
                return res.text();
            })
            .then(html => {
                // Basic cleanup of full page HTML to partial for editor
                // This is crude but works for now to remove <html><body> wrapper if present
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const content = doc.body.innerHTML || html;
                setHtmlContent(content);
                setLoading(false);
            })
            .catch(err => {
                console.error("HTML Fetch failed, falling back to Mammoth locally", err);

                // Fallback to local Mammoth if backend fails
                fetch(file.url)
                    .then(r => r.arrayBuffer())
                    .then(b => mammoth.convertToHtml({ arrayBuffer: b }))
                    .then(result => {
                        setHtmlContent(result.value);
                        setLoading(false);
                    })
                    .catch(e => {
                        console.error("Mammoth fallback failed", e);
                        setLoading(false);
                    });
            });

    }, [file]);

    return (
        <div className="flex h-full w-full bg-gray-100 flex-col relative overflow-hidden">
            {/* Editor Toolbar (Mock) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-4 z-10">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2">
                    <span className="font-serif font-bold text-lg">B</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2">
                    <span className="font-serif italic text-lg">I</span>
                </button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            {/* Document Page */}
            <div className="flex-1 overflow-y-auto p-12 flex justify-center">
                <div className="w-full max-w-[816px] min-h-[1056px] bg-white shadow-xl p-[96px] my-4 outline-none">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 pt-20">
                            <div className="animate-spin text-brand-primary-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-gray-500">Loading document...</p>
                        </div>
                    ) : (
                        <div
                            className="prose max-w-none focus:outline-none"
                            contentEditable
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                            suppressContentEditableWarning={true}
                            style={{ minHeight: '800px' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocxEditor;
