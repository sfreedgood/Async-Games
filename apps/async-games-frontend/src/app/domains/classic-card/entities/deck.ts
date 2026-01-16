import { DeckEntity } from '../../../shared/entities/deck';
import { ClassicCardEntity } from './card';

export type ClassicDeckEntity = DeckEntity<ClassicCardEntity>;

export const shuffleDeck = <T>(deckId: Pick<DeckEntity<T>, 'id'>) => {
  // TODO: Implement shuffle logic
  return deckId;
};
