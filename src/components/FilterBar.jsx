import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function FilterBar({ 
  filters = [],
  onFilterChange,
  className = '',
  ...props 
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleFilterSelect = (filterId, value) => {
    onFilterChange?.(filterId, value);
    setOpenDropdown(null);
  };

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`} {...props}>
      {filters.map((filter) => (
        <div key={filter.id} className="relative">
          {(() => {
            const activeOption = filter.options.find(opt => opt.value === filter.activeValue);
            const isActive = activeOption && activeOption.value !== null;
            return (
              <button
                onClick={() => setOpenDropdown(openDropdown === filter.id ? null : filter.id)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-slate-400 font-normal">{filter.label}:</span>
                {isActive ? activeOption.label : 'Any'}
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${openDropdown === filter.id ? 'rotate-180' : ''}`}
                />
              </button>
            );
          })()}

          {/* Dropdown menu */}
          {openDropdown === filter.id && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterSelect(filter.id, option.value)}
                  className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors text-sm ${
                    filter.activeValue === option.value 
                      ? 'bg-primary-50 text-primary-700 font-semibold' 
                      : 'text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Clickaway to close dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
