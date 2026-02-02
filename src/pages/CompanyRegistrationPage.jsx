import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { useProgressStream } from '../hooks/useProgressStream';
import { startRegistration, getRegistrationStatus, finalizeRegistration, registerManual } from '../api/company';

import MethodSelection from '../components/registration/MethodSelection';
import UrlInputForm from '../components/registration/UrlInputForm';
import ManualEntryForm from '../components/registration/ManualEntryForm';
import ProfilePreview from '../components/registration/ProfilePreview';
import ScrapedContentFeed from '../components/registration/ScrapedContentFeed';
import ModuleSelection from '../components/registration/ModuleSelection';

// Progress step card component
const ProgressStep = ({ item }) => {
  const isComplete = item.status === 'complete';
  const isError = item.status === 'error';
  const isRunning = item.status === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300
        ${isComplete ? 'bg-green-50/50 border-green-200' : isError ? 'bg-red-50/50 border-red-200' : 'bg-white border-light-border shadow-sm'}
      `}
    >
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm
        ${isComplete ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : 'bg-light-surface text-light-text-secondary border border-light-border'}
      `}>
        {item.icon || (isRunning ? <Loader2 className="w-5 h-5 animate-spin text-brand-accent-600" /> : '📄')}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p className={`font-bold text-sm ${isError ? 'text-red-700' : 'text-light-text'}`}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-light-text-secondary mt-1 truncate font-medium">
            {item.description}
          </p>
        )}
      </div>
      {isComplete && <div className="p-1 rounded-full bg-green-100"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /></div>}
      {isError && <div className="p-1 rounded-full bg-red-100"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" /></div>}
    </motion.div>
  );
};


/**
 * Company Registration Page
 *
 * Multi-phase flow with back navigation:
 * 1. Method Selection - Choose scan or manual entry
 * 2a. URL Input + Scraping - Enter URL and watch progress
 * 2b. Manual Entry - Fill in company details manually
 * 3. Profile Preview - Review and edit extracted/entered data
 * 4. Module Selection - Choose which modules to enable
 */
const CompanyRegistrationPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Phase state with history for back navigation
  // Phases: 'method' | 'url-input' | 'scraping' | 'manual' | 'preview' | 'modules'
  const [phase, setPhase] = useState('method');
  const [phaseHistory, setPhaseHistory] = useState(['method']);
  
  // Registration state
  const [sessionId, setSessionId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pages, setPages] = useState([]);  // Scraped pages for preview
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  
  // Track which flow was taken for progress indicator
  const [flowType, setFlowType] = useState(null); // 'scan' | 'manual'

  // SSE progress stream
  const { items: progressItems, isConnected, isComplete, error: streamError } = useProgressStream(sessionId);

  // Navigate to a new phase (pushes to history)
  const goToPhase = useCallback((nextPhase) => {
    setPhaseHistory(prev => [...prev, nextPhase]);
    setPhase(nextPhase);
  }, []);

  // Go back to previous phase (pops from history)
  const goBack = useCallback(() => {
    if (phaseHistory.length > 1) {
      const newHistory = [...phaseHistory];
      newHistory.pop();
      setPhaseHistory(newHistory);
      setPhase(newHistory[newHistory.length - 1]);
      
      // Clear errors when going back
      setError(null);
    }
  }, [phaseHistory]);

  // Reset to method selection
  const resetToMethod = useCallback(() => {
    setPhase('method');
    setPhaseHistory(['method']);
    setSessionId(null);
    setOrgId(null);
    setProfile(null);
    setPages([]);
    setError(null);
    setFlowType(null);
  }, []);

  // Poll for status when scraping completes
  useEffect(() => {
    if (isComplete && orgId && phase === 'scraping') {
      getRegistrationStatus(orgId)
        .then(response => {
          if (response.status === 'complete') {
            setProfile(response.profile);
            setPages(response.pages || []);  // Store scraped pages for preview
            goToPhase('preview');
          } else if (response.status === 'failed') {
            setError(response.error || 'Scraping failed');
          }
        })
        .catch(err => {
          console.error('Failed to get status:', err);
          setError('Failed to get registration status');
        });
    }
  }, [isComplete, orgId, phase, goToPhase]);

  // Handle stream errors
  useEffect(() => {
    if (streamError) {
      setError(streamError);
    }
  }, [streamError]);

  // === Handlers ===

  // Method selection handlers
  const handleSelectScan = useCallback(() => {
    setFlowType('scan');
    goToPhase('url-input');
  }, [goToPhase]);

  const handleSelectManual = useCallback(() => {
    setFlowType('manual');
    goToPhase('manual');
  }, [goToPhase]);

  // Start website scraping
  const handleStartScraping = useCallback(async (websiteUrl) => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await startRegistration(websiteUrl);
      setSessionId(response.session_id);
      setOrgId(response.org_id);
      goToPhase('scraping');
    } catch (err) {
      console.error('Failed to start registration:', err);
      setError(err.response?.data?.detail || 'Failed to start registration');
    } finally {
      setIsStarting(false);
    }
  }, [goToPhase]);

  // Cancel scraping and go back
  const handleCancelScraping = useCallback(() => {
    // TODO: Optionally call backend to cleanup/cancel
    resetToMethod();
  }, [resetToMethod]);

  // Submit manual entry
  const handleManualSubmit = useCallback(async (profileData) => {
    setIsSubmittingManual(true);
    setError(null);

    try {
      const response = await registerManual(profileData);
      setOrgId(response.org_id);
      setProfile(response.profile || profileData);
      goToPhase('preview');
    } catch (err) {
      console.error('Failed to submit manual registration:', err);
      setError(err.response?.data?.detail || 'Failed to create company profile');
    } finally {
      setIsSubmittingManual(false);
    }
  }, [goToPhase]);

  // Continue to module selection
  const handleContinueToModules = useCallback(() => {
    goToPhase('modules');
  }, [goToPhase]);

  // Handle profile edit
  const handleProfileEdit = useCallback((updatedProfile) => {
    setProfile(updatedProfile);
  }, []);

  // Finalize registration
  const handleFinalizeRegistration = useCallback(async (enabledModules) => {
    if (!orgId) return;

    setIsFinalizing(true);
    setError(null);

    try {
      const response = await finalizeRegistration(
        orgId,
        enabledModules,
        profile?.name
      );

      if (response.success) {
        if (response.token) {
          localStorage.setItem('phidocs_auth_token', response.token);
        }
        navigate(response.redirect_url || '/app/dashboard');
      } else {
        setError('Failed to complete registration');
      }
    } catch (err) {
      console.error('Failed to finalize registration:', err);
      setError(err.response?.data?.detail || 'Failed to complete registration');
    } finally {
      setIsFinalizing(false);
    }
  }, [orgId, profile, navigate]);

  // Filter progress items for display
  const stepItems = progressItems.filter(
    item => ['step_start', 'step_complete', 'step_error', 'substep', 'progress'].includes(item.type)
  );

  // Get current step number for progress indicator
  const getProgressSteps = () => {
    if (flowType === 'scan') {
      return [
        { id: 'method', label: 'Method' },
        { id: 'url-input', label: 'Website' },
        { id: 'scraping', label: 'Scanning' },
        { id: 'preview', label: 'Preview' },
        { id: 'modules', label: 'Modules' },
      ];
    } else if (flowType === 'manual') {
      return [
        { id: 'method', label: 'Method' },
        { id: 'manual', label: 'Details' },
        { id: 'preview', label: 'Preview' },
        { id: 'modules', label: 'Modules' },
      ];
    }
    // Default before selection
    return [
      { id: 'method', label: 'Method' },
      { id: 'details', label: 'Details' },
      { id: 'preview', label: 'Preview' },
      { id: 'modules', label: 'Modules' },
    ];
  };

  const progressSteps = getProgressSteps();
  const currentStepIndex = progressSteps.findIndex(s => 
    s.id === phase || (phase === 'url-input' && s.id === 'url-input') || (phase === 'scraping' && s.id === 'scraping')
  );

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-light-surface/80 backdrop-blur-xl border-b border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg border border-gray-100 overflow-hidden">
                <img src="/genX.png" alt="GendocX" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tight text-light-text group-hover:text-brand-accent-600 transition-colors">
                GENDOC<span className="text-brand-accent-600">X</span>
              </span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 text-light-text-secondary hover:text-light-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        {phase !== 'method' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {progressSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;
              const isClickable = isPast && phase !== 'scraping'; // Can't go back during scraping

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={isClickable ? () => {
                      // Navigate back to this step
                      const targetIndex = phaseHistory.findIndex(p => p === step.id);
                      if (targetIndex >= 0) {
                        const newHistory = phaseHistory.slice(0, targetIndex + 1);
                        setPhaseHistory(newHistory);
                        setPhase(step.id);
                      }
                    } : undefined}
                    disabled={!isClickable}
                    className={`
                      flex flex-col items-center gap-1 transition-all
                      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        transition-all
                        ${isActive
                          ? 'bg-brand-accent-600 text-white shadow-lg shadow-brand-accent-600/30'
                          : isPast
                            ? 'bg-green-500 text-white'
                            : 'bg-light-surface text-light-text-secondary'
                        }
                      `}
                    >
                      {isPast ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-brand-accent-600' : 'text-light-text-secondary'}`}>
                      {step.label}
                    </span>
                  </button>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`w-12 h-1 rounded ${
                        isPast ? 'bg-green-500' : 'bg-light-border'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Scraping Phase - Two Column Layout */}
        {phase === 'scraping' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Status */}
            <div>
              <div className="bg-white rounded-[32px] border border-light-border p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-[20px] bg-brand-accent-50 border border-brand-accent-100 flex items-center justify-center shadow-sm">
                    <Building2 className="w-8 h-8 text-brand-accent-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-light-text tracking-tight">
                      Analyzing Domain
                    </h2>
                    <p className="text-sm font-medium text-light-text-secondary mt-1 flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Live Intelligence Feed
                        </>
                      ) : (
                        'Establishing Secure Connection...'
                      )}
                    </p>
                  </div>
                  {!isComplete && (
                    <div className="p-3 rounded-full bg-brand-accent-50">
                       <Loader2 className="w-6 h-6 animate-spin text-brand-accent-600" />
                    </div>
                  )}
                </div>

                {/* Progress Steps */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {stepItems.map((item, index) => (
                      <ProgressStep key={item.id || index} item={item} />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Cancel Button */}
                <div className="mt-8 pt-6 border-t border-light-border">
                  <button
                    onClick={handleCancelScraping}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-bold text-light-text-secondary hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <X className="w-4 h-4" />
                    Abort Operation
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Scraped Content Feed */}
            <div>
              <ScrapedContentFeed items={progressItems} />

              {progressItems.filter(i => i.type === 'content_card').length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-accent-500 mb-4" />
                  <p className="text-light-text-secondary">
                    Waiting for content...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single Column for other phases */
          <div className="w-full">
            <AnimatePresence mode="wait">
              {phase === 'method' && (
                <MethodSelection
                  key="method"
                  onSelectScan={handleSelectScan}
                  onSelectManual={handleSelectManual}
                />
              )}

              {phase === 'url-input' && (
                <motion.div
                  key="url-input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={goBack}
                      className="p-2 rounded-xl text-light-text-secondary hover:text-light-text hover:bg-light-surface transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-light-text-secondary">Back to method selection</span>
                  </div>
                  <UrlInputForm
                    onSubmit={handleStartScraping}
                    isLoading={isStarting}
                  />
                </motion.div>
              )}

              {phase === 'manual' && (
                <ManualEntryForm
                  key="manual"
                  onSubmit={handleManualSubmit}
                  onBack={goBack}
                  isLoading={isSubmittingManual}
                />
              )}

              {phase === 'preview' && (
                <ProfilePreview
                  key="preview"
                  profile={profile}
                  pages={pages}
                  onEdit={handleProfileEdit}
                  onContinue={handleContinueToModules}
                  onBack={goBack}
                />
              )}

              {phase === 'modules' && (
                <ModuleSelection
                  key="modules"
                  onSubmit={handleFinalizeRegistration}
                  onBack={goBack}
                  isLoading={isFinalizing}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyRegistrationPage;
