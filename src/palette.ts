// WHICH COLOUR SET THIS APP WEARS (3.4.0, ADR-0110).
//
// The second axis. Mode (light / dark / follow the device) says how bright; a
// palette says which colours. Hub PALETTES.md §6 rules they are independent, and
// that if several palettes pass they SHIP AS OPTIONS rather than one being
// chosen for everybody — which also settles arguments that have no right answer,
// like warm against neutral, by shipping both.
//
// EVERY ONE OF THESE PASSES THE SAME FLOORS. `npm run palette:check` holds all
// five families, in both modes, against the pairs the UI actually renders — 13
// of them — and it takes a quarter of a second because it is arithmetic over a
// measured structure rather than a browser rendering every screen again.
//
// NAMED, NEVER A SWATCH ALONE. PALETTES.md again, and Doctrine §4 under it: a
// row of coloured squares is colour as the sole carrier of meaning.
//
// A DEVICE PREFERENCE, NEVER AN EVENT — the rule `SCALE_KEY` and the theme
// already follow. Which colours somebody likes is not a fact about their work.

export const PALETTE_KEY = 'ui.palette';

export const DEFAULT_PALETTE = 'quietkeep';

export const PALETTES: readonly { value: string; words: string; why: string }[] = [
  { value: 'quietkeep', words: 'Quietkeep', why: 'the original — warm paper by day, deep blue-grey by night' },
  { value: 'instrument', words: 'Instrument', why: 'exact-neutral night, warm day; the hub council’s recommended default' },
  { value: 'paper', words: 'Paper', why: 'cool night, warm paper day' },
  { value: 'mono', words: 'Mono', why: 'neutral in both modes, no hue at all' },
  { value: 'soft', words: 'Soft', why: 'lowest glare, contrast deliberately capped' },
];

export function normalisePalette(v: unknown): string {
  return typeof v === 'string' && PALETTES.some((p) => p.value === v) ? v : DEFAULT_PALETTE;
}

export const paletteWords = (v: string): string =>
  PALETTES.find((p) => p.value === v)?.words ?? DEFAULT_PALETTE;

export const paletteNote = (v: string): string => {
  const p = PALETTES.find((x) => x.value === v);
  return p ? `${p.words} — ${p.why}.` : '';
};

let palette: string = DEFAULT_PALETTE;
export const getPalette = (): string => palette;
export const setPalette = (v: unknown): void => { palette = normalisePalette(v); };

/**
 * Put the choice on the root.
 *
 * The default is ABSENT rather than named, matching how `data-theme` treats
 * "follow the device": the generated stylesheet declares the default family
 * unattributed, because it is what has to paint before the reader's own choice
 * can be read back out of IndexedDB. An attribute saying "the default" would be
 * one more state for every selector in that file to think about.
 */
export function applyPalette(v: string, doc: Document = document): void {
  const root = doc.documentElement;
  if (v === DEFAULT_PALETTE) delete root.dataset.palette;
  else root.dataset.palette = v;
}
