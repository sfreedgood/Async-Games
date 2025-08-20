import { Score } from '.';
import { Hand } from '../../abstract/hand';
import { Player, PlayerId } from '../../abstract/player';
import { Turn } from '../../abstract/turn';
import { CardSuit, StandardPlayingCard } from '../card';
import { NumberInRange, numberInRange } from '../common';

export type TrickNumber = NumberInRange<0, 13>;
export type TrickId = `hand${number}-trick${NumberInRange<1, 13>}`;
export type WonCards = Map<PlayerId, Record<TrickId, StandardPlayingCard[]>>;

export class Trick extends Turn {
  hands: Map<PlayerId, Hand>;
  playedCards: Map<string, StandardPlayingCard>;
  wonCards: Map<string, StandardPlayingCard[]> = new Map();
  trickNumber: NumberInRange<1, 13> = numberInRange(1, 1, 13);
  gameScore: Score;
  trump?: CardSuit;
  highestTrump?: StandardPlayingCard;

  constructor(
    name: string,
    hands: Map<PlayerId, Hand>,
    startingPlayer: Player,
    allPlayers: Player[],
    gameScore: Score,
    gameId?: string
  ) {
    super(name, startingPlayer, allPlayers, gameId);
    this.hands = hands;
    this.playedCards = new Map();
    this.gameScore = gameScore;
  }

  static valueAsTrickNumber(trickNumber: TrickNumber) {
    return numberInRange(trickNumber, 0, 13);
  }

  playCard(player: string, card: StandardPlayingCard) {
    const currentPlayerIndex = this.playProgression.indexOf(player);

    this.playedCards.set(player, card);

    if (currentPlayerIndex === 0) this.trump = card.type;
    if (currentPlayerIndex === this.playProgression.length - 1) {
      this.endTrick();
    } else {
      this.playCard(this.playProgression[currentPlayerIndex + 1], card);
    }
  }

  getWinningCard() {
    const startingPlayer = this.playProgression[0];
    this.highestTrump = this.playedCards.get(startingPlayer);

    if (this.highestTrump === undefined) return;

    for (const card of this.playedCards.values()) {
      if (card.type === this.trump && card.value > this.highestTrump?.value) {
        this.highestTrump = card;
      }
    }

    return this.highestTrump;
  }

  calculatePoints() {
    let points = 0;

    for (const card of this.playedCards.values()) {
      if (card.type === 'spade' && card.name === 'Q') points = points + 13;
      if (card.type === 'heart') points++;
    }

    const winningCard = this.getWinningCard();
    const winningPlayer = [...this.playedCards.entries()]
      .filter((cardMapping) => cardMapping[1] === winningCard)
      .flatMap((cardEntry) => cardEntry[0])[0];

    this.wonCards.set(winningPlayer, [...this.playedCards.values()]);

    const playerScore = this.gameScore.get(winningPlayer);
    const prevScore = playerScore?.total || 0;
    const prevHands = playerScore?.hands || [];

    this.gameScore = this.gameScore.set(winningPlayer, {
      hands: [...prevHands, points],
      total: prevScore + points,
    });
  }

  endTrick() {
    this.getWinningCard();
    this.calculatePoints();
  }
}
