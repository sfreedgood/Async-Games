import {
  ClassicCardEntity,
  ClassicCardFields,
} from '../../classic-card/entities/card';
import { PlayerEntity } from './player';

export interface HandEntity {
  player: PlayerEntity;
  cards: ClassicCardEntity<ClassicCardFields>[];
  playedCards?: ClassicCardEntity<ClassicCardFields>[];
}
