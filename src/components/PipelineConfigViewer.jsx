import React from 'react';
import { 
  CodeBracketIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PipelineConfigViewer = ({ pipelineSpec, onEdit, isEditable = false }) => {
  // Handle legacy or invalid specifications
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

  // Handle new schema format with metadata, inputs, outputs, preprocessing, postprocessing
  const hasNewFormat = pipelineSpec.metadata && Array.isArray(pipelineSpec.preprocessing);
  
  if (hasNewFormat) {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Configuration</h3>
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 space-y-4">
          {pipelineSpec.metadata && pipelineSpec.metadata[0] && (
            <div className="mb-4 pb-4 border-b border-slate-300">
              <h4 className="font-semibold text-slate-900 mb-2">Model Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Model Name</p>
                  <p className="font-medium text-slate-900">{pipelineSpec.metadata[0].model_name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Framework</p>
                  <p className="font-medium text-slate-900">{pipelineSpec.metadata[0].framework}</p>
                </div>
              </div>
            </div>
          )}
          
          {pipelineSpec.preprocessing && pipelineSpec.preprocessing.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Preprocessing</h4>
              <div className="space-y-2">
                {pipelineSpec.preprocessing.map((block, blockIdx) => (
                  <div key={blockIdx} className="p-3 bg-white rounded border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{block.input_name} ({block.expects_type})</p>
                    <div className="mt-2 space-y-1">
                      {block.steps && block.steps.map((step, stepIdx) => (
                        <p key={stepIdx} className="text-xs text-slate-600 ml-2">
                          {stepIdx + 1}. {step.step}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {pipelineSpec.postprocessing && pipelineSpec.postprocessing.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Postprocessing</h4>
              <div className="space-y-2">
                {pipelineSpec.postprocessing.map((block, blockIdx) => (
                  <div key={blockIdx} className="p-3 bg-white rounded border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{block.output_name} ({block.interpretation})</p>
                    <div className="mt-2 space-y-1">
                      {block.steps && block.steps.map((step, stepIdx) => (
                        <p key={stepIdx} className="text-xs text-slate-600 ml-2">
                          {stepIdx + 1}. {step.step}
                        </p>
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
        <div className="w-8 h-8 rounded-full bg-accent-lime-100 border-2 border-accent-lime flex items-center justify-center text-sm font-bold text-accent-lime">
          {index + 1}
        </div>
        {index < (pipelineSpec.postprocessing?.length || 0) - 1 && (
          <div className="w-0.5 h-12 bg-accent-lime-200 my-1"></div>
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <code className="px-2 py-1 bg-accent-lime-100 text-accent-lime-700 rounded text-sm font-semibold">
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

      {/* Main Pipeline Flow */}
      <div className="space-y-12">
        {/* Preprocessing Section */}
        {hasPreprocessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-0.5 flex-1 bg-primary-200"></div>
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  INPUT
                </span>
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

        {/* Model Execution Section */}
        <div className="flex justify-center py-4">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full font-bold text-amber-900">
            🧠 MODEL INFERENCE
          </div>
        </div>

        {/* Postprocessing Section */}
        {hasPostprocessing && (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <ArrowRightIcon className="h-6 w-6 text-slate-400 rotate-90" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-0.5 flex-1 bg-accent-lime-200"></div>
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="px-3 py-1 bg-accent-lime-100 text-accent-lime-700 rounded-full text-sm font-semibold">
                  OUTPUT
                </span>
              </h4>
              <div className="h-0.5 flex-1 bg-accent-lime-200"></div>
            </div>

            <div className="space-y-6">
              {pipelineSpec.postprocessing.map((step, idx) => (
                <PostprocessingStep key={idx} step={step} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
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
