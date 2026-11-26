/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Heart, Moon, Sun } from 'lucide-react';
import { AccountView, type LocalAccount } from './components/AccountView';
import { AddPlaceView } from './components/AddPlaceView';
import { AzerbaijanMap } from './components/AzerbaijanMap';
import { BottomNavBar, type ActiveTab } from './components/BottomNavBar';
import { ExploreView } from './components/ExploreView';
import { FavoritesView } from './components/FavoritesView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { TripXLogo } from './components/TripXLogo';
import { AZERBAIJAN_REGIONS } from './data/azerbaijanRegions';
import { SAMPLE_PLACES } from './data/samplePlaces';
import { useTheme } from './hooks/useTheme';
import { GOOGLE_MAPS_API_KEY } from './lib/googleMaps';
import {
  countActiveFilters,
  EMPTY_FILTER_STATE,
  type FilterState,
  type PlaceSubmission,
} from './types/filter';

function matchesFilterArray(placeValues: string[], filterValues: string[]): boolean {
  if (filterValues.length === 0) return true;
  return filterValues.some((val) => placeValues.includes(val));
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTER_STATE);
  const [places, setPlaces] = useState<PlaceSubmission[]>(SAMPLE_PLACES);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const highlightedMapIds = useMemo(() => {
    const regionMap = new Map(AZERBAIJAN_REGIONS.map((r) => [r.id, r.mapId]));
    const ids = new Set<string>();
    for (const regionId of filterState.regions) {
      const mapId = regionMap.get(regionId);
      if (mapId) ids.add(mapId);
    }
    return Array.from(ids);
  }, [filterState.regions]);

  const activeFilterCount = countActiveFilters(filterState);

  const filteredPlaces = useMemo(() => {
    if (activeFilterCount === 0) return places;
    return places.filter(
      (place) =>
        matchesFilterArray(place.filters.regions, filterState.regions) &&
        matchesFilterArray(place.filters.places, filterState.places) &&
        matchesFilterArray(place.filters.companions, filterState.companions) &&
        matchesFilterArray(place.filters.crowdSize, filterState.crowdSize) &&
        matchesFilterArray(place.filters.seasons, filterState.seasons)
    );
  }, [activeFilterCount, filterState, places]);

  const handleDistrictSelectFromMap = useCallback((districtId: string) => {
    setFilterState((prev) => ({
      ...prev,
      regions: prev.regions.includes(districtId)
        ? prev.regions
        : [...prev.regions, districtId],
    }));
    setActiveTab('explore');
  }, []);

  const handleAddPlace = useCallback((draft: PlaceSubmission) => {
    setPlaces((prev) => [draft, ...prev]);
  }, []);

  const handleToggleFavorite = useCallback((placeId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [placeId, ...prev]
    );
  }, []);

  const appShell = (
    <div className="flex min-h-dvh flex-col bg-[#E7ECF2] text-[#141A23] transition-colors duration-200 dark:bg-[#0E1116] dark:text-[#EEF2F6]">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Compact mobile-first sticky header (<15% viewport height combined with bottom bar) */}
      <header className="sticky top-0 z-30 border-b border-[#141A23]/[0.08] bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-[#EEF2F6]/[0.07] dark:bg-[#0E1116]/85">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className="inline-flex min-h-[44px] items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] cursor-pointer"
          >
            <TripXLogo className="h-7 w-7 shrink-0" />
            <span className="font-display text-lg font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
              TripX
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              aria-label="Sevimlilər"
              title="Sevimlilər"
              aria-current={activeTab === 'favorites' ? 'page' : undefined}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] cursor-pointer ${
                activeTab === 'favorites'
                  ? 'text-[#1F5D6B] bg-[#1F5D6B]/[0.08] dark:text-[#6BC0D1] dark:bg-[#4FA3B3]/[0.14]'
                  : 'text-[#5B6472] hover:bg-[#141A23]/[0.05] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#EEF2F6]/[0.07] dark:hover:text-[#EEF2F6]'
              }`}
            >
              <Heart
                className={`h-[19px] w-[19px] ${activeTab === 'favorites' ? 'fill-current' : ''}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'İşıqlı rejimə keç' : 'Qaranlıq rejimə keç'}
              title={theme === 'dark' ? 'İşıqlı rejim' : 'Qaranlıq rejim'}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors duration-150 hover:bg-[#141A23]/[0.05] hover:text-[#141A23] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:text-[#94A0B2] dark:hover:bg-[#EEF2F6]/[0.07] dark:hover:text-[#EEF2F6] cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="h-[19px] w-[19px]" aria-hidden="true" />
              ) : (
                <Moon className="h-[19px] w-[19px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main viewport switching cleanly between Explore, Favorites, Map, Add Place, and Account */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        {activeTab === 'explore' && (
          <ExploreView
            places={places}
            filterState={filterState}
            onChangeFilter={setFilterState}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesView
            places={places}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onExplore={() => setActiveTab('explore')}
          />
        )}
        {activeTab === 'map' && (
          <AzerbaijanMap
            highlightedRegionIds={highlightedMapIds}
            activeFilterCount={activeFilterCount}
            pinnedPlaces={filteredPlaces}
            onDistrictSelect={handleDistrictSelectFromMap}
          />
        )}
        {activeTab === 'add-place' && (
          <AddPlaceView
            onSubmitPlace={handleAddPlace}
            onViewMap={() => setActiveTab('map')}
          />
        )}
        {activeTab === 'account' && (
          <AccountView account={account} onChangeAccount={setAccount} />
        )}
      </main>

      <OfflineIndicator />
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return appShell;
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="az"
      region="AZ"
      libraries={['places', 'marker']}
    >
      {appShell}
    </APIProvider>
  );
}
