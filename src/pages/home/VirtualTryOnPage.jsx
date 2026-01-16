import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Shirt, ArrowLeft, Loader2, Download, Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, getFileUrl } from '../../api/files';
import { sendMessage } from '../../api/chat';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';

const VirtualTryOnPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [clothImage, setClothImage] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [personImage, setPersonImage] = useState(null);
  const [personFile, setPersonFile] = useState(null);
  const [isUploadingCloth, setIsUploadingCloth] = useState(false);
  const [isUploadingPerson, setIsUploadingPerson] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [dragActiveCloth, setDragActiveCloth] = useState(false);
  const [dragActivePerson, setDragActivePerson] = useState(false);

  const clothInputRef = useRef(null);
  const personInputRef = useRef(null);

  // Chat pipeline state
  const [sessionId] = useState(() => `virtual-tryon-${Date.now()}`);
  const [processCard, setProcessCard] = useState(null);
  const progressStream = useProgressStream(sessionId);

  const processCardRef = useRef(processCard);

  useEffect(() => {
    processCardRef.current = processCard;
  }, [processCard]);

  useEffect(() => {
    const currentCard = processCardRef.current;
    if (progressStream.items.length > 0 && currentCard && currentCard.status === 'processing') {
      const currentStepsLength = currentCard.steps?.length || 0;
      if (progressStream.items.length !== currentStepsLength) {
        setProcessCard(prev => {
          if (!prev || prev.status !== 'processing') return prev;
          return { ...prev, steps: [...progressStream.items] };
        });
      }
    }
  }, [progressStream.items.length]);

  const handleClothFileSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingCloth(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setClothImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setClothFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingCloth(false);
    }
  };

  const handlePersonFileSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingPerson(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setPersonImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setPersonFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingPerson(false);
    }
  };

  const handleDrag = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (type === 'cloth') setDragActiveCloth(true);
      else setDragActivePerson(true);
    } else if (e.type === 'dragleave') {
      if (type === 'cloth') setDragActiveCloth(false);
      else setDragActivePerson(false);
    }
  };

  const handleDrop = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'cloth') setDragActiveCloth(false);
    else setDragActivePerson(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'cloth') {
        handleClothFileSelect(e.dataTransfer.files[0]);
      } else {
        handlePersonFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleRemoveCloth = () => {
    setClothImage(null);
    setClothFile(null);
    if (clothInputRef.current) clothInputRef.current.value = '';
  };

  const handleRemovePerson = () => {
    setPersonImage(null);
    setPersonFile(null);
    if (personInputRef.current) personInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!clothFile || !personFile) {
      setError('Please upload both cloth and person images');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    progressStream.clear();

    const message = `Perform virtual try-on: place the clothing from "${clothFile.filename}" onto the person in "${personFile.filename}".
Create a realistic visualization of how the clothing looks on the person.
Maintain natural fit and appearance.`;

    const cardId = `card-${Date.now()}`;
    setProcessCard({
      id: cardId,
      query: message,
      steps: [],
      status: 'processing',
      isCollapsed: false
    });

    try {
      const result = await sendMessage(
        message,
        [clothFile.filename, personFile.filename],
        sessionId,
        null,
        null,
        null,
        null,
        null
      );

      setProcessCard(prev => prev ? {
        ...prev,
        status: 'completed',
        finalResult: result.response
      } : null);

      if (result.new_artifacts && result.new_artifacts.length > 0) {
        const imageArtifact = result.new_artifacts.find(f => 
          f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
        ) || result.new_artifacts[0];
        
        setResultImage(getFileUrl(imageArtifact));
      }
    } catch (err) {
      setProcessCard(prev => prev ? {
        ...prev,
        status: 'error',
        finalResult: err.response?.data?.detail || err.message || 'Processing failed'
      } : null);
      setError(err.response?.data?.detail || err.message || 'Failed to process images');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `virtual-tryon-result-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleSave = async () => {
    handleDownload();
  };

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home/product-design')}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface'
                : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Shirt className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Virtual Try On
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            {/* Cloth Upload */}
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Upload className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Upload Clothing Image
              </h3>
              
              <input
                ref={clothInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleClothFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div
                onDragEnter={handleDrag('cloth')}
                onDragLeave={handleDrag('cloth')}
                onDragOver={handleDrag('cloth')}
                onDrop={handleDrop('cloth')}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActiveCloth 
                    ? 'border-brand-accent-500 bg-brand-accent-50/50' 
                    : isDark
                      ? 'border-dark-border bg-dark-sidebar hover:border-brand-accent-500/50'
                      : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                }`}
              >
                {clothImage ? (
                  <div className="relative">
                    <img
                      src={clothImage}
                      alt="Cloth"
                      className="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={handleRemoveCloth}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isUploadingCloth ? (
                      <Loader2 className="w-10 h-10 mx-auto text-brand-accent-500 animate-spin" />
                    ) : (
                      <Upload className={`w-10 h-10 mx-auto ${
                        isDark ? 'text-dark-text-muted' : 'text-light-text-muted'
                      }`} />
                    )}
                    <div>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Drag and drop or click to upload
                      </p>
                      <button
                        onClick={() => clothInputRef.current?.click()}
                        disabled={isUploadingCloth}
                        className="px-3 py-1.5 bg-brand-accent-500 text-white rounded-lg font-medium text-xs hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Person Upload */}
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Upload className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Upload Person Image
              </h3>
              
              <input
                ref={personInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handlePersonFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div
                onDragEnter={handleDrag('person')}
                onDragLeave={handleDrag('person')}
                onDragOver={handleDrag('person')}
                onDrop={handleDrop('person')}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActivePerson 
                    ? 'border-brand-accent-500 bg-brand-accent-50/50' 
                    : isDark
                      ? 'border-dark-border bg-dark-sidebar hover:border-brand-accent-500/50'
                      : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                }`}
              >
                {personImage ? (
                  <div className="relative">
                    <img
                      src={personImage}
                      alt="Person"
                      className="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={handleRemovePerson}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isUploadingPerson ? (
                      <Loader2 className="w-10 h-10 mx-auto text-brand-accent-500 animate-spin" />
                    ) : (
                      <Upload className={`w-10 h-10 mx-auto ${
                        isDark ? 'text-dark-text-muted' : 'text-light-text-muted'
                      }`} />
                    )}
                    <div>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Drag and drop or click to upload
                      </p>
                      <button
                        onClick={() => personInputRef.current?.click()}
                        disabled={isUploadingPerson}
                        className="px-3 py-1.5 bg-brand-accent-500 text-white rounded-lg font-medium text-xs hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!clothFile || !personFile || isProcessing}
              className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                  : 'bg-gradient-to-r from-brand-accent-500 to-brand-accent-600 text-white hover:from-brand-accent-600 hover:to-brand-accent-700'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shirt className="w-5 h-5" />
                  Process Try-On
                </>
              )}
            </button>

            {error && !processCard && (
              <div className={`p-4 rounded-xl text-sm ${
                isDark
                  ? 'bg-red-900/30 border border-red-800 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {processCard && (processCard.status === 'processing' || processCard.status === 'error') && (
              <ProcessCard
                title="Virtual Try-On Processing"
                query={processCard.query}
                steps={processCard.steps}
                finalResult={processCard.finalResult}
                artifacts={[]}
                status={processCard.status}
                isCollapsed={processCard.isCollapsed}
                onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                onRetry={handleProcess}
              />
            )}
          </div>

          {/* Right Panel - Result */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Shirt className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Result Preview
              </h3>
              {resultImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-dark-sidebar border border-dark-border text-dark-text hover:bg-dark-surface'
                        : 'bg-light-surface border border-light-border text-light-text hover:bg-light-bg'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-brand-accent-500/20 border border-brand-accent-500/30 text-brand-accent-400 hover:bg-brand-accent-500/30'
                        : 'bg-brand-accent-50 border border-brand-accent-200 text-brand-accent-600 hover:bg-brand-accent-100'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {resultImage ? (
              <div className="space-y-4">
                <div className={`aspect-square rounded-xl overflow-hidden border ${
                  isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                } flex items-center justify-center`}>
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {processCard && processCard.status === 'completed' && (
                  <ProcessCard
                    title="Processing Details"
                    query={processCard.query}
                    steps={processCard.steps}
                    finalResult={processCard.finalResult}
                    artifacts={[]}
                    status={processCard.status}
                    isCollapsed={true}
                    onToggle={() => setProcessCard(prev => prev ? { ...prev, isCollapsed: !prev.isCollapsed } : null)}
                    onRetry={handleProcess}
                  />
                )}
              </div>
            ) : (
              <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center ${
                isDark 
                  ? 'bg-dark-sidebar border-dark-border' 
                  : 'bg-light-bg border-light-border'
              }`}>
                <div className="text-center p-8">
                  <Shirt className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Upload both images and click Process to see results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnPage;

