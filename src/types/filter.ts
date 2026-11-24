export const PLACE_OPTIONS = [
  'Təbiət',
  'Yemək',
  'Qonaqlama',
  'Macəra',
  'Gizli yerlər',
] as const;

export const COMPANION_OPTIONS = [
  'Tək',
  'Dostlarla',
  'Ailə ilə',
  'Sevgili ilə',
] as const;

export const CROWD_OPTIONS = ['Az', 'Çox'] as const;

export const SEASON_OPTIONS = ['Qış', 'Yaz', 'Yay', 'Payız'] as const;

export interface FilterState {
  regions: string[];
  places: string[];
  companions: string[];
  crowdSize: string[];
  seasons: string[];
}

export const EMPTY_FILTER_STATE: FilterState = {
  regions: [],
  places: [],
  companions: [],
  crowdSize: [],
  seasons: [],
};

export interface MapPinPoint {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  x?: number | null;
  y?: number | null;
  districtId: string | null;
  districtName: string | null;
}

export interface PlaceSubmission {
  id: string;
  name: string;
  mainImage: string | null;
  extraImages: string[];
  pin: MapPinPoint | null;
  filters: FilterState;
  createdAt: number;
}

export function countActiveFilters(state: FilterState): number {
  return (
    state.regions.length +
    state.places.length +
    state.companions.length +
    state.crowdSize.length +
    state.seasons.length
  );
}

export function countDetailedFilters(state: FilterState): number {
  return state.companions.length + state.crowdSize.length + state.seasons.length;
}
