/**
 * Deterministic, seedable pseudo-random number generator (mulberry32).
 *
 * Given the same seed it always yields the same sequence, which keeps game
 * dealing/shuffling reproducible for tests (CLAUDE.md requires deterministic
 * tests — no reliance on Math.random in game logic that is under test).
 */
export type RandomFn = () => number;

/**
 * Returns a function producing floats in [0, 1) for the given seed.
 * Based on the public-domain mulberry32 algorithm.
 */
export const createSeededRandom = (seed: number): RandomFn => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * In-place Fisher–Yates shuffle. Pass a seed for a reproducible order, or omit
 * it to fall back to Math.random for non-deterministic callers.
 */
export const shuffleInPlace = <T>(items: T[], seed?: number): T[] => {
  const random: RandomFn = seed === undefined ? Math.random : createSeededRandom(seed);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};
