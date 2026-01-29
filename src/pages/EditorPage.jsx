import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import UniversalEditor from '../components/editors/UniversalEditor';
import { useSession } from '../hooks/useSession';
import { getFileUrl } from '../api/files';
import { ChevronRight, X, Save, AlertTriangle, CheckCircle, Download } from 'lucide-react';

/**
 * EditorPage - Full-screen document editing workspace
 *
 * Features:
 * - Collabora Online integration via UniversalEditor
 * - Save button with unsaved changes tracking
 * - Exit confirmation dialog when unsaved changes exist
 * - PhiAI awareness via RAG re-indexing after save
 */
const EditorPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId } = useSession();
    const editorRef = useRef(null);

    // Get file from location state
    const [file, setFile] = useState(location.state?.file || null);
    const returnTo = location.state?.returnTo || '/chat';

    // Document state
    const [isModified, setIsModified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Handle modified status change from editor
    const handleModifiedChange = useCallback((modified) => {
        setIsModified(modified);
        setSaveStatus(null); // Clear any previous save status
    }, []);

    // Handle save completion
    const handleSaveComplete = useCallback((success, error) => {
        setIsSaving(false);
        if (success) {
            setSaveStatus('success');
            setIsModified(false);
            // Show success toast
            setToastMessage('Document saved successfully!');
            setShowToast(true);
            // Clear success status and toast after 3 seconds
            setTimeout(() => {
                setSaveStatus(null);
                setShowToast(false);
            }, 3000);
        } else {
            setSaveStatus('error');
            setToastMessage('Failed to save document');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
            console.error('Save failed:', error);
        }
    }, []);

    // Trigger save
    const handleSave = useCallback(() => {
        if (editorRef.current && !isSaving) {
            setIsSaving(true);
            editorRef.current.save();
        }
    }, [isSaving]);

    // Handle close/exit request
    const handleCloseRequest = useCallback(() => {
        if (isModified) {
            setShowExitDialog(true);
            setPendingNavigation(returnTo);
        } else {
            // Navigate back with file info so ChatPage can auto-select it
            navigate(returnTo, { state: { returnedFile: file?.filename } });
        }
    }, [isModified, navigate, returnTo, file?.filename]);

    // Handle exit dialog actions
    const handleExitWithSave = useCallback(async () => {
        setShowExitDialog(false);
        if (editorRef.current) {
            setIsSaving(true);
            editorRef.current.save();
            // Wait a bit for save to complete, then navigate with saved file info
            setTimeout(() => {
                navigate(pendingNavigation || returnTo, {
                    state: { savedFile: file?.filename, savedAt: Date.now() }
                });
            }, 1500);
        }
    }, [navigate, pendingNavigation, file, returnTo]);

    const handleExitWithoutSave = useCallback(() => {
        setShowExitDialog(false);
        // Pass file info so ChatPage can auto-select it (even without save)
        navigate(pendingNavigation || returnTo, { state: { returnedFile: file?.filename } });
    }, [navigate, pendingNavigation, file, returnTo]);

    const handleCancelExit = useCallback(() => {
        setShowExitDialog(false);
        setPendingNavigation(null);
    }, []);

    // Prevent accidental browser close when modified
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isModified) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isModified]);

    // Keyboard shortcut for save (Ctrl/Cmd + S)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    // If no file is present, redirect back to chat
    // This check must be AFTER all hooks to comply with React's Rules of Hooks
    if (!file) {
        return <Navigate to="/chat" replace />;
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-light-bg flex flex-col">
            {/* Premium Editor Header */}
            <header className="h-16 border-b border-brand-accent-100/50 bg-white flex items-center justify-between px-6 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <img src="/logophi_brown.png" alt="Phi" className="w-8 h-8 object-contain" />

                    <div className="w-[1px] h-6 bg-brand-accent-100 mx-2" />

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-light-text-secondary/60">
                        <span>WORKSPACE</span>
                        <ChevronRight className="w-3 h-3 text-brand-accent-300" />
                        <span className="text-brand-accent-500">{file.type?.toUpperCase() || 'DOCUMENT'}</span>
                        <ChevronRight className="w-3 h-3 text-brand-accent-300" />
                        <span className="text-light-text tracking-normal normal-case font-bold">{file.filename}</span>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Save Status Indicator */}
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/50 rounded-full border border-green-100/50 text-[10px] font-bold text-green-600 tracking-wider animate-pulse">
                            <CheckCircle className="w-3.5 h-3.5" />
                            SAVED
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50/50 rounded-full border border-red-100/50 text-[10px] font-bold text-red-600 tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            SAVE_FAILED
                        </div>
                    )}

                    {/* Modified Indicator */}
                    {isModified && !saveStatus && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 rounded-full border border-amber-100/50 text-[10px] font-bold text-amber-600 tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            UNSAVED_CHANGES
                        </div>
                    )}

                    {/* Cloud Sync Status */}
                    {!isModified && !saveStatus && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/50 rounded-full border border-green-100/50 text-[10px] font-bold text-green-600 tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            CLOUD_SYNCED
                        </div>
                    )}

                    <div className="w-[1px] h-6 bg-brand-accent-100" />

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isModified}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border active:scale-95 group ${isModified
                            ? 'bg-brand-accent-500 text-white border-brand-accent-600 hover:bg-brand-accent-600 shadow-md'
                            : 'text-light-text-secondary border-brand-accent-100 hover:border-brand-accent-200 bg-brand-accent-50/50'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                SAVING...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                SAVE
                            </>
                        )}
                    </button>

                    {/* Download Button */}
                    <a
                        href={getFileUrl(file.filename)}
                        download={file.filename}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text bg-white border border-brand-accent-100 hover:bg-brand-accent-50 hover:border-brand-accent-200 rounded-xl transition-all active:scale-95 shadow-sm"
                        title="Download document"
                    >
                        <Download className="w-4 h-4 text-brand-accent-500" />
                        DOWNLOAD
                    </a>

                    <div className="w-[1px] h-6 bg-brand-accent-100" />

                    {/* Exit Button */}
                    <button
                        onClick={handleCloseRequest}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95 group"
                    >
                        <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        EXIT_WORKSPACE
                    </button>
                </div>
            </header>

            {/* Main Editor Canvas */}
            <main className="flex-1 relative overflow-hidden bg-white">
                <div className="w-full h-full overflow-hidden relative">
                    <UniversalEditor
                        ref={editorRef}
                        file={file}
                        sessionId={sessionId}
                        onClose={handleCloseRequest}
                        onModifiedChange={handleModifiedChange}
                        onSaveComplete={handleSaveComplete}
                        isFullScreen={true}
                    />
                </div>
            </main>

            {/* Exit Confirmation Dialog */}
            {showExitDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Dialog Header */}
                        <div className="px-6 py-5 border-b border-brand-accent-100/50 bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-light-text">Unsaved Changes</h3>
                                    <p className="text-sm text-light-text-secondary">Save before leaving?</p>
                                </div>
                            </div>
                        </div>

                        {/* Dialog Content */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-light-text-secondary leading-relaxed mb-4">
                                You have unsaved changes in <span className="font-bold text-light-text">{file.filename}</span>.
                                Save now so <span className="font-bold text-brand-accent-600">PhiAI</span> can track your edits and provide better assistance.
                            </p>

                            <div className="flex items-center gap-2 p-3 bg-brand-accent-50/50 rounded-xl border border-brand-accent-100/50">
                                <div className="w-8 h-8 bg-brand-accent-100 rounded-lg flex items-center justify-center">
                                    <img src="/logophi_brown.png" alt="Phi" className="w-5 h-5 object-contain" />
                                </div>
                                <p className="text-xs text-brand-accent-600 font-medium">
                                    Saving updates PhiAI's understanding of your document
                                </p>
                            </div>
                        </div>

                        {/* Dialog Actions */}
                        <div className="px-6 py-4 border-t border-brand-accent-100/50 bg-brand-accent-50/30 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCancelExit}
                                className="px-4 py-2.5 text-sm font-bold text-light-text-secondary hover:text-light-text rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExitWithoutSave}
                                className="px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                            >
                                Don't Save
                            </button>
                            <button
                                onClick={handleExitWithSave}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-brand-accent-500 hover:bg-brand-accent-600 rounded-xl transition-colors shadow-md flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save & Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300`}>
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${saveStatus === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700'
                            : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-700'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${saveStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {saveStatus === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{toastMessage}</p>
                            {saveStatus === 'success' && (
                                <p className="text-xs opacity-70 mt-0.5">PhiAI will now recognize your changes</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;
