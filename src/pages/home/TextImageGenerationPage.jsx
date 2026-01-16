import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Type, ArrowLeft, Loader2, Download, Save, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../../api/chat';
import { getFileUrl } from '../../api/files';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';

const TextImageGenerationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'bold', label: 'Bold' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'playful', label: 'Playful' },
    { value: 'professional', label: 'Professional' },
    { value: 'artistic', label: 'Artistic' }
  ];

  // Chat pipeline state
  const [sessionId] = useState(() => `text-image-gen-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);

  const processCardRef = useRef(processCard);

  // Keep ref in sync with processCard
  useEffect(() => {
    processCardRef.current = processCard;
  }, [processCard]);

  // Update process card with progress stream
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

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    // Clear previous progress
    progressStream.clear();

    // Build the message for text image generation
    const message = `Generate a text-based image with the following text: "${text.trim()}"
${description ? `Description/Style context: ${description.trim()}` : ''}
Style: ${style}

Create a visually appealing image with the text prominently displayed. Use ${style} typography style and design elements. The text should be the main focus of the image.`;

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
        [], // no context files
        sessionId,
        null, // active document
        null, // current page
        null, // integrations
        null, // signal
        'imagegen' // skill_hint - routes to imagegen skill
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
        
        setGeneratedImage(getFileUrl(imageArtifact));
      }
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Text image generation failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to generate text image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `text-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleSave = async () => {
    // For now, save functionality can be similar to download
    // In a full implementation, this would save to user's gallery/library
    handleDownload();
  };

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home/ai-generation')}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Type className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Text Image Generation
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Text Image Details
              </h3>
              
              {/* Text Input */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text to display in the image..."
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                      : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                  disabled={isGenerating}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context about the design, colors, or layout..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border resize-none transition-all ${
                    isDark
                      ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                      : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                  disabled={isGenerating}
                />
              </div>

              {/* Style Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-dark-sidebar border-dark-border text-dark-text focus:border-brand-accent-500'
                      : 'bg-light-bg border-light-border text-light-text focus:border-brand-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                  disabled={isGenerating}
                >
                  {styleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating}
                className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                    : 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Text Image
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

            {/* Process Card */}
            {processCard && (processCard.status === 'processing' || processCard.status === 'error') && (
              <ProcessCard
                title="Text Image Generation"
                query={processCard.query}
                steps={processCard.steps}
                finalResult={processCard.finalResult}
                artifacts={[]}
                status={processCard.status}
                isCollapsed={processCard.isCollapsed}
                onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                onRetry={handleGenerate}
              />
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Type className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Generated Text Image
              </h3>
              {generatedImage && (
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

            {/* Image Preview */}
            {generatedImage ? (
              <div className="space-y-4">
                <div className={`aspect-square rounded-xl overflow-hidden border ${
                  isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                } flex items-center justify-center`}>
                  <img
                    src={generatedImage}
                    alt="Generated text image"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {/* Collapsed process card below image */}
                {processCard && processCard.status === 'completed' && (
                  <ProcessCard
                    title="Generation Details"
                    query={processCard.query}
                    steps={processCard.steps}
                    finalResult={processCard.finalResult}
                    artifacts={[]}
                    status={processCard.status}
                    isCollapsed={true}
                    onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                    onRetry={handleGenerate}
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
                  <Type className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Enter text and click Generate to create a text image
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

export default TextImageGenerationPage;

