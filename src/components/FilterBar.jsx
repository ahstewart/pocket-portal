import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

/**
 * Unified multi-select / single-select filter bar.
 *
 * Filter shape:
 *   { id, label, multi?, activeValue, options: [{ label, value }] }
 *
 * For multi filters, activeValue must be an array.
 * For single filters, activeValue is a scalar (or null for "any").
 */
export default function FilterBar({ filters = [], onFilterChange, className = '' }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getButtonLabel = (filter) => {
    if (filter.multi) {
      const selected = Array.isArray(filter.activeValue) ? filter.activeValue : [];
      if (selected.length === 0) return 'Any';
      if (selected.length === 1) {
        return filter.options.find(o => o.value === selected[0])?.label ?? selected[0];
      }
      return `${selected.length} selected`;
    }
    const opt = filter.options.find(o => o.value === filter.activeValue);
    return opt && opt.value !== null ? opt.label : 'Any';
  };

  const isFilterActive = (filter) => {
    if (filter.multi) {
      return Array.isArray(filter.activeValue) && filter.activeValue.length > 0;
    }
    const opt = filter.options.find(o => o.value === filter.activeValue);
    return opt && opt.value !== null;
  };

  const toggleMultiValue = (filter, value) => {
    const current = Array.isArray(filter.activeValue) ? filter.activeValue : [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange?.(filter.id, next);
  };

  const selectAll = (filter) => {
    onFilterChange?.(filter.id, filter.options.map(o => o.value));
  };

  const clearAll = (filter) => {
    onFilterChange?.(filter.id, []);
  };

  return (
    <div ref={containerRef} className={`flex flex-wrap gap-3 items-center ${className}`}>
      {filters.map((filter) => {
        const active = isFilterActive(filter);
        const isOpen = openDropdown === filter.id;

        return (
          <div key={filter.id} className="relative">
            {/* Trigger button */}
            <button
              onClick={() => setOpenDropdown(isOpen ? null : filter.id)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-slate-400 font-normal">{filter.label}:</span>
              <span>{getButtonLabel(filter)}</span>
              {active && !filter.multi && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onFilterChange?.(filter.id, null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onFilterChange?.(filter.id, null); } }}
                  className="ml-0.5 text-primary-400 hover:text-primary-600 leading-none"
                  title="Clear"
                >
                  ×
                </span>
              )}
              <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-52 overflow-hidden">
                {filter.multi ? (
                  <>
                    {/* Options list */}
                    <div className="max-h-56 overflow-y-auto py-1">
                      {filter.options.map((option) => {
                        const checked = Array.isArray(filter.activeValue) && filter.activeValue.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMultiValue(filter, option.value)}
                              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {/* Footer: Select All / Clear All */}
                    <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => selectAll(filter)}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        Select all
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => clearAll(filter)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    {filter.options.map((option) => {
                      const selected = filter.activeValue === option.value;
                      return (
                        <button
                          key={String(option.value)}
                          onClick={() => { onFilterChange?.(filter.id, option.value); setOpenDropdown(null); }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                            selected
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`flex-shrink-0 h-4 w-4 rounded-full border-2 ${
                            selected ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                          }`} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
