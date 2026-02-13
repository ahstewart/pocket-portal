import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import Button from '../components/Button';
import { ApiService } from '../api/client';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  StarIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalModels: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch only the current user's models
    ApiService.getModels(user.id)
      .then(data => {
        setModels(data);
        
        // Calculate stats
        const totalDownloads = data.reduce((sum, m) => sum + (m.total_download_count || 0), 0);
        const avgRating = data.length > 0 
          ? (data.reduce((sum, m) => sum + (m.rating_weighted_avg || 0), 0) / data.length).toFixed(1)
          : 0;
        
        setStats({
          totalDownloads,
          totalModels: data.length,
          averageRating: avgRating
        });
      })
      .catch(err => console.error("Failed to load models:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your uploaded models and track usage</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          className="gap-2"
          onClick={() => navigate('/models/create')}
        >
          <PlusIcon className="h-4 w-4" />
          Upload Model
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Downloads</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalDownloads}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Your Models</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalModels}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-slate-900">{stats.averageRating}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-accent-amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Your Models</h2>
        </div>

        {loading ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : models.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 cursor-pointer hover:text-primary-600" onClick={() => navigate(`/models/${model.id}`)}>
                        {model.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {model.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span className="font-medium">{model.total_download_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-900">{(model.rating_weighted_avg || 0).toFixed(1)}</span>
                        <span className="text-xs text-slate-500">({model.total_ratings})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/models/${model.id}`)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Model"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              title="No models yet"
              description="Upload your first model to get started"
              action={{
                label: 'Upload Model',
                onClick: () => navigate('/models/create')
              }}
            />
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Downloads Over Time</h3>
            <div className="flex items-end gap-2 h-48">
              {models.map((model, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                    style={{
                      height: `${(model.total_download_count / Math.max(...models.map(m => m.total_download_count))) * 100}%`
                    }}
                    title={`${model.name}: ${model.total_download_count} downloads`}
                  />
                  <p className="text-xs text-slate-600 text-center truncate w-full">{model.name.substring(0, 8)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Model Performance</h3>
            <div className="space-y-3">
              {models.slice(0, 5).map((model) => (
                <div key={model.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{model.name.substring(0, 25)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-amber rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (parseFloat(model.rating_weighted_avg || 0) / 5) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700 w-8 text-right">
                      {(model.rating_weighted_avg || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
