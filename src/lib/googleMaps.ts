export const GOOGLE_MAPS_API_KEY: string =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
  (typeof __GOOGLE_MAPS_API_KEY__ === 'string' ? __GOOGLE_MAPS_API_KEY__.trim() : '');
