import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaGalleryPicker from './MediaGalleryPicker';
import ImageGeneratorPanel from './ImageGeneratorPanel';
import PublishButton from './PublishButton';
import { attachImageToContent, detachImageFromContent } from '../../api/marketing';

const CHANNELS = [
  { value: 'twitter', label: 'Twitter / X', limit: 280 },
  { value: 'linkedin', label: 'LinkedIn', limit: 3000 },
  { value: 'facebook', label: 'Facebook', limit: 63206 },
  { value: 'instagram', label: 'Instagram', limit: 2200 },
  { value: 'blog', label: 'Blog', limit: 50000 },
];

export default function ContentEditor({ 
  contentId,
  initialContent = '',
  initialTitle = '',
  initialChannel = 'twitter',
  initialMedia = [],
  onSave,
  onPublished,
  readOnly = false 
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [channel, setChannel] = useState(initialChannel);
  const [media, setMedia] = useState(initialMedia);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const channelConfig = CHANNELS.find(c => c.value === channel) || CHANNELS[0];
  const charCount = content.length;
  const charLimit = channelConfig.limit;
  const isOverLimit = charCount > charLimit;

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await onSave({
        title,
        content,
        channel,
        media_files: media.map(m => m.file_path || m.file_url),
      });
    } catch (err) {
      setError('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = async (selectedImages) => {
    // Attach new images to content
    for (const img of selectedImages) {
      if (!media.find(m => m.id === img.id)) {
        try {
          if (contentId) {
            await attachImageToContent(contentId, img.id);
          }
          setMedia(prev => [...prev, img]);
        } catch (err) {
          console.error('Failed to attach image:', err);
        }
      }
    }
  };

  const handleRemoveMedia = async (imageId) => {
    try {
      if (contentId) {
        await detachImageFromContent(contentId, imageId);
      }
      setMedia(prev => prev.filter(m => m.id !== imageId));
    } catch (err) {
      setError('Failed to remove image');
    }
  };

  const handleImageGenerated = (image) => {
    setMedia(prev => [...prev, image]);
    setShowImageGenerator(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {contentId ? 'Edit Content' : 'Create Content'}
        </h3>
        <div className="flex items-center gap-2">
          {contentId && (
            <PublishButton
              contentId={contentId}
              contentText={content}
              mediaCount={media.length}
              onPublished={onPublished}
              disabled={isOverLimit || !content.trim()}
            />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your content..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={readOnly}
          />
        </div>

        {/* Channel Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(ch => (
              <button
                key={ch.value}
                onClick={() => setChannel(ch.value)}
                disabled={readOnly}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  channel === ch.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              isOverLimit ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            rows={6}
            disabled={readOnly}
          />
          <div className={`text-right text-sm mt-1 ${
            isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'
          }`}>
            {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters
            {isOverLimit && ' (over limit!)'}
          </div>
        </div>

        {/* Media Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Media ({media.length})
            </label>
            {!readOnly && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImageGenerator(true)}
                  className="text-sm px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  ✨ Generate AI Image
                </button>
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="text-sm px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  🖼️ Add Media
                </button>
              </div>
            )}
          </div>

          {/* Media Grid */}
          {media.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {media.map((img, idx) => (
                <div key={img.id || idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={img.file_url}
                    alt={img.prompt || 'Media'}
                    className="w-full h-full object-cover"
                  />
                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveMedia(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-2xl mb-2">🖼️</div>
              <p className="text-gray-500 text-sm">No media attached</p>
              {!readOnly && (
                <p className="text-gray-400 text-xs mt-1">
                  Click "Add Media" or "Generate AI Image" to attach images
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        {!readOnly && onSave && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !content.trim() || isOverLimit}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <MediaGalleryPicker
            onSelect={handleMediaSelect}
            onClose={() => setShowMediaPicker(false)}
            selectedIds={media.map(m => m.id)}
            contentId={contentId}
          />
        )}
      </AnimatePresence>

      {/* Image Generator Panel (Slide-in) */}
      <AnimatePresence>
        {showImageGenerator && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full w-full max-w-md bg-white shadow-xl overflow-auto"
            >
              <div className="p-4">
                <ImageGeneratorPanel
                  contentId={contentId}
                  onImageGenerated={handleImageGenerated}
                  onClose={() => setShowImageGenerator(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
