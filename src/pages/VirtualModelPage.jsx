import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, ArrowLeft, Loader2, Upload, X, Download, Sparkles,
  Image as ImageIcon, Info
} from 'lucide-react';
import { uploadFile, getFileUrl } from '../api/files';
import { sendMessage } from '../api/chat';
import { useProgressStream } from '../hooks/useProgressStream';
import ProcessCard from '../components/progress/ProcessCard';

// Mode configurations
const modes = [
  {
    id: 'virtual-model',
    name: 'Virtual Model',
    description: 'Generate a product worn by an AI-generated model based on description',
    icon: User,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'virtual-tryon',
    name: 'Virtual Try-On',
    description: 'Apply clothing to a user-provided model image',
    icon: ImageIcon,
    color: 'from-blue-500 to-cyan-500'
  }
];

// Model types for virtual model
const modelTypes = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Gender Neutral' }
];

// Pose options
const poseOptions = [
  { value: 'front', label: 'Front View' },
  { value: 'side', label: 'Side View' },
  { value: 'three-quarter', label: '3/4 View' },
  { value: 'walking', label: 'Walking' },
  { value: 'sitting', label: 'Sitting' }
];

// Background styles
const backgroundStyles = [
  { value: 'studio', label: 'Studio White' },
  { value: 'urban', label: 'Urban' },
  { value: 'nature', label: 'Nature' },
  { value: 'minimal', label: 'Minimal Gray' },
  { value: 'gradient', label: 'Gradient' }
];

function VirtualModelPage() {
  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  
  // Product image state
  const [productImage, setProductImage] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  
  // Model image state (for try-on)
  const [modelImage, setModelImage] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  
  // Drag state
  const [dragActiveProduct, setDragActiveProduct] = useState(false);
  const [dragActiveModel, setDragActiveModel] = useState(false);
  
  // Form data for virtual model
  const [formData, setFormData] = useState({
    model_type: 'female',
    pose: 'front',
    background: 'studio',
    model_description: '',
    additional_context: ''
  });

  // Chat pipeline state
  const [sessionId] = useState(() => `virtual-model-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);
  
  const productInputRef = useRef(null);
  const modelInputRef = useRef(null);

  // Update process card with progress stream
  useEffect(() => {
    if (progressStream.items.length > 0 && processCard && processCard.status === 'processing') {
      setProcessCard(prev => prev ? { ...prev, steps: progressStream.items } : null);
    }
  }, [progressStream.items, processCard]);

  // Handle product file selection
  const handleProductSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingProduct(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setProductImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setProductFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload product image');
    } finally {
      setIsUploadingProduct(false);
    }
  };

  // Handle model file selection (for try-on)
  const handleModelSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingModel(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setModelImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setModelFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload model image');
    } finally {
      setIsUploadingModel(false);
    }
  };

  // Drag handlers
  const createDragHandlers = (setDragActive, handleFile) => ({
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); },
    onDragLeave: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); },
    onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    }
  });

  // Clear product image
  const handleRemoveProduct = () => {
    setProductImage(null);
    setProductFile(null);
    setResultImage(null);
    setProcessCard(null);
    if (productInputRef.current) productInputRef.current.value = '';
  };

  // Clear model image
  const handleRemoveModel = () => {
    setModelImage(null);
    setModelFile(null);
    if (modelInputRef.current) modelInputRef.current.value = '';
  };

  // Build message based on mode and settings
  const buildMessage = () => {
    if (selectedMode.id === 'virtual-model') {
      return `Generate a virtual model image wearing the product from "${productFile.filename}".
Model type: ${formData.model_type}
Pose: ${formData.pose}
Background style: ${formData.background}
${formData.model_description ? `Model description: ${formData.model_description}` : ''}
${formData.additional_context ? `Additional context: ${formData.additional_context}` : ''}

Create a realistic, professional fashion photography image showing the product worn by an AI-generated model.
The product should be prominently displayed and accurately represented.`;
    } else {
      return `Perform a virtual try-on: apply the clothing/product from "${productFile.filename}" to the model image "${modelFile.filename}".
Preserve the model's pose and appearance while realistically fitting the product onto them.
Create a natural, professional-looking result suitable for e-commerce or fashion marketing.`;
    }
  };

  // Process via chat pipeline
  const handleProcess = async () => {
    if (!productFile) {
      setError('Please upload a product image first');
      return;
    }

    if (selectedMode.id === 'virtual-tryon' && !modelFile) {
      setError('Please upload a model image for virtual try-on');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);

    // Clear previous progress
    progressStream.clear();

    // Build the message
    const message = buildMessage();

    // Prepare context files
    const contextFiles = [productFile.filename];
    if (selectedMode.id === 'virtual-tryon' && modelFile) {
      contextFiles.push(modelFile.filename);
    }

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
        contextFiles,
        sessionId,
        null,  // active document
        null,  // current page
        null,  // integrations
        null,  // signal
        'virtual_model'  // skill_hint
      );

      // Update process card with completion
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      // Handle artifacts (output images)
      if (result.new_artifacts && result.new_artifacts.length > 0) {
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
      setError(err.response?.data?.detail || err.message || 'Failed to process');
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
      a.download = `${selectedMode.id}-result.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const ModeIcon = selectedMode.icon;

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
                  <User className="w-5 h-5 text-brand-accent-600" />
                </div>
                <span className="text-lg font-semibold text-light-text">Virtual Model</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-light-text-secondary uppercase tracking-wider mb-4">
            Select Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode.id === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode)}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-accent-500 bg-brand-accent-50'
                      : 'border-light-border bg-white hover:border-brand-accent-300'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r ${mode.color}`} />
                  )}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${mode.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-light-text mb-1">{mode.name}</h3>
                  <p className="text-sm text-light-text-secondary">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload & Settings */}
          <div className="space-y-6">
            {/* Product Upload */}
            <div className="bg-white rounded-xl border border-light-border p-6">
              <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-accent-500" />
                Upload Product Image
              </h3>
              
              <input
                ref={productInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleProductSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div
                {...createDragHandlers(setDragActiveProduct, handleProductSelect)}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActiveProduct ? 'border-brand-accent-500 bg-brand-accent-50' : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                }`}
              >
                {productImage ? (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt="Product"
                      className="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={handleRemoveProduct}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isUploadingProduct ? (
                      <Loader2 className="w-10 h-10 mx-auto text-brand-accent-500 animate-spin" />
                    ) : (
                      <Upload className="w-10 h-10 mx-auto text-light-text-muted" />
                    )}
                    <div>
                      <p className="text-sm text-light-text-secondary mb-2">
                        Drag product image or
                      </p>
                      <button
                        onClick={() => productInputRef.current?.click()}
                        disabled={isUploadingProduct}
                        className="px-4 py-2 bg-brand-accent-500 text-white rounded-lg font-medium text-sm hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Model Upload (for try-on) */}
            {selectedMode.id === 'virtual-tryon' && (
              <div className="bg-white rounded-xl border border-light-border p-6">
                <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-accent-500" />
                  Upload Model Image
                </h3>
                
                <input
                  ref={modelInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleModelSelect(e.target.files[0])}
                  className="hidden"
                />
                
                <div
                  {...createDragHandlers(setDragActiveModel, handleModelSelect)}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragActiveModel ? 'border-brand-accent-500 bg-brand-accent-50' : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                  }`}
                >
                  {modelImage ? (
                    <div className="relative">
                      <img
                        src={modelImage}
                        alt="Model"
                        className="max-h-48 mx-auto rounded-lg shadow-sm"
                      />
                      <button
                        onClick={handleRemoveModel}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isUploadingModel ? (
                        <Loader2 className="w-10 h-10 mx-auto text-brand-accent-500 animate-spin" />
                      ) : (
                        <User className="w-10 h-10 mx-auto text-light-text-muted" />
                      )}
                      <div>
                        <p className="text-sm text-light-text-secondary mb-2">
                          Drag model image or
                        </p>
                        <button
                          onClick={() => modelInputRef.current?.click()}
                          disabled={isUploadingModel}
                          className="px-4 py-2 bg-brand-accent-500 text-white rounded-lg font-medium text-sm hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                        >
                          Browse Files
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex items-start gap-2 text-xs text-light-text-secondary bg-blue-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>For best results, use a clear full-body or upper-body photo with good lighting.</p>
                </div>
              </div>
            )}

            {/* Settings (for virtual model) */}
            {selectedMode.id === 'virtual-model' && (
              <div className="bg-white rounded-xl border border-light-border p-6">
                <h3 className="font-semibold text-light-text mb-4 flex items-center gap-2">
                  <ModeIcon className="w-4 h-4 text-brand-accent-500" />
                  Model Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">Model Type</label>
                      <select
                        value={formData.model_type}
                        onChange={(e) => setFormData({...formData, model_type: e.target.value})}
                        className="w-full px-3 py-2 border border-light-border rounded-lg text-sm bg-white"
                      >
                        {modelTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text mb-2">Pose</label>
                      <select
                        value={formData.pose}
                        onChange={(e) => setFormData({...formData, pose: e.target.value})}
                        className="w-full px-3 py-2 border border-light-border rounded-lg text-sm bg-white"
                      >
                        {poseOptions.map((pose) => (
                          <option key={pose.value} value={pose.value}>{pose.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">Background</label>
                    <select
                      value={formData.background}
                      onChange={(e) => setFormData({...formData, background: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border rounded-lg text-sm bg-white"
                    >
                      {backgroundStyles.map((bg) => (
                        <option key={bg.value} value={bg.value}>{bg.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Model Description (Optional)
                    </label>
                    <textarea
                      value={formData.model_description}
                      onChange={(e) => setFormData({...formData, model_description: e.target.value})}
                      rows={2}
                      placeholder="e.g., professional model with short hair, casual expression..."
                      className="w-full px-3 py-2 border border-light-border rounded-lg text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!productFile || isProcessing || (selectedMode.id === 'virtual-tryon' && !modelFile)}
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
                  Generate {selectedMode.id === 'virtual-model' ? 'Virtual Model' : 'Try-On'}
                </>
              )}
            </button>

            {error && !processCard && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Result */}
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

            {/* Show ProcessCard during/after processing, otherwise show results or placeholder */}
            {processCard && (processCard.status === 'processing' || (processCard.status === 'completed' && !resultImage) || processCard.status === 'error') ? (
              <div className="space-y-4">
                <ProcessCard
                  title="Virtual Model"
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
                <div className="aspect-[3/4] rounded-xl bg-light-bg border border-light-border flex items-center justify-center overflow-hidden">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
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
              <div className="aspect-[3/4] rounded-xl bg-light-bg border border-light-border flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <User className="w-20 h-20 mx-auto text-light-text-muted opacity-30 mb-4" />
                  <p className="text-light-text-secondary">Upload a product image and generate</p>
                  <p className="text-sm text-light-text-muted mt-1">Results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualModelPage;
