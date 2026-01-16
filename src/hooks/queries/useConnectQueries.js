import { useMutation, useQuery } from '@tanstack/react-query';
import { showSuccess, showError } from '../../utils/toast';

const API_BASE = '';

// Default connectors list
const DEFAULT_CONNECTORS = [
  { id: 'gmail', name: 'Gmail', emoji: '✉️', category: 'Email' },
  { id: 'googledrive', name: 'Google Drive', emoji: '📁', category: 'Storage' },
  { id: 'googledocs', name: 'Google Docs', emoji: '📄', category: 'Docs' },
  { id: 'hubspot', name: 'HubSpot', emoji: '🟠', category: 'CRM' },
  { id: 'airtable', name: 'Airtable', emoji: '📊', category: 'Database' },
];

/**
 * Query for Connect service availability
 */
export const useConnectStatus = () => {
  return useQuery({
    queryKey: ['connect', 'status'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/connect/status`);
        if (response.ok) {
          const data = await response.json();
          return data.available || false;
        }
        return false;
      } catch (error) {
        console.log('Connect service not available:', error);
        return false;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Query for available connector apps
 */
export const useConnectorApps = () => {
  const { data: connectAvailable } = useConnectStatus();

  return useQuery({
    queryKey: ['connect', 'apps'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/connect/apps`);
        if (response.ok) {
          const apps = await response.json();
          return apps;
        }
        return DEFAULT_CONNECTORS;
      } catch (error) {
        console.log('Error fetching connector apps:', error);
        return DEFAULT_CONNECTORS;
      }
    },
    enabled: connectAvailable === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: DEFAULT_CONNECTORS,
  });
};

/**
 * Query for connection status of a specific connector
 */
export const useConnectionStatus = (connectorId, sessionId) => {
  const { data: connectAvailable } = useConnectStatus();

  return useQuery({
    queryKey: ['connect', 'connection', connectorId, sessionId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE}/connect/status/${connectorId}?user_id=${sessionId}`
        );
        if (response.ok) {
          const data = await response.json();
          return data.connected || false;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    enabled: !!connectAvailable && !!connectorId && !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Mutation to initiate OAuth connection for an app
 */
export const useConnectApp = () => {
  return useMutation({
    mutationFn: async ({ appId, sessionId }) => {
      const response = await fetch(`${API_BASE}/connect/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appId, user_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const data = await response.json();

      if (data.status === 'already_connected') {
        return { connected: true, alreadyConnected: true };
      }

      // Open OAuth popup
      if (data.auth_url) {
        const popup = window.open(data.auth_url, 'oauth', 'width=600,height=700');

        // Poll for popup close
        return new Promise((resolve) => {
          const pollTimer = setInterval(async () => {
            if (popup && popup.closed) {
              clearInterval(pollTimer);

              // Recheck connection status
              try {
                const resp = await fetch(
                  `${API_BASE}/connect/status/${appId}?user_id=${sessionId}`
                );
                if (resp.ok) {
                  const status = await resp.json();
                  resolve({ connected: status.connected });
                }
              } catch (err) {
                resolve({ connected: false });
              }
            }
          }, 500);

          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(pollTimer);
            resolve({ connected: false, timeout: true });
          }, 300000);
        });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      if (data.connected) {
        showSuccess(`${variables.appId} connected successfully`);
      } else if (data.timeout) {
        showError('Connection timeout. Please try again.');
      }
    },
    onError: (error) => {
      showError(error.message || 'Failed to connect app');
    },
  });
};

