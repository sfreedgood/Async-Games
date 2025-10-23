import React from 'react';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '../entities/player';

export interface TableProps {
  players: Player[];
  pieces?: any; // cards, board, etc.
}

export const Table: React.FC<TableProps> = ({
  players,
  pieces,
}: TableProps) => {
  return (
    <div
      className={`grid grid-cols-6 grid-rows-6 place-items-stretch place-content-stretch bg-green-300 h-screen w-full`}
    >
      {players.map((player, index) => (
        <PlayerAvatar
          key={`${player.name}-${index}`}
          player={player}
          position={index}
          totalPlayers={players.length}
        />
      ))}
      {/* Render pieces (cards, board, etc.) here */}
    </div>
  );
};
