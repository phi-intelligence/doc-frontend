import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, Loader2, Copy, CheckCircle, RefreshCw,
  Twitter, Linkedin, Facebook, Instagram, Hash, MessageSquare, Image
} from 'lucide-react';
import { sendMessage } from '../api/chat';
import { useProgressStream } from '../hooks/useProgressStream';
import ProcessCard from '../components/progress/ProcessCard';

// Platform configurations
const platforms = [
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, maxLength: 280, color: 'from-sky-400 to-sky-500' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, maxLength: 2200, color: 'from-pink-500 to-rose-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, maxLength: 3000, color: 'from-blue-600 to-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, maxLength: 63206, color: 'from-blue-500 to-blue-600' }
];

// Tones
const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'educational', label: 'Educational' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'storytelling', label: 'Storytelling' }
];

// Content types
const contentTypes = [
  { value: 'post', label: 'Regular Post' },
  { value: 'thread', label: 'Thread / Carousel' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'question', label: 'Question / Poll' },
  { value: 'tip', label: 'Tips & How-to' }
];

function ContentGenerationPage() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    topic: '',
    context: '',
    tone: 'professional',
    content_type: 'post',
    include_hashtags: true,
    include_emoji: true,
    call_to_action: ''
  });

  // Chat pipeline state
  const [sessionId] = useState(() => `content-gen-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);

  // Update process card with progress stream
  useEffect(() => {
    if (progressStream.items.length > 0 && processCard && processCard.status === 'processing') {
      setProcessCard(prev => prev ? { ...prev, steps: progressStream.items } : null);
    }
  }, [progressStream.items, processCard]);

  // Build message based on form data
  const buildMessage = () => {
    return `Generate social media content for ${selectedPlatform.name}.
Topic: ${formData.topic}
${formData.context ? `Additional context: ${formData.context}` : ''}
Tone: ${formData.tone}
Content type: ${formData.content_type}
${formData.include_hashtags ? 'Include relevant hashtags' : 'Do not include hashtags'}
${formData.include_emoji ? 'Include appropriate emojis' : 'Do not include emojis'}
${formData.call_to_action ? `Call to action: ${formData.call_to_action}` : ''}
Maximum character limit: ${selectedPlatform.maxLength} characters

Please generate engaging, platform-appropriate content. Return the content in a structured format with the main text, any hashtags separately listed, and an image suggestion if applicable.`;
  };

  // Generate content via chat pipeline
  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);
    setCopied(false);

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
        [],  // no context files
        sessionId,
        null,  // active document
        null,  // current page
        null,  // integrations
        null,  // signal
        'content_generation'  // skill_hint
      );

      // Update process card with completion
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      // Parse the response - extract content, hashtags, image suggestion
      // The LLM should return structured content
      const responseText = result.response || '';
      
      // Simple parsing - the agent should return structured content
      // For robustness, we handle plain text too
      const content = responseText;
      const hashtags = [];
      let imageSuggestion = null;

      // Try to extract hashtags from the response
      const hashtagMatches = responseText.match(/#\w+/g);
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches);
      }

      // Check if there's an image suggestion section
      const imageSuggestionMatch = responseText.match(/Image Suggestion[:\s]*(.+?)(?:\n|$)/i);
      if (imageSuggestionMatch) {
        imageSuggestion = imageSuggestionMatch[1].trim();
      }

      setGeneratedContent({
        content: content,
        hashtags: hashtags,
        image_suggestion: imageSuggestion
      });
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

  // Retry handler
  const handleRetry = () => {
    handleGenerate();
  };

  // Regenerate content
  const handleRegenerate = () => {
    handleGenerate();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedContent?.content) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Character count
  const charCount = generatedContent?.content?.length || 0;
  const isOverLimit = charCount > selectedPlatform.maxLength;

  const PlatformIcon = selectedPlatform.icon;

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
                  <Sparkles className="w-5 h-5 text-brand-accent-600" />
                </div>
                <span className="text-lg font-semibold text-light-text">Content Generation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-light-text-secondary uppercase tracking-wider mb-4">
            Select Platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatform.id === platform.id;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand-accent-500 bg-brand-accent-50'
                      : 'border-light-border bg-white hover:border-brand-accent-300'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r ${platform.color}`} />
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${platform.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-light-text text-sm">{platform.name}</h3>
                  <p className="text-xs text-light-text-secondary">Max {platform.maxLength.toLocaleString()} chars</p>
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
                <MessageSquare className="w-4 h-4 text-brand-accent-500" />
                Content Details
              </h3>

              <div className="space-y-5">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Topic / Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="What should the post be about?"
                    className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                  />
                </div>

                {/* Context */}
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Additional Context
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData({...formData, context: e.target.value})}
                    rows={3}
                    placeholder="Any specific details, key points, or brand voice guidelines..."
                    className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type}
                      onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    >
                      {contentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Tone
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({...formData, tone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                    >
                      {tones.map((tone) => (
                        <option key={tone.value} value={tone.value}>{tone.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Call to Action */}
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Call to Action (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.call_to_action}
                    onChange={(e) => setFormData({...formData, call_to_action: e.target.value})}
                    placeholder="e.g., Visit our website, DM for details"
                    className="w-full px-4 py-2.5 border border-light-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-200 focus:border-brand-accent-400"
                  />
                </div>

                {/* Options */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.include_hashtags}
                      onChange={(e) => setFormData({...formData, include_hashtags: e.target.checked})}
                      className="w-4 h-4 rounded border-light-border text-brand-accent-500 focus:ring-brand-accent-200"
                    />
                    <span className="text-sm text-light-text flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Include Hashtags
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.include_emoji}
                      onChange={(e) => setFormData({...formData, include_emoji: e.target.checked})}
                      className="w-4 h-4 rounded border-light-border text-brand-accent-500 focus:ring-brand-accent-200"
                    />
                    <span className="text-sm text-light-text">Include Emojis</span>
                  </label>
                </div>
              </div>

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
                    Generate Content
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

          {/* Right Panel - Generated Content */}
          <div className="bg-white rounded-xl border border-light-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-light-text flex items-center gap-2">
                <PlatformIcon className="w-4 h-4 text-brand-accent-500" />
                Generated Content
              </h3>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Regenerate"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-brand-accent-50 text-brand-accent-600 hover:bg-brand-accent-100'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
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

            {/* Show ProcessCard during/after processing, otherwise show results or placeholder */}
            {processCard && (processCard.status === 'processing' || (processCard.status === 'completed' && !generatedContent) || processCard.status === 'error') ? (
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
                  onRetry={handleRetry}
                />
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                {/* Content Preview */}
                <div className="min-h-[200px] p-4 rounded-xl bg-light-bg border border-light-border">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-light-text leading-relaxed">
                      {generatedContent.content}
                    </p>
                  </div>
                </div>

                {/* Character Count */}
                <div className={`flex items-center justify-between text-sm ${isOverLimit ? 'text-red-600' : 'text-light-text-secondary'}`}>
                  <span>Character count</span>
                  <span className="font-medium">
                    {charCount.toLocaleString()} / {selectedPlatform.maxLength.toLocaleString()}
                  </span>
                </div>

                {/* Hashtags */}
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-light-text mb-2">
                      Extracted Hashtags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-accent-50 text-brand-accent-600 rounded-full text-sm"
                        >
                          <Hash className="w-3 h-3" />
                          {tag.replace('#', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Suggestion */}
                {generatedContent.image_suggestion && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Image className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 text-sm mb-1">Image Suggestion</h4>
                        <p className="text-sm text-blue-700">{generatedContent.image_suggestion}</p>
                      </div>
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
                    onRetry={handleRetry}
                  />
                )}
              </div>
            ) : (
              <div className="min-h-[300px] rounded-xl bg-light-bg border border-light-border flex items-center justify-center">
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

export default ContentGenerationPage;
