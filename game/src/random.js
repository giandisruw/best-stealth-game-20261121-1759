// A tiny seeded random-number generator (mulberry32) so a level layout and a
// screenshot staged from a seed always come out the same way.

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** An integer in [min, max] from a seeded generator. */
export function randomInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** One item picked from an array, from a seeded generator. */
export function randomPick(rng, items) {
  if (items.length === 0) throw new Error('randomPick: cannot pick from an empty array');
  return items[Math.floor(rng() * items.length)];
}
