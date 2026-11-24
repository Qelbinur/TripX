import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Search, X } from 'lucide-react';
import { AZERBAIJAN_REGIONS } from '../data/azerbaijanRegions';

interface RegionPickerModalProps {
  isOpen: boolean;
  selectedIds: string[];
  onToggle: (regionId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const RegionPickerModal: React.FC<RegionPickerModalProps> = ({
  isOpen,
  selectedIds,
  onToggle,
  onClear,
  onClose,
}) => {
  const [regionQuery, setRegionQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setRegionQuery('');
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const filteredRegions = useMemo(() => {
    const q = regionQuery.trim().toLocaleLowerCase('az');
    if (!q) return AZERBAIJAN_REGIONS;
    return AZERBAIJAN_REGIONS.filter((r) => r.name.toLocaleLowerCase('az').includes(q));
  }, [regionQuery]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="region-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1116]/45 p-3 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[82dvh] w-full max-w-md flex-col rounded-3xl border border-[#141A23]/8 bg-white shadow-xl sm:rounded-2xl dark:border-[#EEF2F6]/10 dark:bg-[#161B22]"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2
              id="region-picker-title"
              className="font-display text-base font-semibold text-[#141A23] dark:text-[#EEF2F6]"
            >
              Bölgə seçimi
            </h2>
            <p className="text-xs text-[#5B6472] dark:text-[#94A0B2]">
              Əlifba sırası · bir neçəsini seçə bilərsiniz
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bağla"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-[#F0F2F5] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#7A8494]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={regionQuery}
              onChange={(e) => setRegionQuery(e.target.value)}
              placeholder="Rayon və ya şəhər axtar..."
              aria-label="Rayon və ya şəhər axtar"
              className="h-11 w-full rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] pr-10 pl-10 text-sm text-[#141A23] placeholder:text-[#8A94A3] focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3]"
            />
            {regionQuery && (
              <button
                type="button"
                onClick={() => setRegionQuery('')}
                aria-label="Axtarışı təmizlə"
                className="absolute inset-y-0 right-0 flex min-w-[40px] items-center justify-center text-[#7A8494] hover:text-[#141A23] dark:hover:text-[#EEF2F6] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border-y border-[#141A23]/[0.06] px-2 py-1 dark:border-[#EEF2F6]/[0.07]">
          {filteredRegions.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6B7482] dark:text-[#8A95A5]">
              Uyğun bölgə tapılmadı.
            </p>
          ) : (
            <ul className="divide-y divide-[#141A23]/[0.04] dark:divide-[#EEF2F6]/[0.05]">
              {filteredRegions.map((region) => {
                const isSelected = selectedIds.includes(region.id);
                return (
                  <li key={region.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => onToggle(region.id)}
                      className="flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left transition-colors duration-100 hover:bg-[#F7F8FA] dark:hover:bg-[#1E252F] cursor-pointer"
                    >
                      <span
                        className={`text-sm ${
                          isSelected
                            ? 'font-semibold text-[#1F5D6B] dark:text-[#6BC0D1]'
                            : 'font-normal text-[#141A23] dark:text-[#EEF2F6]'
                        }`}
                      >
                        {region.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'border-[#1F5D6B] bg-[#1F5D6B] text-white dark:border-[#3A8A9C] dark:bg-[#2B7788]'
                            : 'border-[#141A23]/20 bg-transparent dark:border-[#EEF2F6]/20'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2.5 px-5 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClear}
            disabled={selectedIds.length === 0}
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#141A23]/12 px-4 text-sm font-medium text-[#5B6472] transition-colors hover:bg-[#F7F8FA] hover:text-[#141A23] disabled:opacity-40 dark:border-[#EEF2F6]/12 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer disabled:cursor-default"
          >
            Təmizlə
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#1F5D6B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            {selectedIds.length > 0 ? `Hazır (${selectedIds.length})` : 'Hazır'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
