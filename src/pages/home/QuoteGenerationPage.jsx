import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Quote, ArrowLeft, Loader2, Copy, Check, Hash, Image, Download, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../../api/chat';
import { getFileUrl } from '../../api/files';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';
import { motion } from 'framer-motion';

const QuoteGenerationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [generateWithImage, setGenerateWithImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'playful', label: 'Playful' },
    { value: 'modern', label: 'Modern' },
    { value: 'casual', label: 'Casual' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'creative', label: 'Creative' }
  ];

  // Chat pipeline state
  const [sessionId] = useState(() => `quote-gen-${Date.now()}`);
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
    setGeneratedQuote('');
    setGeneratedHashtags([]);
    setGeneratedImage(null);

    // Clear previous progress
    progressStream.clear();

    // Build the message for quote generation
    const hashtagInstruction = includeHashtags 
      ? ' Also generate relevant hashtags for social media.' 
      : '';
    
    const imageInstruction = generateWithImage
      ? ' Generate this quote as a visually appealing image with the quote text overlaid. Create a professional quote image suitable for social media sharing.'
      : '';
    
    const message = `Generate a ${tone} quote based on this description: "${description.trim()}"
    
Tone: ${tone}${hashtagInstruction}${imageInstruction}
Create an engaging, memorable quote that captures the essence of the description.`;

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
      // Send via chat pipeline with skill hint for image generation if needed
      const skillHint = generateWithImage ? 'imagegen' : null;
      
      const result = await sendMessage(
        message,
        [], // no context files
        sessionId,
        null, // active document
        null, // current page
        null, // integrations
        null, // signal
        skillHint // skill hint for image generation
      );

      // Update process card with completion
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      // Handle image artifacts first
      if (result.new_artifacts && result.new_artifacts.length > 0) {
        const imageArtifact = result.new_artifacts.find(f => 
          f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
        );
        
        if (imageArtifact) {
          setGeneratedImage(getFileUrl(imageArtifact));
          // If image is generated, still try to extract text quote and hashtags from response
          const responseText = result.response || '';
          const hashtagMatch = responseText.match(/#[\w]+/g);
          let quote = responseText;
          let hashtags = [];

          if (includeHashtags && hashtagMatch) {
            quote = responseText.replace(/#[\w]+/g, '').trim();
            hashtags = hashtagMatch.map(tag => tag.replace('#', ''));
          }

          setGeneratedQuote(quote || responseText);
          setGeneratedHashtags(hashtags);
          return; // Exit early if image was found
        }
      }

      // Parse the response to extract quote and hashtags (text-only)
      const responseText = result.response || '';
      
      // Extract quote (everything before hashtags)
      const hashtagMatch = responseText.match(/#[\w]+/g);
      let quote = responseText;
      let hashtags = [];

      if (includeHashtags && hashtagMatch) {
        // Remove hashtags from quote text
        quote = responseText.replace(/#[\w]+/g, '').trim();
        hashtags = hashtagMatch.map(tag => tag.replace('#', ''));
      } else if (includeHashtags) {
        // If hashtags were requested but not found, try to extract them from the end
        const lines = responseText.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.includes('#')) {
          const extractedHashtags = lastLine.match(/#[\w]+/g);
          if (extractedHashtags) {
            hashtags = extractedHashtags.map(tag => tag.replace('#', ''));
            quote = lines.slice(0, -1).join('\n').trim();
          }
        }
      }

      setGeneratedQuote(quote || responseText);
      setGeneratedHashtags(hashtags);
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Quote generation failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to generate quote');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQuote = async () => {
    if (!generatedQuote) return;
    
    try {
      await navigator.clipboard.writeText(generatedQuote);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    } catch (err) {
      setError('Failed to copy quote');
    }
  };

  const handleCopyHashtags = async () => {
    if (generatedHashtags.length === 0) return;
    
    const hashtagsText = generatedHashtags.map(tag => `#${tag}`).join(' ');
    try {
      await navigator.clipboard.writeText(hashtagsText);
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } catch (err) {
      setError('Failed to copy hashtags');
    }
  };

  const handleCopyHashtag = async (hashtag) => {
    try {
      await navigator.clipboard.writeText(`#${hashtag}`);
      // Show brief feedback (could add toast notification here)
    } catch (err) {
      setError('Failed to copy hashtag');
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleSaveImage = async () => {
    // For now, save functionality can be similar to download
    // In a full implementation, this would save to user's gallery/library
    handleDownloadImage();
  };

  const handleSaveQuote = async () => {
    if (!generatedQuote) return;
    
    try {
      const content = generatedQuote + (generatedHashtags.length > 0 
        ? '\n\n' + generatedHashtags.map(tag => `#${tag}`).join(' ')
        : '');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to save quote');
    }
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
            <Quote className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Quote Generation
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
                <Quote className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Quote Details
              </h3>
              
              {/* Description */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A motivational quote about perseverance and success..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border resize-none transition-all ${
                    isDark
                      ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                      : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                  disabled={isGenerating}
                />
              </div>

              {/* Tone Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-dark-sidebar border-dark-border text-dark-text focus:border-brand-accent-500'
                      : 'bg-light-bg border-light-border text-light-text focus:border-brand-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                  disabled={isGenerating}
                >
                  {toneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hashtags Checkbox */}
              <div className="mb-4">
                <label className={`flex items-center gap-2 cursor-pointer ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className={`w-4 h-4 rounded border-2 transition-all ${
                      isDark
                        ? 'border-dark-border bg-dark-sidebar checked:bg-brand-accent-500 checked:border-brand-accent-500'
                        : 'border-light-border bg-light-bg checked:bg-brand-accent-500 checked:border-brand-accent-500'
                    } focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isGenerating}
                  />
                  <span className="text-sm font-medium">Include hashtags</span>
                </label>
              </div>

              {/* Generate with Image Checkbox */}
              <div className="mb-6">
                <label className={`flex items-center gap-2 cursor-pointer ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  <input
                    type="checkbox"
                    checked={generateWithImage}
                    onChange={(e) => setGenerateWithImage(e.target.checked)}
                    className={`w-4 h-4 rounded border-2 transition-all ${
                      isDark
                        ? 'border-dark-border bg-dark-sidebar checked:bg-brand-accent-500 checked:border-brand-accent-500'
                        : 'border-light-border bg-light-bg checked:bg-brand-accent-500 checked:border-brand-accent-500'
                    } focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isGenerating}
                  />
                  <span className="text-sm font-medium">Generate with image</span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!description.trim() || isGenerating}
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
                    <Quote className="w-5 h-5" />
                    Generate Quote
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
                title="Quote Generation"
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

          {/* Right Panel - Output */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                {generatedImage ? (
                  <Image className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                ) : (
                  <Quote className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                )}
                {generatedImage ? 'Generated Quote Image' : 'Generated Quote'}
              </h3>
              {generatedImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveImage}
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
                    onClick={handleDownloadImage}
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
              {generatedQuote && !generatedImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveQuote}
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
                    onClick={handleCopyQuote}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-brand-accent-500/20 border border-brand-accent-500/30 text-brand-accent-400 hover:bg-brand-accent-500/30'
                        : 'bg-brand-accent-50 border border-brand-accent-200 text-brand-accent-600 hover:bg-brand-accent-100'
                    }`}
                  >
                    {copiedQuote ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quote Display */}
            {generatedQuote || generatedImage ? (
              <div className="space-y-6">
                {/* Image Display */}
                {generatedImage && (
                  <div className={`aspect-square rounded-xl overflow-hidden border ${
                    isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                  } flex items-center justify-center`}>
                    <img
                      src={generatedImage}
                      alt="Generated quote"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Text Quote Display */}
                {generatedQuote && !generatedImage && (
                  <div className={`p-6 rounded-xl border-2 ${
                    isDark 
                      ? 'bg-dark-sidebar border-brand-accent-500/30' 
                      : 'bg-light-bg border-brand-accent-200'
                  }`}>
                    <p className={`text-lg leading-relaxed ${
                      isDark ? 'text-dark-text' : 'text-light-text'
                    }`}>
                      {generatedQuote}
                    </p>
                  </div>
                )}

                {/* Hashtags Section */}
                {includeHashtags && generatedHashtags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        <Hash className="w-4 h-4" />
                        Hashtags
                      </h4>
                      <button
                        onClick={handleCopyHashtags}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          isDark
                            ? 'bg-dark-sidebar border border-dark-border text-dark-text-secondary hover:bg-dark-surface'
                            : 'bg-light-surface border border-light-border text-light-text-secondary hover:bg-light-bg'
                        }`}
                      >
                        {copiedHashtags ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy All
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedHashtags.map((hashtag, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyHashtag(hashtag)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isDark
                              ? 'bg-brand-accent-500/20 border border-brand-accent-500/30 text-brand-accent-400 hover:bg-brand-accent-500/30'
                              : 'bg-brand-accent-50 border border-brand-accent-200 text-brand-accent-600 hover:bg-brand-accent-100'
                          }`}
                        >
                          <Hash className="w-3 h-3" />
                          {hashtag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsed process card */}
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
              <div className={`p-12 rounded-xl border-2 border-dashed flex items-center justify-center ${
                isDark 
                  ? 'bg-dark-sidebar border-dark-border' 
                  : 'bg-light-bg border-light-border'
              }`}>
                <div className="text-center">
                  <Quote className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Enter a description and click Generate to create a quote
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

export default QuoteGenerationPage;

