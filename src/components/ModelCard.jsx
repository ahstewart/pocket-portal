import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownTrayIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Badge from './Badge';

export const ModelCard = ({ model }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Object Detection': 'primary',
      'Image Classification': 'lime',
      'Pose Estimation': 'amber',
      'Semantic Segmentation': 'rose',
      'Custom': 'slate',
    };
    return colors[category] || 'primary';
  };

  const getBorderColor = (category) => {
    const colors = {
      'Object Detection': 'border-primary-500',
      'Image Classification': 'border-lime-500',
      'Pose Estimation': 'border-amber-500',
      'Semantic Segmentation': 'border-rose-500',
      'Custom': 'border-slate-400',
    };
    return colors[category] || 'border-primary-500';
  };

  const rating = model.rating_weighted_avg?.toFixed(1) || '0.0';
  const taskLabel = model.task
    ? model.task.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null;

  return (
    <Link
      to={`/models/${model.id}`}
      className={`group block bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all duration-300 ease-smooth border-t-4 ${getBorderColor(model.category)} hover:-translate-y-1`}
    >
      <div className="p-4 space-y-2">
        {/* Row 1: task (left) + category (right) */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-slate-900 truncate">
            {taskLabel ?? '—'}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0 text-xs text-slate-500">
            <span>Category:</span>
            <Badge variant={getCategoryColor(model.category)} className="text-xs">
              {model.category}
            </Badge>
          </div>
        </div>

        {/* Row 3: model name */}
        <h3 className="text-sm font-medium text-slate-500 group-hover:text-primary-600 truncate transition-colors">
          {model.name}
        </h3>

        {/* Row 3: description */}
        <p className="text-sm text-slate-600 line-clamp-1">
          {model.description || 'No description provided.'}
        </p>

        {/* Row 4: stats */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            <span>{model.total_download_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <StarSolidIcon className="h-3.5 w-3.5 text-accent-amber" />
            <span className="font-medium text-slate-700">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <RectangleStackIcon className="h-3.5 w-3.5" />
            <span>{model.version_count ?? 0} {model.version_count === 1 ? 'version' : 'versions'}</span>
          </div>
          {model.license_type && (
            <span className="ml-auto px-1.5 py-0.5 bg-slate-100 rounded uppercase tracking-wide">
              {model.license_type}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
