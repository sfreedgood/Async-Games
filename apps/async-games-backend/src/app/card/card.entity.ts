import { Card } from '../../abstract/card';
import { Deck } from '../../abstract/deck';
import {
  type CardName,
  type CardOptions,
  type CardSuit,
  type CardValue,
  type StandardPlayingCardProperties,
  type StandardCardName,
  joker,
  standardValues,
  standardSuits,
} from './card.interface';

function handleCardOptions(name: CardName, options?: CardOptions): CardValue {
  let value: CardValue;
  if (name === 'joker') {
    value = options?.valueOverrides?.['joker'] || joker.joker;
  } else {
    value =
      options?.aceLow === true && name === 'A'
        ? (1 as CardValue)
        : standardValues[name];
    value = options?.valueOverrides?.[name] ?? value;
  }
  return value;
}

export class StandardPlayingCard extends Card<StandardPlayingCardProperties> {
  options?: CardOptions;

  constructor(name: CardName, suit: CardSuit, options?: CardOptions) {
    const value = handleCardOptions(name, options);
    super(name, suit, value);
    this.value = value;
    this.suit = suit;
    this.name = name;
    this.options = options;
  }

  get color() {
    if (this.suit === standardSuits.spade || this.suit === standardSuits.club) {
      return 'black';
    }
    if (
      this.suit === standardSuits.heart ||
      this.suit === standardSuits.diamond
    ) {
      return 'red';
    }
    return null;
  }

  makeAceLow(value: boolean) {
    if (this.name !== 'A') {
      console.error('method not applicable to selected card, ignoring'); // placeholder for validations and error handling
      return;
    }
    if (this.name === 'A' && value) {
      this.value = 1 as CardValue;
    } else {
      this.value = this.options?.valueOverrides?.A
        ? this.options?.valueOverrides?.A
        : standardValues['A'];
    }
  }

  isTrumpSuit(suit: CardSuit) {
    return this.suit === suit ? true : false;
  }
}

export type StandardDeckOptions = {
  aceLow?: boolean;
  jokers?: number;
};

function buildStandardDeck(
  deckOptions?: StandardDeckOptions
): StandardPlayingCard[] {
  function buildSuit(suit: CardSuit): StandardPlayingCard[] {
    return Object.keys(standardValues).map(
      (k) =>
        new StandardPlayingCard(k as StandardCardName, suit, {
          aceLow: deckOptions?.aceLow,
        })
    );
  }

  const cards = Object.values(standardSuits).flatMap((suit) => buildSuit(suit));

  if (deckOptions?.jokers) {
    const jokerCount = deckOptions.jokers;
    for (let i = 0; i < jokerCount; i++) {
      cards.push(new StandardPlayingCard('joker', 'joker'));
    }
  }

  return cards;
}

export class StandardDeck extends Deck<StandardPlayingCard> {
  constructor(deckOptions?: StandardDeckOptions) {
    const cards = buildStandardDeck(deckOptions);
    super(cards);
  }
}
