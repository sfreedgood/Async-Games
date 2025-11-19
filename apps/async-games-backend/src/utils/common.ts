export type NumberInRange<Min extends number, Max extends number> = number & {
  __brand: `NumberInRange<${Min}, ${Max}>`;
};
export function numberInRange<Min extends number, Max extends number>(
  value: number,
  min: Min,
  max: Max
): NumberInRange<Min, Max> {
  if (value >= min && value <= max) {
    return value as NumberInRange<Min, Max>;
  }
  throw new Error(`Value ${value} is not in range [${min}, ${max}]`);
}
