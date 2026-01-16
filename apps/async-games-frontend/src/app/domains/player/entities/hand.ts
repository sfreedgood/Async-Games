import { CardEntity } from '../../../shared/entities/card';
import {
  ClassicCardEntity,
  ClassicCardSuit,
} from '../../classic-card/entities';
import { classicCardSuits, Joker } from '../../classic-card/entities/card';
import { PlayerEntity } from './player';

export interface HandEntity<CardType> {
  player: PlayerEntity;
  cards: CardType[];
  playedCards?: CardType[];
}

export abstract class PlayerHand<T> implements HandEntity<T> {
  player: PlayerEntity;
  cards: T[];
  playedCards?: T[];

  constructor(player: PlayerEntity, cards: T[]) {
    this.player = player;
    this.cards = cards;
  }

  playCard(card: CardEntity): void {
    const index = this.cards.findIndex((c) => c === card);
    if (index === -1) return;
    const [played] = this.cards.splice(index, 1);
    if (!this.playedCards) {
      this.playedCards = [];
    }
    this.playedCards.push(played);
  }

  sortCards(cards: CardEntity[]) {
    return cards.sort((a, b) => a.value - b.value);
  }
}

export type SuitSortOrder = [
  ClassicCardSuit | Joker,
  ClassicCardSuit | Joker,
  ClassicCardSuit | Joker,
  ClassicCardSuit | Joker,
  Joker?
];

const defaultSuitSortOrder: SuitSortOrder = [
  classicCardSuits.club,
  classicCardSuits.diamond,
  classicCardSuits.spade,
  classicCardSuits.heart,
  'Joker' as Joker,
];
export class ClassicCardHand extends PlayerHand<ClassicCardEntity> {
  constructor(player: PlayerEntity, cards: ClassicCardEntity[]) {
    super(player, cards);
  }

  override sortCards(
    cards: ClassicCardEntity[],
    suitSortOrder = defaultSuitSortOrder
  ): ClassicCardEntity[] {
    const suits = [...Object.values(classicCardSuits), 'Joker' as Joker];
    const sortedBySuit = suits.reduce((acc, suit) => {
      acc[suit] = cards
        .filter((card) => card.suit === suit)
        .sort((a, b) => a.value - b.value);
      return acc;
    }, {} as Record<ClassicCardSuit | Joker, ClassicCardEntity[]>);

    // Flatten in suit order and skip undefined entries (e.g. Joker when not present).
    return [...suitSortOrder].flatMap((suit) =>
      suit ? sortedBySuit[suit] : []
    );
  }
}
