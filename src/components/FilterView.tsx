import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { AZERBAIJAN_REGIONS } from '../data/azerbaijanRegions';
import {
  COMPANION_OPTIONS,
  countActiveFilters,
  countDetailedFilters,
  CROWD_OPTIONS,
  EMPTY_FILTER_STATE,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  type FilterState,
} from '../types/filter';
import { RegionPickerModal } from './RegionPickerModal';

interface FilterViewProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onApply: () => void;
  embedded?: boolean;
}

function toggleArrayItem(items: string[], target: string): string[] {
  return items.includes(target)
    ? items.filter((item) => item !== target)
    : [...items, target];
}

export const FilterView: React.FC<FilterViewProps> = ({
  value,
  onChange,
  onApply,
  embedded = false,
}) => {
  const [showDetailed, setShowDetailed] = useState(() => countDetailedFilters(value) > 0);
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);

  const totalCount = countActiveFilters(value);
  const detailedCount = countDetailedFilters(value);

  const selectedRegionNames = useMemo(() => {
    const map = new Map(AZERBAIJAN_REGIONS.map((r) => [r.id, r.name]));
    return value.regions.map((id) => map.get(id)).filter((n): n is string => Boolean(n));
  }, [value.regions]);

  const toggleFilter = (key: keyof FilterState, item: string) => {
    onChange({
      ...value,
      [key]: toggleArrayItem(value[key], item),
    });
  };

  const resetAll = () => {
    onChange(EMPTY_FILTER_STATE);
  };

  const renderMultiSelectGroup = (
    title: string,
    key: Exclude<keyof FilterState, 'regions'>,
    options: readonly string[]
  ) => {
    const selected = value[key];

    return (
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
            {title}
          </h2>
          {selected.length > 0 && (
            <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
              {selected.length} seçilib
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleFilter(key, option)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-[#1F5D6B] bg-[#1F5D6B] text-white shadow-xs dark:border-[#3A8A9C] dark:bg-[#2B7788] dark:text-[#F7F8FA]'
                    : 'border-[#141A23]/10 bg-[#F7F8FA] text-[#2B3544] hover:border-[#141A23]/20 hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#C5D0DC] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1E252F]'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="Filtr"
      className={
        embedded
          ? 'tripx-enter w-full'
          : 'tripx-enter mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-5 sm:px-6'
      }
    >
      <div className="rounded-3xl border border-[#141A23]/[0.07] bg-white p-5 shadow-[0_12px_32px_rgba(17,34,51,0.06)] transition-colors duration-200 sm:p-6 dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#141A23]/[0.06] pb-4 dark:border-[#EEF2F6]/[0.07]">
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
              Filtr
            </h1>
            {totalCount > 0 && (
              <span className="text-xs font-medium text-[#5B6472] tabular-nums dark:text-[#94A0B2]">
                {totalCount} seçim
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={resetAll}
            disabled={totalCount === 0}
            className="min-h-[44px] px-2 text-xs font-medium text-[#1F5D6B] transition-opacity duration-150 hover:text-[#164652] disabled:opacity-35 dark:text-[#6BC0D1] dark:hover:text-[#8FD1DE] cursor-pointer disabled:cursor-default"
          >
            Təmizlə
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Bölgə (Azerbaijan districts & cities, alphabetical, multi-select) */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
                Bölgə
              </h2>
              {selectedRegionNames.length > 0 && (
                <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
                  {selectedRegionNames.length} seçilib
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsRegionPickerOpen(true)}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#141A23]/20 hover:bg-white active:scale-[0.99] dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1B222C] cursor-pointer"
            >
              <span
                className={`truncate text-sm ${
                  selectedRegionNames.length > 0
                    ? 'font-medium text-[#141A23] dark:text-[#EEF2F6]'
                    : 'text-[#6B7482] dark:text-[#8A95A5]'
                }`}
              >
                {selectedRegionNames.length > 0
                  ? selectedRegionNames.join(', ')
                  : 'Rayon və ya şəhər seçin'}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#6B7482] dark:text-[#8A95A5]" aria-hidden="true" />
            </button>

            {selectedRegionNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {value.regions.map((regionId) => {
                  const region = AZERBAIJAN_REGIONS.find((r) => r.id === regionId);
                  if (!region) return null;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => toggleFilter('regions', region.id)}
                      aria-label={`${region.name} seçimini sil`}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-[#E4F0F3] px-2.5 py-1 text-xs font-medium text-[#164652] transition-colors hover:bg-[#D5E9EE] dark:bg-[#1E333B] dark:text-[#A8DCE6] dark:hover:bg-[#26424C] cursor-pointer"
                    >
                      <span>{region.name}</span>
                      <X className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {/* 2. Məkan */}
          {renderMultiSelectGroup('Məkan', 'places', PLACE_OPTIONS)}

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {/* 3. Ətraflı filtr toggle */}
          <div>
            <button
              type="button"
              aria-expanded={showDetailed}
              onClick={() => setShowDetailed((prev) => !prev)}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#141A23]/20 hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1B222C] cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-[#141A23] dark:text-[#EEF2F6]">
                <SlidersHorizontal
                  className="h-4 w-4 text-[#1F5D6B] dark:text-[#6BC0D1]"
                  aria-hidden="true"
                />
                <span>Ətraflı filtr</span>
                {!showDetailed && detailedCount > 0 && (
                  <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
                    ({detailedCount})
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#6B7482] transition-transform duration-150 dark:text-[#8A95A5] ${
                  showDetailed ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {showDetailed && (
              <div className="mt-5 space-y-5 pt-1">
                {renderMultiSelectGroup('Kimlə', 'companions', COMPANION_OPTIONS)}

                <div className="border-t border-[#141A23]/[0.05] dark:border-[#EEF2F6]/[0.06]" />

                {renderMultiSelectGroup('İnsan sayı', 'crowdSize', CROWD_OPTIONS)}

                <div className="border-t border-[#141A23]/[0.05] dark:border-[#EEF2F6]/[0.06]" />

                {renderMultiSelectGroup('Mövsüm', 'seasons', SEASON_OPTIONS)}
              </div>
            )}
          </div>
        </div>

        {/* Apply button */}
        <div className="mt-7 flex items-center gap-2.5 border-t border-[#141A23]/[0.06] pt-4 dark:border-[#EEF2F6]/[0.07]">
          <button
            type="button"
            onClick={onApply}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            {totalCount > 0 ? `Tətbiq et (${totalCount})` : 'Tətbiq et'}
          </button>
        </div>
      </div>

      <RegionPickerModal
        isOpen={isRegionPickerOpen}
        selectedIds={value.regions}
        onToggle={(regionId) => toggleFilter('regions', regionId)}
        onClear={() => onChange({ ...value, regions: [] })}
        onClose={() => setIsRegionPickerOpen(false)}
      />
    </section>
  );
};
