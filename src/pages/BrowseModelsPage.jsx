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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + itemsPerPage);

  // Ensure current page is valid
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setCurrentPage(1); // Reset to first page when filters change
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
        Showing {paginatedModels.length > 0 ? startIndex + 1 : 0} – {Math.min(startIndex + itemsPerPage, filteredModels.length)} of {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : paginatedModels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show all pages if 5 or fewer, otherwise show with ellipsis
                  if (totalPages <= 5) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-black'
                            : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  // Show first, last, and nearby pages with ellipsis
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-black'
                            : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  // Show ellipsis
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={`ellipsis-${pageNum}`} className="px-2 text-slate-600">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
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
