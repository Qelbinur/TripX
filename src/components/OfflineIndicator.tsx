import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center justify-center gap-2.5 rounded-xl border border-[#141A23]/10 bg-white/95 px-4 py-3 text-xs font-medium text-[#141A23] shadow-sm backdrop-blur-md dark:border-[#EEF2F6]/10 dark:bg-[#161B22]/95 dark:text-[#EEF2F6]"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-[#B45309] dark:text-[#F59E0B]" aria-hidden="true" />
      <span>Oflayn rejim — keşlənmiş məlumat istifadə olunur</span>
    </div>
  );
};
