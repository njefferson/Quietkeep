// WHICH THEME THIS APP USES (3.1.0).
//
// Both themes have existed since the beginning and are measured in both by the
// accessibility walk — contrast, focus rings, targets, every state. What has
// never existed is a way to CHOOSE. Which one you got was decided by the device
// and the app had no opinion and no control, which is fine until the device is
// set to switch at sunset and this app is the one you are reading at sunset.
//
// ## Three answers, and "whatever the device says" is one of them
//
// Not a toggle. A toggle has two positions and the honest set is three: light,
// dark, and *follow the thing you already told your device*. Shipping only two
// would take away the behaviour every reader has today and call it a feature.
// It is the default, and it is named in words rather than implied by an
// unset switch.
//
// ## A device preference, never an event
//
// Which theme somebody wants is not a fact about their work, and the log has no
// business holding a history of it — the same rule `SCALE_KEY`, the lens root
// and where-you-are already follow. It lives in the kv store, cached at module
// level so renders stay synchronous, and a value that cannot be read is simply
// "follow the device" rather than a reason to fail to start.
//
// ## The CSS keeps the media query, deliberately
//
// The stylesheet still answers `prefers-color-scheme`, and the choice overrides
// it by an attribute on the root. It would be tidier to decide entirely here and
// stamp the attribute on boot — one rule, no media query — except that this app
// ships `script-src 'self'` with no inline script, so nothing of ours can run
// before the first paint. A reader who has chosen light on a dark device would
// see a dark flash on every open. The media query is what prevents that.

export const THEME_KEY = 'ui.theme';

export type Theme = 'device' | 'light' | 'dark';

/** What the control offers. Words, and the default said out loud. */
export const THEME_CHOICES: readonly { value: Theme; words: string }[] = [
  { value: 'device', words: 'whatever your device is set to' },
  { value: 'light', words: 'light' },
  { value: 'dark', words: 'dark' },
];

export function normaliseTheme(v: unknown): Theme {
  return v === 'light' || v === 'dark' ? v : 'device';
}

export const themeWords = (v: Theme): string =>
  THEME_CHOICES.find((c) => c.value === v)?.words ?? 'whatever your device is set to';

export const themeNote = (v: Theme): string => (v === 'device'
  ? 'Following your device. If it changes at sunset, so does this.'
  : `Always ${v}, on this device, whatever your device is set to.`);

let theme: Theme = 'device';
export const getTheme = (): Theme => theme;
export const setTheme = (v: unknown): void => { theme = normaliseTheme(v); };

/**
 * Put the choice on the root, and tell the browser's own chrome about it.
 *
 * `data-theme` is absent for "device" rather than set to it, so the stylesheet's
 * `:not([data-theme="light"])` reads naturally and the media query is left to
 * answer on its own — an attribute saying "no opinion" is one more state for
 * every selector in the file to think about.
 *
 * THE `theme-color` META TOO. Two of them ship, one per `prefers-color-scheme`,
 * and they are what colours the status bar around an installed app. Left alone,
 * a reader who chose light on a dark device gets a light app in a dark frame —
 * the seam this control exists to remove, one band further out.
 */
export function applyTheme(v: Theme, doc: Document = document): void {
  const root = doc.documentElement;
  if (v === 'device') delete root.dataset.theme;
  else root.dataset.theme = v;

  const metas = Array.from(doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
  for (const m of metas) {
    const forDark = (m.getAttribute('media') ?? '').includes('dark');
    // Restore both to their own media when following the device; otherwise the
    // one that matches the choice answers unconditionally and the other cannot.
    if (v === 'device') {
      m.media = forDark ? '(prefers-color-scheme: dark)' : '(prefers-color-scheme: light)';
    } else {
      m.media = (v === 'dark') === forDark ? 'all' : 'not all';
    }
  }
}
