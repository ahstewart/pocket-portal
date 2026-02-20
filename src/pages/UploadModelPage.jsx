import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import HuggingFaceSearch from '../components/HuggingFaceSearch';
import { ArrowUpTrayIcon, CheckCircleIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const UploadModelPage = () => {
  const navigate = useNavigate();
  const [showHFSearch, setShowHFSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // STEP 1: MODEL METADATA
  // ==========================================
  const [modelMetadata, setModelMetadata] = useState({
    name: '',
    description: '',
    category: 'utility',
    tags: [],
    task: '',
    license_type: 'unknown',
    hf_model_id: '',
  });

  // ==========================================
  // STEP 2: MODEL VERSION INFO
  // ==========================================
  const [versionInfo, setVersionInfo] = useState({
    version_string: '1.0.0',
    changelog: '',
  });

  // ==========================================
  // STEP 3: ASSETS (File Pointers)
  // ==========================================
  const [assets, setAssets] = useState([
    {
      asset_key: 'model_file',
      asset_type: 'tflite',
      source_url: '',
      file_size_bytes: 0,
      file_hash: '',
      is_hosted_by_us: false,
    }
  ]);

  // ==========================================
  // STEP 4: PIPELINE CONFIGURATION
  // ==========================================
  const [pipelineConfig, setPipelineConfig] = useState({
    input_nodes: [],
    output_nodes: [],
    pre_processing: [],
    post_processing: [],
    asset_map: {},
  });

  const categories = [
    { value: 'utility', label: 'Utility' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'performance', label: 'Performance' },
    { value: 'fun', label: 'Fun' },
    { value: 'other', label: 'Other' }
  ];

  const assetTypes = [
    { value: 'tflite', label: 'TFLite Model' },
    { value: 'label_txt', label: 'Label File' },
    { value: 'vocab_txt', label: 'Vocabulary File' },
    { value: 'config_json', label: 'Config JSON' },
  ];

  const licenseOptions = [
    { value: 'apache-2.0', label: 'Apache 2.0' },
    { value: 'mit', label: 'MIT' },
    { value: 'bsd', label: 'BSD' },
    { value: 'cc-by-4.0', label: 'CC BY 4.0' },
    { value: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0' },
    { value: 'openrail', label: 'OpenRAIL' },
    { value: 'gpl-3.0', label: 'GPL 3.0' },
    { value: 'unknown', label: 'Unknown' },
  ];

  const handleHFModelSelect = (hfModelData) => {
    setModelMetadata(prev => ({
      ...prev,
      name: hfModelData.name || prev.name,
      description: hfModelData.description || prev.description,
      category: hfModelData.category || prev.category,
      tags: hfModelData.tags || prev.tags,
      task: hfModelData.task || prev.task,
      hf_model_id: hfModelData.hf_model_id || prev.hf_model_id,
    }));
  };

  const handleAddAsset = () => {
    setAssets(prev => [
      ...prev,
      {
        asset_key: '',
        asset_type: 'tflite',
        source_url: '',
        file_size_bytes: 0,
        file_hash: '',
        is_hosted_by_us: false,
      }
    ]);
  };

  const handleUpdateAsset = (index, field, value) => {
    setAssets(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveAsset = (index) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPreProcessingStep = () => {
    setPipelineConfig(prev => ({
      ...prev,
      pre_processing: [
        ...prev.pre_processing,
        { step_name: '', params: {} }
      ]
    }));
  };

  const handleAddPostProcessingStep = () => {
    setPipelineConfig(prev => ({
      ...prev,
      post_processing: [
        ...prev.post_processing,
        { step_name: '', params: {} }
      ]
    }));
  };

  const handleUpdatePipelineInputNode = (index, value) => {
    setPipelineConfig(prev => {
      const updated = [...prev.input_nodes];
      updated[index] = value;
      return { ...prev, input_nodes: updated };
    });
  };

  const handleUpdatePipelineOutputNode = (index, value) => {
    setPipelineConfig(prev => {
      const updated = [...prev.output_nodes];
      updated[index] = value;
      return { ...prev, output_nodes: updated };
    });
  };

  const handleAddInputNode = () => {
    setPipelineConfig(prev => ({
      ...prev,
      input_nodes: [...prev.input_nodes, '']
    }));
  };

  const handleAddOutputNode = () => {
    setPipelineConfig(prev => ({
      ...prev,
      output_nodes: [...prev.output_nodes, '']
    }));
  };

  const handleRemoveInputNode = (index) => {
    setPipelineConfig(prev => ({
      ...prev,
      input_nodes: prev.input_nodes.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveOutputNode = (index) => {
    setPipelineConfig(prev => ({
      ...prev,
      output_nodes: prev.output_nodes.filter((_, i) => i !== index)
    }));
  };

  const canProceedToStep2 = () => {
    return modelMetadata.name.trim() && modelMetadata.description.trim();
  };

  const canProceedToStep3 = () => {
    return versionInfo.version_string.trim();
  };

  const canProceedToStep4 = () => {
    return assets.length > 0 && assets.every(a => a.asset_key && a.source_url);
  };

  const canCreateModel = () => {
    return canProceedToStep4() && pipelineConfig.input_nodes.length > 0 && pipelineConfig.output_nodes.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreateModel()) {
      setError('Please complete all required fields');
      return;
    }

    try {
      // Here you would call the backend API to create the model and version
      // For now, we'll simulate the process
      setSuccess(true);
      setTimeout(() => {
        navigate('/browse');
      }, 2000);
    } catch (err) {
      setError('Failed to create model. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <CheckCircleIcon className="h-12 w-12 text-accent-lime" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Model Created!</h2>
        <p className="text-slate-600 mb-8">Your model has been successfully created and is now available for users to download.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          View on Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Model</h1>
        <p className="text-slate-600">Add a new mobile-optimized model to the platform</p>
      </div>

      {/* HF Import Banner */}
      {currentStep === 1 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-slate-50 border border-primary-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Quick start: Import from Hugging Face</p>
              <p className="text-sm text-slate-600">Auto-fill model metadata</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowHFSearch(true)}
          >
            Search HF
          </Button>
        </div>
      )}

      {showHFSearch && (
        <HuggingFaceSearch 
          onModelSelect={handleHFModelSelect}
          onClose={() => setShowHFSearch(false)}
        />
      )}

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? 'bg-primary-600 text-black'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step}
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-600">
          <span>Model Info</span>
          <span>Version</span>
          <span>Assets</span>
          <span>Pipeline</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ========== STEP 1: MODEL METADATA ========== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Model Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Model Name *
              </label>
              <input
                type="text"
                value={modelMetadata.name}
                onChange={(e) => setModelMetadata(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., MobileNet v3 Small"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Description *
              </label>
              <textarea
                value={modelMetadata.description}
                onChange={(e) => setModelMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this model do? What are its capabilities?"
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-vertical"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Category
                </label>
                <select
                  value={modelMetadata.category}
                  onChange={(e) => setModelMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  License
                </label>
                <select
                  value={modelMetadata.license_type}
                  onChange={(e) => setModelMetadata(prev => ({ ...prev, license_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {licenseOptions.map(lic => (
                    <option key={lic.value} value={lic.value}>{lic.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Task Type
              </label>
              <input
                type="text"
                value={modelMetadata.task}
                onChange={(e) => setModelMetadata(prev => ({ ...prev, task: e.target.value }))}
                placeholder="e.g., image-classification, object-detection"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Hugging Face Model ID
              </label>
              <input
                type="text"
                value={modelMetadata.hf_model_id}
                onChange={(e) => setModelMetadata(prev => ({ ...prev, hf_model_id: e.target.value }))}
                placeholder="e.g., google/mobilenet_v2_1.0_224"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={modelMetadata.tags.join(', ')}
                onChange={(e) => setModelMetadata(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                }))}
                placeholder="e.g., vision, classification, mobile"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
            </div>
          </div>
        )}

        {/* ========== STEP 2: MODEL VERSION ========== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Version Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Version String *
              </label>
              <input
                type="text"
                value={versionInfo.version_string}
                onChange={(e) => setVersionInfo(prev => ({ ...prev, version_string: e.target.value }))}
                placeholder="1.0.0"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Use semantic versioning (e.g., 1.0.0)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Changelog
              </label>
              <textarea
                value={versionInfo.changelog}
                onChange={(e) => setVersionInfo(prev => ({ ...prev, changelog: e.target.value }))}
                placeholder="What's new in this version?"
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-vertical"
              />
            </div>
          </div>
        )}

        {/* ========== STEP 3: ASSETS ========== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Assets</h2>
            <p className="text-sm text-slate-600">Define the files and resources for this model version. Assets are pointers to files, not the files themselves.</p>

            <div className="space-y-4">
              {assets.map((asset, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-slate-900">Asset {idx + 1}</h4>
                    {assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(idx)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Asset Key *
                      </label>
                      <input
                        type="text"
                        value={asset.asset_key}
                        onChange={(e) => handleUpdateAsset(idx, 'asset_key', e.target.value)}
                        placeholder="e.g., model_file, labels_file"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Asset Type *
                      </label>
                      <select
                        value={asset.asset_type}
                        onChange={(e) => handleUpdateAsset(idx, 'asset_type', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        {assetTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Source URL *
                    </label>
                    <input
                      type="url"
                      value={asset.source_url}
                      onChange={(e) => handleUpdateAsset(idx, 'source_url', e.target.value)}
                      placeholder="https://example.com/model.tflite"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        File Size (bytes)
                      </label>
                      <input
                        type="number"
                        value={asset.file_size_bytes}
                        onChange={(e) => handleUpdateAsset(idx, 'file_size_bytes', parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        File Hash
                      </label>
                      <input
                        type="text"
                        value={asset.file_hash}
                        onChange={(e) => handleUpdateAsset(idx, 'file_hash', e.target.value)}
                        placeholder="sha256:..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={asset.is_hosted_by_us}
                      onChange={(e) => handleUpdateAsset(idx, 'is_hosted_by_us', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Hosted by us</span>
                  </label>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddAsset}
            >
              + Add Another Asset
            </Button>
          </div>
        )}

        {/* ========== STEP 4: PIPELINE ========== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Pipeline Configuration</h2>

            {/* Input Nodes */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Input Nodes *</h3>
              <div className="space-y-2 mb-3">
                {pipelineConfig.input_nodes.map((node, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={node}
                      onChange={(e) => handleUpdatePipelineInputNode(idx, e.target.value)}
                      placeholder="e.g., input_1, image"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInputNode(idx)}
                      className="text-red-600 hover:text-red-700 px-3 py-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddInputNode}
              >
                + Add Input Node
              </Button>
            </div>

            {/* Output Nodes */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Output Nodes *</h3>
              <div className="space-y-2 mb-3">
                {pipelineConfig.output_nodes.map((node, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={node}
                      onChange={(e) => handleUpdatePipelineOutputNode(idx, e.target.value)}
                      placeholder="e.g., output_1, predictions"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOutputNode(idx)}
                      className="text-red-600 hover:text-red-700 px-3 py-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddOutputNode}
              >
                + Add Output Node
              </Button>
            </div>

            {/* Pre-processing */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Pre-processing Steps</h3>
              <p className="text-sm text-slate-600 mb-3">Define data preprocessing steps like normalization, resizing, etc.</p>
              <div className="space-y-2 mb-3">
                {pipelineConfig.pre_processing.map((step, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                    <input
                      type="text"
                      value={step.step_name}
                      onChange={(e) => {
                        setPipelineConfig(prev => {
                          const updated = [...prev.pre_processing];
                          updated[idx].step_name = e.target.value;
                          return { ...prev, pre_processing: updated };
                        });
                      }}
                      placeholder="e.g., resize, normalize, convert_color"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddPreProcessingStep}
              >
                + Add Pre-processing Step
              </Button>
            </div>

            {/* Post-processing */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Post-processing Steps</h3>
              <p className="text-sm text-slate-600 mb-3">Define output processing steps like softmax, NMS, etc.</p>
              <div className="space-y-2 mb-3">
                {pipelineConfig.post_processing.map((step, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                    <input
                      type="text"
                      value={step.step_name}
                      onChange={(e) => {
                        setPipelineConfig(prev => {
                          const updated = [...prev.post_processing];
                          updated[idx].step_name = e.target.value;
                          return { ...prev, post_processing: updated };
                        });
                      }}
                      placeholder="e.g., softmax, nms, decode"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddPostProcessingStep}
              >
                + Add Post-processing Step
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => currentStep === 1 ? navigate(-1) : setCurrentStep(currentStep - 1)}
            className="flex-1"
          >
            {currentStep === 1 ? 'Cancel' : '← Back'}
          </Button>
          
          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                currentStep === 1 ? !canProceedToStep2() :
                currentStep === 2 ? !canProceedToStep3() :
                !canProceedToStep4()
              }
              className="flex-1 flex items-center justify-center gap-2"
            >
              Next <ChevronRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
            >
              Create Model
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
