import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Layers, ArrowLeft, Loader2, Download, Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, getFileUrl } from '../../api/files';
import { sendMessage } from '../../api/chat';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';

const FlatLayPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Chat pipeline state
  const [sessionId] = useState(() => `flat-lay-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);

  const processCardRef = useRef(processCard);

  useEffect(() => {
    processCardRef.current = processCard;
  }, [processCard]);

  useEffect(() => {
    const currentCard = processCardRef.current;
    if (progressStream.items.length > 0 && currentCard && currentCard.status === 'processing') {
      const currentStepsLength = currentCard.steps?.length || 0;
      if (progressStream.items.length !== currentStepsLength) {
        setProcessCard(prev => {
          if (!prev || prev.status !== 'processing') return prev;
          return { ...prev, steps: [...progressStream.items] };
        });
      }
    }
  }, [progressStream.items.length]);

  const handleFileSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setUploadedFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleProcess = async () => {
    if (!uploadedFile) {
      setError('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    progressStream.clear();

    const message = `Create a flat lay catalog image from the uploaded product photo "${uploadedFile.filename}".
Remove the background, segment the product, and place it centered on a clean white background.
Create a professional e-commerce catalog style image.`;

    const cardId = `card-${Date.now()}`;
    setProcessCard({
      id: cardId,
      query: message,
      steps: [],
      status: 'processing',
      isCollapsed: false
    });

    try {
      const result = await sendMessage(
        message,
        [uploadedFile.filename],
        sessionId,
        null,
        null,
        null,
        null,
        'product_photography'
      );

      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

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
      setError(err.response?.data?.detail || err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flat-lay-result-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleSave = async () => {
    handleDownload();
  };

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home/product-design')}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Layers className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Flat Lay
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Upload className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Upload Product Image
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
                  dragActive 
                    ? 'border-brand-accent-500 bg-brand-accent-50/50' 
                    : isDark
                      ? 'border-dark-border bg-dark-sidebar hover:border-brand-accent-500/50'
                      : 'border-light-border bg-light-bg hover:border-brand-accent-300'
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
                      <Upload className={`w-12 h-12 mx-auto ${
                        isDark ? 'text-dark-text-muted' : 'text-light-text-muted'
                      }`} />
                    )}
                    <div>
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
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

              <button
                onClick={handleProcess}
                disabled={!uploadedFile || isProcessing}
                className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                    : 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Layers className="w-5 h-5" />
                    Process Image
                  </>
                )}
              </button>

              {error && !processCard && (
                <div className={`mt-4 p-4 rounded-xl text-sm ${
                  isDark
                    ? 'bg-red-900/30 border border-red-800 text-red-300'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {error}
                </div>
              )}
            </div>

            {processCard && (processCard.status === 'processing' || processCard.status === 'error') && (
              <ProcessCard
                title="Flat Lay Processing"
                query={processCard.query}
                steps={processCard.steps}
                finalResult={processCard.finalResult}
                artifacts={[]}
                status={processCard.status}
                isCollapsed={processCard.isCollapsed}
                onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                onRetry={handleProcess}
              />
            )}
          </div>

          {/* Right Panel - Result */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Layers className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Result Preview
              </h3>
              {resultImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-dark-sidebar border border-dark-border text-dark-text hover:bg-dark-surface'
                        : 'bg-light-surface border border-light-border text-light-text hover:bg-light-bg'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-brand-accent-500/20 border border-brand-accent-500/30 text-brand-accent-400 hover:bg-brand-accent-500/30'
                        : 'bg-brand-accent-50 border border-brand-accent-200 text-brand-accent-600 hover:bg-brand-accent-100'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {resultImage ? (
              <div className="space-y-4">
                <div className={`aspect-square rounded-xl overflow-hidden border ${
                  isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                } flex items-center justify-center`}>
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
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
                    onRetry={handleProcess}
                  />
                )}
              </div>
            ) : (
              <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center ${
                isDark 
                  ? 'bg-dark-sidebar border-dark-border' 
                  : 'bg-light-bg border-light-border'
              }`}>
                <div className="text-center p-8">
                  <Layers className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Upload an image and click Process to see results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatLayPage;

