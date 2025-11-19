import Icon from '../Icon';
import { StandardPlayingCard } from '../../entities/card';

export type CardProps = StandardPlayingCard;

export const Card = ({ name, suit, primaryValue }: CardProps) => {
  return (
    <div className="w-32 h-48 border border-gray-300 rounded-lg shadow-lg relative">
      <div className="absolute top-2 left-2 text-2xl font-bold">{name}</div>
      <div className="absolute bottom-2 right-2 text-2xl font-bold">{name}</div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">
        {name === 'Joker' ? (
          <Icon icon={'Joker'} />
        ) : (
          <Icon height={48} width={48} icon={suit} />
        )}
      </div>
    </div>
  );
};
