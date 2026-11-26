import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MapPin, SlidersHorizontal, X } from 'lucide-react';
import {
  countActiveFilters,
  EMPTY_FILTER_STATE,
  type FilterState,
  type PlaceSubmission,
} from '../types/filter';
import { FilterView } from './FilterView';
import { PlaceCard, resolvePlaceRegionLabel } from './PlaceCard';

interface ExploreViewProps {
  places: PlaceSubmission[];
  filterState: FilterState;
  onChangeFilter: (next: FilterState) => void;
  favoriteIds: string[];
  onToggleFavorite: (placeId: string) => void;
}

function matchesFilterArray(placeValues: string[], filterValues: string[]): boolean {
  if (filterValues.length === 0) return true;
  return filterValues.some((val) => placeValues.includes(val));
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  places,
  filterState,
  onChangeFilter,
  favoriteIds,
  onToggleFavorite,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSubmission | null>(null);

  const activeFilterCount = countActiveFilters(filterState);

  useEffect(() => {
    if (!selectedPlace) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPlace(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPlace]);

  const displayedPlaces = useMemo(() => {
    const sorted = [...places].sort((a, b) => b.createdAt - a.createdAt);
    if (activeFilterCount === 0) {
      return sorted.slice(0, 20);
    }
    return sorted.filter(
      (place) =>
        matchesFilterArray(place.filters.regions, filterState.regions) &&
        matchesFilterArray(place.filters.places, filterState.places) &&
        matchesFilterArray(place.filters.companions, filterState.companions) &&
        matchesFilterArray(place.filters.crowdSize, filterState.crowdSize) &&
        matchesFilterArray(place.filters.seasons, filterState.seasons)
    );
  }, [activeFilterCount, filterState, places]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const selectedMetadata = useMemo(() => {
    if (!selectedPlace) return [];
    return [
      ...selectedPlace.filters.places,
      ...selectedPlace.filters.companions,
      ...selectedPlace.filters.seasons,
    ];
  }, [selectedPlace]);

  return (
    <section
      aria-label="Kəşf et"
      className="tripx-enter mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6"
    >
      {/* Top bar with page heading & Filter button */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
            Kəşf et
          </h1>
          <p className="mt-0.5 text-xs font-medium text-[#5B6472] tabular-nums dark:text-[#94A0B2]">
            {activeFilterCount === 0
              ? `Son əlavə edilən ${displayedPlaces.length} yer`
              : `${displayedPlaces.length} nəticə tapıldı`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeFilterCount > 0 && !isFilterOpen && (
            <button
              type="button"
              onClick={() => onChangeFilter(EMPTY_FILTER_STATE)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-2.5 text-xs font-medium text-[#1F5D6B] transition-colors hover:text-[#164652] whitespace-nowrap shrink-0 dark:text-[#6BC0D1] dark:hover:text-[#8FD1DE] cursor-pointer"
            >
              Təmizlə
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            aria-expanded={isFilterOpen}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] cursor-pointer ${
              isFilterOpen || activeFilterCount > 0
                ? 'border-[#1F5D6B] bg-[#1F5D6B] text-white shadow-xs hover:bg-[#194D59] dark:border-[#3A8A9C] dark:bg-[#2B7788] dark:text-[#F7F8FA] dark:hover:bg-[#358A9D]'
                : 'border-[#141A23]/10 bg-white text-[#141A23] shadow-xs hover:border-[#141A23]/20 hover:bg-[#F7F8FA] dark:border-[#EEF2F6]/10 dark:bg-[#161B22] dark:text-[#EEF2F6] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1E252F]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Filtr</span>
            {activeFilterCount > 0 && (
              <span className="tabular-nums opacity-90">({activeFilterCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Filter panel (moved from FilterView) */}
      {isFilterOpen && (
        <div className="mb-6">
          <FilterView
            embedded
            value={filterState}
            onChange={onChangeFilter}
            onApply={() => setIsFilterOpen(false)}
          />
        </div>
      )}

      {/* Places card grid */}
      {displayedPlaces.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isFavorite={favoriteSet.has(place.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={setSelectedPlace}
            />
          ))}
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center justify-center rounded-3xl border border-[#141A23]/[0.07] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(17,34,51,0.05)] dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F0F3] text-[#1F5D6B] dark:bg-[#1D323A] dark:text-[#6BC0D1]">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-base font-semibold text-[#141A23] dark:text-[#EEF2F6]">
            Uyğun məkan tapılmadı
          </h2>
          <p className="mt-1 max-w-xs text-sm text-[#5B6472] dark:text-[#94A0B2]">
            Seçdiyiniz filtrlərə uyğun nəticə yoxdur. Filtrləri dəyişin və ya təmizləyin.
          </p>
          <button
            type="button"
            onClick={() => onChangeFilter(EMPTY_FILTER_STATE)}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1F5D6B] px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            Filtrləri təmizlə
          </button>
        </div>
      )}

      {/* Lightweight Place Detail Modal */}
      {selectedPlace &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-detail-title"
            onClick={() => setSelectedPlace(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1116]/60 p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="tripx-enter w-full max-w-md overflow-hidden rounded-3xl border border-[#141A23]/8 bg-white shadow-xl dark:border-[#EEF2F6]/10 dark:bg-[#161B22]"
            >
              <div className="relative aspect-[4/3] w-full bg-[#DCE5EE] dark:bg-[#1C2430]">
                {selectedPlace.mainImage && (
                  <img
                    src={selectedPlace.mainImage}
                    alt={selectedPlace.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(selectedPlace.id)}
                  aria-label={
                    favoriteSet.has(selectedPlace.id)
                      ? 'Sevimlilərdən sil'
                      : 'Sevimlilərə əlavə et'
                  }
                  aria-pressed={favoriteSet.has(selectedPlace.id)}
                  className={`absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
                    favoriteSet.has(selectedPlace.id)
                      ? 'bg-white/95 text-[#E11D48] dark:bg-[#0E1116]/90 dark:text-[#FB7185]'
                      : 'bg-white/85 text-[#2B3544] dark:bg-[#0E1116]/75 dark:text-[#EEF2F6]'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${favoriteSet.has(selectedPlace.id) ? 'fill-current' : ''}`}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  aria-label="Bağla"
                  className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#2B3544] backdrop-blur-md transition-colors hover:bg-white dark:bg-[#0E1116]/75 dark:text-[#EEF2F6] dark:hover:bg-[#0E1116]/95 cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h2
                    id="place-detail-title"
                    className="font-display text-lg font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]"
                  >
                    {selectedPlace.name}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-[#5B6472] dark:text-[#94A0B2]">
                    {resolvePlaceRegionLabel(selectedPlace)}
                  </p>
                </div>

                {selectedMetadata.length > 0 && (
                  <p className="border-t border-[#141A23]/[0.06] pt-3 text-xs leading-relaxed text-[#5B6472] dark:border-[#EEF2F6]/[0.07] dark:text-[#94A0B2]">
                    {selectedMetadata.join(' · ')}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
