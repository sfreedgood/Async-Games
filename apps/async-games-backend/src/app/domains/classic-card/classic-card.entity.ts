import { Card } from '../../../abstract/card';
import { Deck } from '../../../abstract/deck';
import {
  type ClassicCardName,
  type ClassicCardOptions,
  type ClassicCardSuit,
  type ClassicCardValue,
  type ClassicCardProperties,
  joker,
  classicCardValues,
  classicCardSuits,
} from './classic-card.interface';

export function handleClassicCardOptions(
  name: ClassicCardName,
  options?: ClassicCardOptions
): ClassicCardValue {
  let value: ClassicCardValue;
  if (name === 'joker') {
    value = options?.valueOverride?.['joker'] || joker.joker;
  } else {
    value = options?.valueOverride?.[name] ?? classicCardValues[name];
  }
  return value;
}

export class ClassicPlayingCard extends Card<ClassicCardProperties> {
  suit: ClassicCardSuit;
  options?: ClassicCardOptions;

  constructor(
    name: ClassicCardName,
    suit: ClassicCardSuit,
    options?: ClassicCardOptions
  ) {
    const value = handleClassicCardOptions(name, options);
    super(name, value);
    this.suit = suit;
    this.options = options;
  }

  get color() {
    if (
      this.suit === classicCardSuits.spade ||
      this.suit === classicCardSuits.club
    ) {
      return 'black';
    }
    if (
      this.suit === classicCardSuits.heart ||
      this.suit === classicCardSuits.diamond
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
      this.value = 1 as ClassicCardValue;
    } else {
      this.value = this.options?.valueOverride?.A
        ? this.options?.valueOverride?.A
        : classicCardValues['A'];
    }
  }
}

export type ClassicDeckOptions = {
  aceLow?: boolean;
  jokers?: number;
};

function buildClassicDeck(
  deckOptions?: ClassicDeckOptions
): ClassicPlayingCard[] {
  function buildSuit(suit: ClassicCardSuit): ClassicPlayingCard[] {
    return Object.keys(classicCardValues).map((k) => {
      const cardName = k as ClassicCardName;
      return deckOptions?.aceLow === true && cardName === 'A'
        ? new ClassicPlayingCard(k as ClassicCardName, suit, {
            valueOverride: { A: 1 as ClassicCardValue },
          })
        : new ClassicPlayingCard(k as ClassicCardName, suit);
    });
  }

  const cards = Object.values(classicCardSuits).flatMap((suit) =>
    buildSuit(suit)
  );

  if (deckOptions?.jokers) {
    const jokerCount = deckOptions.jokers;
    for (let i = 0; i < jokerCount; i++) {
      cards.push(new ClassicPlayingCard('joker', 'joker'));
    }
  }

  return cards;
}

export class ClassicDeck extends Deck<ClassicPlayingCard> {
  constructor(deckOptions?: ClassicDeckOptions) {
    const cards = buildClassicDeck(deckOptions);
    super(cards);
  }
}
