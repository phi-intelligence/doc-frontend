/**
 * useConnect Hook - Manages Connect feature state for all app integrations
 * 
 * Supports: Gmail, Google Drive, Google Docs, HubSpot, Airtable
 */
import { useState, useCallback, useEffect } from 'react';

// Use relative URLs (same as rest of the app)
const API_BASE = '/api';

// Default connectors list
const DEFAULT_CONNECTORS = [
    { id: 'gmail', name: 'Gmail', emoji: '✉️', category: 'Email' },
    { id: 'googledrive', name: 'Google Drive', emoji: '📁', category: 'Storage' },
    { id: 'googledocs', name: 'Google Docs', emoji: '📄', category: 'Docs' },
    { id: 'hubspot', name: 'HubSpot', emoji: '🟠', category: 'CRM' },
    { id: 'airtable', name: 'Airtable', emoji: '📊', category: 'Database' },
];

export function useConnect(sessionId) {
    // Available connectors from backend
    const [connectors, setConnectors] = useState(DEFAULT_CONNECTORS);

    // Connection status per connector (has OAuth been done)
    const [connectionStatus, setConnectionStatus] = useState({});

    // Active state per connector (user has toggled ON for this session)
    const [activeConnectors, setActiveConnectors] = useState({});

    // Service availability
    const [connectAvailable, setConnectAvailable] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check service availability and fetch connectors on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                // Check service status
                const statusResp = await fetch(`${API_BASE}/connect/status`);
                if (statusResp.ok) {
                    const data = await statusResp.json();
                    setConnectAvailable(data.available);

                    if (data.available) {
                        // Fetch available apps
                        const appsResp = await fetch(`${API_BASE}/connect/apps`);
                        if (appsResp.ok) {
                            const apps = await appsResp.json();
                            setConnectors(apps);
                        }
                    }
                }
            } catch (err) {
                console.log('Connect service not available:', err);
                setConnectAvailable(false);
            }
        };

        initialize();
    }, []);

    // Check all connection statuses when sessionId changes
    useEffect(() => {
        const checkAllConnections = async () => {
            if (!connectAvailable || !sessionId) return;

            const statuses = {};
            for (const connector of connectors) {
                try {
                    const resp = await fetch(
                        `${API_BASE}/connect/status/${connector.id}?user_id=${sessionId}`
                    );
                    if (resp.ok) {
                        const data = await resp.json();
                        statuses[connector.id] = data.connected;
                    }
                } catch (err) {
                    statuses[connector.id] = false;
                }
            }
            setConnectionStatus(statuses);
        };

        checkAllConnections();
    }, [sessionId, connectAvailable, connectors]);

    // Toggle a connector's active state (only if connected)
    const toggleConnector = useCallback((appId) => {
        if (!connectionStatus[appId]) {
            console.warn(`Cannot toggle ${appId} - not connected`);
            return;
        }

        setActiveConnectors(prev => ({
            ...prev,
            [appId]: !prev[appId]
        }));
    }, [connectionStatus]);

    // Initiate OAuth connection for an app
    const connectApp = useCallback(async (appId) => {
        if (!sessionId) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/connect/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app: appId, user_id: sessionId })
            });

            if (!response.ok) {
                throw new Error('Failed to initiate connection');
            }

            const data = await response.json();

            if (data.status === 'already_connected') {
                setConnectionStatus(prev => ({ ...prev, [appId]: true }));
                // Auto-activate on connect
                setActiveConnectors(prev => ({ ...prev, [appId]: true }));
                return { connected: true };
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
                                    setConnectionStatus(prev => ({ ...prev, [appId]: status.connected }));
                                    if (status.connected) {
                                        // Auto-activate on successful connect
                                        setActiveConnectors(prev => ({ ...prev, [appId]: true }));
                                    }
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
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    // Get current integrations state for API calls
    const getIntegrations = useCallback(() => {
        const result = {};
        for (const [appId, isActive] of Object.entries(activeConnectors)) {
            if (isActive && connectionStatus[appId]) {
                result[appId] = true;
            }
        }
        return result;
    }, [activeConnectors, connectionStatus]);

    // Legacy compatibility - drive/gmail specific
    const driveEnabled = activeConnectors.googledrive && connectionStatus.googledrive;
    const gmailEnabled = activeConnectors.gmail && connectionStatus.gmail;
    const driveConnected = connectionStatus.googledrive || false;
    const gmailConnected = connectionStatus.gmail || false;

    return {
        // Connectors list
        connectors,

        // Status maps
        connectionStatus,
        activeConnectors,

        // Service status
        connectAvailable,
        loading,
        error,

        // Actions
        toggleConnector,
        connectApp,
        getIntegrations,

        // Legacy compatibility
        driveEnabled,
        gmailEnabled,
        driveConnected,
        gmailConnected,
        toggleDrive: () => toggleConnector('googledrive'),
        toggleGmail: () => toggleConnector('gmail')
    };
}
