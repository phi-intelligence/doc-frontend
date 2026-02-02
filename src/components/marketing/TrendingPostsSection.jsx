import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Twitter,
  Linkedin,
  Globe,
  Hash,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Eye,
  Clock,
  User,
  Edit3,
  FileText,
  Send,
  Copy,
  Check,
  Facebook,
  Instagram,
  Save,
  CheckCircle
} from 'lucide-react';
import { getTrendingPosts, getTrendCategories, refreshTrends } from '../../api/marketing';
import apiClient from '../../api/index';

// Source icons mapping
const SOURCE_ICONS = {
  twitter: Twitter,
  reddit: Hash,
  linkedin: Linkedin,
  facebook: Globe,
  instagram: Globe,
  news: Globe
};

// Source colors mapping
const SOURCE_COLORS = {
  twitter: 'bg-sky-500',
  reddit: 'bg-orange-500',
  linkedin: 'bg-blue-600',
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  news: 'bg-gray-600'
};

// Category colors for badges
const CATEGORY_COLORS = {
  tech: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  marketing: 'bg-purple-100 text-purple-700 border-purple-200',
  business: 'bg-blue-100 text-blue-700 border-blue-200',
  finance: 'bg-amber-100 text-amber-700 border-amber-200',
  health: 'bg-green-100 text-green-700 border-green-200',
  lifestyle: 'bg-pink-100 text-pink-700 border-pink-200',
  entertainment: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

// Format engagement numbers
const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * TrendingPostCard - Individual trending post card
 */
const TrendingPostCard = ({ post, onGeneratePost, onPreview }) => {
  const SourceIcon = SOURCE_ICONS[post.source] || Globe;
  const sourceColor = SOURCE_COLORS[post.source] || 'bg-gray-600';
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => onPreview(post)}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${sourceColor} flex items-center justify-center`}>
            <SourceIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-600 capitalize">{post.source}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${categoryColor}`}>
          {post.category}
        </span>
      </div>
      
      {/* Content */}
      <div className="px-4 py-2 flex-1">
        <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors">
          {truncateText(post.title, 80)}
        </h4>
        <p className="text-gray-600 text-xs leading-relaxed">
          {truncateText(post.content, 120)}
        </p>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        {/* Engagement metrics */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-gray-500">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs">{formatNumber(post.engagement?.likes)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-xs">{formatNumber(post.engagement?.comments)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-xs">{formatNumber(post.engagement?.shares)}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onGeneratePost(post)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Post
          </button>
          <button
            onClick={() => onPreview(post)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          {post.source_url && (
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View original"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Channel selector options for the post editor
 */
const CHANNEL_OPTIONS = [
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-sky-500', maxLength: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', maxLength: 3000 },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-500', maxLength: 2000 },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', maxLength: 2200 },
];

/**
 * PostPreviewModal - Fullscreen modal for viewing post details and creating new posts
 */
const PostPreviewModal = ({ post, onClose, onGeneratePost }) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'editor'
  const [selectedChannel, setSelectedChannel] = useState('linkedin');
  const [draftContent, setDraftContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  if (!post) return null;
  
  const SourceIcon = SOURCE_ICONS[post.source] || Globe;
  const sourceColor = SOURCE_COLORS[post.source] || 'bg-gray-600';
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700 border-gray-200';
  const selectedChannelConfig = CHANNEL_OPTIONS.find(c => c.id === selectedChannel) || CHANNEL_OPTIONS[1];
  
  // Format date if available
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };
  
  // Generate a draft post using AI (navigates to editor with prompt)
  const handleAIGenerate = () => {
    setGenerating(true);
    onGeneratePost(post);
    onClose();
  };
  
  // Copy content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Save draft as a content calendar item
  const handleSaveDraft = async () => {
    if (!draftContent.trim()) {
      setSaveError('Please write some content first');
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    
    try {
      await apiClient.post('/marketing/content', {
        title: `Post from: ${post.title?.slice(0, 50)}...`,
        description: `Inspired by trending topic: ${post.title}`,
        content_type: 'social_post',
        channel: selectedChannel,
        content: draftContent,
      });
      
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSaveError('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Quick template suggestions
  const templateSuggestions = [
    { label: 'Professional', text: `🔥 Breaking: ${post.title}\n\nKey takeaways:\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nWhat are your thoughts? 💬\n\n#${post.category} #trending` },
    { label: 'Casual', text: `Just saw this and had to share! 👀\n\n${post.title}\n\nThis is huge for our industry. Here's why...\n\n[Your insight here]\n\nThoughts? 🤔` },
    { label: 'Question', text: `🤔 What do you think about this?\n\n"${post.title}"\n\nI'd love to hear your perspective in the comments! 👇` },
  ];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with tabs */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${sourceColor} flex items-center justify-center`}>
                <SourceIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 capitalize">{post.source}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColor}`}>
                  {post.category}
                </span>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/60 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'editor' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Create Post
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'preview' ? (
              /* Preview Tab */
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h2>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                  )}
                  {post.fetched_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(post.fetched_at)}</span>
                    </div>
                  )}
                </div>
                
                {/* Full content */}
                <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                  <p className="whitespace-pre-wrap">{post.content || 'No content available.'}</p>
                </div>
                
                {/* Engagement metrics */}
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{formatNumber(post.engagement?.likes)}</span>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{formatNumber(post.engagement?.comments)}</span>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{formatNumber(post.engagement?.shares)}</span>
                    <p className="text-xs text-gray-500">Shares</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Editor Tab */
              <div className="p-6">
                {/* Source reference */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-blue-600 font-medium mb-1">Creating post based on:</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  </div>
                </div>
                
                {/* Channel selector */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Channel</label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map((channel) => {
                      const ChannelIcon = channel.icon;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            selectedChannel === channel.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md ${channel.color} flex items-center justify-center`}>
                            <ChannelIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-medium">{channel.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Quick templates */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {templateSuggestions.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDraftContent(template.text)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Text editor */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Your Post</label>
                    <span className={`text-xs ${
                      draftContent.length > selectedChannelConfig.maxLength 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                    }`}>
                      {draftContent.length} / {selectedChannelConfig.maxLength}
                    </span>
                  </div>
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder={`Write your ${selectedChannelConfig.label} post here... or use AI to generate one!`}
                    className="w-full h-48 p-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating...' : 'AI Generate'}
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!draftContent}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving || !draftContent.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ml-auto"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Draft'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer actions */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            {activeTab === 'preview' ? (
              <>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Create Post from This
                </button>
                {post.source_url && (
                  <a
                    href={post.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Original
                  </a>
                )}
              </>
            ) : (
              <>
                {saveError && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {saveError}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || !draftContent.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : saved ? 'Saved to Calendar!' : 'Save to Calendar'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * LoadingSkeleton - Skeleton loader for posts
 */
const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-gray-200" />
      <div className="w-20 h-4 rounded bg-gray-200" />
      <div className="ml-auto w-16 h-5 rounded-full bg-gray-200" />
    </div>
    <div className="space-y-2">
      <div className="h-4 rounded bg-gray-200 w-3/4" />
      <div className="h-3 rounded bg-gray-200 w-full" />
      <div className="h-3 rounded bg-gray-200 w-2/3" />
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex gap-4 mb-3">
        <div className="w-12 h-4 rounded bg-gray-200" />
        <div className="w-12 h-4 rounded bg-gray-200" />
        <div className="w-12 h-4 rounded bg-gray-200" />
      </div>
      <div className="h-8 rounded-lg bg-gray-200 w-full" />
    </div>
  </div>
);

/**
 * TrendingPostsSection - Main component for displaying trending posts
 */
const TrendingPostsSection = ({ onGeneratePost: externalOnGeneratePost }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [previewPost, setPreviewPost] = useState(null);
  
  // Posts per page for horizontal scroll
  const POSTS_PER_VIEW = 4;
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getTrendCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);
  
  // Fetch posts when category changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTrendingPosts(activeCategory, 20);
        setPosts(data.items || []);
      } catch (err) {
        console.error('Failed to fetch trending posts:', err);
        setError('Failed to load trending posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeCategory]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshTrends(activeCategory);
      const data = await getTrendingPosts(activeCategory, 20);
      setPosts(data.items || []);
    } catch (err) {
      console.error('Failed to refresh trends:', err);
      setError('Failed to refresh trends. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory]);
  
  // Handle generate post - open the preview modal with editor tab
  const handleGeneratePost = useCallback((post) => {
    // Use external handler if provided
    if (externalOnGeneratePost) {
      externalOnGeneratePost(post);
      return;
    }
    
    // Default behavior: open the preview modal (user can use editor tab to create post)
    setPreviewPost(post);
  }, [externalOnGeneratePost]);
  
  // Scroll handlers
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < Math.max(0, posts.length - POSTS_PER_VIEW);
  
  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - POSTS_PER_VIEW));
  };
  
  const scrollRight = () => {
    setScrollPosition(Math.min(posts.length - POSTS_PER_VIEW, scrollPosition + POSTS_PER_VIEW));
  };
  
  // Get visible posts
  const visiblePosts = posts.slice(scrollPosition, scrollPosition + POSTS_PER_VIEW);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trending Posts</h3>
              <p className="text-sm text-gray-500">Latest social media trends to inspire your content</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="flex items-center gap-3 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-auto text-sm font-medium underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No trending posts found</h4>
            <p className="text-gray-500 mb-4">Try selecting a different category or refresh to fetch new trends.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Fetch Trends
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation arrows */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {/* Posts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {visiblePosts.map((post) => (
                  <TrendingPostCard
                    key={post.id}
                    post={post}
                    onGeneratePost={handleGeneratePost}
                    onPreview={setPreviewPost}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Pagination dots */}
            {posts.length > POSTS_PER_VIEW && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {Array.from({ length: Math.ceil(posts.length / POSTS_PER_VIEW) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setScrollPosition(idx * POSTS_PER_VIEW)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      Math.floor(scrollPosition / POSTS_PER_VIEW) === idx
                        ? 'bg-blue-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      {previewPost && (
        <PostPreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onGeneratePost={handleGeneratePost}
        />
      )}
    </div>
  );
};

export default TrendingPostsSection;
