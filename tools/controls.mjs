#!/usr/bin/env node
// WHERE THE CONTROLS ARE IS A COMPATIBILITY SURFACE — V2 stage 7.
//
// The shape is fixed forever and the contents change every time. That is not a
// style preference: it is the only stable resolution of the sameness/novelty
// deadlock this audience lives in, and it is what errorless learning and the
// familiarity evidence require. A person's hands learn where Done is. Moving it
// costs them that, silently, on a day they had no warning about.
//
// So a core control's POSITION and LABEL are treated exactly like a data-model
// change: rare, deliberate, and declared out loud. This gate is what makes
// "treated exactly like" mean something rather than being a paragraph in a
// design document.
//
// ## What it does
//
// It reads `public/index.html`, works out each core control's label and where it
// sits — which region, and how many focusable controls precede it there — and
// compares that against the manifest checked in beside it. Any difference FAILS
// until two things happen:
//
//   1. the manifest is updated to the new truth, and
//   2. the running release's notes carry a MOVE line, stated first and in
//      place-language: "the ⓘ is now top-right; it was bottom-left."
//
// The second is the part that matters. Updating a manifest is bookkeeping;
// telling the person whose hands have to relearn it is the obligation. A gate
// that only checked the manifest would make the declaration optional, which is
// the same as not having it.
//
// ## What "position" means here
//
// The containing region and the ordinal among focusable controls in it — coarse
// on purpose. Pixel positions change with every wrap and every font; what a
// person's hands learn is "the second button under the thing I am doing". A
// finer measure would cry wolf on every layout tweak and be ignored, which is
// worse than no measure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public/index.html'), 'utf8');
const manifestPath = join(root, 'docs/control-surface.json');

/**
 * The controls a person's hands learn. Deliberately SHORT: everything cannot be
 * a compatibility surface, or nothing is. These are the ones used without
 * looking — the way in, the two acts on the offered thing, the way to the held
 * list, and the way to what the app is.
 */
const CORE = [
  'capture', 'open-about', 'nextup-done', 'nextup-skip', 'menu-open',
];

/**
 * Controls whose LABEL is filled at runtime, so the markup has none to read.
 *
 * `#menu-open` is the gauge: its words are a live count, so "the label changed"
 * is its ordinary state and cannot be a promise. Its POSITION still is one, and
 * that is what is held for it. Recorded here rather than left as an empty
 * string, because `""` in the manifest would look like a label and would never
 * detect a change from nothing to something.
 */
const LABEL_AT_RUNTIME = new Set(['menu-open']);

const FOCUSABLE = /<(?:button|input|select|textarea|a\s)[^>]*>/g;

/** Which region encloses this id, and how many focusable things precede it. */
function locate(id) {
  const at = html.search(new RegExp(`id="${id}"`));
  if (at < 0) return null;
  const before = html.slice(0, at);

  // The nearest enclosing landmark still open at this point, walking outward to
  // the first one WITH AN ID. A REAL STACK, pushed and popped in document order.
  //
  // Two bugs lived here and both produced a confident wrong answer rather than
  // an error, which is why they are written down:
  //
  //   - The id was captured inside the tag pattern, where a lazy group before an
  //     optional `id="..."` swallows it. Every control then reported the same
  //     region — a measure collapsed to one value, which is not a loose gate but
  //     no gate.
  //   - The open landmarks were taken as `opens.slice(closes)`, which drops the
  //     FIRST n opened. Nesting closes the LAST opened first, so that is exactly
  //     backwards: it reported `#menu-open` as living inside `#upkeep`, a section
  //     that had closed six lines earlier.
  const stack = [];
  for (const m of before.matchAll(/<(\/?)(?:section|header|footer|dialog|main|nav)\b[^>]*>/g)) {
    if (m[1] === '/') stack.pop();
    else stack.push(m[0]);
  }
  let frame = null;
  let frameId = null;
  for (let i = stack.length - 1; i >= 0; i--) {
    const withId = stack[i].match(/\sid="([^"]+)"/);
    if (withId) { frame = stack[i]; frameId = withId[1]; break; }
  }
  const region = frameId ?? 'document';

  // Ordinal among focusable controls since that region opened.
  const regionAt = frame ? before.lastIndexOf(frame) : 0;
  const between = before.slice(regionAt);
  const ordinal = (between.match(FOCUSABLE) ?? []).length;

  // The label a person reads. `aria-label` when there is one, else the element's
  // own text, else the <label for=> that names it.
  const tagAt = html.lastIndexOf('<', at);
  const tagEnd = html.indexOf('>', at);
  const tag = html.slice(tagAt, tagEnd + 1);
  const aria = tag.match(/aria-label="([^"]*)"/);
  let label = aria ? aria[1] : '';
  if (!label) {
    const closeAt = html.indexOf('</', tagEnd);
    const text = html.slice(tagEnd + 1, closeAt < 0 ? tagEnd + 1 : closeAt);
    label = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
  if (!label) {
    const forLabel = html.match(new RegExp(`<label[^>]*for="${id}"[^>]*>([^<]*)</label>`));
    label = forLabel ? forLabel[1].replace(/\s+/g, ' ').trim() : '';
  }
  return { region, ordinal, label };
}

const now = {};
for (const id of CORE) {
  const found = locate(id);
  if (!found) {
    console.log(`\n  FAIL  a core control has gone: #${id} is not in the markup at all\n`);
    process.exit(1);
  }
  if (LABEL_AT_RUNTIME.has(id)) found.label = null;
  else if (!found.label) {
    // A core control with no readable label in the markup is either mis-located
    // by this gate or genuinely unlabelled, and either way the baseline would be
    // worthless: `""` compares equal to `""` for ever.
    console.log(`\n  FAIL  #${id} has no readable label — either it needs one, or it belongs in LABEL_AT_RUNTIME\n`);
    process.exit(1);
  }
  now[id] = found;
}

let was = null;
try { was = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { /* first run */ }

console.log('\nWhere the controls are (V2 stage 7)\n');

if (!was) {
  console.log(`  FAIL  no manifest at docs/control-surface.json — write this and commit it:\n`);
  console.log(JSON.stringify(now, null, 2));
  process.exit(1);
}

const moved = [];
for (const id of CORE) {
  const a = was[id];
  const b = now[id];
  if (!a) { moved.push(`#${id} is new to the core set`); continue; }
  if (a.region !== b.region || a.ordinal !== b.ordinal) {
    moved.push(`#${id} is now ${b.region} position ${b.ordinal}; it was ${a.region} position ${a.ordinal}`);
  }
  if (!LABEL_AT_RUNTIME.has(id) && a.label !== b.label) {
    moved.push(`#${id} is now labelled "${b.label}"; it was "${a.label}"`);
  }
}

if (!moved.length) {
  console.log(`  ok    all ${CORE.length} core controls are where the manifest says, with the labels it records`);
  console.log('\nThe shape is where it was. Nobody has to relearn anything.\n');
  process.exit(0);
}

// Something moved. The manifest is only half of it — the person whose hands
// have to relearn the shape has to be TOLD, in the running release's notes.
//
// THE FIRST VERSION OF THIS CHECK PASSED AN UNDECLARED MOVE. It asked whether
// "is now … it was" appeared anywhere in the head release's notes, and some
// unrelated sentence satisfied it, so the gate reported a relabelled control as
// properly declared. A gate that fails OPEN is worse than none: it converts an
// unchecked thing into a checked-looking one.
//
// So the declaration must name the CONTROL. For each thing that moved, one note
// has to carry both halves of the place-language AND the control's own label,
// which is the only string a reader would recognise it by.
const changelog = readFileSync(join(root, 'src/ui/changelog.ts'), 'utf8');
const notesAt = changelog.indexOf('notes: [');
const head = notesAt < 0 ? '' : changelog.slice(notesAt, changelog.indexOf('\n    ],', notesAt));

/** What a reader calls this control. Runtime-labelled ones get a written name,
 *  because "" would match every note and declare everything. */
const READER_NAME = {
  capture: 'capture', 'open-about': 'ⓘ', 'nextup-done': 'Done',
  'nextup-skip': 'Not this', 'menu-open': 'Menu',
};

const undeclared = [];
for (const m of moved) {
  const id = m.match(/^#([\w-]+)/)?.[1] ?? '';
  const names = [READER_NAME[id], was[id]?.label, now[id]?.label].filter(Boolean);
  const said = head.split(/',\s*\n/).some(note =>
    /\bis now\b/.test(note) && /\bit was\b/.test(note)
    && names.some(n => note.includes(n)));
  if (!said) undeclared.push({ id, names });
}

for (const m of moved) console.log(`  ..    ${m}`);

if (!undeclared.length) {
  console.log('\n  ok    and the running release declares each move in place-language, by name');
  console.log('\nMoved, and said so. Update docs/control-surface.json to the new truth:\n');
} else {
  for (const u of undeclared) {
    console.log(`\n  FAIL  #${u.id} moved and the running release does not declare it BY NAME`);
    console.log(`        One note must carry "is now", "it was", and one of: ${u.names.join(', ')}`);
  }
  console.log('\n        The note leads with WHERE, in place-language, not with why:');
  console.log('        "**Not this is now the first button; it was the second.**"');
  console.log('\n        Updating the manifest alone is bookkeeping. Telling the person');
  console.log('        whose hands have to relearn it is the obligation.\n');
}
console.log(JSON.stringify(now, null, 2));
process.exit(undeclared.length ? 1 : 0);
