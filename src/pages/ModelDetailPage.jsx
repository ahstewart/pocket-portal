import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../api/client';
import Button from '../components/Button';
import Badge from '../components/Badge';
import PipelineConfigViewer from '../components/PipelineConfigViewer';
import { PipelineConfigWizard } from '../components/PipelineConfigWizard';
import { 
  StarIcon as StarOutlineIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  LinkIcon,
  SparklesIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export const ModelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPipelineEditor, setShowPipelineEditor] = useState(false);
  const [savingPipeline, setSavingPipeline] = useState(false);

  useEffect(() => {
    // Fetch single model and its versions
    const fetchData = async () => {
      try {
        const [models, fetchedVersions] = await Promise.all([
          ApiService.getModels(),
          ApiService.getModelVersions(id)
        ]);
        
        const found = models.find(m => m.id.toString() === id);
        if (found) {
          setModel(found);
          setVersions(Array.isArray(fetchedVersions) ? fetchedVersions : []);
        } else {
          setModel(null);
          setVersions([]);
        }
      } catch (err) {
        console.error("Failed to load model:", err);
        setModel(null);
        setVersions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSavePipelineConfig = async (config) => {
    setSavingPipeline(true);
    try {
      const selectedVersion = versions[selectedVersionIdx];
      // Call API to update the version with new pipeline spec
      // await ApiService.updateModelVersion(selectedVersion.id, {
      //   pipeline_spec: config,
      //   status: 'configured'
      // });
      
      // Update local state
      const updatedVersions = [...versions];
      updatedVersions[selectedVersionIdx] = {
        ...selectedVersion,
        pipeline_spec: config,
        status: 'configured'
      };
      setVersions(updatedVersions);
      setShowPipelineEditor(false);
      
      // Show success message (you may want to add toast notifications)
      console.log('Pipeline configuration saved successfully');
    } catch (error) {
      console.error('Failed to save pipeline configuration:', error);
    } finally {
      setSavingPipeline(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-primary-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Model not found</h2>
        <p className="text-slate-600 mb-6">The model you're looking for doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/browse')}>
          Browse Models
        </Button>
      </div>
    );
  }

  const rating = model.rating_weighted_avg?.toFixed(1) || '0.0';
  const selectedVersion = versions[selectedVersionIdx];
  const versionRating = selectedVersion?.rating_avg?.toFixed(1) || '0.0';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <Button variant="tertiary" size="sm" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Model Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <Badge variant={model.category === 'diagnostic' ? 'primary' : 'slate'}>
                {model.category}
              </Badge>
              {parseFloat(rating) >= 4.0 && (
                <Badge variant="warning">Popular</Badge>
              )}
              {model.hf_model_id && (
                <Badge variant="slate">HF Synced</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">{model.name}</h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {model.description || "No description provided."}
            </p>

            {/* Hugging Face Link */}
            {model.hf_model_id && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-slate-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Available on Hugging Face</p>
                  <a 
                    href={`https://huggingface.co/${model.hf_model_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 font-medium hover:text-primary-700 break-all"
                  >
                    huggingface.co/{model.hf_model_id}
                  </a>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 py-4 border-y border-slate-200">
              <div>
                <p className="text-sm text-slate-600">Downloads</p>
                <p className="text-2xl font-bold text-slate-900">{model.total_download_count}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>
                        {i < Math.round(parseFloat(rating)) ? (
                          <StarSolidIcon className="h-5 w-5 text-accent-amber" />
                        ) : (
                          <StarOutlineIcon className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900">{rating}</span>
                  <span className="text-sm text-slate-600">({model.total_ratings})</span>
                </div>
              </div>
              {model.task && (
                <div>
                  <p className="text-sm text-slate-600">Task</p>
                  <p className="text-lg font-semibold text-slate-900">{model.task}</p>
                </div>
              )}
            </div>
          </div>

          {/* Model Metadata Card */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Model Details</h3>
                <div className="space-y-3 text-sm">
                  {model.hf_model_id && (
                    <div>
                      <p className="text-slate-600">Hugging Face</p>
                      <p className="font-medium text-slate-900 break-all">{model.hf_model_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600">Category</p>
                    <p className="font-medium text-slate-900 capitalize">{model.category}</p>
                  </div>
                  {model.task && (
                    <div>
                      <p className="text-slate-600">Task</p>
                      <p className="font-medium text-slate-900 capitalize">{model.task}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600">License</p>
                    <p className="font-medium text-slate-900 uppercase">{model.license_type}</p>
                  </div>
                  {model.tags && model.tags.length > 0 && (
                    <div>
                      <p className="text-slate-600 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {model.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Versions Section */}
      {versions.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Versions</h2>
            <p className="text-slate-600 mb-4">This model has {versions.length} available version{versions.length !== 1 ? 's' : ''}.</p>
          </div>

          {/* Version Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {versions.map((version, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVersionIdx(idx)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedVersionIdx === idx
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">v{version.version_name || version.version_string}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(version.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  {version.is_supported && (
                    <CheckBadgeIcon className="h-5 w-5 text-accent-lime flex-shrink-0" />
                  )}
                </div>
                {version.changelog && (
                  <p className="text-sm text-slate-600 line-clamp-2">{version.changelog}</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="text-slate-600">{version.download_count} downloads</span>
                  {version.num_ratings > 0 && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{version.rating_avg.toFixed(1)} ⭐</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Version Details */}
          {selectedVersion && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
              {/* Version Header */}
              <div className="border-b border-slate-200 pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Version {selectedVersion.version_name || selectedVersion.version_string}</h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Released {new Date(selectedVersion.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedVersion.changelog && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Changelog</h4>
                    <p className="text-slate-700">{selectedVersion.changelog}</p>
                  </div>
                )}
              </div>

              {/* Pipeline Configuration */}
              {selectedVersion && (
                <div>
                  <PipelineConfigViewer
                    pipelineSpec={selectedVersion.pipeline_spec}
                    onEdit={() => setShowPipelineEditor(true)}
                    isEditable={true}
                  />
                </div>
              )}

              {/* Pipeline Verification Status */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Verification</h3>
                {selectedVersion.is_supported ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-accent-lime flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Pipeline Verified</h4>
                      <p className="text-sm text-green-800 mt-1">
                        This model version has a verified pipeline configuration.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900">Pipeline Not Verified</h4>
                      <p className="text-sm text-red-800 mt-1">
                        {selectedVersion.unsupported_reason || "This model version does not have a verified pipeline configuration."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Version Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Downloads</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedVersion.download_count}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          {i < Math.round(parseFloat(versionRating)) ? (
                            <StarSolidIcon className="h-4 w-4 text-accent-amber" />
                          ) : (
                            <StarOutlineIcon className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900">{versionRating}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">({selectedVersion.num_ratings} ratings)</p>
                </div>
              </div>

              {/* Download and Config Buttons */}
              <div className="border-t border-slate-200 pt-6 flex gap-3">
                {selectedVersion.status === 'unconfigured' && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 justify-center gap-2"
                    onClick={() => setShowPipelineEditor(true)}
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Create Configuration
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Configuration Wizard Modal */}
      {showPipelineEditor && (
        <PipelineConfigWizard
          initialConfig={versions[selectedVersionIdx]?.pipeline_spec}
          onSave={handleSavePipelineConfig}
          onCancel={() => setShowPipelineEditor(false)}
        />
      )}
    </div>
  );
};
