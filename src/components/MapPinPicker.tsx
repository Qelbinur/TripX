import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AdvancedMarker,
  Map as GoogleMap,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { LocateFixed, MapPin, Maximize2, Search, Trash2, X } from 'lucide-react';
import { AZERBAIJAN_REGIONS } from '../data/azerbaijanRegions';
import { GOOGLE_MAPS_API_KEY } from '../lib/googleMaps';
import type { MapPinPoint } from '../types/filter';

interface MapPinPickerProps {
  value: MapPinPoint | null;
  onChange: (pin: MapPinPoint | null) => void;
}

const DEFAULT_CENTER = { lat: 40.3777, lng: 49.892 };
const AZERBAIJAN_CENTER = { lat: 40.25, lng: 47.85 };

function projectLatLngToSvg(
  lat: number,
  lng: number
): { x: number; y: number } | null {
  if (lat < 38.3 || lat > 42.0 || lng < 44.65 || lng > 50.75) {
    return null;
  }
  const minLng = 44.75;
  const maxLng = 50.62;
  const minLat = 38.38;
  const maxLat = 41.92;
  const x = 15 + ((lng - minLng) / (maxLng - minLng)) * 895;
  const y = 12 + ((maxLat - lat) / (maxLat - minLat)) * 756;
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

function matchDistrictFromText(text?: string | null): {
  districtId: string | null;
  districtName: string | null;
} {
  if (!text) return { districtId: null, districtName: null };
  const normalized = text.toLocaleLowerCase('az');
  for (const region of AZERBAIJAN_REGIONS) {
    const regionLower = region.name.toLocaleLowerCase('az');
    if (normalized.includes(regionLower)) {
      return {
        districtId: region.id,
        districtName: region.name,
      };
    }
  }
  return { districtId: null, districtName: null };
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

interface InnerMapContentProps {
  draftPin: MapPinPoint | null;
  onSelectPin: (pin: MapPinPoint) => void;
  focusTarget: { center: google.maps.LatLngLiteral; zoom: number; nonce: number } | null;
}

const InnerMapContent: React.FC<InnerMapContentProps> = ({
  draftPin,
  onSelectPin,
  focusTarget,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !focusTarget) return;
    map.panTo(focusTarget.center);
    map.setZoom(focusTarget.zoom);
  }, [focusTarget, map]);

  const markerPosition =
    draftPin && typeof draftPin.lat === 'number' && typeof draftPin.lng === 'number'
      ? { lat: draftPin.lat, lng: draftPin.lng }
      : null;

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      defaultCenter={markerPosition ?? AZERBAIJAN_CENTER}
      defaultZoom={markerPosition ? 13 : 7}
      gestureHandling="greedy"
      streetViewControl={false}
      mapTypeControl={false}
      fullscreenControl={false}
      onClick={(e) => {
        const latLng = e.detail.latLng;
        if (!latLng) return;
        const projected = projectLatLngToSvg(latLng.lat, latLng.lng);
        onSelectPin({
          lat: Number(latLng.lat.toFixed(6)),
          lng: Number(latLng.lng.toFixed(6)),
          address: null,
          x: projected?.x ?? null,
          y: projected?.y ?? null,
          districtId: null,
          districtName: null,
        });
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {markerPosition && (
        <AdvancedMarker
          position={markerPosition}
          draggable
          onDragEnd={(e) => {
            const latLng = e.latLng;
            if (!latLng) return;
            const lat = latLng.lat();
            const lng = latLng.lng();
            const projected = projectLatLngToSvg(lat, lng);
            onSelectPin({
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
              address: null,
              x: projected?.x ?? null,
              y: projected?.y ?? null,
              districtId: null,
              districtName: null,
            });
          }}
        >
          <Pin background="#1F5D6B" borderColor="#15424D" glyphColor="#FFFFFF" />
        </AdvancedMarker>
      )}
    </GoogleMap>
  );
};

interface PlacesSearchBarProps {
  onPlacePicked: (pin: MapPinPoint, viewport?: google.maps.LatLngBounds | null) => void;
}

const PlacesSearchBar: React.FC<PlacesSearchBarProps> = ({ onPlacePicked }) => {
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!placesLib || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        setIsSearching(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['az'],
        });
        if (!cancelled) {
          setSuggestions(res.suggestions ?? []);
        }
      } catch (err) {
        const msg = String(err ?? '');
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [placesLib, query]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
        });
        const location = place.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          const addressText = place.formattedAddress || place.displayName || null;
          const districtMatch = matchDistrictFromText(
            `${place.displayName ?? ''} ${place.formattedAddress ?? ''}`
          );
          const projected = projectLatLngToSvg(lat, lng);

          onPlacePicked(
            {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
              address: addressText,
              x: projected?.x ?? null,
              y: projected?.y ?? null,
              districtId: districtMatch.districtId,
              districtName: districtMatch.districtName,
            },
            place.viewport ?? null
          );
        }
        setQuery('');
        setSuggestions([]);
        sessionTokenRef.current = null;
      } catch (err) {
        const msg = String(err ?? '');
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    },
    [onPlacePicked]
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#7A8494]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ünvan və ya məkan axtar..."
          aria-label="Google Xəritədə ünvan axtar"
          className="h-11 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] pr-10 pl-10 text-sm text-[#141A23] placeholder:text-[#8A94A3] focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            aria-label="Axtarışı təmizlə"
            className="absolute inset-y-0 right-0 flex min-w-[40px] items-center justify-center text-[#7A8494] hover:text-[#141A23] dark:hover:text-[#EEF2F6] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {(suggestions.length > 0 || isSearching) && (
        <div className="absolute inset-x-0 top-12 z-30 max-h-56 overflow-y-auto rounded-xl border border-[#141A23]/10 bg-white shadow-lg dark:border-[#EEF2F6]/12 dark:bg-[#161B22]">
          {isSearching && suggestions.length === 0 ? (
            <p className="px-3.5 py-3 text-xs text-[#6B7482] dark:text-[#8A95A5]">
              Axtarılır...
            </p>
          ) : (
            <ul className="divide-y divide-[#141A23]/[0.05] dark:divide-[#EEF2F6]/[0.06]">
              {suggestions.map((suggestion, idx) => (
                <li key={suggestion.placePrediction?.placeId ?? idx}>
                  <button
                    type="button"
                    onClick={() => void handleSelectSuggestion(suggestion)}
                    className="flex min-h-[44px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[#141A23] transition-colors hover:bg-[#F7F8FA] dark:text-[#EEF2F6] dark:hover:bg-[#1E252F] cursor-pointer"
                  >
                    <MapPin
                      className="h-4 w-4 shrink-0 text-[#1F5D6B] dark:text-[#6BC0D1]"
                      aria-hidden="true"
                    />
                    <span className="line-clamp-2">
                      {suggestion.placePrediction?.text.text}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export const MapPinPicker: React.FC<MapPinPickerProps> = ({ value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftPin, setDraftPin] = useState<MapPinPoint | null>(value);
  const [focusTarget, setFocusTarget] = useState<{
    center: google.maps.LatLngLiteral;
    zoom: number;
    nonce: number;
  } | null>(null);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    setDraftPin(value);
    setLocatingError(null);
    if (value && typeof value.lat === 'number' && typeof value.lng === 'number') {
      setFocusTarget({
        center: { lat: value.lat, lng: value.lng },
        zoom: 13,
        nonce: Date.now(),
      });
    } else {
      setFocusTarget(null);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, value]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocatingError('Cihazda konum dəstəyi yoxdur.');
      return;
    }
    setLocatingError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const projected = projectLatLngToSvg(lat, lng);
        setDraftPin({
          lat,
          lng,
          address: null,
          x: projected?.x ?? null,
          y: projected?.y ?? null,
          districtId: null,
          districtName: null,
        });
        setFocusTarget({
          center: { lat, lng },
          zoom: 15,
          nonce: Date.now(),
        });
      },
      () => {
        setLocatingError('Konum icazəsi verilmədi.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const hasValidCoords =
    value !== null && typeof value.lat === 'number' && typeof value.lng === 'number';

  const summaryLabel = hasValidCoords
    ? value.address || value.districtName || formatCoords(value.lat!, value.lng!)
    : null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
          Google Xəritədə konum
        </h2>
        {hasValidCoords && (
          <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
            {formatCoords(value.lat!, value.lng!)}
          </span>
        )}
      </div>

      {/* Preview button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#141A23]/10 bg-[#F7F8FA] text-left transition-colors duration-150 hover:border-[#1F5D6B]/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:hover:border-[#4FA3B3]/45 cursor-pointer"
      >
        {hasValidCoords && GOOGLE_MAPS_API_KEY ? (
          <div className="relative h-44 w-full pointer-events-none">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              center={{ lat: value.lat!, lng: value.lng! }}
              zoom={13}
              gestureHandling="none"
              disableDefaultUI
              style={{ width: '100%', height: '100%' }}
            >
              <AdvancedMarker position={{ lat: value.lat!, lng: value.lng! }}>
                <Pin background="#1F5D6B" borderColor="#15424D" glyphColor="#FFFFFF" />
              </AdvancedMarker>
            </GoogleMap>
          </div>
        ) : (
          <div className="flex h-36 w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1F5D6B] shadow-xs dark:bg-[#161B22] dark:text-[#6BC0D1]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-[#141A23] dark:text-[#EEF2F6]">
              Google Xəritədən konum seçin
            </span>
            <span className="text-xs text-[#6B7482] dark:text-[#8A95A5]">
              Axtarış edin və ya xəritədə nöqtəni işarələyin
            </span>
          </div>
        )}

        {summaryLabel && (
          <div className="flex items-center justify-between gap-3 border-t border-[#141A23]/[0.06] bg-white px-3.5 py-2.5 dark:border-[#EEF2F6]/[0.07] dark:bg-[#161B22]">
            <span className="truncate text-xs font-medium text-[#141A23] dark:text-[#EEF2F6]">
              {summaryLabel}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#1F5D6B] dark:text-[#6BC0D1]">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dəyiş</span>
            </span>
          </div>
        )}
      </button>

      {/* Centered Viewport Modal via Portal */}
      {isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-pin-picker-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1116]/60 p-3 backdrop-blur-xs sm:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#141A23]/8 bg-white shadow-xl sm:rounded-2xl dark:border-[#EEF2F6]/10 dark:bg-[#161B22]"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0">
                  <h2
                    id="map-pin-picker-title"
                    className="font-display text-base font-semibold text-[#141A23] dark:text-[#EEF2F6]"
                  >
                    Konum seçimi
                  </h2>
                  <p className="truncate text-xs text-[#5B6472] dark:text-[#94A0B2]">
                    {draftPin && typeof draftPin.lat === 'number' && typeof draftPin.lng === 'number'
                      ? draftPin.address ||
                        `${formatCoords(draftPin.lat, draftPin.lng)} · Dəyişmək üçün xəritəyə toxunun`
                      : 'Xəritəyə toxunaraq və ya axtarışla pin qoyun'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Bağla"
                  className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-[#F0F2F5] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Search & Geolocation bar */}
              {GOOGLE_MAPS_API_KEY && (
                <div className="flex items-center gap-2 px-5 pb-3">
                  <div className="flex-1">
                    <PlacesSearchBar
                      onPlacePicked={(pickedPin) => {
                        setDraftPin(pickedPin);
                        if (typeof pickedPin.lat === 'number' && typeof pickedPin.lng === 'number') {
                          setFocusTarget({
                            center: { lat: pickedPin.lat, lng: pickedPin.lng },
                            zoom: 14,
                            nonce: Date.now(),
                          });
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    title="Cari konumum"
                    aria-label="Cari konumum"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] text-[#1F5D6B] transition-colors hover:bg-white dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#6BC0D1] dark:hover:bg-[#1E252F] cursor-pointer"
                  >
                    <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {locatingError && (
                <p className="px-5 pb-2 text-xs text-[#B91C1C] dark:text-[#F87171]">
                  {locatingError}
                </p>
              )}

              {/* Map viewport with explicit height (CF2) */}
              <div className="relative h-[48dvh] min-h-[260px] w-full bg-[#E7ECF2] dark:bg-[#0E1116]">
                {GOOGLE_MAPS_API_KEY ? (
                  <InnerMapContent
                    draftPin={draftPin}
                    onSelectPin={setDraftPin}
                    focusTarget={focusTarget}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <MapPin
                      className="h-7 w-7 text-[#1F5D6B] dark:text-[#6BC0D1]"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-[#141A23] dark:text-[#EEF2F6]">
                      Google Maps açarı konfiqurasiya edilməyib.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const projected = projectLatLngToSvg(
                          DEFAULT_CENTER.lat,
                          DEFAULT_CENTER.lng
                        );
                        setDraftPin({
                          lat: DEFAULT_CENTER.lat,
                          lng: DEFAULT_CENTER.lng,
                          address: 'Bakı',
                          x: projected?.x ?? null,
                          y: projected?.y ?? null,
                          districtId: 'baku',
                          districtName: 'Bakı',
                        });
                      }}
                      className="mt-1 rounded-xl border border-[#141A23]/12 bg-white px-3.5 py-2 text-xs font-medium text-[#141A23] dark:border-[#EEF2F6]/12 dark:bg-[#161B22] dark:text-[#EEF2F6] cursor-pointer"
                    >
                      Mərkəz nöqtəsini seç
                    </button>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-2.5 border-t border-[#141A23]/[0.06] px-5 py-3.5 dark:border-[#EEF2F6]/[0.07]">
                <button
                  type="button"
                  onClick={() => setDraftPin(null)}
                  disabled={!draftPin}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#141A23]/12 px-4 text-sm font-medium text-[#5B6472] transition-colors hover:bg-[#F7F8FA] hover:text-[#141A23] disabled:opacity-40 dark:border-[#EEF2F6]/12 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer disabled:cursor-default"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Pini sil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(draftPin);
                    setIsModalOpen(false);
                  }}
                  className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#1F5D6B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
                >
                  {draftPin ? 'Təsdiqlə' : 'Hazır'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
