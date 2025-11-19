import { DeckEntity } from '../../generic/entities/deck';
import { ClassicPlayingCard } from './card';

export type ClassicDeckEntity = DeckEntity<ClassicPlayingCard>;

export const shuffleDeck = <T>(deckId: Pick<DeckEntity<T>, 'id'>) => {
  // TODO: Implement shuffle logic
  return deckId;
};
