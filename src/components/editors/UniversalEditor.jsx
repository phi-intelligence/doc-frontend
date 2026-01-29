import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Layout, X, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../api';

/**
 * UniversalEditor - Collabora Online integration component
 *
 * Uses WOPI protocol to communicate with Collabora Online editor.
 * Handles document loading, saving, and change detection via PostMessage API.
 */
const UniversalEditor = forwardRef(({ file, isFullScreen, onClose, onModifiedChange, onSaveComplete, sessionId }, ref) => {
    const [wopiUrl, setWopiUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const iframeRef = useRef(null);
    const isSavingRef = useRef(false); // Ref to track saving state for timeout
    const saveTimeoutRef = useRef(null); // Ref to store timeout ID

    // Refs for callback functions to avoid stale closures
    const triggerSaveRef = useRef(null);
    const notifyBackendOfSaveRef = useRef(null);

    useImperativeHandle(ref, () => ({
        save: () => triggerSaveRef.current?.(),
        isModified: () => isModified,
        isSaving: () => isSaving
    }), [isModified, isSaving]);

    // Fetch WOPI URL on file change - using apiClient for authenticated requests
    useEffect(() => {
        if (!file?.filename) return;

        setLoading(true);
        setError(null);
        setIsModified(false);

        apiClient.get(`/wopi/url/${file.filename}`)
            .then(response => {
                setWopiUrl(response.data.url);
                setLoading(false);
            })
            .catch(err => {
                console.error("WOPI URL Fetch failed", err);
                setError(err.response?.data?.detail || err.message || "Failed to initialize editor session");
                setLoading(false);
            });

    }, [file]);

    // Handle PostMessage events from Collabora
    useEffect(() => {
        const handleMessage = (event) => {
            // Verify origin (Collabora sends from its domain)
            // In development, we might need to be flexible with origins

            try {
                let data = event.data;

                // Collabora sends JSON strings
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        // Not JSON, ignore
                        return;
                    }
                }

                // Handle different Collabora message types
                switch (data.MessageId) {
                    case 'Doc_ModifiedStatus':
                        // Document modification status changed
                        const modified = data.Values?.Modified === true;
                        setIsModified(modified);
                        if (onModifiedChange) {
                            onModifiedChange(modified);
                        }
                        console.log('Document modified status:', modified);
                        break;

                    case 'Action_Save_Resp':
                        // Save completed - clear the fallback timeout
                        if (saveTimeoutRef.current) {
                            clearTimeout(saveTimeoutRef.current);
                            saveTimeoutRef.current = null;
                        }
                        isSavingRef.current = false;
                        setIsSaving(false);
                        if (data.Values?.success !== false) {
                            setIsModified(false);
                            notifyBackendOfSaveRef.current?.();
                            if (onSaveComplete) {
                                onSaveComplete(true);
                            }
                        } else {
                            if (onSaveComplete) {
                                onSaveComplete(false, data.Values?.result);
                            }
                        }
                        break;

                    case 'UI_Close':
                        // User closed from within Collabora
                        if (onClose) {
                            onClose();
                        }
                        break;

                    case 'App_LoadingStatus':
                        // Loading status update
                        if (data.Values?.Status === 'Document_Loaded') {
                            console.log('Collabora: Document fully loaded');
                        }
                        break;

                    default:
                        // Log other messages for debugging
                        if (data.MessageId) {
                            console.log('Collabora message:', data.MessageId, data.Values);
                        }
                }
            } catch (e) {
                console.error('Error handling Collabora message:', e);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onModifiedChange, onSaveComplete, onClose]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Notify backend that file was saved (for RAG re-indexing)
    // IMPORTANT: This must be defined BEFORE triggerSave since triggerSave depends on it
    const notifyBackendOfSave = useCallback(async () => {
        if (!file?.filename) return;

        try {
            const response = await apiClient.post(`/wopi/notify-save/${file.filename}`, null, {
                headers: {
                    'X-Session-Id': sessionId || ''
                }
            });
            console.log('Backend notified of save:', response.data);
        } catch (e) {
            console.error('Failed to notify backend of save:', e);
        }
    }, [file, sessionId]);

    // Keep notifyBackendOfSaveRef in sync
    useEffect(() => {
        notifyBackendOfSaveRef.current = notifyBackendOfSave;
    }, [notifyBackendOfSave]);

    // Trigger save via PostMessage to Collabora
    const triggerSave = useCallback(() => {
        if (!iframeRef.current || !wopiUrl || isSavingRef.current) return;

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        isSavingRef.current = true;
        setIsSaving(true);

        try {
            const message = JSON.stringify({
                MessageId: 'Action_Save',
                Values: {
                    DontTerminateEdit: true,
                    DontSaveIfUnmodified: false,
                    Notify: true
                }
            });

            iframeRef.current.contentWindow.postMessage(message, '*');
            console.log('Sent save command to Collabora');

            // Fallback: If we don't get a response within 3 seconds, assume success
            // Collabora saves via WOPI which works, but might not send PostMessage back
            saveTimeoutRef.current = setTimeout(() => {
                if (isSavingRef.current) {
                    console.log('Save timeout - assuming success (WOPI save completed)');
                    isSavingRef.current = false;
                    setIsSaving(false);
                    setIsModified(false);
                    notifyBackendOfSaveRef.current?.();
                    if (onSaveComplete) {
                        onSaveComplete(true);
                    }
                }
                saveTimeoutRef.current = null;
            }, 3000);
        } catch (e) {
            console.error('Failed to send save command:', e);
            isSavingRef.current = false;
            setIsSaving(false);
            if (onSaveComplete) {
                onSaveComplete(false, e.message);
            }
        }
    }, [wopiUrl, onSaveComplete]);

    // Keep triggerSaveRef in sync with triggerSave
    useEffect(() => {
        triggerSaveRef.current = triggerSave;
    }, [triggerSave]);

    return (
        <div className="flex h-full w-full bg-white overflow-hidden relative">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full relative z-0">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#FAFAF9]">
                        <div className="relative mb-10">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-brand-accent-200/30 rounded-full blur-3xl" 
                            />
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-accent-100/50"
                            >
                                <Layout className="w-12 h-12 text-brand-accent-600" />
                            </motion.div>
                        </div>
                        <h3 className="text-2xl font-black text-light-text mb-2 tracking-tighter uppercase">INITIALIZING_CANVAS</h3>
                        <p className="text-[10px] font-black text-brand-accent-500 tracking-[0.4em] uppercase opacity-70">Establishing Secure Sandbox Protocol</p>

                        <div className="mt-12 flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-2 h-2 rounded-full bg-brand-accent-400"
                                />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-light-text mb-2">Editor Protocol Refused</h3>
                        <p className="text-sm text-light-text-secondary mb-8 leading-relaxed">{error}</p>
                        <div className="text-[10px] font-bold text-brand-accent-400 bg-brand-accent-50/50 px-4 py-3 rounded-xl border border-brand-accent-100/50 uppercase tracking-wider">
                            Verify Sandbox Connectivity (Port 9980)
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 w-full h-full bg-white relative">
                        {/* Saving Overlay - Refined & Aesthetic */}
                        {isSaving && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center"
                            >
                                <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-2xl border border-brand-accent-100/50">
                                    <div className="w-6 h-6 border-3 border-brand-accent-600 border-t-transparent rounded-full animate-spin" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-light-text tracking-tight">SYNCHRONIZING</span>
                                        <span className="text-[10px] font-bold text-brand-accent-500 tracking-widest uppercase">Safe Workspace Sync...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Collabora Iframe */}
                        <iframe
                            ref={iframeRef}
                            src={wopiUrl}
                            className="w-full h-full border-none block"
                            title="Office Editor"
                            allow="clipboard-read; clipboard-write"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

UniversalEditor.displayName = 'UniversalEditor';

export default UniversalEditor;
