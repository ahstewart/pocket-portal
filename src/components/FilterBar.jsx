import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function FilterBar({
  filters = [],
  onFilterChange,
  className = '',
  ...props
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleFilterSelect = (filterId, value, multi) => {
    if (multi) {
      // Find the current filter to get its activeValue array
      const filter = filters.find(f => f.id === filterId);
      const current = Array.isArray(filter?.activeValue) ? filter.activeValue : [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      onFilterChange?.(filterId, next);
      // Keep dropdown open for multi-select
    } else {
      onFilterChange?.(filterId, value);
      setOpenDropdown(null);
    }
  };

  const getButtonLabel = (filter) => {
    if (filter.multi) {
      const selected = Array.isArray(filter.activeValue) ? filter.activeValue : [];
      if (selected.length === 0) return 'Any';
      if (selected.length === 1) {
        return filter.options.find(o => o.value === selected[0])?.label ?? selected[0];
      }
      return `${selected.length} selected`;
    }
    const activeOption = filter.options.find(opt => opt.value === filter.activeValue);
    return activeOption && activeOption.value !== null ? activeOption.label : 'Any';
  };

  const isFilterActive = (filter) => {
    if (filter.multi) {
      return Array.isArray(filter.activeValue) && filter.activeValue.length > 0;
    }
    const activeOption = filter.options.find(opt => opt.value === filter.activeValue);
    return activeOption && activeOption.value !== null;
  };

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`} {...props}>
      {filters.map((filter) => {
        const active = isFilterActive(filter);
        return (
          <div key={filter.id} className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === filter.id ? null : filter.id)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-slate-400 font-normal">{filter.label}:</span>
              {getButtonLabel(filter)}
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${openDropdown === filter.id ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {openDropdown === filter.id && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto">
                {filter.multi ? (
                  filter.options.map((option) => {
                    const checked = Array.isArray(filter.activeValue) && filter.activeValue.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterSelect(filter.id, option.value, true)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors text-sm text-slate-700 flex items-center gap-2"
                      >
                        <span className={`flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center ${
                          checked ? 'bg-primary-600 border-primary-600' : 'border-slate-300'
                        }`}>
                          {checked && <CheckIcon className="h-3 w-3 text-white" />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })
                ) : (
                  filter.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterSelect(filter.id, option.value, false)}
                      className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors text-sm ${
                        filter.activeValue === option.value
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

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
