import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to connect to the Phi Docs Progress SSE stream.
 * Manages the state of steps, thoughts, code execution, and artifacts.
 */
export const useProgressStream = (sessionId) => {
    const [items, setItems] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    // Refs to avoid dependency cycles in event listeners
    const itemsRef = useRef([]);

    useEffect(() => {
        if (!sessionId) return;

        // Reset state on new session
        setItems([]);
        itemsRef.current = [];
        setIsConnected(false);
        setError(null);
        setIsComplete(false);

        console.log(`Connecting to progress stream for session: ${sessionId}`);

        // Connect to SSE endpoint
        const eventSource = new EventSource(`/api/stream/${sessionId}`);

        eventSource.onopen = () => {
            console.log('Progress stream connected');
            setIsConnected(true);
        };

        eventSource.onerror = (err) => {
            console.error('Progress stream error:', err);
            // Only set error if we haven't completed gracefully
            if (!isComplete) {
                // Don't show generic connection errors to user, just log them
                // unless it's a persistent failure which EventSource handles by retrying
            }
            eventSource.close();
            setIsConnected(false);
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleEvent(data);
            } catch (e) {
                console.error('Failed to parse progress event:', e);
            }
        };

        return () => {
            console.log('Closing progress stream');
            eventSource.close();
        };
    }, [sessionId]);

    const handleEvent = (event) => {
        const currentItems = [...itemsRef.current];
        let updated = false;

        // Helper to find item by ID
        const findItemIndex = (id) => currentItems.findIndex(item => item.id === id);

        switch (event.type) {
            case 'step_start':
            case 'code_start':
            case 'thought':
                // New item - check for duplicates by title if same ID doesn't exist
                if (findItemIndex(event.id) === -1) {
                    // Check for duplicate by title (for deduplication)
                    const existingIdx = currentItems.findIndex(
                        item => item.title === event.title &&
                            item.status === 'running' &&
                            (item.type === 'step_start' || item.type === event.type)
                    );

                    if (existingIdx !== -1) {
                        // Update existing instead of creating new
                        currentItems[existingIdx] = {
                            ...currentItems[existingIdx],
                            ...event,
                            children: currentItems[existingIdx].children || [],
                            output: currentItems[existingIdx].output || ''
                        };
                    } else {
                        currentItems.push({
                            ...event,
                            children: [], // For substeps
                            output: '',   // For code/thought streaming
                        });
                    }
                    updated = true;
                }
                break;

            case 'progress':
                // Filter transient progress events - only show meaningful ones
                // Skip if it's just a status update without significant content
                const isMeaningful = event.title && event.title.length > 0 &&
                    (event.description || event.content || event.duration > 0.5);

                if (isMeaningful && findItemIndex(event.id) === -1) {
                    // Check for duplicate by title
                    const existingIdx = currentItems.findIndex(
                        item => item.title === event.title &&
                            item.status === 'running' &&
                            item.type === 'progress'
                    );

                    if (existingIdx !== -1) {
                        // Update existing instead of creating new
                        currentItems[existingIdx] = {
                            ...currentItems[existingIdx],
                            ...event
                        };
                    } else {
                        currentItems.push({
                            ...event,
                            children: [],
                            output: ''
                        });
                    }
                    updated = true;
                }
                // Skip transient progress events
                break;

            case 'step_complete':
            case 'step_error':
                const stepIdx = findItemIndex(event.id);
                if (stepIdx !== -1) {
                    currentItems[stepIdx] = {
                        ...currentItems[stepIdx],
                        status: event.status,
                        ...event, // Merge any final details
                    };
                    updated = true;
                }
                break;

            case 'code_output':
                const codeIdx = findItemIndex(event.id);
                if (codeIdx !== -1) {
                    // If streaming, append. If full block update (which backend currently does), replace.
                    // Our backend currently sends the FULL block in code_output for code generation,
                    // but might send chunks for other things.
                    // Safe approach: if event.output is significantly longer, assume replacement/append

                    if (event.is_streaming) {
                        currentItems[codeIdx].output = (currentItems[codeIdx].output || '') + event.output;
                    } else if (event.output) {
                        currentItems[codeIdx].output = event.output;
                    }

                    currentItems[codeIdx] = {
                        ...currentItems[codeIdx],
                        status: event.status,
                        duration: event.duration,
                        language: event.language || currentItems[codeIdx].language,  // Preserve language
                        // Store content snippets for document content cards (if present)
                        content_snippets: event.content_snippets || currentItems[codeIdx].content_snippets
                    };
                    updated = true;
                }
                break;

            case 'thought':
                // Handle streaming thought updates (if using same ID) or start new thought
                const thoughtIdx = findItemIndex(event.id);
                if (thoughtIdx !== -1) {
                    // Update existing thought
                    if (event.content) {
                        // For thoughts, we usually append if streaming
                        if (event.is_streaming) {
                            // Check if content already ends with this chunk to avoid duplication if backend sends full history
                            // But backend implementation sends chunks.
                            currentItems[thoughtIdx].output = (currentItems[thoughtIdx].output || '') + event.content;
                        } else {
                            // Complete - replace with final content if provided, or just update status
                            if (event.content) currentItems[thoughtIdx].output = event.content;
                        }
                    }
                    currentItems[thoughtIdx].status = event.status;
                    updated = true;
                } else {
                    // New thought started (handled by first case, but if missed...)
                    currentItems.push({
                        ...event,
                        output: event.content || '',
                        children: []
                    });
                    updated = true;
                }
                break;

            case 'substep':
                if (event.parent_id) {
                    const parentIdx = findItemIndex(event.parent_id);
                    if (parentIdx !== -1) {
                        const parent = currentItems[parentIdx];
                        if (!parent.children) parent.children = [];
                        parent.children.push(event);
                        updated = true;
                    }
                }
                break;

            case 'content_card':
                // Add scraped content card to items (for company registration feed)
                currentItems.push({
                    ...event,
                    children: []
                });
                updated = true;
                break;

            case 'file_created':
                // Add as a special item type or add to a "Files" list?
                // Let's add as a timeline item for now
                currentItems.push(event);
                updated = true;
                break;

            case 'message':
                // Final message - usually handled by chat stream, but good to have in timeline
                currentItems.push(event);
                setIsComplete(true);
                updated = true;
                break;

            case 'error':
                setError(event.error);
                currentItems.push({
                    type: 'error',
                    id: 'error-' + Date.now(),
                    title: 'Error',
                    error: event.error,
                    status: 'error'
                });
                updated = true;
                break;
        }

        if (updated) {
            itemsRef.current = currentItems;
            setItems(currentItems);
        }
    };

    const clear = () => {
        setItems([]);
        itemsRef.current = [];
        setIsComplete(false);
        setError(null);
    };

    return { items, isConnected, error, isComplete, clear };
};
