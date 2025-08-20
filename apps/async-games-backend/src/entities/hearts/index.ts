import { Hand } from '../../abstract/hand';
import { Player, PlayerId } from '../../abstract/player';
import { GameTracker } from '../../abstract/tracker';
import { StandardDeck } from '../card';

export type Score = Map<PlayerId, { hands: number[]; total: number }>;

export class HeartsGame extends GameTracker {
  hands: Map<PlayerId, Hand>;
  score: Score;
  deck: StandardDeck;
  dealer: Player;
  tricksWonThisHand: string[];

  constructor(name: string, players: Player[], gameId?: string) {
    super(name, players, gameId);
    this.score = new Map();
    this.hands = new Map();
    this.deck = new StandardDeck();
    this.dealer = players[0];
    this.tricksWonThisHand = [];
  }

  async startGame() {
    await this.initializeGame();
    for (const player in this.players) {
      this.score.set(player, { hands: [], total: 0 });
    }
  }

  getStartingPlayer = () => {
    const startingCard = this.deck.cards.find((card) => {
      card.name === '2' && card.type === 'club';
    });

    const playerWithStartingCard = [...this.hands.values()].find((hand) => {
      startingCard && hand.hasCard(startingCard);
    })?.player;

    const isFirstTrickOfHand = !!this.tricksWonThisHand.length;
    const lastTrickWinner =
      this.tricksWonThisHand[this.tricksWonThisHand.length - 1];

    return isFirstTrickOfHand ? playerWithStartingCard : lastTrickWinner;
  };

  async dealCards() {
    for (const player of this.players) {
      const cards = this.deck.deal(13);
      this.hands.set(player.playerId, new Hand(player, cards));
    }
  }

  async nextHand() {
    const nextDealer = this.getNextPlayer(this.dealer);
    this.dealer = nextDealer;

    this.deck.shuffle();
    this.dealCards();
  }
}
