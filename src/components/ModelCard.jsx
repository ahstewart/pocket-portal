import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';
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

  const rating = model.rating_weighted_avg?.toFixed(1) || '0.0';
  const hasHighRating = parseFloat(rating) >= 4.0;

  return (
    <Link 
      to={`/models/${model.id}`}
      className="group block bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all duration-300 ease-smooth overflow-hidden h-full hover:-translate-y-1"
    >
      {/* Header with gradient background */}
      <div className="h-32 bg-gradient-to-br from-primary-100 via-slate-50 to-slate-100 relative overflow-hidden group-hover:from-primary-200 transition-all duration-300">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-radial" />
        
        {/* Category badge positioned absolutely */}
        <div className="absolute top-3 left-3">
          <Badge variant={getCategoryColor(model.category)} className="text-xs">
            {model.category}
          </Badge>
        </div>

        {/* Premium badge if highly rated */}
        {hasHighRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <SparklesIcon className="h-3.5 w-3.5 text-accent-amber" />
            <span className="text-xs font-semibold text-slate-900">Popular</span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-5 flex flex-col h-full">
        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-700 mb-2 line-clamp-2 transition-colors">
          {model.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
          {model.description || "No description provided."}
        </p>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  {i < Math.round(parseFloat(rating)) ? (
                    <StarSolidIcon className="h-3.5 w-3.5 text-accent-amber" />
                  ) : (
                    <StarIcon className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-700">{rating}</span>
          </div>

          {/* Downloads */}
          <div className="flex items-center gap-1 text-slate-500">
            <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{model.total_download_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};