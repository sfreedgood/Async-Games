import React, { useMemo } from 'react';
import { PlayerSettings } from '../entities/player';

export const PlayerBadge: React.FC<{
  name: string;
  settings?: PlayerSettings;
  isLocalPlayer?: boolean;
}> = ({ name, settings, isLocalPlayer }) => {
  const activeSettings = useMemo(() => {
    if (!isLocalPlayer || !settings) return [];
    return [
      settings.isDealer ? 'Dealer' : null,
      settings.showHints ? 'Hints' : null,
      settings.isMuted ? 'Muted' : null,
    ].filter(Boolean);
  }, [isLocalPlayer, settings]);

  return (
    <div className="flex h-full min-w-[180px] items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-950/70 px-3 py-2 shadow-inner">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700/60 text-emerald-100">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
        >
          <path
            d="M12 12c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4Z"
            className="fill-emerald-200/90"
          />
          <path
            d="M5 19.25c0-2.761 3.134-5 7-5s7 2.239 7 5V20H5v-.75Z"
            className="fill-emerald-200/70"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-emerald-50">{name}</span>
        {isLocalPlayer ? (
          <div className="flex flex-wrap gap-1 text-xs text-emerald-100/80">
            {activeSettings.length ? (
              activeSettings.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-emerald-700/60 px-2 py-0.5"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="text-emerald-100/60">Ready</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-emerald-100/70">Opponent</span>
        )}
      </div>
    </div>
  );
};
