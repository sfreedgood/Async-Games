import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PlayerEntity } from '../../entities/player';

export interface PlayerProps {
  player: PlayerEntity;
  position: number;
  totalPlayers: number;
}

export const PlayerAvatar: React.FC<PlayerProps> = ({
  player,
  position,
  totalPlayers,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [rotationOffset, setRotationOffset] = useState(0);

  useEffect(() => {
    if (playerRef.current) {
      const offset =
        (playerRef.current.clientWidth - playerRef.current.clientHeight) / 2;
      setRotationOffset(offset);
    }
  }, [
    position,
    totalPlayers,
    playerRef.current?.clientHeight,
    playerRef.current?.clientWidth,
  ]);

  const rotateWithOffsetStyle = useCallback(
    (clockwiseDegrees: number) => {
      const rotationStyle =
        clockwiseDegrees <= 180
          ? `rotate-${clockwiseDegrees} transform -translate-x-[${rotationOffset}px]`
          : `-rotate-${
              clockwiseDegrees - 180
            } transform translate-x-[${rotationOffset}px]`;
      return rotationStyle;
    },
    [rotationOffset]
  );

  const playerPosition = useMemo(() => {
    let positionStyle: string;
    switch (position) {
      case 0:
        if (totalPlayers <= 2) {
          positionStyle = 'col-start-1 col-span-6 row-span-2 row-start-5';
        } else if (totalPlayers === 3) {
          positionStyle = 'col-start-3 row-start-5 row-span-2 col-span-4';
        } else {
          positionStyle = 'col-start-3 row-start-5 row-span-2 col-span-3';
        }
        return `${positionStyle} flex w-full h-full justify-center items-end bg-blue-200`;
      case 1:
        if (totalPlayers <= 2) {
          positionStyle =
            'col-start-1 col-span-6 row-span-2 row-start-1 items-start';
        } else if (totalPlayers === 3) {
          positionStyle =
            'col-start-1 col-span-2 row-start-2 row-span-4 items-end';
        } else {
          positionStyle =
            'col-start-1 col-span-2 row-start-3 row-span-3 items-end';
        }
        return `${positionStyle} flex w-full h-full justify-center bg-yellow-300`;
      case 2:
        if (totalPlayers === 3) {
          positionStyle = 'col-start-3 col-span-4 row-start-1 row-span-2';
        } else {
          positionStyle = 'col-start-2 col-span-3 row-start-1 row-span-2'; // top center
        }
        return `${positionStyle}  flex w-full h-full justify-center items-start bg-red-300`;
      case 3:
        return `col-start-5 row-start-2 col-span-2 row-span-3 flex w-full h-full justify-center items-end bg-gray-300`; // right center
      default:
        throw Error('More than 4 players not supported');
    }
  }, [position, rotationOffset]);

  return (
    <div ref={playerRef} className={playerPosition}>
      <h2 className="h-12 flex w-12 text-nowrap justify-center items-center border border-blue-500 rounded-full">
        {player.name}
      </h2>
    </div>
  );
};
