export interface DeckEntity<T> {
  id: string;
  cards: T[];
  shuffle: () => T[];
  deal?: (count: number) => T[];
  draw?: (count: number) => T[] | T;
}
