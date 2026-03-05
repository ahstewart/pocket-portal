import React from 'react';
import {
  CodeBracketIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PipelineConfigViewer = ({ pipelineSpec, onEdit, isEditable = false }) => {
  const isValidSpec = pipelineSpec && (
    pipelineSpec.metadata ||
    pipelineSpec.preprocessing ||
    pipelineSpec.postprocessing
  );

  if (!isValidSpec) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-4">
        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-900 text-lg">No Pipeline Configuration</h4>
          <p className="text-yellow-800 mt-1">
            This version doesn't have a pipeline configuration yet. {isEditable && 'Create one to define how this model should be executed.'}
          </p>
          {isEditable && (
            <button
              onClick={onEdit}
              className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Configuration
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Shared sub-components ────────────────────────────────────────────────

  const TensorRow = ({ tensor }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono font-medium text-slate-800">{tensor.name}</span>
      <span className="text-slate-400">·</span>
      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-xs">
        [{Array.isArray(tensor.shape) ? tensor.shape.join(', ') : tensor.shape}]
      </span>
      <span className="text-slate-400">·</span>
      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-xs">{tensor.dtype}</span>
    </div>
  );

  // Used by new-format path (step.step + step.params)
  const NewPreprocessingStep = ({ step, index, totalSteps }) => (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-primary-100 border-2 border-primary-600 flex items-center justify-center text-xs font-bold text-primary-600">
          {index + 1}
        </div>
        {index < totalSteps - 1 && <div className="w-0.5 h-8 bg-primary-200 my-1" />}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <code className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-sm font-semibold">
            {step.step}
          </code>
          {Object.keys(step.params || {}).length > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(step.params).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-slate-600 font-medium">{key}:</span>
                  <span className="text-slate-700 font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NewPostprocessingStep = ({ step, index, totalSteps }) => (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-secondary-100 border-2 border-secondary-600 flex items-center justify-center text-xs font-bold text-secondary-600">
          {index + 1}
        </div>
        {index < totalSteps - 1 && <div className="w-0.5 h-8 bg-secondary-200 my-1" />}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <code className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded text-sm font-semibold">
            {step.step}
          </code>
          {Object.keys(step.params || {}).length > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(step.params).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-slate-600 font-medium">{key}:</span>
                  <span className="text-slate-700 font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── New schema format (metadata + inputs + outputs arrays) ───────────────

  const hasNewFormat = pipelineSpec.metadata && Array.isArray(pipelineSpec.preprocessing);

  if (hasNewFormat) {
    const meta = pipelineSpec.metadata?.[0] || {};

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CodeBracketIcon className="h-7 w-7 text-primary-600" />
            Pipeline Configuration
          </h3>
          {isEditable && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Edit Configuration
            </button>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          {meta.model_name && <span className="font-medium text-slate-900">{meta.model_name}</span>}
          {meta.model_name && (meta.model_task || meta.framework) && <span className="text-slate-300">·</span>}
          {meta.model_task && <span className="text-slate-600">{meta.model_task}</span>}
          {meta.model_task && meta.framework && <span className="text-slate-300">·</span>}
          {meta.framework && <span className="text-slate-600">{meta.framework}</span>}
          {meta.schema_version && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">schema v{meta.schema_version}</span>
            </>
          )}
        </div>

        <div className="space-y-12">
          {/* INPUT section */}
          {pipelineSpec.preprocessing && pipelineSpec.preprocessing.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-0.5 flex-1 bg-primary-200" />
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">INPUT</span>
                <div className="h-0.5 flex-1 bg-primary-200" />
              </div>

              {pipelineSpec.inputs && pipelineSpec.inputs.length > 0 && (
                <div className="space-y-1.5 ml-2">
                  {pipelineSpec.inputs.map((t, i) => (
                    <TensorRow key={i} tensor={t} />
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {pipelineSpec.preprocessing.map((block, blockIdx) => (
                  <div key={blockIdx} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      <span className="font-mono text-primary-700">{block.input_name}</span>
                      <span className="text-slate-500 font-normal"> (expects: {block.expects_type})</span>
                    </p>
                    <div className="ml-4 space-y-1">
                      {block.steps && block.steps.map((step, stepIdx) => (
                        <NewPreprocessingStep key={stepIdx} step={step} index={stepIdx} totalSteps={block.steps.length} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center py-2">
                <ArrowRightIcon className="h-6 w-6 text-slate-400 rotate-90" />
              </div>
            </div>
          )}

          {/* Model inference */}
          <div className="flex justify-center py-4">
            <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full font-bold text-amber-900">
              🧠 MODEL INFERENCE
            </div>
          </div>

          {/* OUTPUT section */}
          {pipelineSpec.postprocessing && pipelineSpec.postprocessing.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-center py-2">
                <ArrowRightIcon className="h-6 w-6 text-slate-400 rotate-90" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-0.5 flex-1 bg-secondary-200" />
                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">OUTPUT</span>
                <div className="h-0.5 flex-1 bg-secondary-200" />
              </div>

              {pipelineSpec.outputs && pipelineSpec.outputs.length > 0 && (
                <div className="space-y-1.5 ml-2">
                  {pipelineSpec.outputs.map((t, i) => (
                    <TensorRow key={i} tensor={t} />
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {pipelineSpec.postprocessing.map((block, blockIdx) => (
                  <div key={blockIdx} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      <span className="font-mono text-secondary-700">{block.output_name}</span>
                      <span className="text-slate-500 font-normal"> (interpretation: {block.interpretation})</span>
                    </p>
                    <div className="ml-4 space-y-1">
                      {block.steps && block.steps.map((step, stepIdx) => (
                        <NewPostprocessingStep key={stepIdx} step={step} index={stepIdx} totalSteps={block.steps.length} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Legacy schema format ─────────────────────────────────────────────────

  const PreprocessingStep = ({ step, index }) => (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-600 flex items-center justify-center text-sm font-bold text-primary-600">
          {index + 1}
        </div>
        {index < (pipelineSpec.preprocessing?.length || 0) - 1 && (
          <div className="w-0.5 h-12 bg-primary-200 my-1"></div>
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <code className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-semibold">
              {step.action}
            </code>
            <span className="text-xs text-slate-600">Preprocessing Step {index + 1}</span>
          </div>
          {Object.keys(step.params || {}).length > 0 && (
            <div className="mt-3 space-y-2 text-sm">
              {Object.entries(step.params).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-slate-600 font-medium">{key}:</span>
                  <span className="text-slate-700 font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PostprocessingStep = ({ step, index }) => (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-secondary-100 border-2 border-secondary-600 flex items-center justify-center text-sm font-bold text-secondary-600">
          {index + 1}
        </div>
        {index < (pipelineSpec.postprocessing?.length || 0) - 1 && (
          <div className="w-0.5 h-12 bg-secondary-200 my-1"></div>
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <code className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-sm font-semibold">
              {step.action}
            </code>
            <span className="text-xs text-slate-600">Postprocessing Step {index + 1}</span>
          </div>
          {Object.keys(step.params || {}).length > 0 && (
            <div className="mt-3 space-y-2 text-sm">
              {Object.entries(step.params).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-slate-600 font-medium">{key}:</span>
                  <span className="text-slate-700 font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const hasPreprocessing = pipelineSpec.preprocessing && pipelineSpec.preprocessing.length > 0;
  const hasPostprocessing = pipelineSpec.postprocessing && pipelineSpec.postprocessing.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <CodeBracketIcon className="h-7 w-7 text-primary-600" />
            Pipeline Configuration
          </h3>
          <p className="text-slate-600">
            Schema version: <code className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">{pipelineSpec.schema_version || '1.0'}</code>
          </p>
        </div>
        {isEditable && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            Edit Configuration
          </button>
        )}
      </div>

      <div className="space-y-12">
        {hasPreprocessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-0.5 flex-1 bg-primary-200"></div>
              <h4 className="text-lg font-bold text-slate-900">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">INPUT</span>
              </h4>
              <div className="h-0.5 flex-1 bg-primary-200"></div>
            </div>
            <div className="space-y-6">
              {pipelineSpec.preprocessing.map((step, idx) => (
                <PreprocessingStep key={idx} step={step} index={idx} />
              ))}
            </div>
            <div className="flex justify-center py-2">
              <ArrowRightIcon className="h-6 w-6 text-slate-400 rotate-90" />
            </div>
          </div>
        )}

        <div className="flex justify-center py-4">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full font-bold text-amber-900">
            🧠 MODEL INFERENCE
          </div>
        </div>

        {hasPostprocessing && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <ArrowRightIcon className="h-6 w-6 text-slate-400 rotate-90" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-0.5 flex-1 bg-secondary-200"></div>
              <h4 className="text-lg font-bold text-slate-900">
                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">OUTPUT</span>
              </h4>
              <div className="h-0.5 flex-1 bg-secondary-200"></div>
            </div>
            <div className="space-y-6">
              {pipelineSpec.postprocessing.map((step, idx) => (
                <PostprocessingStep key={idx} step={step} index={idx} />
              ))}
            </div>
          </div>
        )}

        {(hasPreprocessing || hasPostprocessing) && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              Pipeline Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
              <div>
                <p className="font-medium">Preprocessing Steps</p>
                <p className="text-lg font-bold text-slate-900">{pipelineSpec.preprocessing?.length || 0}</p>
              </div>
              <div>
                <p className="font-medium">Postprocessing Steps</p>
                <p className="text-lg font-bold text-slate-900">{pipelineSpec.postprocessing?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineConfigViewer;
