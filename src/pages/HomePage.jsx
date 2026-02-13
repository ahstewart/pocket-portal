import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModelCard } from '../components/ModelCard';
import { ApiService } from '../api/client';
import Button from '../components/Button';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import WhyYouShouldCare from '../components/WhyYouShouldCare';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const HomePage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getModels()
      .then(data => setModels(data.slice(0, 6))) // Show only 6 models on home
      .catch(err => console.error("Failed to load models:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-slate-50 to-primary-50 rounded-2xl" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-1/4 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-2 right-1/4 w-64 h-64 bg-slate-200 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 px-8 py-16 sm:py-24 text-center max-w-3xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200">
              <SparklesIcon className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Welcome to Pocket AI</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Mobile AI Models <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-slate-900">Made Simple</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Download lightweight, optimized LiteRT (previously TFLite) models for edge devices. No complicated setup, just lightning-fast AI inference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/browse')}
            >
              Browse Models
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/models/create')}
            >
              Upload Your Model
            </Button>
          </div>
        </div>
      </section>

      {/* Why You Should Care Section */}
      <WhyYouShouldCare />

      {/* Featured Models Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Models</h2>
            <p className="text-slate-600 mt-1">Popular models from our community</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/browse')}
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No models yet"
            description="Be the first to upload a mobile-optimized AI model"
            action={{
              label: 'Upload Model',
              onClick: () => navigate('/models/create')
            }}
          />
        )}
      </section>

      {/* Info Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Lightning Fast</h3>
          <p className="text-sm text-slate-600">Optimized TFLite models designed for edge devices and mobile inference.</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Easy Sharing</h3>
          <p className="text-sm text-slate-600">Upload your models and share them with the community effortlessly.</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Track Usage</h3>
          <p className="text-sm text-slate-600">Monitor usage metrics and see how your models are being used.</p>
        </div>
      </section>
    </div>
  );
};