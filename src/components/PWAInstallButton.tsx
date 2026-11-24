import React, { useEffect, useState } from 'react';
import { Download, PlusSquare, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowIOSGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIOSGuide]);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1F5D6B] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#194D59] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:bg-[#3A8A9C] dark:hover:bg-[#4FA3B3] dark:text-[#0B1114] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Yüklə</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#141A23]/10 bg-white px-3.5 py-2 text-sm font-medium text-[#141A23] transition-colors duration-150 hover:bg-[#F0F2F5] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:border-[#EEF2F6]/10 dark:bg-[#161B22] dark:text-[#EEF2F6] dark:hover:bg-[#1E252F] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4 shrink-0 text-[#1F5D6B] dark:text-[#4FA3B3]" aria-hidden="true" />
          <span>Yüklə</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#0E1116]/45 backdrop-blur-xs sm:items-center sm:p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-t-3xl bg-white px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-6 dark:bg-[#161B22] border border-[#141A23]/8 dark:border-[#EEF2F6]/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                aria-hidden="true"
                className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#141A23]/15 sm:hidden dark:bg-[#EEF2F6]/20"
              />
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="ios-install-title"
                  className="font-display text-base font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]"
                >
                  TripX tətbiqini quraşdırın
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Bağla"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors duration-150 hover:bg-[#F0F2F5] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <ol className="mt-4 space-y-3.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A3B0C2]">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2F5] text-[#1F5D6B] dark:bg-[#1E252F] dark:text-[#4FA3B3]">
                    <Share className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    Safari panelində <strong className="font-medium text-[#141A23] dark:text-[#EEF2F6]">Paylaş</strong> düyməsinə toxunun.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2F5] text-[#1F5D6B] dark:bg-[#1E252F] dark:text-[#4FA3B3]">
                    <PlusSquare className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    Aşağı sürüşdürüb <strong className="font-medium text-[#141A23] dark:text-[#EEF2F6]">Əsas Ekrana Əlavə Et</strong> seçimini edin.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#3A8A9C] dark:hover:bg-[#4FA3B3] dark:text-[#0B1114] cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
