import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import api from '../api/client';

export default function ConfigureModelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State arrays for our Pipeline Spec
  const [preprocessing, setPreprocessing] = useState([]);
  const [postprocessing, setPostprocessing] = useState([]);

  useEffect(() => {
    async function fetchModel() {
      try {
        const response = await api.get(`/models/${id}`);
        setModel(response.data);
        // Pre-fill if there's an existing draft config
        if (response.data.pipeline_spec) {
            setPreprocessing(response.data.pipeline_spec.preprocessing || []);
            setPostprocessing(response.data.pipeline_spec.postprocessing || []);
        }
      } catch (err) {
        setError('Failed to load model details.');
      } finally {
        setLoading(false);
      }
    }
    fetchModel();
  }, [id]);

  const handleAddStep = (type) => {
    const newStep = { step: '', params: {} };
    if (type === 'pre') setPreprocessing([...preprocessing, newStep]);
    else setPostprocessing([...postprocessing, newStep]);
  };

  const handleRemoveStep = (type, index) => {
    if (type === 'pre') setPreprocessing(preprocessing.filter((_, i) => i !== index));
    else setPostprocessing(postprocessing.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (type, index, field, value) => {
    const targetArray = type === 'pre' ? [...preprocessing] : [...postprocessing];
    
    if (field === 'step') {
      // If they change the step type, wipe the old params to prevent schema pollution
      targetArray[index] = { step: value, params: {} };
    } else {
      // Update nested params
      targetArray[index].params = { ...targetArray[index].params, [field]: value };
    }

    if (type === 'pre') setPreprocessing(targetArray);
    else setPostprocessing(targetArray);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        pipeline_spec: {
          preprocessing,
          postprocessing
        },
        status: "configured"
      };
      // Send the PATCH request to our FastAPI backend
      await api.patch(`/models/${id}`, payload);
      navigate(`/models/${id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to save configuration. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="p-8">Loading model data...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Configure Pipeline: {model?.name || 'Unknown Model'}
            </h2>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <ExclamationTriangleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-amber-500" aria-hidden="true" />
              Help the community by mapping this model's execution pipeline.
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={() => navigate(`/models/${id}`)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT PANE: Asset Inspector */}
          <div className="lg:col-span-1 border-r border-gray-200 pr-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Asset Inspector</h3>
            <div className="bg-gray-50 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
                  <dd className="mt-1 text-sm leading-6 text-amber-600 sm:col-span-2 sm:mt-0 font-bold uppercase">{model?.status}</dd>
                </div>
                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Task</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{model?.task}</dd>
                </div>
                <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Target Asset</dt>
                  <dd className="mt-1 text-xs leading-6 text-gray-500 sm:col-span-2 sm:mt-0 break-all">{model?.model_asset_url}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-gray-500">
                Look at the model author's documentation to determine required input shapes and normalizations.
              </p>
            </div>
          </div>

          {/* RIGHT PANE: Pipeline Constructor */}
          <div className="lg:col-span-2">
            
            {/* Preprocessing Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Pre-Processing Steps</h3>
                <button onClick={() => handleAddStep('pre')} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Step
                </button>
              </div>
              
              <div className="space-y-4">
                {preprocessing.length === 0 && <p className="text-sm text-gray-500 italic border-2 border-dashed border-gray-200 p-4 text-center rounded-lg">No pre-processing steps defined.</p>}
                
                {preprocessing.map((step, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start space-x-4">
                    <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md text-sm">{idx + 1}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Step Type</label>
                        <select 
                          value={step.step} 
                          onChange={(e) => handleUpdateStep('pre', idx, 'step', e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        >
                          <option value="" disabled>Select a transformation...</option>
                          <option value="resize_image">Resize Image</option>
                          <option value="normalize">Normalize</option>
                          <option value="format">Format Tensor</option>
                          <option value="tokenize_bert">Tokenize (BERT)</option>
                        </select>
                      </div>

                      {/* Dynamic Parameters based on Step Type */}
                      {step.step === 'resize_image' && (
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                            <input type="number" onChange={(e) => handleUpdateStep('pre', idx, 'width', parseInt(e.target.value))} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                            <input type="number" onChange={(e) => handleUpdateStep('pre', idx, 'height', parseInt(e.target.value))} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm" />
                          </div>
                        </div>
                      )}

                      {step.step === 'normalize' && (
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mean (e.g. 127.5)</label>
                            <input type="number" step="0.1" onChange={(e) => handleUpdateStep('pre', idx, 'mean', parseFloat(e.target.value))} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Std (e.g. 127.5)</label>
                            <input type="number" step="0.1" onChange={(e) => handleUpdateStep('pre', idx, 'std', parseFloat(e.target.value))} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm" />
                          </div>
                        </div>
                      )}

                    </div>
                    <button onClick={() => handleRemoveStep('pre', idx)} className="text-gray-400 hover:text-red-600 pt-6">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Postprocessing Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Post-Processing Steps</h3>
                <button onClick={() => handleAddStep('post')} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Step
                </button>
              </div>
              
              <div className="space-y-4">
                {postprocessing.length === 0 && <p className="text-sm text-gray-500 italic border-2 border-dashed border-gray-200 p-4 text-center rounded-lg">No post-processing steps defined.</p>}
                
                {postprocessing.map((step, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start space-x-4">
                    <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md text-sm">{idx + 1}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Step Type</label>
                        <select 
                          value={step.step} 
                          onChange={(e) => handleUpdateStep('post', idx, 'step', e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        >
                          <option value="" disabled>Select interpretation...</option>
                          <option value="apply_activation">Apply Activation (Softmax)</option>
                          <option value="map_labels">Map to Labels</option>
                          <option value="filter_by_score">Filter by Score</option>
                          <option value="decode_boxes">Decode Boxes</option>
                        </select>
                      </div>

                      {/* Dynamic Parameters */}
                      {step.step === 'filter_by_score' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Threshold (e.g. 0.5)</label>
                          <input type="number" step="0.01" onChange={(e) => handleUpdateStep('post', idx, 'threshold', parseFloat(e.target.value))} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm" />
                        </div>
                      )}

                    </div>
                    <button onClick={() => handleRemoveStep('post', idx)} className="text-gray-400 hover:text-red-600 pt-6">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}