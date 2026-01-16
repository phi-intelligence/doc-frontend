import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Camera, Upload, ArrowLeft, Loader2, X, Download,
  Layers, Package, Sparkles, Image as ImageIcon, ChevronDown, Check
} from 'lucide-react';
import { uploadFile, getFileUrl } from '../api/files';
import { sendMessage } from '../api/chat';
import { useProgressStream } from '../hooks/useProgressStream';
import ProcessCard from '../components/progress/ProcessCard';
import { useTheme } from '../context/ThemeContext';

// Feature definitions
const features = [
  {
    id: 'flat-lay',
    name: 'Flat Lay',
    icon: Layers,
    description: 'Remove background and center product on clean background',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ghost-mannequin',
    name: 'Ghost Mannequin',
    icon: Package,
    description: 'Remove mannequin while preserving garment shape',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'product-staging',
    name: 'Product Staging',
    icon: ImageIcon,
    description: 'Place product in AI-generated environment',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'enhancement',
    name: 'Photo Enhancement',
    icon: Sparkles,
    description: 'Apply professional photography styles',
    color: 'from-green-500 to-emerald-500'
  }
];

// Size presets for flat lay
const sizePresets = {
  'instagram-feed': { width: 1080, height: 1080, label: 'Instagram Feed (1:1)' },
  'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story (9:16)' },
  'linkedin': { width: 1200, height: 627, label: 'LinkedIn Post' },
  'facebook': { width: 1200, height: 630, label: 'Facebook Post' },
  'twitter': { width: 1200, height: 675, label: 'Twitter Post' },
  'custom': { width: null, height: null, label: 'Custom Size' }
};

const ProductPhotographyPage = () => {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Feature-specific settings
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [sizePreset, setSizePreset] = useState('instagram-feed');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [enhancementStyle, setEnhancementStyle] = useState('professional');
  
  // Chat pipeline state
  const [sessionId] = useState(() => `product-photo-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);
  
  const fileInputRef = useRef(null);
  const processCardRef = useRef(processCard);

  // Keep ref in sync with processCard
  useEffect(() => {
    processCardRef.current = processCard;
  }, [processCard]);

  // Update process card with progress stream
  useEffect(() => {
    const currentCard = processCardRef.current;
    if (progressStream.items.length > 0 && currentCard && currentCard.status === 'processing') {
      // Only update if steps actually changed (compare lengths to avoid infinite loop)
      const currentStepsLength = currentCard.steps?.length || 0;
      if (progressStream.items.length !== currentStepsLength) {
        setProcessCard(prev => {
          if (!prev || prev.status !== 'processing') return prev;
          return { ...prev, steps: [...progressStream.items] };
        });
      }
    }
  }, [progressStream.items.length]);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
      
      // Upload file
      const response = await uploadFile(file);
      setUploadedFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setResultImage(null);
    setError(null);
    setProcessCard(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Build message based on selected feature
  const buildMessage = () => {
    const filename = uploadedFile.filename;
    
    switch (selectedFeature.id) {
      case 'flat-lay': {
        const preset = sizePresets[sizePreset];
        const width = sizePreset === 'custom' ? (parseInt(customWidth) || 1080) : preset.width;
        const height = sizePreset === 'custom' ? (parseInt(customHeight) || 1080) : preset.height;
        return `Create a flat lay catalog image from the uploaded product photo "${filename}".
Background color: ${backgroundColor}
Output dimensions: ${width}x${height} pixels
Mode: catalog (clean e-commerce style)
Remove the background, segment the product, and place it centered on the specified background color.`;
      }
      
      case 'ghost-mannequin':
        return `Process the clothing image "${filename}" using ghost mannequin technique.
Remove the mannequin while preserving the natural garment shape.
Create a clean, professional result suitable for e-commerce catalog.
Fill in any gaps left by mannequin removal naturally.`;
      
      case 'product-staging':
        return `Place the product from "${filename}" into an AI-generated environment.
Environment description: ${environmentDescription || 'Modern, clean studio setting with soft lighting'}
Keep the product pixels unchanged - only generate the surrounding scene.
Create a professional product staging image suitable for marketing.`;
      
      case 'enhancement':
        return `Enhance the product photo "${filename}" with professional photography styling.
Style: ${enhancementStyle}
Apply appropriate color correction, lighting adjustments, and professional finishing.
Maintain the product's accurate representation while improving visual appeal.`;
      
      default:
        return `Process the product image "${filename}" for e-commerce use.`;
    }
  };

  // Process image via chat pipeline
  const handleProcess = async () => {
    if (!uploadedFile) {
      setError('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    // Clear previous progress
    progressStream.clear();

    // Build the message based on feature settings
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
        [uploadedFile.filename],  // context files
        sessionId,
        null,  // active document
        null,  // current page
        null,  // integrations
        null,  // signal
        'product_photography'  // skill_hint - routes to product_photography skill
      );

      // Update process card with completion
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      // Handle artifacts (output images)
      if (result.new_artifacts && result.new_artifacts.length > 0) {
        // Find the image artifact
        const imageArtifact = result.new_artifacts.find(f => 
          f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
        ) || result.new_artifacts[0];
        
        setResultImage(getFileUrl(imageArtifact));
      }
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Processing failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    handleProcess();
  };

  // Download result
  const handleDownload = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFeature.id}-result.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const FeatureIcon = selectedFeature.icon;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
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
                  <Camera className="w-5 h-5 text-brand-accent-600" />
                </div>
                <span className="text-lg font-semibold text-light-text">Product Photography</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-light-text-secondary uppercase tracking-wider mb-4">
            Select Feature
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature.id === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-accent-500 bg-brand-accent-50'
                      : 'border-light-border bg-white hover:border-brand-accent-300'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r ${feature.color}`} />
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${feature.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-light-text mb-1">{feature.name}</h3>
                  <p className="text-xs text-light-text-secondary">{feature.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-white rounded-xl border border-light-border p-6">
              <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-accent-500" />
                Upload Image
              </h3>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive ? 'border-brand-accent-500 bg-brand-accent-50' : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                }`}
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-h-64 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isUploading ? (
                      <Loader2 className="w-12 h-12 mx-auto text-brand-accent-500 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto text-light-text-muted" />
                    )}
                    <div>
                      <p className="text-sm text-light-text-secondary mb-2">
                        Drag and drop your image here, or
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-brand-accent-500 text-white rounded-lg font-medium text-sm hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature-specific Settings */}
            <div className="bg-white rounded-xl border border-light-border p-6">
              <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
                <FeatureIcon className="w-4 h-4 text-brand-accent-500" />
                {selectedFeature.name} Settings
              </h3>
              
              {selectedFeature.id === 'flat-lay' && (
                <div className="space-y-4">
                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-light-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-light-border rounded-lg text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  
                  {/* Size Preset */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Output Size
                    </label>
                    <select
                      value={sizePreset}
                      onChange={(e) => setSizePreset(e.target.value)}
                      className="w-full px-3 py-2 border border-light-border rounded-lg text-sm bg-white"
                    >
                      {Object.entries(sizePresets).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Custom Size */}
                  {sizePreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          placeholder="1080"
                          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text mb-2">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          placeholder="1080"
                          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedFeature.id === 'product-staging' && (
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Environment Description
                  </label>
                  <textarea
                    value={environmentDescription}
                    onChange={(e) => setEnvironmentDescription(e.target.value)}
                    rows={3}
                    placeholder="e.g., Modern minimalist living room with natural lighting..."
                    className="w-full px-3 py-2 border border-light-border rounded-lg text-sm resize-none"
                  />
                </div>
              )}

              {selectedFeature.id === 'enhancement' && (
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Enhancement Style
                  </label>
                  <select
                    value={enhancementStyle}
                    onChange={(e) => setEnhancementStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-light-border rounded-lg text-sm bg-white"
                  >
                    <option value="professional">Professional Studio</option>
                    <option value="natural">Natural Lighting</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="soft">Soft & Airy</option>
                    <option value="vibrant">Vibrant Colors</option>
                  </select>
                </div>
              )}

              {selectedFeature.id === 'ghost-mannequin' && (
                <div className="text-sm text-light-text-secondary">
                  <p>Upload a clothing image worn on a mannequin. The AI will remove the mannequin while preserving the natural garment shape.</p>
                </div>
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!uploadedFile || isProcessing}
              className="w-full py-3 bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white rounded-xl font-semibold
                         hover:from-brand-accent-600 hover:to-brand-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Process Image
                </>
              )}
            </button>

            {error && !processCard && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Result Preview */}
          <div className="bg-white rounded-xl border border-light-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-light-text flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-accent-500" />
                Result Preview
              </h3>
              {resultImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent-50 text-brand-accent-600 rounded-lg text-sm font-medium hover:bg-brand-accent-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            {/* Show ProcessCard during/after processing, otherwise show result or placeholder */}
            {processCard && (processCard.status === 'processing' || (processCard.status === 'completed' && !resultImage) || processCard.status === 'error') ? (
              <div className="space-y-4">
                <ProcessCard
                  title="Product Photography"
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
            ) : resultImage ? (
              <div className="space-y-4">
                {/* Result image */}
                <div className="aspect-square rounded-xl bg-light-bg border border-light-border flex items-center justify-center overflow-hidden">
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {/* Collapsed process card below result */}
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
              <div className="aspect-square rounded-xl bg-light-bg border border-light-border flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <ImageIcon className="w-16 h-16 mx-auto text-light-text-muted opacity-30 mb-4" />
                  <p className="text-light-text-secondary">Upload an image and click Process to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPhotographyPage;
