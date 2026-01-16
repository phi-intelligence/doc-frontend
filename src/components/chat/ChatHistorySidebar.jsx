import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, MessageSquare, ChevronLeft, Trash2, Home, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ProfilePopover from '../home/ProfilePopover';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showProfilePopover, setShowProfilePopover] = useState(false);

  return (
    <div className={`h-full flex flex-col transition-all duration-300 border-r ${isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-sidebar border-light-border'} ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header - Logo and App Name */}
      <div className={`h-16 sm:h-20 border-b ${isDark ? 'border-b-dark-border' : 'border-b-light-border'} flex items-center justify-between px-4`}>
        {!isCollapsed && (
          <Link to="/home" className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <img 
                src="/logophi_brown.png" 
                alt="Phi Docs Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.nextSibling.style.display = 'block'; 
                }} 
              />
              <Sparkles className={`w-full h-full ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'} hidden`} />
            </div>
            <span className={`font-display font-semibold text-lg sm:text-xl tracking-tight uppercase truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Phi Docs
            </span>
          </Link>
        )}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center cursor-pointer"
            title="Expand sidebar"
          >
            <div className="w-10 h-10 flex-shrink-0">
              <img 
                src="/logophi_brown.png" 
                alt="Phi Docs Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.nextSibling.style.display = 'block'; 
                }} 
              />
              <Sparkles className={`w-full h-full ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'} hidden`} />
            </div>
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark 
              ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface' 
              : 'text-light-text-secondary hover:text-light-text hover:bg-white'
              }`}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar-dark">
        {!isCollapsed && (
          <>
            {/* New Chat and Home buttons at top */}
            <div className="space-y-2 mb-4">
              <button
                onClick={onNewChat}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold ${isDark ? 'text-dark-text bg-dark-surface border-dark-border hover:bg-dark-bg hover:border-dark-border-hover' : 'text-light-text bg-light-surface border-light-border hover:bg-white hover:border-gray-300'} border`}
              >
                <MessageSquarePlus className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">New Chat</span>
              </button>
              <Link
                to="/home"
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold ${isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface' : 'text-light-text-secondary hover:text-light-text hover:bg-white'}`}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Home</span>
              </Link>
            </div>

            {/* Recent Chats Section */}
            <div className={`px-4 py-2 text-xs font-semibold uppercase ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Recent</div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-all duration-200 relative ${session.id === currentSessionId
                  ? isDark ? 'bg-dark-bg text-dark-text border-l-2 border-brand-accent-500/30' : 'bg-light-bg text-light-text border-l-2 border-brand-accent-500/30'
                  : isDark ? 'text-dark-text-secondary hover:bg-dark-surface/50 hover:text-dark-text' : 'text-light-text-secondary hover:bg-white/50 hover:text-light-text'
                  }`}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${session.id === currentSessionId ? isDark ? 'text-brand-accent-400' : 'text-brand-accent-500' : isDark ? 'text-dark-text-secondary group-hover:text-dark-text' : 'text-light-text-secondary group-hover:text-light-text'}`} />
                <span className="truncate">{session.title || 'New Conversation'}</span>

                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className={`absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${isDark ? 'hover:bg-red-900/30 hover:text-red-400' : 'hover:bg-red-100 hover:text-red-600'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-2 px-1">
            {/* New Chat button */}
            <button
              onClick={onNewChat}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface/50' : 'text-light-text-secondary hover:text-light-text hover:bg-white/50'}`}
              title="New Chat"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
            {/* Home button */}
            <Link
              to="/home"
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface/50' : 'text-light-text-secondary hover:text-light-text hover:bg-white/50'}`}
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer - User Profile */}
      <div className={`relative border-t ${isDark ? 'border-t-dark-border' : 'border-t-light-border'} p-3`}>
        <button
          onClick={() => {
            setShowProfilePopover(!showProfilePopover);
          }}
          className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} rounded-lg transition-all ${isDark 
            ? 'hover:bg-dark-surface' 
            : 'hover:bg-white'
            }`}
        >
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${isDark ? 'from-brand-accent-400 to-brand-accent-600' : 'from-brand-accent-400 to-brand-accent-600'} flex items-center justify-center text-white font-bold text-sm ring-2 ${isDark ? 'ring-brand-accent-900/20' : 'ring-brand-accent-500/20'} flex-shrink-0`}>
            P
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-sm font-medium truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Phi User
              </div>
              <div className={`text-xs truncate ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                Pro Plan
              </div>
            </div>
          )}
        </button>

        {/* Profile Popover */}
        {showProfilePopover && (
          <ProfilePopover 
            isCollapsed={isCollapsed} 
            onClose={() => setShowProfilePopover(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;

