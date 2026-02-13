import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../api/client';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { 
  ArrowDownTrayIcon, 
  StarIcon as StarOutlineIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export const ModelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Fetch single model
    ApiService.getModels()
      .then(models => {
        const found = models.find(m => m.id.toString() === id);
        if (found) {
          setModel(found);
        }
      })
      .catch(err => console.error("Failed to load model:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Model download started! (This is a demo)');
    } finally {
      setDownloading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <Button variant="tertiary" size="sm" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Model Header Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <Badge variant={model.category === 'Object Detection' ? 'primary' : 'slate'}>
                {model.category}
              </Badge>
              {parseFloat(rating) >= 4.0 && (
                <Badge variant="warning">Popular</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">{model.name}</h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {model.description || "No description provided."}
            </p>

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
              <div>
                <p className="text-sm text-slate-600">Version</p>
                <p className="text-2xl font-bold text-slate-900">v1.0</p>
              </div>
            </div>
          </div>

          {/* Download Card */}
          <div className="w-full sm:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20">
              <div className="mb-6">
                <div className="h-32 bg-gradient-to-br from-primary-100 to-slate-100 rounded-lg flex items-center justify-center mb-3">
                  <CodeBracketIcon className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Model Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Format</span>
                    <span className="font-medium text-slate-900">TFLite</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Framework</span>
                    <span className="font-medium text-slate-900">TensorFlow</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center gap-2 mb-3"
                onClick={handleDownload}
                isLoading={downloading}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download Model
              </Button>
              
              <p className="text-xs text-slate-600 text-center">
                Free to download and use
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs/Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-accent-lime" />
            Features
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-accent-lime flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Mobile-optimized for edge devices</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-accent-lime flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Quantized for efficient inference</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-accent-lime flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Pre-trained on large datasets</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-accent-lime flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">Compatible with TFLite runtime</span>
            </li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary-600" />
            Requirements
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold flex-shrink-0">•</span>
              <span className="text-slate-700"><strong>Minimum Size:</strong> 50 MB free storage</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold flex-shrink-0">•</span>
              <span className="text-slate-700"><strong>Android:</strong> API 21+</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold flex-shrink-0">•</span>
              <span className="text-slate-700"><strong>iOS:</strong> iOS 12+</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold flex-shrink-0">•</span>
              <span className="text-slate-700"><strong>RAM:</strong> 2+ GB recommended</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Documentation</h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            This TFLite model is ready to use in your mobile applications. Simply download the model file and integrate it using the TensorFlow Lite interpreter for your target platform.
          </p>
          <p>
            For detailed implementation guides and best practices, visit our documentation site.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              📖 View Docs
            </Button>
            <Button variant="outline" size="sm">
              💻 View Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
