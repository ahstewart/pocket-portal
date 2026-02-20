import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import LoadingCard from './LoadingCard';

export default function HuggingFaceSearch({ onModelSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const searchHuggingFace = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setLoading(true);
    setError('');
    setNoResults(false);

    try {
      // Get auth token from localStorage (set by auth context)
      const token = localStorage.getItem('supabase_auth_token');
      
      // Call the backend to search HF models with tflite files
      const response = await fetch(
        `http://127.0.0.1:8000/search/huggingface?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        const errorMsg = errorData.detail || response.statusText;
        
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 429) {
          throw new Error('Search rate limit reached. Please try again in a moment.');
        } else if (response.status === 503) {
          throw new Error('Hugging Face is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(errorMsg);
        }
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setNoResults(data.results && data.results.length === 0);
    } catch (err) {
      setError(`${err.message}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search - only search if user stops typing for 500ms
    const timer = setTimeout(() => {
      searchHuggingFace(query);
    }, 500);

    return () => clearTimeout(timer);
  };

  const handleModelSelect = async (model) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('supabase_auth_token');
      
      // Call the import endpoint
      const response = await fetch('http://127.0.0.1:8000/import/huggingface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          hf_id: model.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || response.statusText);
      }

      const importedModel = await response.json();
      
      // Pass the imported data back to parent component
      onModelSelect({
        name: importedModel.name,
        slug: importedModel.slug,
        description: importedModel.description,
        category: importedModel.category,
        task: importedModel.task,
        tags: importedModel.tags || [],
        hf_model_id: importedModel.hf_model_id,
        license_type: importedModel.license_type,
      });

      // Close the search modal
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-slate-900">Import from Hugging Face</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-slate-600">Search for TFLite models and import their metadata</p>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for models (e.g., 'mobilenet', 'efficientnet')..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 m-6 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : noResults ? (
            <div className="p-6 text-center">
              <p className="text-slate-600">No models found. Try a different search term.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              <p>Enter a search term to find TFLite models on Hugging Face</p>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {searchResults.map((model) => (
                <div
                  key={model.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer"
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{model.id}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {model.description || 'No description available'}
                      </p>
                      {model.tags && model.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {model.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {model.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              +{model.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModelSelect(model);
                      }}
                      isLoading={loading}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
