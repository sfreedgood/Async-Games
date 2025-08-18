export const requiredCardFields = ['name', 'type', 'value'] as const;
export type RequiredCardFields = (typeof requiredCardFields)[number];
export type CardFields = Record<RequiredCardFields[number], any> & {
  [key: string]: any;
};

export class Card<T extends CardFields> {
  name: T['name'];
  type: T['type'];
  value: T['value'];

  constructor(name: T['name'], type: T['type'], value: T['value']) {
    this.name = name;
    this.type = type;
    this.value = value;
  }
}
