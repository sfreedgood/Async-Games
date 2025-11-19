import { StandardPlayingCard } from './card';

export interface DeckEntity<T> {
  id: string;
  cards: T[];
}

export type StandardDeckEntity = DeckEntity<StandardPlayingCard>;
