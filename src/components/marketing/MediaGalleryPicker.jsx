import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMarketingImages, uploadMarketingImage, deleteMarketingImage } from '../../api/marketing';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'social', label: 'Social' },
  { value: 'blog', label: 'Blog' },
  { value: 'email', label: 'Email' },
  { value: 'general', label: 'General' },
];

const SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'uploaded', label: 'Uploaded' },
];

export default function MediaGalleryPicker({ 
  onSelect, 
  onClose, 
  selectedIds = [], 
  maxSelection = 10,
  contentId = null 
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (source) params.source = source;
      params.limit = 100;
      
      const data = await getMarketingImages(params);
      setImages(data.images || []);
      setError(null);
    } catch (err) {
      setError('Failed to load images');
      console.error('Load images error:', err);
    } finally {
      setLoading(false);
    }
  }, [category, source]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          setError('Please select image files only');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('File too large (max 10MB)');
          continue;
        }

        const result = await uploadMarketingImage(file, 'social', contentId);
        if (result.success) {
          setImages(prev => [result, ...prev]);
        }
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelect = (image) => {
    const newSelected = new Set(selected);
    
    if (newSelected.has(image.id)) {
      newSelected.delete(image.id);
    } else {
      if (newSelected.size >= maxSelection) {
        setError(`Maximum ${maxSelection} images allowed`);
        return;
      }
      newSelected.add(image.id);
    }
    
    setSelected(newSelected);
    setError(null);
  };

  const handleDelete = async (imageId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Delete this image?')) return;
    
    try {
      await deleteMarketingImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelected(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const handleConfirm = () => {
    const selectedImages = images.filter(img => selected.has(img.id));
    onSelect?.(selectedImages);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Media
            {selected.size > 0 && (
              <span className="ml-2 text-sm text-blue-600">
                ({selected.size} selected)
              </span>
            )}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Filters & Upload */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="flex-1" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <span>↑</span>
                Upload
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Image Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🖼️</div>
              <p>No images found</p>
              <p className="text-sm mt-2">Upload or generate images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(image => (
                <div
                  key={image.id}
                  onClick={() => handleSelect(image)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selected.has(image.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.file_url}
                      alt={image.prompt || 'Marketing image'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Selection indicator */}
                  {selected.has(image.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                  
                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="w-full p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-xs truncate">
                        {image.source === 'ai_generated' ? '✨ AI Generated' : '↑ Uploaded'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(image.id, e)}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {images.length} images • Max {maxSelection} selection
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
