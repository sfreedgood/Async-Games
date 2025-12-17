import { useMemo, useState } from "react";
import { PlayerEntity, PlayerSettings } from "../../player";
import { PlayerBadge } from "../../player/components/PlayerBadge";

export interface PlayerZoneProps {
  player: PlayerEntity;
  settings?: PlayerSettings;
  isLocalPlayer?: boolean;
}

export const PlayerZone: React.FC<PlayerZoneProps> = ({
  player,
  settings,
  isLocalPlayer,
}) => {
  return (
    <div className={`flex flex-1 gap-3 rounded-lg bg-emerald-950/30 p-3`}>
      {isLocalPlayer ? (
        <PrimaryPlayerZone
          player={player}
          settings={settings}
          isLocalPlayer={isLocalPlayer}
        />
      ) : (
        <OtherTablePlayerZone
          player={player}
          settings={settings}
          isLocalPlayer={isLocalPlayer}
        />
      )}
    </div>
  );
};

const MODES = ['showBoth', 'showHand', 'showTable', 'showNone'] as const;
type ViewMode = (typeof MODES)[number];

function PrimaryPlayerZone({ player, settings }: PlayerZoneProps) {
  const playerSettings = settings ?? player.settings;

  const [viewMode, setViewMode] = useState<ViewMode>('showBoth');

  const nextMode = useMemo(() => {
    return MODES.indexOf(viewMode) === MODES.length - 1
      ? MODES[0]
      : MODES[MODES.indexOf(viewMode) + 1];
  }, [viewMode]);

  const prevMode = useMemo(() => {
    return MODES.indexOf(viewMode) === 0
      ? MODES[MODES.length - 1]
      : MODES[MODES.indexOf(viewMode) - 1];
  }, [viewMode]);

  const labelMap: Record<ViewMode, string> = {
    showHand: 'Hand',
    showTable: 'Table',
    showBoth: 'Both',
    showNone: 'None',
  };

  return (
    <div className="flex-1 h-full rounded-lg border border-emerald-500/30 bg-emerald-800/70 p-3 shadow-inner">
      <div className="h-full">
        <div
          data-testId="local-player-header"
          className="flex items-center justify-between"
        >
          <PlayerBadge
            name={player.name}
            settings={playerSettings}
            isLocalPlayer
          />
          <div className="flex items-center gap-2">
            <label htmlFor="view-mode-select">Table View</label>
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-800/50">
              <button
                type="button"
                onClick={() => setViewMode(prevMode)}
                className="flex items-center justify-center h-8 px-2 rounded-l-full border-r-0 text-emerald-100/80 hover:border-emerald-400 hover:text-emerald-50"
                aria-pressed={viewMode === prevMode}
                aria-label={`Previous view: ${labelMap[prevMode]}`}
                title={`Current: ${labelMap[viewMode]} — switch to ${labelMap[prevMode]}`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M12 16L6 10l6-6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <select
                id="view-mode-select"
                name="view-mode-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="h-8 px-3 text-xs bg-transparent border-none outline-none appearance-none text-emerald-100/80 hover:border-emerald-400 hover:text-emerald-50 hover:cursor-pointer"
                aria-label={`Select view: ${labelMap[viewMode]}`}
                title={`Current: ${labelMap[viewMode]}`}
              >
                {MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {labelMap[mode]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setViewMode(nextMode)}
                className="flex items-center justify-center h-8 px-2 rounded-r-full border-l-0 text-emerald-100/80 hover:border-emerald-400 hover:text-emerald-50"
                aria-pressed={viewMode === nextMode}
                aria-label={`Next view: ${labelMap[nextMode]}`}
                title={`Current: ${labelMap[viewMode]} — switch to ${labelMap[nextMode]}`}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M8 4l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          {(viewMode === 'showHand' || viewMode === 'showBoth') && (
            <div className="w-full mt-3 space-y-3 min-h-[120px] rounded-md border border-emerald-500/20 bg-emerald-950/70 p-3">
              Your Hand
            </div>
          )}
          {(viewMode === 'showTable' || viewMode === 'showBoth') && (
            <div className="w-full mt-3 space-y-3 min-h-[120px] rounded-md border border-emerald-500/20 bg-emerald-900/70 p-3">
              Table
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function OtherTablePlayerZone ({
  player,
  settings,
}: PlayerZoneProps) {
  const playerSettings = settings ?? player.settings;
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-800/70 p-3 shadow-inner">
      <div className="flex items-center justify-between">
        <PlayerBadge
          name={player.name}
          settings={playerSettings}
          isLocalPlayer={false}
        />
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="rounded-full border border-emerald-500/30 px-2 py-1 text-xs text-emerald-100/80 hover:border-emerald-400 hover:text-emerald-50"
        >
          {showTable ? 'Hide' : 'Show'}
        </button>
      </div>
      <div>
        {showTable && (
          <div className="mt-3 h-full min-h-[120px] rounded-md border border-emerald-500/20 bg-emerald-900/70" />
        )}
      </div>
    </div>
  );
};