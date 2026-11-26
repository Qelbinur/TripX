import React, { useMemo, useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { AZERBAIJAN_REGIONS } from '../data/azerbaijanRegions';
import type { PlaceSubmission } from '../types/filter';

interface PlaceCardProps {
  place: PlaceSubmission;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  onSelect?: (place: PlaceSubmission) => void;
}

export function resolvePlaceRegionLabel(place: PlaceSubmission): string {
  if (place.filters.regions.length > 0) {
    const regionMap = new Map(AZERBAIJAN_REGIONS.map((r) => [r.id, r.name]));
    const names = place.filters.regions
      .map((id) => regionMap.get(id))
      .filter((n): n is string => Boolean(n));
    if (names.length > 0) {
      return names.join(', ');
    }
  }
  if (place.pin?.districtName) {
    return place.pin.districtName;
  }
  return 'Azərbaycan';
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [imageError, setImageError] = useState(false);

  const regionLabel = useMemo(() => resolvePlaceRegionLabel(place), [place]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#141A23]/[0.07] bg-white shadow-[0_8px_24px_rgba(17,34,51,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(17,34,51,0.09)] dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22] dark:shadow-[0_12px_28px_rgba(0,0,0,0.36)]">
      {/* Top-left heart icon button to add/remove favorites */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(place.id);
        }}
        aria-label={isFavorite ? 'Sevimlilərdən sil' : 'Sevimlilərə əlavə et'}
        aria-pressed={isFavorite}
        className={`absolute top-2.5 left-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] cursor-pointer ${
          isFavorite
            ? 'bg-white/95 text-[#E11D48] shadow-[0_4px_12px_rgba(17,34,51,0.16)] dark:bg-[#0E1116]/90 dark:text-[#FB7185]'
            : 'bg-white/85 text-[#2B3544] shadow-[0_4px_12px_rgba(17,34,51,0.12)] hover:bg-white dark:bg-[#0E1116]/75 dark:text-[#EEF2F6] dark:hover:bg-[#0E1116]/95'
        }`}
      >
        <Heart
          className={`h-[18px] w-[18px] transition-transform duration-150 ${
            isFavorite ? 'fill-current scale-105' : ''
          }`}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </button>

      {/* Main clickable card surface */}
      <button
        type="button"
        onClick={() => onSelect?.(place)}
        className="flex flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1F5D6B] cursor-pointer"
      >
        {/* Top half: Place main image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#DCE5EE] dark:bg-[#1C2430]">
          {place.mainImage && !imageError ? (
            <img
              src={place.mainImage}
              alt={place.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#D7E6EC] via-[#E7ECF2] to-[#CFDCE7] px-3 text-center dark:from-[#1B2B33] dark:via-[#161B22] dark:to-[#1E2733]">
              <MapPin
                className="h-6 w-6 text-[#1F5D6B] dark:text-[#6BC0D1]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="line-clamp-1 text-xs font-medium text-[#4B5563] dark:text-[#94A0B2]">
                {regionLabel}
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Place name and region */}
        <div className="flex flex-1 flex-col justify-center gap-0.5 px-3.5 py-3">
          <h3 className="font-display text-sm font-semibold leading-snug tracking-tight text-[#141A23] line-clamp-1 sm:text-[15px] dark:text-[#EEF2F6]">
            {place.name}
          </h3>
          <p className="truncate text-xs font-medium text-[#5B6472] dark:text-[#94A0B2]">
            {regionLabel}
          </p>
        </div>
      </button>
    </article>
  );
};
