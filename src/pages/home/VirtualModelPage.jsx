import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { User, ArrowLeft, Loader2, Download, Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, getFileUrl } from '../../api/files';
import { sendMessage } from '../../api/chat';
import { useProgressStream } from '../../hooks/useProgressStream';
import ProcessCard from '../../components/progress/ProcessCard';

const VirtualModelPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [productImage, setProductImage] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [personImage, setPersonImage] = useState(null);
  const [personFile, setPersonFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [useCustomPerson, setUseCustomPerson] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isUploadingPerson, setIsUploadingPerson] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [dragActiveProduct, setDragActiveProduct] = useState(false);
  const [dragActivePerson, setDragActivePerson] = useState(false);

  const productInputRef = useRef(null);
  const personInputRef = useRef(null);

  // Available models from public/models directory
  const availableModels = [
    { value: 'model_female_1.jpg', label: 'Female Model 1', image: '/models/model_female_1.jpg' },
    { value: 'model_female_2.jpg', label: 'Female Model 2', image: '/models/model_female_2.jpg' },
    { value: 'model_male_1.jpg', label: 'Male Model 1', image: '/models/model_male_1.jpg' },
    { value: 'model_male_2.jpg', label: 'Male Model 2', image: '/models/model_male_2.jpg' }
  ];

  // Chat pipeline state
  const [sessionId] = useState(() => `virtual-model-${Date.now()}`);
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

  const handleProductFileSelect = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingProduct(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setProductImage(e.target.result);
      reader.readAsDataURL(file);
      
      const response = await uploadFile(file);
      setProductFile(response);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingProduct(false);
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
      if (type === 'product') setDragActiveProduct(true);
      else setDragActivePerson(true);
    } else if (e.type === 'dragleave') {
      if (type === 'product') setDragActiveProduct(false);
      else setDragActivePerson(false);
    }
  };

  const handleDrop = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'product') setDragActiveProduct(false);
    else setDragActivePerson(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'product') {
        handleProductFileSelect(e.dataTransfer.files[0]);
      } else {
        handlePersonFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleRemoveProduct = () => {
    setProductImage(null);
    setProductFile(null);
    if (productInputRef.current) productInputRef.current.value = '';
  };

  const handleRemovePerson = () => {
    setPersonImage(null);
    setPersonFile(null);
    if (personInputRef.current) personInputRef.current.value = '';
  };

  const handleModelSelect = (modelValue) => {
    setSelectedModel(modelValue);
    setUseCustomPerson(false);
    setPersonImage(null);
    setPersonFile(null);
  };

  const handleUseCustomPersonChange = (checked) => {
    setUseCustomPerson(checked);
    if (checked) {
      setSelectedModel('');
    }
  };

  const handleProcess = async () => {
    if (!productFile) {
      setError('Please upload a product image');
      return;
    }

    if (!useCustomPerson && !selectedModel) {
      setError('Please select a model or upload a person image');
      return;
    }

    if (useCustomPerson && !personFile) {
      setError('Please upload a person image');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    progressStream.clear();

    const personImageRef = useCustomPerson ? personFile.filename : selectedModel;
    const message = `Create a virtual model visualization: place the product from "${productFile.filename}" on ${useCustomPerson ? 'the uploaded person' : `model "${selectedModel}"`}.
${useCustomPerson ? `Person image: "${personFile.filename}"` : `Model image: "${selectedModel}"`}
Create a realistic visualization showing how the product looks on the model/person.`;

    const cardId = `card-${Date.now()}`;
    setProcessCard({
      id: cardId,
      query: message,
      steps: [],
      status: 'processing',
      isCollapsed: false
    });

    try {
      const contextFiles = [productFile.filename];
      if (useCustomPerson && personFile) {
        contextFiles.push(personFile.filename);
      }

      const result = await sendMessage(
        message,
        contextFiles,
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
      a.download = `virtual-model-result-${Date.now()}.png`;
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

  const selectedModelData = availableModels.find(m => m.value === selectedModel);

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
            <User className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Virtual Model
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            {/* Product Upload */}
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <Upload className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Upload Product Image
              </h3>
              
              <input
                ref={productInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleProductFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div
                onDragEnter={handleDrag('product')}
                onDragLeave={handleDrag('product')}
                onDragOver={handleDrag('product')}
                onDrop={handleDrop('product')}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActiveProduct 
                    ? 'border-brand-accent-500 bg-brand-accent-50/50' 
                    : isDark
                      ? 'border-dark-border bg-dark-sidebar hover:border-brand-accent-500/50'
                      : 'border-light-border bg-light-bg hover:border-brand-accent-300'
                }`}
              >
                {productImage ? (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt="Product"
                      className="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={handleRemoveProduct}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isUploadingProduct ? (
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
                        onClick={() => productInputRef.current?.click()}
                        disabled={isUploadingProduct}
                        className="px-3 py-1.5 bg-brand-accent-500 text-white rounded-lg font-medium text-xs hover:bg-brand-accent-600 transition-colors disabled:opacity-50"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Person/Model Selection */}
            <div className={`rounded-xl border p-6 ${
              isDark 
                ? 'bg-dark-surface border-dark-border' 
                : 'bg-white border-light-border'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <User className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Select Model or Upload Person
              </h3>

              {/* Use Custom Person Checkbox */}
              <div className="mb-4">
                <label className={`flex items-center gap-2 cursor-pointer ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  <input
                    type="checkbox"
                    checked={useCustomPerson}
                    onChange={(e) => handleUseCustomPersonChange(e.target.checked)}
                    className={`w-4 h-4 rounded border-2 transition-all ${
                      isDark
                        ? 'border-dark-border bg-dark-sidebar checked:bg-brand-accent-500 checked:border-brand-accent-500'
                        : 'border-light-border bg-light-bg checked:bg-brand-accent-500 checked:border-brand-accent-500'
                    } focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isProcessing}
                  />
                  <span className="text-sm font-medium">Upload custom person image</span>
                </label>
              </div>

              {useCustomPerson ? (
                <div>
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
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Select Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelSelect(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-dark-sidebar border-dark-border text-dark-text focus:border-brand-accent-500'
                        : 'bg-light-bg border-light-border text-light-text focus:border-brand-accent-500'
                    } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
                    disabled={isProcessing}
                  >
                    <option value="">Select a model...</option>
                    {availableModels.map(model => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                  
                  {selectedModelData && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                    }`}>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Selected Model Preview:
                      </p>
                      <img
                        src={selectedModelData.image}
                        alt={selectedModelData.label}
                        className="w-24 h-24 object-cover rounded-lg mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleProcess}
              disabled={!productFile || (!useCustomPerson && !selectedModel) || (useCustomPerson && !personFile) || isProcessing}
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
                  <User className="w-5 h-5" />
                  Process Virtual Model
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
                title="Virtual Model Processing"
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

          {/* Right Panel - Preview & Result */}
          <div className={`rounded-xl border p-6 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                <User className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                Preview & Result
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

            {/* Preview Section */}
            {(productImage || personImage || selectedModelData) && !resultImage && (
              <div className="mb-6 space-y-4">
                <h4 className={`text-sm font-medium ${
                  isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Upload Preview:
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {productImage && (
                    <div className={`p-3 rounded-lg border ${
                      isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                    }`}>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Product
                      </p>
                      <img
                        src={productImage}
                        alt="Product preview"
                        className="w-full h-32 object-contain rounded"
                      />
                    </div>
                  )}
                  {(personImage || selectedModelData) && (
                    <div className={`p-3 rounded-lg border ${
                      isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-bg border-light-border'
                    }`}>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        {useCustomPerson ? 'Person' : 'Model'}
                      </p>
                      <img
                        src={personImage || selectedModelData?.image}
                        alt={useCustomPerson ? 'Person preview' : 'Model preview'}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result Section */}
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
                  <User className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? 'text-dark-text-muted opacity-30' : 'text-light-text-muted opacity-30'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Upload product image and select/upload model to see results
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

export default VirtualModelPage;

