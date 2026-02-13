import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const UploadModelPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Object Detection',
    version: '1.0.0',
    fileSize: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Object Detection',
    'Image Classification',
    'Pose Estimation',
    'Semantic Segmentation',
    'Custom'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter a model name');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      // Redirect to browse page after 2 seconds
      setTimeout(() => {
        navigate('/browse');
      }, 2000);
    } catch (err) {
      setError('Failed to upload model. Please try again.');
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <CheckCircleIcon className="h-12 w-12 text-accent-lime" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Model Uploaded!</h2>
        <p className="text-slate-600 mb-8">Your model has been successfully uploaded and is now available for others to download.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          View on Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Model</h1>
        <p className="text-slate-600">Share your mobile-optimized TFLite model with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-slate-200 p-8">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Model Name */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Model Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., MobileNet v3 Small"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your model's capabilities and use cases..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-vertical"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Version
          </label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleInputChange}
            placeholder="1.0.0"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Upload TFLite Model *
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".tflite"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              required
            />
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-all"
            >
              <ArrowUpTrayIcon className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">TFLite files only (typically less than 50 MB)</p>
            </label>
          </div>
          
          {file && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-accent-lime" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-slate-600">{formData.fileSize}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={uploading}
            className="flex-1"
          >
            {uploading ? 'Uploading...' : 'Upload Model'}
          </Button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2">✨ Best Practices</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Optimize your model for mobile devices</li>
            <li>• Keep model size under 50 MB</li>
            <li>• Use descriptive names and descriptions</li>
            <li>• Include version numbers</li>
          </ul>
        </div>
        
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2">📋 Requirements</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Must be in TFLite format (.tflite)</li>
            <li>• Properly quantized or converted</li>
            <li>• Include model metadata</li>
            <li>• Clear input/output descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
