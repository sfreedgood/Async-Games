export const requiredCardFields = ['name', 'value'] as const;
export type RequiredCardFields = (typeof requiredCardFields)[number];
export type CardFields = Record<RequiredCardFields[number], any> & {
  [key: string]: any;
};

export class Card<T extends CardFields> {
  name: T['name'];
  value: T['value'];

  constructor(name: T['name'], value: T['value']) {
    this.name = name;
    this.value = value;
  }
}
