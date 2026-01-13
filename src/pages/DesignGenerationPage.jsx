import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Palette, ArrowLeft, Loader2, Download, Sparkles,
  Type, Image as ImageIcon
} from 'lucide-react';
import { getFileUrl } from '../api/files';
import { sendMessage } from '../api/chat';
import { useProgressStream } from '../hooks/useProgressStream';
import ProcessCard from '../components/progress/ProcessCard';

// Logo styles
const logoStyles = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'playful', label: 'Playful' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'bold', label: 'Bold' },
  { value: 'geometric', label: 'Geometric' }
];

// Logo types
const logoTypes = [
  { value: 'text', label: 'Text Only' },
  { value: 'icon', label: 'Icon Only' },
  { value: 'combination', label: 'Text + Icon' },
  { value: 'emblem', label: 'Emblem' }
];

// Common colors
const commonColors = [
  '#000000', '#FFFFFF', '#1a1a1a', '#4a4a4a',
  '#886C4A', '#B8A07A', '#D4C4A8', 
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

// Design modes
const designModes = [
  { id: 'logo', name: 'Logo Maker', icon: Sparkles, description: 'Create professional logos' },
  { id: 'text-image', name: 'Text Image', icon: Type, description: 'Generate styled text graphics' }
];

function DesignGenerationPage() {
  const [selectedMode, setSelectedMode] = useState('logo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  
  // Logo form data
  const [logoForm, setLogoForm] = useState({
    company_name: '',
    tagline: '',
    style: 'modern',
    logo_type: 'combination',
    color_preferences: [],
    description: ''
  });

  // Text image form data
  const [textImageForm, setTextImageForm] = useState({
    text: '',
    style: 'modern',
    font_style: 'sans-serif',
    color: '#000000',
    background_color: '#FFFFFF'
  });

  // Chat pipeline state
  const [sessionId] = useState(() => `design-gen-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);

  // Update process card with progress stream
  useEffect(() => {
    if (progressStream.items.length > 0 && processCard && processCard.status === 'processing') {
      setProcessCard(prev => prev ? { ...prev, steps: progressStream.items } : null);
    }
  }, [progressStream.items, processCard]);

  // Toggle color selection
  const toggleColor = (color) => {
    setLogoForm(prev => {
      const colors = prev.color_preferences || [];
      if (colors.includes(color)) {
        return { ...prev, color_preferences: colors.filter(c => c !== color) };
      } else if (colors.length < 3) {
        return { ...prev, color_preferences: [...colors, color] };
      }
      return prev;
    });
  };

  // Build message based on selected mode
  const buildMessage = () => {
    if (selectedMode === 'logo') {
      const colorStr = logoForm.color_preferences.length > 0 
        ? `Color preferences: ${logoForm.color_preferences.join(', ')}`
        : 'Use appropriate professional colors';
      
      return `Generate a logo for "${logoForm.company_name}".
Style: ${logoForm.style}
Type: ${logoForm.logo_type}
${logoForm.tagline ? `Tagline: ${logoForm.tagline}` : ''}
${logoForm.description ? `Description/Keywords: ${logoForm.description}` : ''}
${colorStr}
Create a professional, high-quality logo suitable for business use.`;
    } else {
      return `Generate a styled text image with the text: "${textImageForm.text}".
Style: ${textImageForm.style}
Font style: ${textImageForm.font_style}
Text color: ${textImageForm.color}
Background color: ${textImageForm.background_color}
Create a clean, professional text graphic.`;
    }
  };

  // Generate design via chat pipeline
  const handleGenerate = async () => {
    if (selectedMode === 'logo' && !logoForm.company_name.trim()) {
      setError('Please enter a company name');
      return;
    }
    if (selectedMode === 'text-image' && !textImageForm.text.trim()) {
      setError('Please enter text to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    
    // Clear previous progress
    progressStream.clear();

    // Build the message
    const message = buildMessage();

    // Create process card for UI
    const cardId = `card-${Date.now()}`;
    setProcessCard({
      id: cardId,
      query: message,
      steps: [],
      status: 'processing',
      isCollapsed: false
    });

    try {
      // Send via chat pipeline with skill hint
      const result = await sendMessage(
        message,
        [],  // no context files for design generation
        sessionId,
        null,  // active document
        null,  // current page
        null,  // integrations
        null,  // signal
        'design_generation'  // skill_hint
      );

      // Update process card with completion
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      // Handle artifacts (output images)
      if (result.new_artifacts && result.new_artifacts.length > 0) {
        const imageUrls = result.new_artifacts
          .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg'))
          .map(f => getFileUrl(f));
        setGeneratedImages(imageUrls);
      }
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Generation failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to generate design');
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    handleGenerate();
  };

  // Download image
  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const name = selectedMode === 'logo' 
        ? logoForm.company_name.replace(/\s+/g, '-').toLowerCase()
        : 'text-image';
      a.download = `${name}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-light-bg/80 backdrop-blur-md border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-accent-100 rounded-lg">
                  <Palette className="w-5 h-5 text-brand-accent-600" />
                </div>
                <span className="text-lg font-semibold text-light-text">Design Generation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-light-text-secondary uppercase tracking-wider mb-4">
            Design Mode
          </h2>
          <div className="flex gap-4">
            {designModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex-1 max-w-xs p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-accent-500 bg-brand-accent-50'
                      : 'border-light-border bg-white hover:border-brand-accent-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-brand-accent-500' : 'bg-brand-accent-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-brand-accent-600'}`} />
                  </div>
                  <h3 className="font-semibold text-light-text mb-1">{mode.name}</h3>
                  <p className="text-xs text-light-text-secondary">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-light-border p-6">
              <h3 className="font-semibold text-light-text mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-accent-500" />
                {selectedMode === 'logo' ? 'Logo Details' : 'Text Image Settings'}
              </h3>

              {selectedMode === 'logo' ? (
                <div className="space-y-5">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Company / Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={logoForm.company_name}
                      onChange={(e) => setLogoForm({...logoForm, company_name: e.target.value})}
                      placeholder="Enter name"
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Tagline (Optional)
                    </label>
                    <input
                      type="text"
                      value={logoForm.tagline}
                      onChange={(e) => setLogoForm({...logoForm, tagline: e.target.value})}
                      placeholder="Your company tagline"
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Description (Keywords)
                    </label>
                    <textarea
                      value={logoForm.description}
                      onChange={(e) => setLogoForm({...logoForm, description: e.target.value})}
                      rows={2}
                      placeholder="e.g., tech, innovative, professional, modern"
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    />
                  </div>

                  {/* Logo Type */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Logo Type
                    </label>
                    <select
                      value={logoForm.logo_type}
                      onChange={(e) => setLogoForm({...logoForm, logo_type: e.target.value})}
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    >
                      {logoTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Style
                    </label>
                    <select
                      value={logoForm.style}
                      onChange={(e) => setLogoForm({...logoForm, style: e.target.value})}
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    >
                      {logoStyles.map((style) => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Color Preferences (Select up to 3)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {commonColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            logoForm.color_preferences?.includes(color)
                              ? 'border-brand-accent-500 ring-2 ring-brand-accent-200 scale-110'
                              : 'border-light-border hover:border-brand-accent-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    {logoForm.color_preferences?.length > 0 && (
                      <p className="text-xs text-light-text-secondary mt-2">
                        Selected: {logoForm.color_preferences.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Text */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={textImageForm.text}
                      onChange={(e) => setTextImageForm({...textImageForm, text: e.target.value})}
                      placeholder="Enter text to generate"
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    />
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Style
                    </label>
                    <select
                      value={textImageForm.style}
                      onChange={(e) => setTextImageForm({...textImageForm, style: e.target.value})}
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    >
                      {logoStyles.map((style) => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textImageForm.color}
                          onChange={(e) => setTextImageForm({...textImageForm, color: e.target.value})}
                          className="w-10 h-10 rounded-lg border border-light-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textImageForm.color}
                          onChange={(e) => setTextImageForm({...textImageForm, color: e.target.value})}
                          className="flex-1 px-3 py-2 border border-light-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">
                        Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textImageForm.background_color}
                          onChange={(e) => setTextImageForm({...textImageForm, background_color: e.target.value})}
                          className="w-10 h-10 rounded-lg border border-light-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textImageForm.background_color}
                          onChange={(e) => setTextImageForm({...textImageForm, background_color: e.target.value})}
                          className="flex-1 px-3 py-2 border border-light-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 py-3 bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white rounded-xl font-semibold
                           hover:from-brand-accent-600 hover:to-brand-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {selectedMode === 'logo' ? 'Logo' : 'Image'}
                  </>
                )}
              </button>
            </div>

            {error && !processCard && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-xl border border-light-border p-6">
            <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-accent-500" />
              Generated Designs
            </h3>

            {/* Show ProcessCard during/after processing, otherwise show results or placeholder */}
            {processCard && (processCard.status === 'processing' || (processCard.status === 'completed' && generatedImages.length === 0) || processCard.status === 'error') ? (
              <div className="space-y-4">
                <ProcessCard
                  title="Design Generation"
                  query={processCard.query}
                  steps={processCard.steps}
                  finalResult={processCard.finalResult}
                  artifacts={[]}
                  status={processCard.status}
                  isCollapsed={processCard.isCollapsed}
                  onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                  onRetry={handleRetry}
                />
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="space-y-4">
                <div className={`grid gap-4 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {generatedImages.map((imageUrl, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl border border-light-border overflow-hidden bg-white">
                        <img
                          src={imageUrl}
                          alt={`Generated design ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(imageUrl, index)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-light-text" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-brand-accent-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Collapsed process card below results */}
                {processCard && processCard.status === 'completed' && (
                  <ProcessCard
                    title="Processing Details"
                    query={processCard.query}
                    steps={processCard.steps}
                    finalResult={processCard.finalResult}
                    artifacts={[]}
                    status={processCard.status}
                    isCollapsed={true}
                    onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-light-bg border border-light-border flex items-center justify-center">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 mx-auto text-light-text-muted opacity-30 mb-4" />
                  <p className="text-light-text-secondary">Fill in the form and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignGenerationPage;
