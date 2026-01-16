import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Image, ArrowLeft, Loader2, Download, Save, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../../api/chat';
import { getFileUrl } from '../../api/files';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';

const ImageGenerationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  // Chat pipeline state
  const [sessionId] = useState(() => `image-gen-${Date.now()}`);
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
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    // Clear previous progress
    progressStream.clear();

    // Build the message for image generation
    const message = `Generate an image based on this description: "${description.trim()}"
    
Create a high-quality, professional image that matches the description. Use appropriate style, colors, and composition.`;

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
        finalResult: err.response?.data?.detail || err.message || 'Image generation failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to generate image');
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
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;
    
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
            <Image className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Image Generation
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
                Describe Your Image
              </h3>
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A serene mountain landscape at sunset with a lake reflecting the colors..."
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border resize-none transition-all ${
                  isDark
                    ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                    : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                disabled={isGenerating}
              />

              <button
                onClick={handleGenerate}
                disabled={!description.trim() || isGenerating}
                className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
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
                    Generate Image
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
                title="Image Generation"
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
                <Image className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Generated Image
              </h3>
              {generatedImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-dark-sidebar border border-dark-border text-dark-text hover:bg-dark-sidebar/80'
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
                    alt="Generated"
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
                  <Image className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Enter a description and click Generate to create an image
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

export default ImageGenerationPage;

