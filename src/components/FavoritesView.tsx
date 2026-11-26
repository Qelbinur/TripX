import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, X } from 'lucide-react';
import type { PlaceSubmission } from '../types/filter';
import { PlaceCard, resolvePlaceRegionLabel } from './PlaceCard';

interface FavoritesViewProps {
  places: PlaceSubmission[];
  favoriteIds: string[];
  onToggleFavorite: (placeId: string) => void;
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  places,
  favoriteIds,
  onToggleFavorite,
  onExplore,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceSubmission | null>(null);

  useEffect(() => {
    if (!selectedPlace) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPlace(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPlace]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const favoritePlaces = useMemo(() => {
    return places.filter((place) => favoriteSet.has(place.id));
  }, [favoriteSet, places]);

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
      aria-label="Sevimlilər"
      className="tripx-enter mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6"
    >
      <div className="flex items-baseline justify-between gap-3 pb-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
            Sevimlilər
          </h1>
          <p className="mt-0.5 text-xs font-medium text-[#5B6472] tabular-nums dark:text-[#94A0B2]">
            {favoritePlaces.length > 0
              ? `${favoritePlaces.length} seçilmiş yer`
              : 'Seçilmiş yer yoxdur'}
          </p>
        </div>
      </div>

      {favoritePlaces.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {favoritePlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isFavorite
              onToggleFavorite={onToggleFavorite}
              onSelect={setSelectedPlace}
            />
          ))}
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center justify-center rounded-3xl border border-[#141A23]/[0.07] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(17,34,51,0.05)] dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F0F3] text-[#1F5D6B] dark:bg-[#1D323A] dark:text-[#6BC0D1]">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-base font-semibold text-[#141A23] dark:text-[#EEF2F6]">
            Hələ sevimli yer yoxdur
          </h2>
          <p className="mt-1 max-w-xs text-sm text-[#5B6472] dark:text-[#94A0B2]">
            Kəşf et bölməsində bəyəndiyiniz yerlərin ürək ikonuna toxunaraq buraya əlavə edin.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1F5D6B] px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            Kəşf etməyə başla
          </button>
        </div>
      )}

      {selectedPlace &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fav-place-detail-title"
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
                    id="fav-place-detail-title"
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
