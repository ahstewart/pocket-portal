import React, { useEffect, useState, useMemo } from 'react';
import { ApiService } from '../api/client';
import { ModelCard } from '../components/ModelCard';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import { FunnelIcon } from '@heroicons/react/24/outline';

export const BrowseModelsPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch all models
  useEffect(() => {
    ApiService.getModels()
      .then(setModels)
      .catch(err => console.error("Failed to load models:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort logic
  const filteredModels = useMemo(() => {
    let result = [...models];

    // Category filter
    if (categoryFilter) {
      result = result.filter(m => m.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        result.sort((a, b) => b.total_download_count - a.total_download_count);
        break;
      case 'highest-rated':
        result.sort((a, b) => (b.rating_weighted_avg || 0) - (a.rating_weighted_avg || 0));
        break;
      default:
        break;
    }

    return result;
  }, [models, searchQuery, categoryFilter, sortBy]);

  // Get unique categories
  const categories = [...new Set(models.map(m => m.category))].sort();

  const filterOptions = [
    {
      id: 'category',
      label: 'Category',
      activeValue: categoryFilter,
      options: [
        { label: 'All Categories', value: null },
        ...categories.map(cat => ({ label: cat, value: cat }))
      ]
    },
    {
      id: 'sort',
      label: 'Sort By',
      activeValue: sortBy,
      options: [
        { label: 'Newest', value: 'newest' },
        { label: 'Most Downloaded', value: 'popular' },
        { label: 'Highest Rated', value: 'highest-rated' }
      ]
    }
  ];

  const handleFilterChange = (filterId, value) => {
    if (filterId === 'category') {
      setCategoryFilter(value);
    } else if (filterId === 'sort') {
      setSortBy(value);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Models</h1>
        <p className="text-slate-600">Explore {models.length} mobile-optimized AI models</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search models by name or description..."
          className="w-full"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="h-4 w-4 text-slate-600" />
          <FilterBar
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
          {(searchQuery || categoryFilter || sortBy !== 'newest') && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter(null);
                setSortBy('newest');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        Showing {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery || categoryFilter ? "No models found" : "No models available"}
          description={
            searchQuery || categoryFilter
              ? "Try adjusting your search or filters"
              : "Check back later for new models"
          }
        />
      )}
    </div>
  );
};
