import React from 'react';
import { MessageSquarePlus, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { getRelativeTime } from '../../utils/timeUtils';

/**
 * Chat history sidebar component
 * @param {Array} sessions - List of chat sessions
 * @param {string} currentSessionId - Currently active session ID
 * @param {Function} onSelectSession - Callback when session is selected
 * @param {Function} onNewChat - Callback to create new chat
 * @param {Function} onDeleteSession - Callback to delete a session
 * @param {boolean} isCollapsed - Whether sidebar is collapsed
 * @param {Function} onToggleCollapse - Callback to toggle collapse state
 */
const ChatHistorySidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={`h-full flex flex-col bg-light-sidebar transition-all duration-300 border-r border-light-border ${isCollapsed ? 'w-12' : 'w-56'}`}>
      {/* Header */}
      <div className="h-16 border-b border-light-border flex items-center justify-between px-4">
        {!isCollapsed && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-light-text bg-light-surface border border-light-border hover:bg-white hover:border-gray-300 rounded-lg transition-all duration-200 w-full"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-2 text-light-text-secondary hover:text-light-text hover:bg-white/50 rounded-lg transition-all duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar-dark">
        {!isCollapsed && (
          <>
            <div className="px-4 py-3 text-xs font-semibold text-light-text-secondary uppercase">Recent</div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-all duration-200 relative ${session.id === currentSessionId
                  ? 'bg-light-bg text-light-text border-l-2 border-brand-accent-500/30'
                  : 'text-light-text-secondary hover:bg-white/50 hover:text-light-text'
                  }`}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${session.id === currentSessionId ? 'text-brand-accent-500' : 'text-light-text-secondary group-hover:text-light-text'}`} />
                <span className="truncate">{session.title || 'New Conversation'}</span>

                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-1 px-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`p-2 rounded-lg transition-colors relative group ${session.id === currentSessionId
                  ? 'bg-light-bg text-brand-accent-500'
                  : 'text-light-text-secondary hover:bg-white/50 hover:text-light-text'}`}
                title={session.title || 'Untitled Chat'}
              >
                <MessageSquare className="w-4 h-4" />
                {session.id === currentSessionId && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand-accent-500 rounded-r"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / User Profile Stub */}
      <div className="p-3 border-t border-light-border">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-accent-400 to-brand-accent-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-accent-500/20">
            P
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-light-text truncate">Phi User</div>
              <div className="text-xs text-light-text-secondary truncate">Pro Plan</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
