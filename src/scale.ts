// THE APP'S OWN TEXT SIZE (2.8.0, ADR-0098).
//
// Asked for from a device: a way to scale this app **independently of the
// phone's own setting**. That is a different request from browser zoom, and the
// difference is the whole point — somebody may want their messages large and
// their planner dense, or the reverse, and until now the only lever moved
// everything at once.
//
// ## It scales the type and never the touch floor
//
// This is the constraint that had to be fixed BEFORE the control could exist.
// `--target` was `2.75rem` — 44px at the default root size, expressed in rem so
// it would grow with the reader's text setting. The growing half is right. The
// shrinking half was never considered and is not symmetric: **bigger text means
// bigger targets, and smaller text does not mean smaller fingers.**
//
// Measured at 390px before the fix, with the root at 87.5% — an ordinary browser
// setting, and exactly what this control produces: **24 visible controls fell
// below 44px**, including every control in the header, the capture box and the
// skip link. At 75% they were 33-34px. `--target` is `max(2.75rem, 44px)` now,
// which grows and cannot go under, and that is what makes this safe to build.
//
// ## A device preference, never an event
//
// How big somebody wants the type is not a fact about their work, and the log
// has no business holding a history of it — the same rule the lens root and
// where-you-are follow. It lives in the kv store, cached at module level so
// renders stay synchronous, and a value that cannot be read is simply "the
// usual" rather than a reason to fail to start.
//
// ## Bounded on purpose
//
// 0.85 to 1.5. Below 0.85 the app stops being a thing anybody can read on a
// phone and the floor starts doing all the work, which would make every control
// the same height as its own text — visually broken rather than dense. Above
// 1.5, `320px @ 200%` is already the gate's stress case and this multiplies with
// it; a reader who needs more than 1.5 is served better by the browser's own
// zoom, which scales layout too.

/** The kv key. Same shape as `LENS_KEY` and `WHERE_KEY`. */
export const SCALE_KEY = 'ui.scale';

/** What the control offers, smallest first. Words, never percentages — a number
 *  invites getting it "right", and there is no right answer to how big text
 *  should be for somebody else. */
export const SCALE_CHOICES: readonly { value: number; words: string }[] = [
  { value: 0.85, words: 'smaller' },
  { value: 0.925, words: 'a little smaller' },
  { value: 1, words: 'the usual' },
  { value: 1.15, words: 'a little bigger' },
  { value: 1.3, words: 'bigger' },
  { value: 1.5, words: 'biggest' },
];

export const SCALE_MIN = 0.85;
export const SCALE_MAX = 1.5;

/**
 * Clamp anything into the permitted band, and fall back to 1 for nonsense.
 *
 * A stored value from a future version with a wider band must not take the app
 * to an unreadable size on an older build — the same additive-migration
 * instinct the snapshot defaults follow.
 */
export function normaliseScale(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, n));
}

/** The words for a value, for the note under the control. */
export const scaleWords = (v: number): string =>
  SCALE_CHOICES.find(c => c.value === v)?.words
    ?? (v > 1 ? 'bigger' : v < 1 ? 'smaller' : 'the usual');

/**
 * What the note says once it is set.
 *
 * It states the SCOPE, because the whole request was about scope: this app, this
 * device, and nothing else. And it says the data is untouched, because a control
 * that changes how everything looks is exactly when somebody wonders whether it
 * changed anything else.
 */
export const scaleNote = (v: number): string =>
  `Text in this app is now ${scaleWords(v)}. Only here, only on this device — `
  + 'nothing you have written down has changed.';

/** The live value, cached at module level like the badge's and the lens root's,
 *  so no paint waits on a store read. */
let scale = 1;
export const getScale = (): number => scale;
export const setScale = (v: number): void => { scale = normaliseScale(v); };

/**
 * Put it on the document.
 *
 * `font-size` on the ROOT, as a percentage of the reader's own base — so this
 * multiplies whatever their browser or OS is already doing rather than
 * overriding it. Somebody with large system text who picks "a little smaller"
 * gets their large text, a little smaller; they do not get thrown back to 16px.
 * Overriding would be this app deciding it knows better than their device
 * setting, which is the opposite of what was asked for.
 */
export function applyScale(v: number, doc: Document = document): void {
  const n = normaliseScale(v);
  doc.documentElement.style.fontSize = n === 1 ? '' : `${(n * 100).toFixed(2)}%`;
}
