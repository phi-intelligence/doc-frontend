import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProcessCard from '../components/progress/ProcessCard';
import EnhancementCard from '../features/artifacts/components/EnhancementCard';

/** Pixels from bottom to consider "near bottom" for auto-scroll */
const SCROLL_NEAR_BOTTOM_THRESHOLD = 100;

/**
 * ChatPane
 * Shared layout for ChatPage + editor AI sidebars:
 * - User message bubble (premium pill)
 * - ProcessCard stack with animations
 * - Enhancement cards list
 */
const ChatPane = ({
  processCards,
  setProcessCards,
  enhancementCards = [],
  onRetry,
  onViewEnhancedFile
}) => {
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !messagesEndRef.current) return;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_NEAR_BOTTOM_THRESHOLD;
    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [processCards, enhancementCards]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar-dark bg-light-bg"
    >
      <AnimatePresence>
        {processCards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* User Message Bubble - Premium Pill */}
            <div className="flex justify-end px-2">
              <div className="bg-white border border-brand-accent-200/40 px-6 py-4 rounded-[2rem] rounded-tr-lg text-light-text max-w-2xl shadow-[0_4px_15px_rgba(136,108,74,0.05)] transition-shadow hover:shadow-[0_8px_25px_rgba(136,108,74,0.08)]">
                <p className="whitespace-pre-wrap text-[15.5px] font-medium leading-[1.6] text-light-text-secondary">
                  {card.query}
                </p>
              </div>
            </div>

            {/* AI Process Card */}
            <ProcessCard
              title="Phi Docs"
              query={card.query}
              steps={card.steps}
              finalResult={card.finalResult}
              artifacts={card.artifacts}
              status={card.status}
              isCollapsed={card.isCollapsed}
              onToggle={() => {
                if (!setProcessCards) return;
                setProcessCards(prev => prev.map(c =>
                  c.id === card.id ? { ...c, isCollapsed: !c.isCollapsed } : c
                ));
              }}
              onRetry={onRetry}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhancement Cards */}
      <AnimatePresence>
        {enhancementCards.map((card) => (
          <EnhancementCard
            key={card.id}
            originalFile={card.originalFile}
            enhancedFile={card.enhancedFile}
            status={card.status}
            onViewFile={onViewEnhancedFile}
          />
        ))}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatPane;

