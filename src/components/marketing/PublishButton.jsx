import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getSocialConnections, 
  publishContent, 
  validateContent,
  getPlatformInfo 
} from '../../api/marketing';

const PLATFORM_CONFIG = {
  twitter: { name: 'Twitter / X', icon: '𝕏', color: '#000000' },
  linkedin: { name: 'LinkedIn', icon: 'in', color: '#0077B5' },
  facebook: { name: 'Facebook', icon: 'f', color: '#1877F2' },
  instagram: { name: 'Instagram', icon: '📷', color: '#E4405F' },
};

export default function PublishButton({ 
  contentId, 
  contentText = '',
  mediaCount = 0,
  onPublished,
  disabled = false,
  className = '' 
}) {
  const [showModal, setShowModal] = useState(false);
  const [connections, setConnections] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set());
  const [validations, setValidations] = useState({});
  const [platformLimits, setPlatformLimits] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showModal) {
      loadData();
    }
  }, [showModal]);

  useEffect(() => {
    // Validate selected platforms when content changes
    validateSelectedPlatforms();
  }, [selectedPlatforms, contentText, mediaCount]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connData, limitsData] = await Promise.all([
        getSocialConnections(),
        getPlatformInfo()
      ]);
      
      setConnections(connData.connections || []);
      setPlatformLimits(limitsData.platforms || {});
      
      // Pre-select connected platforms
      const connectedPlatforms = (connData.connections || [])
        .filter(c => c.status === 'connected')
        .map(c => c.platform);
      setSelectedPlatforms(new Set(connectedPlatforms.slice(0, 1))); // Select first by default
    } catch (err) {
      setError('Failed to load publishing options');
    } finally {
      setLoading(false);
    }
  };

  const validateSelectedPlatforms = async () => {
    if (!contentText) return;
    
    const newValidations = {};
    
    for (const platform of selectedPlatforms) {
      try {
        const result = await validateContent(contentText, platform, mediaCount);
        newValidations[platform] = result;
      } catch (err) {
        newValidations[platform] = { valid: false, errors: ['Validation failed'] };
      }
    }
    
    setValidations(newValidations);
  };

  const togglePlatform = (platform) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setSelectedPlatforms(newSet);
  };

  const handlePublish = async () => {
    if (!contentId || selectedPlatforms.size === 0) return;
    
    // Check for validation errors
    const hasErrors = Array.from(selectedPlatforms).some(
      p => validations[p] && !validations[p].valid
    );
    
    if (hasErrors) {
      setError('Please fix validation errors before publishing');
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      setPublishResults(null);

      const result = await publishContent(contentId, Array.from(selectedPlatforms));
      setPublishResults(result);

      if (result.all_successful) {
        onPublished?.(result);
        // Close modal after success with delay
        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const connectedPlatforms = connections.filter(c => c.status === 'connected');
  const canPublish = selectedPlatforms.size > 0 && 
    !Array.from(selectedPlatforms).some(p => validations[p]?.errors?.length > 0);

  return (
    <>
      {/* Publish Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled || !contentId}
        className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 ${className}`}
      >
        <span>📤</span>
        Publish
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Publish to Social Media
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : connectedPlatforms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔗</div>
                    <p className="text-gray-600">No connected platforms</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your social media accounts first
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Platform Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select platforms to publish to:
                      </label>
                      <div className="space-y-2">
                        {connectedPlatforms.map(conn => {
                          const config = PLATFORM_CONFIG[conn.platform] || {};
                          const validation = validations[conn.platform];
                          const isSelected = selectedPlatforms.has(conn.platform);
                          const hasError = validation?.errors?.length > 0;
                          
                          return (
                            <div
                              key={conn.platform}
                              onClick={() => togglePlatform(conn.platform)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? hasError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ backgroundColor: config.color }}
                                >
                                  {config.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {config.name || conn.platform}
                                  </div>
                                  {conn.profile_name && (
                                    <div className="text-xs text-gray-500">
                                      {conn.profile_name}
                                    </div>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-500 text-white' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && '✓'}
                                </div>
                              </div>
                              
                              {/* Validation feedback */}
                              {isSelected && validation && (
                                <div className="mt-2 text-xs">
                                  {validation.errors?.map((err, i) => (
                                    <div key={i} className="text-red-600">⚠️ {err}</div>
                                  ))}
                                  {validation.warnings?.map((warn, i) => (
                                    <div key={i} className="text-amber-600">⚠️ {warn}</div>
                                  ))}
                                  {validation.valid && !validation.warnings?.length && (
                                    <div className="text-green-600">
                                      ✓ {validation.character_count}/{validation.character_limit} characters
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Publishing Results */}
                    {publishResults && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        publishResults.all_successful ? 'bg-green-50' : 'bg-amber-50'
                      }`}>
                        <div className={`font-medium ${
                          publishResults.all_successful ? 'text-green-800' : 'text-amber-800'
                        }`}>
                          {publishResults.all_successful ? '🎉 Published successfully!' : '⚠️ Partial success'}
                        </div>
                        <div className="mt-2 space-y-1">
                          {Object.entries(publishResults.results || {}).map(([platform, result]) => (
                            <div key={platform} className="text-sm">
                              {result.success ? (
                                <span className="text-green-700">
                                  ✓ {PLATFORM_CONFIG[platform]?.name || platform}
                                  {result.post_url && (
                                    <a 
                                      href={result.post_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-600 hover:underline"
                                    >
                                      View →
                                    </a>
                                  )}
                                </span>
                              ) : (
                                <span className="text-red-700">
                                  ✗ {PLATFORM_CONFIG[platform]?.name || platform}: {result.message}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {!loading && connectedPlatforms.length > 0 && (
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishing || !canPublish}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        📤 Publish Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
