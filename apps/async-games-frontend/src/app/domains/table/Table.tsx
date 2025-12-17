import React, { useMemo } from 'react';
import { PlayerEntity } from '../player';
import { PlayerZone } from './play-area';

export interface TableProps {
  players: PlayerEntity[];
  pieces?: React.ReactNode; // cards, board, etc.
}

type PlayerCount = number;

export const layoutByPlayerCount: Record<
  PlayerCount,
  Record<string, string>
> = {
  1: {
    player0: 'flex-row col-start-1 col-span-12 row-start-5 row-span-8',
    center: 'flex-col col-start-1 col-span-12 row-start-1 row-span-4',
  },
  2: {
    player0: 'flex-row col-start-1 col-span-12 row-start-7 row-span-6',
    player1: 'flex-row col-start-1 col-span-12 row-start-1 row-span-3',
    center: 'flex-col col-start-1 col-span-12 row-start-4 row-span-3',
  },
  3: {
    player0: 'flex-row col-start-1 col-span-12 row-start-7 row-span-6',
    player1: 'flex-col col-start-1 col-span-4 row-start-1 row-span-6',
    player2: 'flex-row col-start-9 col-span-4 row-start-1 row-span-6',
    center: 'flex-col col-start-5 col-span-4 row-start-1 row-span-6',
  },
  4: {
    player0: 'flex-row col-start-1 col-span-8 row-start-7 row-span-9',
    player1: 'flex-col col-start-1 col-span-4 row-start-1 row-span-6',
    player2: 'flex-row col-start-5 col-span-4 row-start-1 row-span-6',
    player3: 'flex-col col-start-9 col-span-4 row-start-1 row-span-6',
    center: 'flex-col col-start-9 col-span-4 row-start-7 row-span-9',
  },
};

export const Table: React.FC<TableProps> = ({
  players,
  pieces,
}: TableProps) => {
  const layouts = useMemo(() => {
    if (!layoutByPlayerCount[players.length]) {
      throw new Error('Only 1-4 player tables are supported.');
    }

    return layoutByPlayerCount[players.length];
  }, [players.length]);

  return (
    <div className="grid h-screen w-full grid-cols-12 grid-rows-12 gap-3 bg-emerald-900 p-4 text-emerald-50">
      <div className={layouts[`center`]}>
        <div className="flex h-full items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-950/70 px-3 py-2 shadow-inner">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100/80">
            Shared Table
          </p>
        </div>
      </div>

      {players.map((player, index) => (
        <div
          className={`flex ${
            layouts[`player${index}`]
          } h-full w-full gap-3 rounded-xl border border-emerald-500/30 bg-blue-900/70 p-4 text-emerald-50 shadow-lg backdrop-blur`}
        >
          <PlayerZone
            key={`${player.id}-${player.name}-${index}`}
            player={player}
            settings={player.settings}
            isLocalPlayer={index === 0}
          />
        </div>
      ))}
    </div>
  );
};
