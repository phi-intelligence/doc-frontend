import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMarketingImage } from '../../api/marketing';

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square', desc: 'Instagram, Facebook' },
  { value: '16:9', label: 'Landscape', desc: 'Twitter, LinkedIn' },
  { value: '4:5', label: 'Portrait', desc: 'Instagram feed' },
  { value: '9:16', label: 'Story', desc: 'Stories, Reels' },
  { value: '2:1', label: 'Wide', desc: 'Twitter header' },
];

const STYLES = [
  { value: 'professional', label: 'Professional', desc: 'Clean, corporate style' },
  { value: 'creative', label: 'Creative', desc: 'Artistic, unique' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Simple, elegant' },
  { value: 'bold', label: 'Bold', desc: 'Eye-catching, vibrant' },
];

export default function ImageGeneratorPanel({ contentId, onImageGenerated, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your image');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGeneratedImage(null);

      const result = await generateMarketingImage(prompt, {
        content_id: contentId,
        aspect_ratio: aspectRatio,
        style,
        category: 'social'
      });

      if (result.success) {
        setGeneratedImage(result);
        onImageGenerated?.(result);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image');
      console.error('Image generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const promptSuggestions = [
    'Professional business meeting in modern office',
    'Abstract technology network with blue gradient',
    'Happy diverse team celebrating success',
    'Minimalist product showcase on clean background',
    'Inspiring motivational quote typography design',
    'Social media marketing concept illustration',
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Generate AI Image
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your image
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A professional marketing image showing..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={generating}
        />
        
        {/* Quick suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {promptSuggestions.slice(0, 3).map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(suggestion)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              disabled={generating}
            >
              {suggestion.length > 30 ? suggestion.slice(0, 30) + '...' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ASPECT_RATIOS.map(ar => (
            <button
              key={ar.value}
              onClick={() => setAspectRatio(ar.value)}
              disabled={generating}
              className={`p-2 text-center rounded-lg border transition-all ${
                aspectRatio === ar.value 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-sm font-medium">{ar.label}</div>
              <div className="text-xs text-gray-500">{ar.value}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map(s => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              disabled={generating}
              className={`p-3 text-left rounded-lg border transition-all ${
                style === s.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-500">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Generated Image Preview */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={generatedImage.file_url}
                alt="Generated image"
                className="w-full h-auto"
              />
              <div className="p-3 bg-gray-50 text-xs text-gray-500">
                {generatedImage.width}x{generatedImage.height} • {generatedImage.format?.toUpperCase()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generating...
          </>
        ) : generatedImage ? (
          'Generate Another'
        ) : (
          <>
            <span>✨</span>
            Generate Image
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-gray-500 text-center">
        AI-generated images using Google Gemini
      </p>
    </div>
  );
}
