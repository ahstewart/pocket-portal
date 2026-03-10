import React, { useState } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  CheckIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
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
        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                <option key={action.value} value={action.value}>{action.label}</option>
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

const validatePipelineSchema = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return 'The pipeline config must be a JSON object.';
  }

  // All five top-level arrays are required by PipelineConfig
  for (const key of ['metadata', 'inputs', 'outputs', 'preprocessing', 'postprocessing']) {
    if (!Array.isArray(obj[key])) {
      return `Missing required field "${key}" — it must be an array.`;
    }
  }

  // metadata: at least one block with required string fields
  if (obj.metadata.length === 0) {
    return '"metadata" must contain at least one block with model_name, model_version, and model_task.';
  }
  for (let i = 0; i < obj.metadata.length; i++) {
    const m = obj.metadata[i];
    for (const f of ['model_name', 'model_version', 'model_task']) {
      if (!m[f] || typeof m[f] !== 'string') {
        return `metadata[${i}] is missing required string field "${f}".`;
      }
    }
  }

  // inputs / outputs: at least one tensor with name, shape[], dtype
  for (const key of ['inputs', 'outputs']) {
    if (obj[key].length === 0) {
      return `"${key}" must contain at least one tensor definition with name, shape, and dtype.`;
    }
    for (let i = 0; i < obj[key].length; i++) {
      const t = obj[key][i];
      if (!t.name || typeof t.name !== 'string') {
        return `${key}[${i}] is missing required string field "name".`;
      }
      if (!Array.isArray(t.shape)) {
        return `${key}[${i}] is missing required array field "shape" (e.g. [1, 224, 224, 3]).`;
      }
      if (!t.dtype || typeof t.dtype !== 'string') {
        return `${key}[${i}] is missing required string field "dtype" (float32, uint8, int8, or int32).`;
      }
    }
  }

  // preprocessing blocks
  for (let i = 0; i < obj.preprocessing.length; i++) {
    const block = obj.preprocessing[i];
    if (!block.input_name || typeof block.input_name !== 'string') {
      return `preprocessing[${i}] is missing required string field "input_name".`;
    }
    if (!Array.isArray(block.steps)) {
      return `preprocessing[${i}] is missing required array field "steps".`;
    }
    for (let j = 0; j < block.steps.length; j++) {
      if (!block.steps[j].step || typeof block.steps[j].step !== 'string') {
        return `preprocessing[${i}].steps[${j}] is missing required string field "step".`;
      }
    }
  }

  // postprocessing blocks
  for (let i = 0; i < obj.postprocessing.length; i++) {
    const block = obj.postprocessing[i];
    if (!block.output_name || typeof block.output_name !== 'string') {
      return `postprocessing[${i}] is missing required string field "output_name".`;
    }
    if (!block.interpretation || typeof block.interpretation !== 'string') {
      return `postprocessing[${i}] is missing required string field "interpretation".`;
    }
    if (!Array.isArray(block.source_tensors)) {
      return `postprocessing[${i}] is missing required array field "source_tensors".`;
    }
    if (!Array.isArray(block.steps)) {
      return `postprocessing[${i}] is missing required array field "steps".`;
    }
    for (let j = 0; j < block.steps.length; j++) {
      if (!block.steps[j].step || typeof block.steps[j].step !== 'string') {
        return `postprocessing[${i}].steps[${j}] is missing required string field "step".`;
      }
    }
  }

  return null;
};

export const PipelineConfigWizard = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState(
    initialConfig || { schema_version: '1.0', preprocessing: [], postprocessing: [] }
  );
  const [mode, setMode] = useState('visual'); // 'visual' | 'json'
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Mode switching ────────────────────────────────────────────────────────

  const switchToJson = () => {
    setJsonText(JSON.stringify(config, null, 2));
    setJsonError(null);
    setMode('json');
  };

  const switchToVisual = () => {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError('The JSON is not valid — check for missing commas, brackets, or quotes before switching.');
      return;
    }
    const schemaError = validatePipelineSchema(parsed);
    if (schemaError) {
      setJsonError(schemaError);
      return;
    }
    setConfig(parsed);
    setJsonError(null);
    setMode('visual');
  };

  // ── Visual editor helpers ─────────────────────────────────────────────────

  const addPreprocessingStep = () => setConfig({
    ...config,
    preprocessing: [...config.preprocessing, { action: 'resize', params: { width: 224, height: 224, keep_aspect_ratio: false } }],
  });

  const addPostprocessingStep = () => setConfig({
    ...config,
    postprocessing: [...config.postprocessing, { action: 'softmax', params: {} }],
  });

  const updatePreprocessingStep = (index, updatedStep) => {
    const steps = [...config.preprocessing];
    steps[index] = updatedStep;
    setConfig({ ...config, preprocessing: steps });
  };

  const updatePostprocessingStep = (index, updatedStep) => {
    const steps = [...config.postprocessing];
    steps[index] = updatedStep;
    setConfig({ ...config, postprocessing: steps });
  };

  const removePreprocessingStep  = (index) => setConfig({ ...config, preprocessing:  config.preprocessing.filter((_, i) => i !== index) });
  const removePostprocessingStep = (index) => setConfig({ ...config, postprocessing: config.postprocessing.filter((_, i) => i !== index) });

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    let configToSave = config;
    if (mode === 'json') {
      try {
        configToSave = JSON.parse(jsonText);
      } catch {
        setJsonError('The JSON is not valid — check for missing commas, brackets, or quotes before saving.');
        return;
      }
      const schemaError = validatePipelineSchema(configToSave);
      if (schemaError) {
        setJsonError(schemaError);
        return;
      }
    }
    setIsSaving(true);
    try {
      await onSave(configToSave);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <CodeBracketIcon className="h-7 w-7 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-900">Configure Pipeline</h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-slate-200 px-8 flex-shrink-0">
          <button
            onClick={mode === 'json' ? switchToVisual : undefined}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === 'visual'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 cursor-pointer'
            }`}
          >
            Visual Editor
          </button>
          <button
            onClick={mode === 'visual' ? switchToJson : undefined}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === 'json'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 cursor-pointer'
            }`}
          >
            JSON Editor
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* JSON editor */}
          {mode === 'json' && (
            <div className="p-8 space-y-3">
              {jsonError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{jsonError}</span>
                </div>
              )}
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setJsonError(null); }}
                spellCheck={false}
                className="w-full h-[420px] px-4 py-3 bg-slate-900 text-slate-100 font-mono text-sm rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-500">
                Edit the raw JSON directly. Switch to Visual Editor to validate and use the form interface.
              </p>
            </div>
          )}

          {/* Visual editor */}
          {mode === 'visual' && (
            <div className="p-8 space-y-8">
              {/* Preprocessing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-primary-600 rounded-full" />
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

              {/* Postprocessing */}
              <div className="space-y-4 border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 bg-accent-lime rounded-full" />
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

              {/* Config preview */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-primary-600" />
                  Configuration Preview
                </h3>
                <div className="p-4 bg-slate-900 rounded-lg overflow-auto max-h-48">
                  <pre className="text-slate-100 font-mono text-xs">{JSON.stringify(config, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            <CheckIcon className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineConfigWizard;
