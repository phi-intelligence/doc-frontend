import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  Palette, 
  Bot, 
  Calendar, 
  Send, 
  Image as ImageIcon, 
  Video, 
  ChevronLeft, 
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ProfilePopover from './ProfilePopover';

/**
 * Sidebar component for home page
 * Collapsible with smooth animations and categorized menus
 */
const Sidebar = ({ onCollapseChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);

  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
    // Close popover when collapsing
    if (newState) {
      setShowProfilePopover(false);
    }
  };

  const menuCategories = [
    {
      name: null, // No category name for Dashboard
      items: [
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          path: '/home',
          exact: true
        }
      ]
    },
    {
      name: 'Business',
      items: [
        {
          name: 'Business Profile',
          icon: Building2,
          path: '/home/business-profile'
        },
        {
          name: 'Analytics',
          icon: BarChart3,
          path: '/home/analytics'
        }
      ]
    },
    {
      name: 'Creative',
      items: [
        {
          name: 'Design Studio',
          icon: Palette,
          path: '/home/design-studio'
        },
        {
          name: 'Agent',
          icon: Bot,
          path: '/agent'
        }
      ]
    },
    {
      name: 'Content',
      items: [
        {
          name: 'Publish',
          icon: Send,
          path: '/home/publish'
        },
        {
          name: 'Calendar',
          icon: Calendar,
          path: '/home/calendar'
        }
      ]
    },
    {
      name: 'Media',
      items: [
        {
          name: 'Photo Editor',
          icon: ImageIcon,
          path: '/home/photo-editor'
        },
        {
          name: 'Video Editor',
          icon: Video,
          path: '/home/video-editor'
        }
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`relative h-full flex flex-col ${isDark ? 'bg-dark-sidebar border-r-dark-border' : 'bg-light-sidebar border-r-light-border'} border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
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
            onClick={handleCollapseToggle}
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
            onClick={handleCollapseToggle}
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

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar-dark">
        {menuCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6 last:mb-0">
            {/* Category Name */}
            {category.name && !isCollapsed && (
              <div className={`px-3 mb-2 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {category.name}
                </span>
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                      active
                        ? isDark
                          ? 'bg-dark-bg text-brand-accent-400 border-l-2 border-brand-accent-500'
                          : 'bg-light-bg text-brand-accent-600 border-l-2 border-brand-accent-500'
                        : isDark
                          ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                          : 'text-light-text-secondary hover:text-light-text hover:bg-white'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? (isDark ? 'text-brand-accent-400' : 'text-brand-accent-600') : ''}`} />
                    {!isCollapsed && (
                      <span className={`text-sm font-medium truncate ${active ? 'font-semibold' : ''}`}>
                        {item.name}
                      </span>
                    )}
                    {active && isCollapsed && (
                      <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r ${isDark ? 'bg-brand-accent-500' : 'bg-brand-accent-500'}`}></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - User Profile */}
      <div className={`relative border-t ${isDark ? 'border-t-dark-border' : 'border-t-light-border'} p-3`}>
        <button
          onClick={() => setShowProfilePopover(!showProfilePopover)}
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

export default Sidebar;

