import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';

const NotificationSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    productUpdates: true,
    securityAlerts: true,
    weeklyDigest: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationCategories = [
    {
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      key: 'emailNotifications',
    },
    {
      title: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      icon: Bell,
      key: 'pushNotifications',
    },
    {
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: MessageSquare,
      key: 'smsNotifications',
    },
    {
      title: 'Marketing Emails',
      description: 'Receive promotional emails and offers',
      icon: Mail,
      key: 'marketingEmails',
    },
    {
      title: 'Product Updates',
      description: 'Get notified about new features and updates',
      icon: CheckCircle,
      key: 'productUpdates',
    },
    {
      title: 'Security Alerts',
      description: 'Important security and account activity notifications',
      icon: Bell,
      key: 'securityAlerts',
    },
    {
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of your activity',
      icon: Mail,
      key: 'weeklyDigest',
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Notification Settings
        </h2>
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Manage how and when you receive notifications
        </p>
      </div>

      <div className="space-y-4">
        {notificationCategories.map((category) => {
          const Icon = category.icon;
          const isEnabled = settings[category.key];

          return (
            <div
              key={category.key}
              className={`rounded-lg border p-6 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {category.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      {category.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(category.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled
                      ? isDark ? 'bg-brand-accent-500' : 'bg-brand-accent-500'
                      : isDark ? 'bg-dark-sidebar' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationSettings;

