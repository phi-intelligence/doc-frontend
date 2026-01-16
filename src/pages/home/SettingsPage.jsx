import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Settings, Bell, Share2 } from 'lucide-react';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SocialSettings from '../../components/settings/SocialSettings';

const SettingsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState('notification');

  const settingsOptions = [
    {
      id: 'notification',
      name: 'Notification',
      icon: Bell,
    },
    {
      id: 'social',
      name: 'Social',
      icon: Share2,
    },
  ];

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'notification':
        return <NotificationSettings />;
      case 'social':
        return <SocialSettings />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className={`h-full flex ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      {/* Left Sidebar - Settings Options */}
      <div className={`w-64 border-r ${isDark ? 'border-dark-border bg-dark-sidebar' : 'border-light-border bg-light-sidebar'} flex flex-col`}>
        <div className={`p-6 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <div className="flex items-center gap-3">
            <Settings className={`w-6 h-6 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Settings</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-dark">
          <div className="space-y-1">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeSection === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setActiveSection(option.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'bg-dark-bg text-brand-accent-400 border-l-2 border-brand-accent-500'
                        : 'bg-light-bg text-brand-accent-600 border-l-2 border-brand-accent-500'
                      : isDark
                        ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                        : 'text-light-text-secondary hover:text-light-text hover:bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? (isDark ? 'text-brand-accent-400' : 'text-brand-accent-600') : ''}`} />
                  <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{option.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark">
        <div className="p-8">
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

