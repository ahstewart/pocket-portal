import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ApiService } from '../api/client';
import { useAuth } from '../lib/authContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import PipelineConfigViewer from '../components/PipelineConfigViewer';
import { PipelineConfigWizard } from '../components/PipelineConfigWizard';
import { AddVersionWizard } from '../components/AddVersionWizard';
import {
  StarIcon as StarOutlineIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const STATUS_BADGE = {
  supported:   'secondary',
  pending:     'accent',
  unsupported: 'danger',
};

const STATUS_TOOLTIP = {
  supported:   'Verified — the pipeline passed TFLite validation and is ready for on-device inference.',
  pending:     'Pending — a pipeline exists but has not yet been verified against the TFLite model.',
  unsupported: 'Unsupported — this version has no pipeline, or its pipeline was confirmed broken or rejected.',
};

export const ModelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = location.state?.from;
  const backLabel = from === 'dashboard' ? 'Back to Dashboard'  : 'Browse All Models';
  const backPath  = from === 'dashboard' ? '/dashboard' : '/browse';

  const [model, setModel]     = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-row action state
  const [generatingId, setGeneratingId]       = useState(null);
  const [deletingId, setDeletingId]           = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteError, setDeleteError]         = useState(null);
  const [generateErrors, setGenerateErrors]   = useState({});
  const [showReasonVersionId, setShowReasonVersionId] = useState(null);

  // Pipeline view modal
  const [viewPipelineVersion, setViewPipelineVersion] = useState(null);

  // Pipeline edit modal
  const [editPipelineVersion, setEditPipelineVersion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Add version wizard
  const [showAddVersionWizard, setShowAddVersionWizard]           = useState(false);
  const [pendingVersionDetails, setPendingVersionDetails]         = useState(null);
  const [showNewVersionPipelineEditor, setShowNewVersionPipelineEditor] = useState(false);
  const [addVersionError, setAddVersionError] = useState(null);

  // ── Data fetch ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [models, fetchedVersions] = await Promise.all([
          ApiService.getModels(),
          ApiService.getModelVersions(id),
        ]);
        const found = models.find(m => m.id.toString() === id);
        setModel(found || null);
        setVersions(Array.isArray(fetchedVersions) ? fetchedVersions : []);
      } catch (err) {
        console.error('Failed to load model:', err);
        setModel(null);
        setVersions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Per-row handlers ──────────────────────────────────────────────────────

  const handleRegenerate = async (version) => {
    setGeneratingId(version.id);
    setGenerateErrors(prev => { const { [version.id]: _, ...rest } = prev; return rest; });
    try {
      const updated = await ApiService.generatePipeline(version.id);
      setVersions(prev => prev.map(v => v.id === updated.id ? updated : v));
    } catch (err) {
      setGenerateErrors(prev => ({
        ...prev,
        [version.id]: err.response?.data?.detail || 'Pipeline generation failed.',
      }));
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteVersion = async (version) => {
    setDeletingId(version.id);
    setDeleteError(null);
    try {
      await ApiService.deleteVersion(version.id);
      setVersions(prev => prev.filter(v => v.id !== version.id));
      setDeleteConfirmId(null);
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Edit pipeline handler ─────────────────────────────────────────────────

  const handleEditPipelineSave = async (newConfig) => {
    setSavingEdit(true);
    try {
      const updated = await ApiService.updateModelVersion(editPipelineVersion.id, {
        pipeline_spec: newConfig,
        status: 'pending',
      });
      setVersions(prev => prev.map(v => v.id === updated.id ? updated : v));
      setEditPipelineVersion(null);
    } catch (err) {
      console.error('Failed to save pipeline config:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Add version handlers ──────────────────────────────────────────────────

  const handleAddVersionManual = (details) => {
    setPendingVersionDetails(details);
    setShowAddVersionWizard(false);
    setShowNewVersionPipelineEditor(true);
  };

  const handleAddVersionGenerate = async (details) => {
    // Create the version (no pipeline yet) — throws on API error, caught in wizard
    const newVersion = await ApiService.createModelVersion(id, {
      version_name: details.version_name,
      commit_sha: details.commit_sha,
      assets: { tflite: details.tflite_url },
      changelog: details.changelog || null,
      license_type: 'unknown',
      is_commercial_safe: false,
      is_hosted_by_us: false,
      file_size_bytes: 0,
    });

    // Add to list and close wizard immediately
    setVersions(prev => [...prev, newVersion]);
    setShowAddVersionWizard(false);

    // Trigger generation asynchronously — tracked in the table via generatingId
    setGeneratingId(newVersion.id);
    try {
      const updated = await ApiService.generatePipeline(newVersion.id);
      setVersions(prev => prev.map(v => v.id === updated.id ? updated : v));
    } catch (err) {
      setGenerateErrors(prev => ({
        ...prev,
        [newVersion.id]: err.response?.data?.detail || 'Pipeline generation failed.',
      }));
    } finally {
      setGeneratingId(null);
    }
  };

  const handleNewVersionPipelineSave = async (config) => {
    try {
      const newVersion = await ApiService.createModelVersion(id, {
        version_name: pendingVersionDetails.version_name,
        commit_sha: pendingVersionDetails.commit_sha,
        assets: { tflite: pendingVersionDetails.tflite_url },
        changelog: pendingVersionDetails.changelog || null,
        license_type: 'unknown',
        is_commercial_safe: false,
        is_hosted_by_us: false,
        file_size_bytes: 0,
        pipeline_spec: config,
      });
      setVersions(prev => [...prev, newVersion]);
    } catch (err) {
      setAddVersionError(err.response?.data?.detail || 'Failed to create version.');
    } finally {
      setShowNewVersionPipelineEditor(false);
      setPendingVersionDetails(null);
    }
  };

  // ── Loading / not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Model not found</h2>
        <p className="text-slate-600 mb-6">The model you're looking for doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/browse')}>Browse Models</Button>
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  const rating = model.rating_weighted_avg?.toFixed(1) || '0.0';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)} className="mb-6 self-start">
          <ArrowLeftIcon className="h-4 w-4" />
          {backLabel}
        </Button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Model Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              {parseFloat(rating) >= 4.0 && <Badge variant="warning">Popular</Badge>}
              {model.hf_model_id && <Badge variant="slate">HF Synced</Badge>}
              {model.is_public === false ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <LockClosedIcon className="h-3.5 w-3.5" />
                  Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  Public
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">{model.name}</h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {model.description || 'No description provided.'}
            </p>

            {model.hf_model_id && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Available on Hugging Face</p>
                  <a
                    href={`https://huggingface.co/${model.hf_model_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:text-blue-700 break-all"
                  >
                    huggingface.co/{model.hf_model_id}
                  </a>
                </div>
              </div>
            )}

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
                      i < Math.round(parseFloat(rating))
                        ? <StarSolidIcon key={i} className="h-5 w-5 text-accent-amber" />
                        : <StarOutlineIcon key={i} className="h-5 w-5 text-slate-300" />
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

          {/* Metadata Card */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20 space-y-4">
              <h3 className="font-semibold text-slate-900">Model Details</h3>
              <div className="space-y-3 text-sm">
                {model.hf_model_id && (
                  <div>
                    <p className="text-slate-600">Hugging Face</p>
                    <p className="font-medium text-slate-900 break-all">{model.hf_model_id}</p>
                  </div>
                )}
                <div>
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

      {/* Section divider */}
      <hr className="border-slate-200 my-2" />

      {/* Versions Section */}
      <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Versions</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {user && (
            <Button variant="primary" size="sm" onClick={() => setShowAddVersionWizard(true)}>
              <PlusIcon className="h-4 w-4" />
              Add New Version
            </Button>
          )}
        </div>

        {addVersionError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{addVersionError}</span>
            <button onClick={() => setAddVersionError(null)} className="text-red-400 hover:text-red-600">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {versions.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 mb-4">No versions yet.</p>
            {user && (
              <Button variant="outline" size="sm" onClick={() => setShowAddVersionWizard(true)}>
                <PlusIcon className="h-4 w-4" />
                Add First Version
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Released</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Pipeline</th>
                  {user && <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.map((version) => {
                  const isSupported     = version.status === 'supported';
                  const isGenerating    = generatingId === version.id;
                  const isDeleting      = deletingId === version.id;
                  const isDeleteConfirm = deleteConfirmId === version.id;
                  const versionError    = generateErrors[version.id];

                  return (
                    <React.Fragment key={version.id}>
                      {/* Delete confirmation row */}
                      {isDeleteConfirm ? (
                        <tr className="bg-red-50">
                          <td colSpan={user ? 5 : 4} className="px-4 py-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-sm text-red-800 flex-1">
                                Permanently delete version <strong className="font-mono">v{version.version_name}</strong>? This cannot be undone.
                                {deleteError && <span className="ml-2 text-red-600">{deleteError}</span>}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setDeleteConfirmId(null); setDeleteError(null); }}
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteVersion(version)}
                                isLoading={isDeleting}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        /* Normal version row */
                        <tr className="bg-white hover:bg-blue-50 transition-colors">
                          {/* Version name + downloads */}
                          <td className="px-4 py-3">
                            <span className="font-mono font-medium text-slate-900">
                              v{version.version_name}
                            </span>
                            {version.download_count > 0 && (
                              <span className="ml-2 text-xs text-slate-400">
                                {version.download_count} ⬇
                              </span>
                            )}
                            {version.changelog && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                                {version.changelog}
                              </p>
                            )}
                          </td>

                          {/* Released date */}
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(version.published_at).toLocaleDateString()}
                          </td>

                          {/* Status badge */}
                          <td className="px-4 py-3">
                            {isGenerating ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                Generating…
                              </span>
                            ) : (
                              <Badge
                                variant={STATUS_BADGE[version.status] ?? 'slate'}
                                title={STATUS_TOOLTIP[version.status]}
                              >
                                {version.status}
                              </Badge>
                            )}
                          </td>

                          {/* Pipeline link + last updated */}
                          <td className="px-4 py-3">
                            {(() => {
                              const isFailure = version.status === 'unsupported';
                              const isShowingReason = showReasonVersionId === version.id;
                              return (
                                <div className="space-y-1">
                                  {version.pipeline_spec && (
                                    <div className="space-y-0.5">
                                      <button
                                        onClick={() => setViewPipelineVersion(version)}
                                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                      >
                                        <EyeIcon className="h-4 w-4" />
                                        View
                                      </button>
                                      {version.pipeline_updated_at && (
                                        <p className="text-xs text-slate-400">
                                          Updated {new Date(version.pipeline_updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {isFailure && (
                                    <button
                                      onClick={() => setShowReasonVersionId(isShowingReason ? null : version.id)}
                                      title={isShowingReason ? 'Hide reason' : 'Click to see failure reason'}
                                      className="text-left"
                                    >
                                      <Badge
                                        variant="danger"
                                        className={`cursor-pointer underline decoration-dotted underline-offset-2 ${isShowingReason ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
                                      >
                                        Failed to generate
                                      </Badge>
                                    </button>
                                  )}
                                  {!version.pipeline_spec && !isFailure && (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Action buttons */}
                          {user && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-0.5">
                                <button
                                  onClick={() => handleRegenerate(version)}
                                  disabled={isSupported || isGenerating || generatingId !== null}
                                  title={isSupported ? 'Cannot regenerate a supported version' : 'Regenerate pipeline with AI'}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditPipelineVersion(version)}
                                  disabled={isSupported || isGenerating}
                                  title={isSupported ? 'Cannot edit a supported version' : 'Edit pipeline configuration'}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => { setDeleteConfirmId(version.id); setDeleteError(null); }}
                                  disabled={isDeleting}
                                  title="Delete this version"
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )}

                      {/* Failure reason row (broken / unsupported) */}
                      {showReasonVersionId === version.id && version.unsupported_reason && (
                        <tr className="bg-red-50">
                          <td colSpan={user ? 5 : 4} className="px-4 py-3">
                            <div className="flex items-start gap-2 text-sm text-red-800">
                              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                              <div>
                                <p className="font-medium text-red-900 mb-0.5">Generation failure reason</p>
                                <p className="text-red-700">{version.unsupported_reason}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Per-row generate error */}
                      {versionError && (
                        <tr className="bg-red-50">
                          <td colSpan={user ? 5 : 4} className="px-4 py-2">
                            <div className="flex items-center gap-2 text-xs text-red-700">
                              <ExclamationTriangleIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="flex-1">{versionError}</span>
                              <button
                                onClick={() => setGenerateErrors(prev => {
                                  const { [version.id]: _, ...rest } = prev;
                                  return rest;
                                })}
                                className="text-red-400 hover:text-red-600"
                              >
                                Dismiss
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Pipeline Modal */}
      {viewPipelineVersion && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setViewPipelineVersion(null); }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mt-8 mb-8">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pipeline Configuration</h2>
                <p className="text-sm text-slate-500 mt-0.5 font-mono">v{viewPipelineVersion.version_name}</p>
              </div>
              <button
                onClick={() => setViewPipelineVersion(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8">
              <PipelineConfigViewer
                pipelineSpec={viewPipelineVersion.pipeline_spec}
                isEditable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Pipeline Modal */}
      {editPipelineVersion && (
        <PipelineConfigWizard
          initialConfig={editPipelineVersion.pipeline_spec}
          onSave={handleEditPipelineSave}
          onCancel={() => setEditPipelineVersion(null)}
        />
      )}

      {/* Add Version Wizard */}
      {showAddVersionWizard && (
        <AddVersionWizard
          hfModelId={model.hf_model_id}
          existingTfliteUrl={versions[0]?.assets?.tflite}
          onCreateManual={handleAddVersionManual}
          onCreateAndGenerate={handleAddVersionGenerate}
          onCancel={() => setShowAddVersionWizard(false)}
        />
      )}

      {/* New Version Pipeline Editor (manual path) */}
      {showNewVersionPipelineEditor && (
        <PipelineConfigWizard
          initialConfig={null}
          onSave={handleNewVersionPipelineSave}
          onCancel={() => {
            setShowNewVersionPipelineEditor(false);
            setPendingVersionDetails(null);
          }}
        />
      )}
    </div>
  );
};
