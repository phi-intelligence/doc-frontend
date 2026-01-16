import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, Link as LinkIcon } from 'lucide-react';

const SocialSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    website: '',
  });

  const handleInputChange = (platform, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      key: 'facebook',
      placeholder: 'https://facebook.com/yourprofile',
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      key: 'twitter',
      placeholder: 'https://twitter.com/yourhandle',
      color: '#1DA1F2',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      key: 'instagram',
      placeholder: 'https://instagram.com/yourprofile',
      color: '#E4405F',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      key: 'linkedin',
      placeholder: 'https://linkedin.com/in/yourprofile',
      color: '#0077B5',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      key: 'youtube',
      placeholder: 'https://youtube.com/@yourchannel',
      color: '#FF0000',
    },
    {
      name: 'Website',
      icon: Globe,
      key: 'website',
      placeholder: 'https://yourwebsite.com',
      color: '#6366F1',
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Social Settings
        </h2>
        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          Connect your social media profiles and website
        </p>
      </div>

      <div className="space-y-4">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          const value = socialLinks[platform.key];

          return (
            <div
              key={platform.key}
              className={`rounded-lg border p-6 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: isDark ? `${platform.color}20` : `${platform.color}15` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: platform.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {platform.name}
                  </h3>
                </div>
              </div>
              <div className="relative">
                <LinkIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => handleInputChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-text-muted focus:border-brand-accent-500 focus:ring-1 focus:ring-brand-accent-500'
                      : 'bg-white border-light-border text-light-text placeholder-light-text-muted focus:border-brand-accent-500 focus:ring-1 focus:ring-brand-accent-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isDark
              ? 'bg-brand-accent-500 hover:bg-brand-accent-600 text-white'
              : 'bg-brand-accent-500 hover:bg-brand-accent-600 text-white'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SocialSettings;

