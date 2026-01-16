import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';

/**
 * Profile Popover Component
 * Shows Settings and Theme Toggle
 */
const ProfilePopover = ({ isCollapsed, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const popoverRef = useRef(null);

  const isSettingsActive = location.pathname === '/home/settings';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className={`absolute ${isCollapsed ? 'bottom-0 left-full ml-2' : 'bottom-full left-0 mb-2'} ${isCollapsed ? 'w-[200px]' : 'w-full'} min-w-[200px] ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'} border rounded-lg shadow-xl z-50 overflow-hidden`}
    >
      {/* Settings Link */}
      <Link
        to="/home/settings"
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 transition-all ${isSettingsActive
          ? isDark ? 'bg-dark-bg text-brand-accent-400' : 'bg-light-bg text-brand-accent-600'
          : isDark ? 'text-dark-text hover:bg-dark-sidebar hover:text-dark-text' : 'text-light-text hover:bg-gray-50 hover:text-light-text'
          }`}
      >
        <Settings className={`w-5 h-5 ${isSettingsActive ? (isDark ? 'text-brand-accent-400' : 'text-brand-accent-600') : ''}`} />
        <span className="text-sm font-medium">Settings</span>
      </Link>

      {/* Theme Toggle */}
      <button
        onClick={() => {
          toggleTheme();
          onClose();
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isDark 
          ? 'text-dark-text hover:bg-dark-sidebar' 
          : 'text-light-text hover:bg-gray-50'
          }`}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-5 h-5" />
            <span className="text-sm font-medium">Dark Mode</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProfilePopover;

