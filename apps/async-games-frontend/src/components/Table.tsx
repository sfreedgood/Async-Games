import React from 'react';

export interface TableProps {
  players: string[];
  pieces: any; // cards, board, etc.
}

export const Table: React.FC<TableProps> = ({
  players,
  pieces,
}: TableProps) => {
  const playerCount = players.length;
  const isSquare = playerCount <= 4;

  const tableStyleRound = `flex justify-center items-center w-100 h-100 rounded-full border-2 border-black relative`;
  const tableStyleSquare = `flex justify-center items-center w-100 h-100 rounded-none`;

  const playerStyle = `absolute w-12 h-12 flex justify-center items-center 
    border border-blue-500 rounded-full`;

  const getPlayerPosition = (index: number) => {
    const angle = (index / playerCount) * 2 * Math.PI;
    const radius = isSquare ? 150 : 180; // Adjust radius for circle
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` };
  };

  return (
    <div className={isSquare ? tableStyleSquare : tableStyleRound}>
      {players.map((player, index) => (
        <div
          key={index}
          className={`${playerStyle} ${getPlayerPosition(index)}`}
        >
          {player}
        </div>
      ))}
      {/* Render pieces (cards, board, etc.) here */}
    </div>
  );
};
