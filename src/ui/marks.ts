/**
 * marks.ts — the app's two inline marks, split from the DOM that renders them.
 *
 * ## Why this exists
 *
 * Two surfaces needed the same thing and only one had it. The ⓘ panel's patch
 * notes already turned `**lead**` into a real `<strong>`, built from text nodes
 * because `innerHTML` is banned in this app — and the walkthrough, which is the
 * first thing a new reader sees, rendered its copy as flat text.
 *
 * That mattered for a specific reason, reported from a device: **the walkthrough
 * names controls, and the names read as ordinary words.** "Not this moves past
 * it" and "Just one thing strips it back" are sentences about two buttons, and
 * nothing on screen said so. The rest of the app already had the answer — the
 * panel writes a control's name in `<em>` (*Not this*, *Just one thing*, *Do
 * now*) in its own markup — so the walkthrough was the one surface not following
 * the app's convention, on the screen where a reader knows least.
 *
 * ## Why the split is PARSE and then BUILD
 *
 * `segments()` touches no DOM, so the part that can actually be wrong — where a
 * span opens, where it closes, what happens to a marker with no partner — is a
 * pure function this repo can test in Node like everything else it trusts. The
 * builder underneath is three lines and is exercised by the walk in a real
 * browser.
 *
 * The alternative was a DOM in the unit tests, which means a new dependency, and
 * a dependency added to make a test convenient is a supply-chain decision
 * wearing a test's clothes (`pin-check.mjs` is right to refuse undeclared ones).
 *
 * ## What it does NOT do
 *
 * No nesting, and no second marker inside a marked span. A caller passes ONE
 * marker and ONE tag; `**bold**` and `*named*` are different calls, and a string
 * mixing them is not supported. That is a deliberate ceiling: this is two marks
 * for copy somebody wrote by hand, not a markdown engine, and the moment it
 * grows a parser it becomes a thing that can be wrong in ways nobody checks.
 *
 * An UNPAIRED marker renders as the text it is, rather than swallowing the rest
 * of the line. The panel's version learned that on a device: an earlier one
 * printed the asterisks — and the HTML entity names — literally on screen.
 */

/** One run of copy: plain text, or text that carried the mark. */
export interface Segment {
  text: string;
  /** True when this run sat between a matched pair of markers. */
  marked: boolean;
}

/**
 * Split `text` on `marker`. PURE — no DOM, no side effects.
 *
 * An even number of parts means an unpaired marker, and the whole line comes
 * back as one unmarked segment: better to show somebody the asterisk they typed
 * than to guess where they meant it to close.
 */
export function segments(text: string, marker: string): Segment[] {
  const parts = text.split(marker);
  if (parts.length % 2 === 0) return [{ text, marked: false }];
  return parts
    .map((part, i) => ({ text: part, marked: i % 2 === 1 }))
    .filter(s => s.text !== '');
}

/**
 * `segments()` rendered as nodes — every character arrives as a text node, and
 * a marked run becomes a real element. Nothing here parses HTML.
 */
export function marked(text: string, marker: string, tag: string, className?: string): Node[] {
  return segments(text, marker).map(s => {
    if (!s.marked) return document.createTextNode(s.text);
    const e = document.createElement(tag);
    e.textContent = s.text;
    if (className) e.className = className;
    return e;
  });
}

/**
 * The app's convention for naming a control inside a sentence: `*Not this*`
 * becomes a marked run, which is what the ⓘ panel has always written by hand.
 * Named rather than inlined at each call site, so the convention is one
 * decision rather than a habit two files happen to share.
 *
 * `.ui-name` AND NOT ITALIC ALONE — THE SAME DEFECT, REPORTED TWICE.
 *
 * The first report said the walkthrough named controls and the names read as
 * ordinary words: "Not this moves past it" is a sentence about a button and
 * nothing on screen said so. The fix set them in `<em>`, matching the panel.
 *
 * The second report, from a device, said the italics make it *harder*: a reader
 * meeting the app for the first time cannot tell which italicised words are
 * things on the screen and which are emphasis, and the copy refers to them as
 * though where they are is obvious. Italic means EMPHASIS. It has never meant
 * "this is a control", and using it for both is why one sentence could not be
 * read two ways.
 *
 * So the run carries a class and the stylesheet gives it an outline, upright,
 * slightly stronger than the prose around it — the shape of a thing on screen.
 * DELIBERATELY NOT the filled look of a real button: a name inside a sentence
 * that looks exactly like a button invites somebody to tap the sentence.
 *
 * The element stays `<em>` so nothing about the spoken output changes.
 */
export const namedControls = (text: string): Node[] => marked(text, '*', 'em', 'ui-name');
