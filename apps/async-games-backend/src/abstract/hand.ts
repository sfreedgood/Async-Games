import { Card, StandardCardFields } from './card';
import { Player } from './player';

export class Hand {
  player: Player;
  cards: Card<StandardCardFields>[];
  playedCards: Card<StandardCardFields>[] = [];
  constructor(player: Player, cards: Card<StandardCardFields>[]) {
    this.player = player;
    this.cards = cards;
  }

  playCard(card: Card<StandardCardFields>) {
    const playedCard = this.cards.splice(this.cards.indexOf(card), 1)[0];
    this.playedCards.push(playedCard);
  }

  hasCard(searchCard: Card<StandardCardFields>): boolean {
    return this.cards.includes(searchCard);
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
