import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, Loader2, Copy, Check, Hash, MessageSquare, Image, Save
} from 'lucide-react';
import { sendMessage } from '../api/chat';
import { getFileUrl } from '../api/files';
import { useProgressStream } from '../hooks/useProgressStream';
import ProcessCard from '../components/progress/ProcessCard';
import { useTheme } from '../context/ThemeContext';

const ContentGenerationPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [wordLength, setWordLength] = useState('500');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [createImage, setCreateImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Chat pipeline state
  const [sessionId] = useState(() => `content-gen-${Date.now()}`);
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

  // Generate content via chat pipeline
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    setGeneratedImage(null);
    setGeneratedHashtags([]);
    setCopied(false);

    // Clear previous progress
    progressStream.clear();

    // Build the message
    const hashtagInstruction = includeHashtags 
      ? ' Include relevant hashtags for social media.' 
      : '';
    
    const imageInstruction = createImage
      ? ' Generate this content as a visually appealing image with the text overlaid. Create a professional content image suitable for sharing.'
      : '';
    
    const wordLengthNum = parseInt(wordLength) || 500;
    
    const message = `Generate content based on this topic: "${topic.trim()}"
${description ? `Description/Context: ${description.trim()}` : ''}
Word length: Approximately ${wordLengthNum} words
${hashtagInstruction}${imageInstruction}

Create engaging, well-structured content that matches the topic and word count requirement.`;

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
      const skillHint = createImage ? 'imagegen' : null;
      
      const result = await sendMessage(
        message,
        [],  // no context files
        sessionId,
        null,  // active document
        null,  // current page
        null,  // integrations
        null,  // signal
        skillHint  // skill hint for image generation
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
          // If image is generated, still try to extract text content and hashtags
          const responseText = result.response || '';
          const hashtagMatch = responseText.match(/#[\w]+/g);
          let content = responseText;
          let hashtags = [];

          if (includeHashtags && hashtagMatch) {
            content = responseText.replace(/#[\w]+/g, '').trim();
            hashtags = hashtagMatch.map(tag => tag.replace('#', ''));
          }

          setGeneratedContent(content || responseText);
          setGeneratedHashtags(hashtags);
          return; // Exit early if image was found
        }
      }

      // Parse the response for text content
      const responseText = result.response || '';
      
      // Extract hashtags if requested
      const hashtagMatch = responseText.match(/#[\w]+/g);
      let content = responseText;
      let hashtags = [];

      if (includeHashtags && hashtagMatch) {
        content = responseText.replace(/#[\w]+/g, '').trim();
        hashtags = hashtagMatch.map(tag => tag.replace('#', ''));
      }

      setGeneratedContent(content || responseText);
      setGeneratedHashtags(hashtags);
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Generation failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Save content
  const handleSave = async () => {
    if (!generatedContent && !generatedImage) return;
    
    try {
      if (generatedImage) {
        // Save image
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Save text content
        const content = generatedContent + (generatedHashtags.length > 0 
          ? '\n\n' + generatedHashtags.map(tag => `#${tag}`).join(' ')
          : '');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to save content');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isDark 
          ? 'bg-dark-bg/80 border-dark-border' 
          : 'bg-light-bg/80 border-light-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                    : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isDark ? 'bg-brand-accent-500/20' : 'bg-brand-accent-100'
                }`}>
                  <Sparkles className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-600'}`} />
                </div>
                <span className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  Content Generation
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`font-semibold mb-6 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <MessageSquare className={`w-4 h-4 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Content Details
              </h3>

              <div className="space-y-5">
                {/* Topic */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What should the content be about?"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                      isDark
                        ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                        : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                    } border focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isGenerating}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Any specific details, key points, or context..."
                    className={`w-full px-4 py-2.5 rounded-lg text-sm resize-none transition-all ${
                      isDark
                        ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                        : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                    } border focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isGenerating}
                  />
                </div>

                {/* Word Length */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Word Length
                  </label>
                  <input
                    type="number"
                    value={wordLength}
                    onChange={(e) => setWordLength(e.target.value)}
                    placeholder="500"
                    min="100"
                    max="5000"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                      isDark
                        ? 'bg-dark-sidebar border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500'
                        : 'bg-light-bg border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500'
                    } border focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isGenerating}
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
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
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Include Hashtags
                    </span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${
                    isDark ? 'text-dark-text' : 'text-light-text'
                  }`}>
                    <input
                      type="checkbox"
                      checked={createImage}
                      onChange={(e) => setCreateImage(e.target.checked)}
                      className={`w-4 h-4 rounded border-2 transition-all ${
                        isDark
                          ? 'border-dark-border bg-dark-sidebar checked:bg-brand-accent-500 checked:border-brand-accent-500'
                          : 'border-light-border bg-light-bg checked:bg-brand-accent-500 checked:border-brand-accent-500'
                      } focus:ring-2 focus:ring-brand-accent-500/20`}
                      disabled={isGenerating}
                    />
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Image className="w-3 h-3" /> Create Image
                    </span>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
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
                    Generate Content
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
                title="Content Generation"
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

          {/* Right Panel - Generated Content */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                {generatedImage ? (
                  <Image className={`w-4 h-4 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                ) : (
                  <MessageSquare className={`w-4 h-4 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                )}
                {generatedImage ? 'Generated Content Image' : 'Generated Content'}
              </h3>
              {(generatedContent || generatedImage) && (
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
                  {!generatedImage && (
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        copied
                          ? isDark
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-green-100 text-green-700'
                          : isDark
                            ? 'bg-brand-accent-500/20 border border-brand-accent-500/30 text-brand-accent-400 hover:bg-brand-accent-500/30'
                            : 'bg-brand-accent-50 border border-brand-accent-200 text-brand-accent-600 hover:bg-brand-accent-100'
                      }`}
                    >
                      {copied ? (
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
                  )}
                </div>
              )}
            </div>

            {/* Show ProcessCard during/after processing, otherwise show results or placeholder */}
            {processCard && (processCard.status === 'processing' || (processCard.status === 'completed' && !generatedContent && !generatedImage) || processCard.status === 'error') ? (
              <div className="space-y-4">
                <ProcessCard
                  title="Content Generation"
                  query={processCard.query}
                  steps={processCard.steps}
                  finalResult={processCard.finalResult}
                  artifacts={[]}
                  status={processCard.status}
                  isCollapsed={processCard.isCollapsed}
                  onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                  onRetry={handleGenerate}
                />
              </div>
            ) : generatedContent || generatedImage ? (
              <div className="space-y-4">
                {/* Image Display */}
                {generatedImage && (
                  <div className={`aspect-square rounded-xl overflow-hidden border ${
                    isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                  } flex items-center justify-center`}>
                    <img
                      src={generatedImage}
                      alt="Generated content"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Text Content Display */}
                {generatedContent && !generatedImage && (
                  <div className={`min-h-[200px] p-4 rounded-xl border ${
                    isDark 
                      ? 'bg-dark-sidebar border-dark-border' 
                      : 'bg-light-bg border-light-border'
                  }`}>
                    <p className={`whitespace-pre-wrap leading-relaxed ${
                      isDark ? 'text-dark-text' : 'text-light-text'
                    }`}>
                      {generatedContent}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {includeHashtags && generatedHashtags.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}>
                      Hashtags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generatedHashtags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
                            isDark
                              ? 'bg-brand-accent-500/20 text-brand-accent-400'
                              : 'bg-brand-accent-50 text-brand-accent-600'
                          }`}
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                    onRetry={handleGenerate}
                  />
                )}
              </div>
            ) : (
              <div className={`min-h-[300px] rounded-xl border flex items-center justify-center ${
                isDark 
                  ? 'bg-dark-sidebar border-dark-border' 
                  : 'bg-light-bg border-light-border'
              }`}>
                <div className="text-center p-8">
                  <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                    Fill in the form and click Generate
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

export default ContentGenerationPage;
