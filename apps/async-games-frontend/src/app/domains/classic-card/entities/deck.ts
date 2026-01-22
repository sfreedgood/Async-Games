import axios from 'axios';
import { buildUrl } from '../../../../api';
import { DeckEntity } from '../../../shared/entities/deck';
import { ClassicCardEntity } from './card';

export type ClassicDeckEntity = DeckEntity<ClassicCardEntity>;

type ShuffleDeckResponse<T> = Pick<DeckEntity<T>, 'id' | 'cards'> | T[];

export const shuffleDeck = async <T>(
  deckId: Pick<DeckEntity<T>, 'id'>
): Promise<T[]> => {
  const url = buildUrl('/cards/deck/shuffle');
  const { data } = await axios.post<ShuffleDeckResponse<T>>(url, deckId);

  if (Array.isArray(data)) {
    return data;
  }

  return data.cards;
};
