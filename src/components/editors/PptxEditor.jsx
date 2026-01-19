import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, GripVertical, Save, RefreshCw } from 'lucide-react';

const PptxEditor = ({ file }) => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSlideId, setActiveSlideId] = useState(1);
    const [error, setError] = useState(null);

    // Derived active slide
    const activeSlide = slides.find(s => s.id === activeSlideId);

    // Fetch Structure
    useEffect(() => {
        if (!file?.filename) return;
        loadStructure();
    }, [file]);

    const loadStructure = () => {
        setLoading(true);
        setError(null);
        fetch(`/api/files/${file.filename}/pptx/structure`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load structure");
                return res.json();
            })
            .then(data => {
                console.log("PPTX Structure Loaded:", data);
                setSlides(data.slides || []);
                if (data.slides && data.slides.length > 0) {
                    setActiveSlideId(data.slides[0].id);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("PPTX Structure Fetch failed", err);
                setError(err.message);
                setLoading(false);
            });
    };

    const updateSlide = (field, value) => {
        setSlides(prev => prev.map(s =>
            s.id === activeSlideId ? { ...s, [field]: value } : s
        ));
    };

    const handleSave = () => {
        setSaving(true);
        const updates = slides.map(s => ({
            slide_index: s.slide_index,
            title: s.title || "",
            content: s.content || "",
            notes: s.notes || ""
        }));

        fetch(`/api/files/${file.filename}/pptx/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                return res.json();
            })
            .then(() => {
                setSaving(false);
                alert("Presentation saved successfully!");
            })
            .catch(err => {
                console.error(err);
                setSaving(false);
                alert("Failed to save changes.");
            });
    };

    return (
        <div className="flex h-full w-full bg-gray-100">
            {/* Slides Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Slides</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadStructure}
                            title="Reload Structure"
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin text-brand-primary-500">
                            <Layout className="w-6 h-6" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-red-500 mb-2">Failed to load slides</div>
                        <p className="text-xs text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={loadStructure}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                onClick={() => setActiveSlideId(slide.id)}
                                className={`group flex flex-col gap-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${activeSlideId === slide.id
                                    ? 'bg-brand-primary-50 border-brand-primary-300 ring-1 ring-brand-primary-200'
                                    : 'bg-white border-gray-200 hover:border-brand-primary-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        #{index + 1}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                    {slide.title || '(No Title)'}
                                </p>
                                <p className="text-xs text-gray-400 line-clamp-1">
                                    {slide.content ? slide.content.substring(0, 30) + "..." : "(Empty content)"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100/50">
                {/* Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Editing:</span>
                        <span className="font-semibold text-gray-800">{file?.filename}</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 transition-colors shadow-sm ${saving ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Form Area */}
                {activeSlide ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Slide Content Card */}
                            <div className="bg-white p-10 shadow-lg rounded-xl border border-gray-200/60 transition-all hover:shadow-xl">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                                    Slide {activeSlide.id} Content
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            value={activeSlide.title}
                                            onChange={(e) => updateSlide('title', e.target.value)}
                                            className="w-full text-xl font-bold text-gray-900 border-gray-300 rounded-lg focus:ring-brand-primary-500 focus:border-brand-primary-500 p-3 bg-gray-50 focus:bg-white transition-colors"
                                            placeholder="Enter slide title..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Body Text / Bullet Points</label>
                                        <textarea
                                            value={activeSlide.content}
                                            onChange={(e) => updateSlide('content', e.target.value)}
                                            className="w-full min-h-[300px] text-base text-gray-700 border-gray-300 rounded-lg focus:ring-brand-primary-500 focus:border-brand-primary-500 p-4 bg-gray-50 focus:bg-white transition-colors leading-relaxed"
                                            placeholder="Enter slide content..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Tip: This text maps to the main body placeholder on the slide. Formatting (bold, bullets) from the original slide is preserved in the backend but edited as plain text here.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Speaker Notes Card */}
                            <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-200/60 shadow-sm">
                                <label className="flex items-center gap-2 text-xs font-bold text-yellow-700 uppercase tracking-wider mb-3">
                                    <span>Speaker Notes</span>
                                </label>
                                <textarea
                                    value={activeSlide.notes}
                                    onChange={(e) => updateSlide('notes', e.target.value)}
                                    className="w-full bg-white border-yellow-200 rounded-lg text-sm text-gray-700 focus:ring-yellow-400 focus:border-yellow-400 min-h-[100px] p-3 shadow-inner"
                                    placeholder="Add notes for the presenter..."
                                />
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                        <div className="text-center">
                            <Layout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Select a slide from the sidebar to start editing</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PptxEditor;
