import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Square, Paperclip } from 'lucide-react';
import { useProgressStream } from '../../hooks/useProgressStream';
import { sendMessage } from '../../api/chat';
import ProcessCard from '../progress/ProcessCard';
import FileThumbnail from '../common/FileThumbnail';
import EnhancementCard from '../../features/artifacts/components/EnhancementCard';
import ChatPane from '../../workspace/ChatPane';

/**
 * AIChatSidebar - Right sidebar for AI chat (demo pages)
 * Full feature parity with ChatPage: ProcessCards, stop button, uploaded files, user bubbles
 */
const AIChatSidebar = ({
  sessionId,
  contextFiles = [],
  onSendMessage,
  messages = [],
  isLoading = false,
  isProcessing = false,
  suggestions = [],
  demoMode = null,
  templateId = null,
  onClearTemplate = () => {},
  enhancementCards = [],
  onViewEnhancedFile = () => {},
  setProcessCards,
  processCards = [],
  onToggleCard = () => {},
  onRetry = () => {},
  onStopGeneration = () => {},
  uploadedFiles = [],
  onRemoveFile,
  onUploadFiles,
  acceptedTypes = ['.docx', '.pdf', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg']
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const progressStream = useProgressStream(sessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [processCards, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !templateId) || isLoading || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    if (onSendMessage) {
      const controller = new AbortController();
      await onSendMessage(userMessage, contextFiles, controller.signal, templateId);
      if (templateId) onClearTemplate();
    } else {
      const response = await sendMessage(
        userMessage,
        contextFiles,
        sessionId,
        null,
        1,
        [],
        null,
        null,
        null,
        [],
        false,
        demoMode
      );
      if (response?.response) {
        // No process cards from parent - messages only
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleFileInputChange = (e) => {
    if (!onUploadFiles) return;
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUploadFiles(files);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full h-full bg-light-sidebar border-l border-light-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-light-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-brand-accent-500" />
          <h3 className="text-lg font-semibold text-light-text">
            {demoMode === 'hr'
              ? 'HR Assistant'
              : demoMode === 'finance'
              ? 'Finance Assistant'
              : demoMode === 'legal'
              ? 'Legal Assistant'
              : 'AI Assistant'}
          </h3>
        </div>
        {contextFiles.length > 0 && (
          <p className="text-xs text-light-text-secondary">
            Using {contextFiles.length} file{contextFiles.length !== 1 ? 's' : ''} as context
          </p>
        )}
        {templateId && (
          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-bold bg-brand-accent-50 border border-brand-accent-100 rounded-lg px-3 py-2">
            <span className="text-brand-accent-700 truncate">TEMPLATE: {templateId}</span>
            <button
              type="button"
              onClick={onClearTemplate}
              className="text-brand-accent-700 hover:text-brand-accent-900"
              title="Clear template selection"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Messages / Process Cards Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 pt-4">
          {processCards.length === 0 && suggestions.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-light-text-secondary mb-2">Suggested Prompts:</p>
              {suggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 bg-light-bg border border-light-border hover:border-brand-accent-300 rounded-lg text-sm text-light-text hover:bg-brand-accent-50 transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Shared ChatPane for cards + enhancements */}
        <ChatPane
          processCards={processCards}
          setProcessCards={setProcessCards}
          enhancementCards={enhancementCards}
          onRetry={(query) => onRetry(query)}
          onViewEnhancedFile={onViewEnhancedFile}
        />
      </div>

      {/* Uploaded files above input */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <FileThumbnail
              key={file.filename}
              file={file}
              onRemove={onRemoveFile ? () => onRemoveFile(file, true) : undefined}
            />
          ))}
        </div>
      )}

      {/* Input Area + Upload */}
      <div className="p-4 border-t border-light-border">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={
                  demoMode === 'hr'
                    ? 'Ask to generate HR documents...'
                    : demoMode === 'finance'
                    ? 'Ask to generate financial reports...'
                    : demoMode === 'legal'
                    ? 'Ask to draft or review legal documents...'
                    : 'Type your message...'
                }
                className="w-full px-3 py-2 text-sm bg-light-bg border border-light-border rounded-lg text-light-text placeholder-light-text-secondary resize-none focus:outline-none focus:border-brand-accent-300 focus:ring-1 focus:ring-brand-accent-300"
                rows={3}
                disabled={isLoading || isProcessing}
              />
              {/* Hidden file input for sidebar uploads */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white border border-light-border text-light-text-secondary rounded-lg hover:bg-light-bg hover:border-brand-accent-300 transition-colors flex-shrink-0"
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            {isProcessing ? (
              <button
                type="button"
                onClick={() => onStopGeneration?.()}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
                title="Stop Execution"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!input.trim() && !templateId) || isLoading}
                className="p-2 bg-brand-accent-500 text-white rounded-lg hover:bg-brand-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatSidebar;
