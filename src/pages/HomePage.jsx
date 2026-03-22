import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModelCard } from '../components/ModelCard';
import { ApiService } from '../api/client';
import Button from '../components/Button';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import { SparklesIcon, CloudArrowUpIcon, CpuChipIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const HOW_IT_WORKS = [
  {
    icon: CloudArrowUpIcon,
    color: 'bg-blue-100 text-blue-600',
    title: 'Add your Model to Jacana',
    description: 'Add your model via Hugging Face, or upload it directly into the Jacana app.',
  },
  {
    icon: CpuChipIcon,
    color: 'bg-teal-100 text-teal-600',
    title: 'Generate a Pipeline',
    description: 'Jacana inspects the model and generates a preprocessing and postprocessing pipeline automatically.',
  },
  {
    icon: DevicePhoneMobileIcon,
    color: 'bg-secondary-100 text-secondary-600',
    title: 'Run it on Mobile',
    description: 'Users download and run the model 100% on-device — no internet required after download.',
  },
];

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
      {/* Hero + How It Works — unified landing area */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-teal-50 to-blue-50" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-1/4 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-2 right-1/4 w-64 h-64 bg-teal-200 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-8 pt-16 sm:pt-20 pb-14">
          {/* Headline + CTA */}
          <div className="text-center max-w-3xl mx-auto mb-14">
{/*             <div className="mb-5 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200">
                <SparklesIcon className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Welcome to Jacana</span>
              </div>
            </div> */}

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Mobile AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-600">Made Simple</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Try out any mobile-optimized AI model without writing a single line of code
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => navigate('/browse')}>Browse Models</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/models/create')}>Upload A Model</Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-5xl mx-auto mb-10">
            <div className="flex-1 h-px bg-primary-200/60" />
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-widest whitespace-nowrap">How it works</span>
            <div className="flex-1 h-px bg-primary-200/60" />
          </div>

          {/* Steps */}
          <div className="group grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-primary-200/70" />
                  )}
                  <div className={`relative z-10 h-14 w-14 rounded-full flex items-center justify-center mb-4 ${step.color} ring-4 ring-white/70`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Step {i + 1}</span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-300">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
              <ModelCard key={model.id} model={model} from="home" />
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
          <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Easy Sharing</h3>
          <p className="text-sm text-slate-600">Upload your models and share them with the community effortlessly.</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Track Usage</h3>
          <p className="text-sm text-slate-600">Monitor usage metrics and see how your models are being used.</p>
        </div>
      </section>
    </div>
  );
};