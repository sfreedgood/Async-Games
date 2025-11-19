import { CardEntity, CardFields } from './card';
import { PlayerEntity } from './player';

export interface HandEntity {
  player: PlayerEntity;
  cards: CardEntity<CardFields>[];
  playedCards?: CardEntity<CardFields>[];
}
