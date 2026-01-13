/**
 * ConnectMenu - Dropdown menu showing available app connectors
 * 
 * Displays Gmail, Google Drive, Google Docs, HubSpot, Airtable with connection status
 * Also shows active connector chips next to the + button
 */
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Link, X, Loader2 } from 'lucide-react';

// Default connectors if API fails
const DEFAULT_CONNECTORS = [
    { id: 'gmail', name: 'Gmail', emoji: '✉️', category: 'Email' },
    { id: 'googledrive', name: 'Google Drive', emoji: '📁', category: 'Storage' },
    { id: 'googledocs', name: 'Google Docs', emoji: '📄', category: 'Docs' },
    { id: 'hubspot', name: 'HubSpot', emoji: '🟠', category: 'CRM' },
    { id: 'airtable', name: 'Airtable', emoji: '📊', category: 'Database' },
];

export default function ConnectMenu({
    sessionId,
    connectors = DEFAULT_CONNECTORS,
    connectionStatus = {},
    activeConnectors = {},
    onToggleConnector,
    onConnectApp,
    loading = false,
    connectAvailable = true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [connecting, setConnecting] = useState(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle connector click
    const handleConnectorClick = async (connector) => {
        const isConnected = connectionStatus[connector.id];

        if (isConnected) {
            // Toggle active state
            onToggleConnector?.(connector.id);
        } else {
            // Initiate OAuth connection
            setConnecting(connector.id);
            try {
                await onConnectApp?.(connector.id);
            } finally {
                setConnecting(null);
            }
        }
    };

    // Get list of active connectors with their info
    const activeConnectorsList = connectors.filter(c => activeConnectors[c.id]);

    if (!connectAvailable) {
        return null;
    }

    return (
        <div className="flex items-center gap-1" ref={menuRef}>
            {/* Active Connector Chips - shown next to + button */}
            {activeConnectorsList.map((connector) => (
                <button
                    key={connector.id}
                    type="button"
                    onClick={() => onToggleConnector?.(connector.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-brand-accent-50 text-brand-accent-700 rounded-lg text-xs font-medium hover:bg-brand-accent-100 transition-all"
                    title={`${connector.name} active - Click to disable`}
                >
                    <span>{connector.emoji}</span>
                    <X className="w-3 h-3 opacity-60" />
                </button>
            ))}

            {/* Plus Button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            p-2 rounded-lg transition-all relative
            ${isOpen
                            ? 'bg-brand-accent-100 text-brand-accent-600'
                            : 'text-light-text-secondary hover:text-light-text hover:bg-gray-100'
                        }
          `}
                    title="Connect apps"
                >
                    <Plus className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-lg border border-light-border overflow-hidden z-50">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-light-border bg-gray-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-light-text">Connect Apps</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-light-text-muted hover:text-light-text"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-light-text-muted mt-1">
                                Save documents, send emails, sync with CRM
                            </p>
                        </div>

                        {/* Connectors List */}
                        <div className="py-2 max-h-64 overflow-y-auto">
                            {connectors.map((connector) => {
                                const isConnected = connectionStatus[connector.id];
                                const isActive = activeConnectors[connector.id];
                                const isConnecting = connecting === connector.id;

                                return (
                                    <button
                                        key={connector.id}
                                        onClick={() => handleConnectorClick(connector)}
                                        disabled={isConnecting}
                                        className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-all
                      ${isActive
                                                ? 'bg-brand-accent-50 border-l-2 border-brand-accent-500'
                                                : 'hover:bg-gray-50 border-l-2 border-transparent'
                                            }
                      ${isConnecting ? 'opacity-50 cursor-wait' : ''}
                    `}
                                    >
                                        {/* Emoji Icon */}
                                        <span className="text-xl w-6 text-center">{connector.emoji}</span>

                                        {/* Name */}
                                        <span className={`flex-1 text-left text-sm ${isActive ? 'font-medium text-brand-accent-700' : 'text-light-text'}`}>
                                            {connector.name}
                                        </span>

                                        {/* Status Indicator */}
                                        <div className="flex items-center gap-1">
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 text-brand-accent-500 animate-spin" />
                                            ) : isConnected ? (
                                                isActive ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <Check className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-green-500">
                                                        <Check className="w-4 h-4" />
                                                        <span className="text-xs">Connected</span>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-1 text-light-text-muted">
                                                    <Link className="w-4 h-4" />
                                                    <span className="text-xs">Connect</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer with active count */}
                        {activeConnectorsList.length > 0 && (
                            <div className="px-4 py-2 border-t border-light-border bg-gray-50">
                                <p className="text-xs text-light-text-muted">
                                    {activeConnectorsList.length} app{activeConnectorsList.length > 1 ? 's' : ''} active for this chat
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
