import { Card, CardFields } from './card';
import { Player } from './player';

export class Hand {
  player: Player;
  cards: Card<CardFields>[];
  playedCards: Card<CardFields>[] = [];
  constructor(player: Player, cards: Card<CardFields>[]) {
    this.player = player;
    this.cards = cards;
  }

  playCard(card: Card<CardFields>) {
    const playedCard = this.cards.splice(this.cards.indexOf(card), 1)[0];
    this.playedCards.push(playedCard);
  }

  hasCard(searchCard: Card<CardFields>): boolean {
    return this.cards.includes(searchCard);
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
