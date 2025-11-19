export const requiredStandardCardFields = ['name', 'suit', 'value'] as const;
export type RequiredStandardCardFields =
  (typeof requiredStandardCardFields)[number];
export type StandardCardFields = Record<
  RequiredStandardCardFields[number],
  any
> & {
  [key: string]: any;
};

export class Card<T extends StandardCardFields> {
  name: T['name'];
  suit: T['suit'];
  value: T['value'];

  constructor(name: T['name'], suit: T['suit'], value: T['value']) {
    this.name = name;
    this.suit = suit;
    this.value = value;
  }
}
