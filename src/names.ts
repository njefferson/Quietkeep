// ONE TYPED ENTRY, SEVERAL LABELS (3.8.0).
//
// The detail sheet's place field has carried the placeholder `at home, out, on
// the phone` since 2.2.0 and took the whole string as ONE label. So a reader
// who followed the app's own example got a single place named after the
// example, sitting in the chooser and in every suggestion list, and the way to
// take it out lived in a different room behind a control that only appears once
// you have chosen that label as where you are.
//
// Both halves of that are fixed in 3.8.0. This is the half that stops it
// happening again: the app keeps the promise its placeholder makes.
//
// ## Why splitting rather than a smaller placeholder
//
// The other consistent resolution was to make the example singular and leave
// the behaviour alone. It was refused because the reader was not confused — he
// wanted three places and typed three places, and typing three places one at a
// time is three round trips through a field, a button and a repaint. Entering
// several at once is what somebody labelling their work actually does, and the
// app already looked like it supported it.
//
// ## Why it lives here and not in `contexts.ts`
//
// Roles do this too, and `roles.ts` importing from `contexts.ts` would say
// something untrue about which of the two axes owns the other. They are the
// same shape pointed in different directions and neither is the parent.

/**
 * "home, office, text" is THREE labels.
 *
 * Empty pieces dropped, so a trailing comma and a double comma are both
 * harmless. Duplicates collapsed CASE-INSENSITIVELY, which is the rule the
 * single-name match already used against the store: "Home, home" is one place,
 * and letting it through would mint two nodes with one name inside a single
 * keystroke — the split creating exactly the mess the match exists to prevent.
 *
 * Order is preserved, so what comes back reads in the order it was typed and
 * the sentence the app says afterwards is the reader's own list back.
 */
export function splitNames(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(',')) {
    const name = piece.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * "at home", then "at home and out", then "at home, out and on the phone".
 *
 * For saying back what just landed. The app confirms an act in the reader's own
 * words wherever it can, and "Can be done at home, out and on the phone." is
 * the difference between believing three places were made and counting them.
 */
export const andWords = (xs: readonly string[]): string =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
