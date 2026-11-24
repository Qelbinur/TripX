import React from 'react';
import { Compass, MapPinPlus, SlidersHorizontal, User } from 'lucide-react';
import { AzerbaijanMapIcon } from './AzerbaijanMapIcon';

export type ActiveTab = 'map' | 'filter' | 'add-place' | 'account';

interface NavItem {
  id: 'explore' | 'filter' | 'add-place' | 'account';
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const LEFT_ITEMS: NavItem[] = [
  { id: 'explore', label: 'Kəşf et', icon: Compass },
  { id: 'filter', label: 'Filtr', icon: SlidersHorizontal },
];

const RIGHT_ITEMS: NavItem[] = [
  { id: 'add-place', label: 'Yer əlavə et', icon: MapPinPlus },
  { id: 'account', label: 'Hesabım', icon: User },
];

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const handleItemClick = (id: NavItem['id']) => {
    if (id === 'filter') {
      onSelectTab('filter');
    } else if (id === 'add-place') {
      onSelectTab('add-place');
    } else if (id === 'account') {
      onSelectTab('account');
    }
    // Kəşf et remains no-op for now
  };

  const renderSideItem = ({ id, label, icon: Icon }: NavItem) => {
    const isActive =
      (id === 'filter' && activeTab === 'filter') ||
      (id === 'add-place' && activeTab === 'add-place') ||
      (id === 'account' && activeTab === 'account');

    return (
      <button
        key={id}
        type="button"
        onClick={() => handleItemClick(id)}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex h-full min-h-[44px] flex-col items-center justify-end gap-1 pb-1.5 transition-colors duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#1F5D6B] cursor-pointer ${
          isActive
            ? 'text-[#1F5D6B] dark:text-[#6BC0D1]'
            : 'text-[#5B6472] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:text-[#EEF2F6]'
        }`}
      >
        <Icon
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth={isActive ? 2.2 : 1.75}
        />
        <span className="text-[10px] min-[390px]:text-[11px] font-medium leading-none tracking-[-0.02em] whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  };

  const isMapActive = activeTab === 'map';

  return (
    <nav
      aria-label="Əsas naviqasiya"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      {/* Solid fill beneath safe-area inset for notched mobile screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)] bg-white transition-colors duration-200 dark:bg-[#161B22]"
      />

      <div className="relative mx-auto w-full">
        {/* Seamless 3-part compact bar background with mathematically smooth SVG concave U-notch */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-stretch"
        >
          <div className="flex-1 border-t border-[#141A23]/[0.08] bg-white transition-colors duration-200 dark:border-[#EEF2F6]/[0.09] dark:bg-[#161B22]" />

          <svg
            viewBox="0 0 116 54"
            fill="none"
            preserveAspectRatio="none"
            className="-mx-px h-[54px] w-[116px] shrink-0"
          >
            <path
              d="M 0 0.5 L 9 0.5 C 20 0.5, 23 5, 27 14 C 33 28, 44 35, 58 35 C 72 35, 83 28, 89 14 C 93 5, 96 0.5, 107 0.5 L 116 0.5 L 116 54 L 0 54 Z"
              className="fill-white transition-colors duration-200 dark:fill-[#161B22]"
            />
            <path
              d="M 0 0.5 L 9 0.5 C 20 0.5, 23 5, 27 14 C 33 28, 44 35, 58 35 C 72 35, 83 28, 89 14 C 93 5, 96 0.5, 107 0.5 L 116 0.5"
              strokeWidth="1"
              className="stroke-[#141A23]/[0.08] transition-colors duration-200 dark:stroke-[#EEF2F6]/[0.09]"
            />
          </svg>

          <div className="flex-1 border-t border-[#141A23]/[0.08] bg-white transition-colors duration-200 dark:border-[#EEF2F6]/[0.09] dark:bg-[#161B22]" />
        </div>

        {/* Interactive 5-column navigation items */}
        <div className="relative z-10 mx-auto grid h-[54px] w-full max-w-lg grid-cols-5 items-end px-0.5 sm:px-3">
          {LEFT_ITEMS.map(renderSideItem)}

          {/* Raised center circular Xəritə (Azerbaijan map) button nestled inside the curved notch */}
          <div className="relative flex h-full flex-col items-center justify-end pb-1.5">
            <button
              type="button"
              onClick={() => onSelectTab('map')}
              aria-label="Xəritə"
              aria-current={isMapActive ? 'page' : undefined}
              className="group flex h-full w-full min-h-[44px] flex-col items-center justify-end focus-visible:outline-none cursor-pointer"
            >
              <span
                className={`absolute -top-[18px] z-20 flex h-[46px] w-[46px] items-center justify-center rounded-full transition-all duration-150 group-active:scale-[0.95] group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#1F5D6B] ${
                  isMapActive
                    ? 'bg-[#1F5D6B] text-[#F7F8FA] shadow-[0_6px_14px_rgba(31,93,107,0.26)] group-hover:bg-[#194D59] dark:border dark:border-[#5CB8C9]/30 dark:bg-[#2B7788] dark:text-[#F7F8FA] dark:shadow-[0_6px_16px_rgba(0,0,0,0.45)] dark:group-hover:bg-[#358A9D]'
                    : 'bg-[#2C4A54] text-[#F7F8FA]/90 shadow-[0_4px_12px_rgba(17,34,51,0.18)] group-hover:bg-[#1F5D6B] dark:border dark:border-[#EEF2F6]/15 dark:bg-[#1E2B33] dark:text-[#C5D0DC] dark:group-hover:bg-[#2B7788] dark:group-hover:text-white'
                }`}
              >
                <AzerbaijanMapIcon className="h-[23px] w-[27px] shrink-0" />
              </span>
              <span
                className={`text-[10px] min-[390px]:text-[11px] font-medium leading-none tracking-[-0.02em] whitespace-nowrap transition-colors duration-150 ${
                  isMapActive
                    ? 'text-[#1F5D6B] dark:text-[#6BC0D1]'
                    : 'text-[#5B6472] dark:text-[#94A0B2]'
                }`}
              >
                Xəritə
              </span>
            </button>
          </div>

          {RIGHT_ITEMS.map(renderSideItem)}
        </div>
      </div>
    </nav>
  );
};
