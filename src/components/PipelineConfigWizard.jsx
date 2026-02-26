import React, { useState } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  CheckIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';

const PREPROCESSING_ACTIONS = [
  { value: 'resize', label: 'Resize', description: 'Resize the input image to specific dimensions' },
  { value: 'normalize', label: 'Normalize', description: 'Normalize pixel values using mean and std' },
  { value: 'center_crop', label: 'Center Crop', description: 'Center crop the image' },
  { value: 'cast_type', label: 'Cast Type', description: 'Convert tensor to a specific data type' },
];

const POSTPROCESSING_ACTIONS = [
  { value: 'softmax', label: 'Softmax', description: 'Apply softmax activation to outputs' },
  { value: 'top_k', label: 'Top-K', description: 'Extract top K results with highest scores' },
  { value: 'map_labels', label: 'Map Labels', description: 'Map numeric outputs to text labels' },
  { value: 'decode_boxes', label: 'Decode Boxes', description: 'Decode bounding box coordinates' },
  { value: 'non_max_suppression', label: 'Non-Max Suppression', description: 'Remove overlapping detections' },
];

const ParamsEditor = ({ action, params = {}, onChange }) => {
  const handleParamChange = (key, value) => {
    onChange({ ...params, [key]: value });
  };

  // Determine which params to show based on action
  const renderParamsForAction = () => {
    switch (action) {
      case 'resize':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Width</label>
              <input
                type="number"
                value={params.width || 224}
                onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="224"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height</label>
              <input
                type="number"
                value={params.height || 224}
                onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="224"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.keep_aspect_ratio || false}
                onChange={(e) => handleParamChange('keep_aspect_ratio', e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Keep aspect ratio</span>
            </label>
          </div>
        );
      case 'normalize':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mean Values (comma-separated)</label>
              <input
                type="text"
                value={(params.mean || []).join(', ')}
                onChange={(e) => handleParamChange('mean', e.target.value.split(',').map(v => parseFloat(v.trim())))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="127.5, 127.5, 127.5"
              />
              <p className="text-xs text-slate-600 mt-1">Common presets: ImageNet: 0.485, 0.456, 0.406</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Standard Deviation Values (comma-separated)</label>
              <input
                type="text"
                value={(params.std || []).join(', ')}
                onChange={(e) => handleParamChange('std', e.target.value.split(',').map(v => parseFloat(v.trim())))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="0.229, 0.224, 0.225"
              />
            </div>
          </div>
        );
      case 'cast_type':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Type</label>
            <select
              value={params.dtype || 'float32'}
              onChange={(e) => handleParamChange('dtype', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="float32">Float32</option>
              <option value="uint8">Unsigned Int8</option>
              <option value="int8">Signed Int8</option>
            </select>
          </div>
        );
      case 'top_k':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">K (Top Results)</label>
            <input
              type="number"
              value={params.k || 5}
              onChange={(e) => handleParamChange('k', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="5"
            />
          </div>
        );
      case 'decode_boxes':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bounding Box Format</label>
            <select
              value={params.format || 'xyxy'}
              onChange={(e) => handleParamChange('format', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="xyxy">Top-Left Bottom-Right (xyxy)</option>
              <option value="xywh">Top-Left Width-Height (xywh)</option>
              <option value="yxyx">Top-Left Bottom-Right Swapped (yxyx)</option>
            </select>
          </div>
        );
      default:
        return <p className="text-sm text-slate-600">This step has no configurable parameters.</p>;
    }
  };

  return <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">{renderParamsForAction()}</div>;
};

const StepCard = ({ step, index, isPreprocessing, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const actions = isPreprocessing ? PREPROCESSING_ACTIONS : POSTPROCESSING_ACTIONS;
  const stepLabel = isPreprocessing ? 'Preprocessing' : 'Postprocessing';

  const actionDetails = actions.find((a) => a.value === step.action);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
            isPreprocessing ? 'bg-primary-600' : 'bg-accent-lime'
          }`}>
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{actionDetails?.label || step.action}</p>
            <p className="text-xs text-slate-600 mt-0.5">{actionDetails?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
            <select
              value={step.action}
              onChange={(e) => onUpdate(index, { ...step, action: e.target.value, params: {} })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {actions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Parameters</label>
            <ParamsEditor
              action={step.action}
              params={step.params || {}}
              onChange={(newParams) => onUpdate(index, { ...step, params: newParams })}
            />
          </div>

          <button
            onClick={() => onRemove(index)}
            className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            Remove Step
          </button>
        </div>
      )}
    </div>
  );
};

export const PipelineConfigWizard = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState(
    initialConfig || {
      schema_version: '1.0',
      preprocessing: [],
      postprocessing: [],
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const addPreprocessingStep = () => {
    setConfig({
      ...config,
      preprocessing: [
        ...config.preprocessing,
        { action: 'resize', params: { width: 224, height: 224, keep_aspect_ratio: false } },
      ],
    });
  };

  const addPostprocessingStep = () => {
    setConfig({
      ...config,
      postprocessing: [
        ...config.postprocessing,
        { action: 'softmax', params: {} },
      ],
    });
  };

  const updatePreprocessingStep = (index, updatedStep) => {
    const newPreprocessing = [...config.preprocessing];
    newPreprocessing[index] = updatedStep;
    setConfig({ ...config, preprocessing: newPreprocessing });
  };

  const updatePostprocessingStep = (index, updatedStep) => {
    const newPostprocessing = [...config.postprocessing];
    newPostprocessing[index] = updatedStep;
    setConfig({ ...config, postprocessing: newPostprocessing });
  };

  const removePreprocessingStep = (index) => {
    setConfig({
      ...config,
      preprocessing: config.preprocessing.filter((_, i) => i !== index),
    });
  };

  const removePostprocessingStep = (index) => {
    setConfig({
      ...config,
      postprocessing: config.postprocessing.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CodeBracketIcon className="h-7 w-7 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-900">Configure Pipeline</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Preprocessing Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-primary-600 rounded-full"></span>
                Preprocessing Steps
              </h3>
              <button
                onClick={addPreprocessingStep}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-medium flex items-center gap-1 transition-colors text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Add Step
              </button>
            </div>

            {config.preprocessing.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                <p className="text-slate-600 mb-3">No preprocessing steps added yet</p>
                <button
                  onClick={addPreprocessingStep}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {config.preprocessing.map((step, idx) => (
                  <StepCard
                    key={idx}
                    step={step}
                    index={idx}
                    isPreprocessing={true}
                    onUpdate={updatePreprocessingStep}
                    onRemove={removePreprocessingStep}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Postprocessing Section */}
          <div className="space-y-4 border-t border-slate-200 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-accent-lime rounded-full"></span>
                Postprocessing Steps
              </h3>
              <button
                onClick={addPostprocessingStep}
                className="px-3 py-1.5 bg-accent-lime-50 hover:bg-accent-lime-100 text-accent-lime-700 rounded-lg font-medium flex items-center gap-1 transition-colors text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Add Step
              </button>
            </div>

            {config.postprocessing.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                <p className="text-slate-600 mb-3">No postprocessing steps added yet</p>
                <button
                  onClick={addPostprocessingStep}
                  className="px-4 py-2 bg-accent-lime hover:bg-accent-lime-600 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {config.postprocessing.map((step, idx) => (
                  <StepCard
                    key={idx}
                    step={step}
                    index={idx}
                    isPreprocessing={false}
                    onUpdate={updatePostprocessingStep}
                    onRemove={removePostprocessingStep}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Configuration Preview */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-primary-600" />
              Configuration Preview
            </h3>
            <div className="p-4 bg-slate-900 rounded-lg overflow-auto max-h-48">
              <pre className="text-slate-100 font-mono text-xs">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <CheckIcon className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineConfigWizard;
