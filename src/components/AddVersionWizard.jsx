import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, PencilSquareIcon, ArrowPathIcon, DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const generateShortId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const fetchHFTfliteFiles = async (hfModelId) => {
  const res = await fetch(`https://huggingface.co/api/models/${hfModelId}`);
  if (!res.ok) throw new Error(`Could not fetch model files (HTTP ${res.status})`);
  const data = await res.json();
  return (data.siblings || [])
    .filter(s => s.rfilename.endsWith('.tflite'))
    .map(s => ({
      filename: s.rfilename,
      url: `https://huggingface.co/${hfModelId}/resolve/main/${s.rfilename}`,
    }));
};

const getStem = (filename) => filename.split('/').pop().replace('.tflite', '');

export const AddVersionWizard = ({ hfModelId, existingTfliteUrl, onCreateManual, onCreateAndGenerate, onCancel }) => {
  const [step, setStep] = useState('details');
  const [details, setDetails] = useState({ version_name: '', changelog: '' });
  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const [tfliteFiles, setTfliteFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState(null);

  useEffect(() => {
    if (!hfModelId) return;
    setLoadingFiles(true);
    fetchHFTfliteFiles(hfModelId)
      .then(files => {
        setTfliteFiles(files);
        // Pre-select all files by default
        setSelectedFiles(files);
      })
      .catch(err => setFilesError(err.message))
      .finally(() => setLoadingFiles(false));
  }, [hfModelId]);

  const toggleFile = (file) => {
    setSelectedFiles(prev =>
      prev.some(f => f.url === file.url)
        ? prev.filter(f => f.url !== file.url)
        : [...prev, file]
    );
  };

  const validate = () => {
    const e = {};
    if (!details.version_name.trim()) e.version_name = 'Version name is required';
    if (hfModelId && selectedFiles.length === 0) e.tflite = 'Please select at least one model file';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep('pipeline-choice');
  };

  // Build tflite_url and tflite_files from selected files, attach a commit SHA.
  const withSha = () => {
    const tflite_url = hfModelId
      ? (selectedFiles[0]?.url || '')
      : (existingTfliteUrl || '');

    const tflite_files = hfModelId && selectedFiles.length > 1
      ? Object.fromEntries(selectedFiles.map(f => [getStem(f.filename), f.url]))
      : null;

    return {
      ...details,
      tflite_url,
      tflite_files,
      commit_sha: generateShortId(),
    };
  };

  const handleCreateAndGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      await onCreateAndGenerate(withSha());
    } catch (err) {
      setGenerateError(err.message || 'Failed to create version.');
      setGenerating(false);
    }
  };

  const renderModelFileField = () => {
    if (!hfModelId) return null;

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Model File(s) <span className="text-red-500">*</span>
        </label>

        {loadingFiles ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            Loading files from Hugging Face…
          </div>
        ) : filesError ? (
          <p className="text-sm text-red-600 py-1">{filesError}</p>
        ) : tfliteFiles.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-1">
            No .tflite files found in this repository.
          </p>
        ) : tfliteFiles.length === 1 ? (
          // Single file — show as read-only confirmation
          <div className="flex items-center gap-3 p-3 border border-primary-200 bg-primary-50 rounded-xl">
            <DocumentIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-800 truncate flex-1">{tfliteFiles[0].filename}</p>
            <CheckCircleIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
          </div>
        ) : (
          // Multiple files — checkbox list, all pre-selected
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              {selectedFiles.length} of {tfliteFiles.length} selected
              {selectedFiles.length > 1 && ' — encoder/decoder model detected'}
            </p>
            {tfliteFiles.map(f => {
              const checked = selectedFiles.some(s => s.url === f.url);
              return (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => toggleFile(f)}
                  className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl text-left transition-all ${
                    checked ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    checked ? 'bg-primary-600 border-primary-600' : 'border-slate-400'
                  }`}>
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <DocumentIcon className={`h-4 w-4 flex-shrink-0 ${checked ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className={`text-sm truncate flex-1 ${checked ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                    {f.filename}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {errors.tflite && <p className="text-xs text-red-600 mt-1">{errors.tflite}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Version</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 'details' ? 'Step 1 of 2 — Version Details' : 'Step 2 of 2 — Pipeline'}
            </p>
          </div>
          <button onClick={onCancel} disabled={generating} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <XMarkIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Version Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={details.version_name}
                onChange={e => setDetails({ ...details, version_name: e.target.value })}
                placeholder="e.g. v1.0.0 or main"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.version_name ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.version_name && <p className="text-xs text-red-600 mt-1">{errors.version_name}</p>}
            </div>

            {renderModelFileField()}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Changelog <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={details.changelog}
                onChange={e => setDetails({ ...details, changelog: e.target.value })}
                rows={3}
                placeholder="Describe what changed in this version…"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Pipeline choice */}
        {step === 'pipeline-choice' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              A pipeline file is required. Choose how to provide it:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onCreateManual(withSha())}
                disabled={generating}
                className="w-full p-4 border-2 border-slate-200 rounded-xl text-left hover:border-primary-400 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors flex-shrink-0">
                    <PencilSquareIcon className="h-5 w-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Create Manually</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Build the pipeline configuration step-by-step using the visual editor.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleCreateAndGenerate}
                disabled={generating}
                className="w-full p-4 border-2 border-slate-200 rounded-xl text-left hover:border-amber-400 hover:bg-amber-50 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors flex-shrink-0">
                    <SparklesIcon className={`h-5 w-5 text-amber-700 ${generating ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Generate with AI</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {generating
                        ? 'Creating version and generating pipeline…'
                        : 'Let Gemini generate the pipeline automatically from the model metadata.'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {generateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {generateError}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step === 'details' ? (
            <>
              <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleNext}>Next: Pipeline</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep('details')} disabled={generating}>
                Back
              </Button>
              <span className="text-xs text-slate-400">Select an option above</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVersionWizard;
