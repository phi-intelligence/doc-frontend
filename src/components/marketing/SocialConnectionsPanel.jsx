import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getSocialConnections, 
  connectSocialPlatform, 
  disconnectSocialPlatform 
} from '../../api/marketing';

const PLATFORM_CONFIG = {
  twitter: {
    name: 'Twitter / X',
    icon: '𝕏',
    color: '#000000',
    bgColor: '#f0f0f0'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'in',
    color: '#0077B5',
    bgColor: '#e8f4fc'
  },
  facebook: {
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    bgColor: '#e8f0fe'
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    bgColor: '#fce8ec'
  }
};

export default function SocialConnectionsPanel({ onConnectionChange }) {
  const [connections, setConnections] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState(null);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSocialConnections();
      setConnections(data.connections || []);
      setAvailablePlatforms(data.available_platforms || []);
      setError(null);
    } catch (err) {
      setError('Failed to load connections');
      console.error('Load connections error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = async (platform) => {
    try {
      setConnecting(platform);
      setError(null);
      
      const result = await connectSocialPlatform(platform);
      
      if (result.auth_url) {
        // Open OAuth popup
        const popup = window.open(
          result.auth_url,
          `Connect ${platform}`,
          'width=600,height=700,scrollbars=yes'
        );
        
        // Poll for popup close
        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            // Reload connections after popup closes
            setTimeout(() => {
              loadConnections();
              onConnectionChange?.();
            }, 1000);
          }
        }, 500);
      }
    } catch (err) {
      setError(`Failed to connect ${platform}`);
      console.error('Connect error:', err);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Disconnect from ${PLATFORM_CONFIG[platform]?.name || platform}?`)) {
      return;
    }
    
    try {
      setConnecting(platform);
      await disconnectSocialPlatform(platform);
      await loadConnections();
      onConnectionChange?.();
    } catch (err) {
      setError(`Failed to disconnect ${platform}`);
    } finally {
      setConnecting(null);
    }
  };

  const getConnectionStatus = (platform) => {
    return connections.find(c => c.platform === platform);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Social Media Connections
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        {availablePlatforms.map(platform => {
          const config = PLATFORM_CONFIG[platform] || { 
            name: platform, 
            icon: '🔗', 
            color: '#666',
            bgColor: '#f5f5f5'
          };
          const connection = getConnectionStatus(platform);
          const isConnected = connection?.status === 'connected';
          const isConnecting = connecting === platform;
          
          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              style={{ backgroundColor: isConnected ? config.bgColor : '#fafafa' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: config.color }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{config.name}</div>
                  {isConnected && connection.profile_name && (
                    <div className="text-sm text-gray-500">
                      {connection.profile_username ? `@${connection.profile_username}` : connection.profile_name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                    <button
                      onClick={() => handleDisconnect(platform)}
                      disabled={isConnecting}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting}
                    className="px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: config.color }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Connect your social media accounts to publish content directly from DocFlies.
      </div>
    </div>
  );
}
