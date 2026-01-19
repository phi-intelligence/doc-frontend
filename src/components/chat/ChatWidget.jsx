import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { sendMessage as sendChatMessage } from '../../api/chat';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard'; // Adjust path if necessary

// Simple loading indicator
const LoadingDots = () => (
    <div className="flex space-x-1 items-center justify-center p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
);

const ChatWidget = ({ sessionId, activeFile, className = '' }) => {
    const [input, setInput] = useState('');
    const [cards, setCards] = useState([]); // Local chat history (ephemeral for this widget session?)
    // Note: For persistence similar to ChatPage, we could lift this state or sync with useSession
    // For now, let's keep it simple: specific to this editor session.

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [currentCardId, setCurrentCardId] = useState(null);

    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Reuse the progress stream hook for real-time updates
    const progressStream = useProgressStream(sessionId);

    // Sync progress stream to active card
    useEffect(() => {
        if (currentCardId && progressStream.items.length > 0) {
            setCards(prev => prev.map(card =>
                card.id === currentCardId
                    ? { ...card, steps: progressStream.items }
                    : card
            ));
            const lastItem = progressStream.items[progressStream.items.length - 1];
            if (lastItem && lastItem.message) {
                setProcessingStatus(lastItem.message);
            }
        }
    }, [progressStream.items, currentCardId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [cards, isProcessing]);


    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;

        const query = input;
        setInput('');
        setIsProcessing(true);
        setProcessingStatus('Starting...');

        abortControllerRef.current = new AbortController();
        progressStream.clear();

        const cardId = `chat-card-${Date.now()}`;
        setCurrentCardId(cardId);

        const newCard = {
            id: cardId,
            query: query,
            steps: [],
            finalResult: '',
            status: 'processing',
            isCollapsed: false,
        };

        setCards(prev => [...prev, newCard]);

        try {
            // Context: Include the active file if available
            const contextFiles = activeFile ? [activeFile.filename] : [];

            const response = await sendChatMessage(
                query,
                contextFiles, // Context
                sessionId,    // Session
                activeFile?.filename, // Active context artifact
                1, // Page (default)
                [], // Integrations (none for now)
                abortControllerRef.current.signal
            );

            setCards(prev => prev.map(card =>
                card.id === cardId
                    ? { ...card, finalResult: response.response, status: 'completed' }
                    : card
            ));

            setProcessingStatus('Complete');

        } catch (error) {
            console.error("Chat error:", error);
            setCards(prev => prev.map(card =>
                card.id === cardId
                    ? { ...card, finalResult: `Error: ${error.message}`, status: 'error' }
                    : card
            ));
        } finally {
            setIsProcessing(false);
            setCurrentCardId(null);
            setTimeout(() => setProcessingStatus(''), 2000);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsProcessing(false);
        setProcessingStatus('Stopped');
        setCurrentCardId(null);
        setCards(prev => prev.map(card =>
            card.status === 'processing'
                ? { ...card, status: 'stopped', finalResult: 'Stopped by user.' }
                : card
        ));
    };


    return (
        <div className={`flex flex-col h-full bg-white border-l border-gray-200 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    AI Assistant
                </h3>
                {isProcessing && (
                    <span className="text-xs text-gray-500 animate-pulse">{processingStatus}</span>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                {cards.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Chat with Phi to edit or summarize this document.</p>
                    </div>
                )}

                {cards.map(card => (
                    <div key={card.id} className="space-y-3">
                        {/* User Query */}
                        <div className="flex justify-end">
                            <div className="bg-brand-primary-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-sm">
                                {card.query}
                            </div>
                        </div>

                        {/* AI Response Card */}
                        <div className="max-w-[95%]">
                            <ProcessCard
                                title="Phi"
                                query={card.query}
                                steps={card.steps}
                                finalResult={card.finalResult}
                                status={card.status}
                                isCollapsed={card.isCollapsed}
                                onToggle={() => {
                                    setCards(prev => prev.map(c =>
                                        c.id === card.id ? { ...c, isCollapsed: !c.isCollapsed } : c
                                    ));
                                }}
                                compact={true} // Add a compact prop to ProcessCard if needed, or just rely on CSS
                            />
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Phi to edit or explain..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20 focus:border-brand-primary-500 transition-all text-sm"
                        disabled={isProcessing}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isProcessing ? (
                            <button
                                type="button"
                                onClick={handleStop}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Stop generation"
                            >
                                <StopCircle className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-1.5 text-brand-primary-600 hover:bg-brand-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;
