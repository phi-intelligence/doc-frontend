import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Square, Paperclip, Globe } from 'lucide-react';
// NOTE: Removed useProgressStream - parent (UnifiedSectionEditor) manages the SSE connection
// to avoid duplicate connections. Progress state is passed via processCards prop.
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
  acceptedTypes = ['.docx', '.pdf', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg'],
  webModeEnabled = false,
  onToggleWebMode = () => {}
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // Progress stream is managed by parent (UnifiedSectionEditor) and passed via processCards

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
    <div className="w-full h-full bg-white flex flex-col overflow-hidden shadow-2xl">
      {/* Header - More Compact & Refined */}
      <div className="p-4 border-b border-light-border bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-brand-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent-100/40 shrink-0">
               <Sparkles className="w-4 h-4 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] font-black text-brand-accent-500 uppercase tracking-widest leading-none mb-0.5">AI_ASSISTANT</span>
               <h3 className="text-xs font-bold text-light-text tracking-tight leading-none">
                 {demoMode === 'hr' ? 'HR Specialist' : 
                  demoMode === 'finance' ? 'Fiscal Auditor' :
                  demoMode === 'legal' ? 'Legal Counsel' :
                  'Document AI'}
               </h3>
             </div>
          </div>

          <div className="flex items-center gap-2">
             {contextFiles.length > 0 && (
               <div className="flex items-center gap-1.5 bg-brand-accent-50 px-2 py-1 rounded-full border border-brand-accent-100/50">
                  <div className="w-1 h-1 rounded-full bg-brand-accent-500 animate-pulse" />
                  <span className="text-[8px] font-black text-brand-accent-600 uppercase tracking-widest">
                    {contextFiles.length} CTX
                  </span>
               </div>
             )}
             
             {templateId && (
               <div className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded-full shadow-sm">
                 <span className="text-[8px] font-black text-white uppercase tracking-widest truncate max-w-[60px]">TPL</span>
                 <button onClick={onClearTemplate} className="text-white/60 hover:text-white transition-colors text-[10px]">✕</button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Messages / Process Cards Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#FAFAF9]">
        <div className="px-6 pt-6">
          {processCards.length === 0 && suggestions.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-[10px] font-black text-light-text-secondary/50 uppercase tracking-[0.2em] mb-3">Capabilities & Actions:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="group w-full text-left p-4 bg-white border border-light-border hover:border-brand-accent-300 rounded-2xl text-xs font-bold text-light-text-secondary hover:text-brand-accent-700 hover:shadow-xl hover:shadow-brand-accent-100/10 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                       <span>{suggestion}</span>
                       <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
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

      {/* Input Area + Upload - Command Center Style */}
      <div className="p-6 border-t border-light-border bg-white">
        {/* Uploaded files above input */}
        {uploadedFiles.length > 0 && (
          <div className="pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
            {uploadedFiles.map((file) => (
              <FileThumbnail
                key={file.filename}
                file={file}
                onRemove={onRemoveFile ? () => onRemoveFile(file, true) : undefined}
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="relative group">
          <div className="relative flex flex-col bg-[#FAFAF9] border border-light-border rounded-3xl p-2 transition-all duration-300 focus-within:border-brand-accent-400 focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-brand-accent-100/20">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-expand height
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                  e.target.style.height = 'auto';
                }
              }}
              placeholder={
                demoMode === 'hr' ? 'Command HR document generation...' : 
                demoMode === 'finance' ? 'Request fiscal audit or report...' : 
                demoMode === 'legal' ? 'Analyze or draft legal docs...' : 
                'Input secure command...'
              }
              className="w-full px-4 py-3 text-sm bg-transparent border-none outline-none text-light-text placeholder-light-text-secondary/50 font-medium resize-none min-h-[44px] max-h-[200px] custom-scrollbar-thin transition-[height] duration-200"
              rows={1}
              disabled={isLoading || isProcessing}
            />
            
            <div className="flex items-center justify-between px-2 pb-2">
               <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all active:scale-90"
                    title="Attach files"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleWebMode}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider ${
                      webModeEnabled
                        ? 'bg-brand-accent-600 text-white shadow-md'
                        : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50'
                    }`}
                    title="Toggle web scraping (Live Surf) – scrape URLs mentioned in your prompt"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    LIVE_SURF
                  </button>
                  <div className="w-[1px] h-4 bg-light-border mx-1" />
                  <span className="text-[9px] font-black text-light-text-secondary/40 uppercase tracking-widest ml-1">Secure Channel Enabled</span>
               </div>

               {isProcessing ? (
                <button
                  type="button"
                  onClick={() => onStopGeneration?.()}
                  className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-90 shadow-lg shadow-red-100"
                  title="Stop Execution"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={(!input.trim() && !templateId) || isLoading}
                  className="p-3 bg-brand-accent-600 text-white rounded-xl hover:bg-brand-accent-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-brand-accent-100/50"
                  title="Execute Command"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </form>
        <p className="text-center mt-3 text-[9px] font-bold text-light-text-secondary/40 uppercase tracking-widest">
           Automated Governance Protocol v2.5
        </p>
      </div>
    </div>
  );
};

export default AIChatSidebar;
