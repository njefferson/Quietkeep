#!/usr/bin/env node
// A CONTROL THAT NARROWS A SURFACE RENDERS ABOVE IT. — 2026-08-22
//
// `#situation-open` shipped in 2.21.0 inside `<section id="held">`. Where you
// are and how long you have are inputs to the OFFER — `app.ts` hands both to
// `setWhereNow`/`setHowLong` and `#nextup` reads them — so the door that sets
// them was rendering 2129px below its own output on a phone (3.84 screens) and
// 1983px below it on an iPad, measured on the sample store. The two standing
// lines that say the list has been narrowed were down there with it.
//
// The release that moved the two `<select>`s OUT of the pile put their door
// back into it, because that is where the selects had been.
//
// It survived twenty-five static gates and eight browser walks. Every one of
// them asks whether a thing exists, is named, is reachable, contrasts, has a
// target, or says the right words. NONE of them asks where it renders. This is
// the same shape as ADR-0099 (the proof line measured 2.73 screens below the
// list it was reassuring somebody about) and LESSONS 95 (a skip link
// unreachable by finger for 142 releases, every conformance gate green).
//
// ## The rule
//
// An element that narrows a surface must come BEFORE that surface in the
// document. Declared in the markup, one attribute, the way
// `data-touch-partner` declares a finger's route in tools/touch-check.mjs:
//
//   data-narrows="#nextup,#held"
//
// Static and source-only: document order is a fact about the file, so this
// needs no browser and runs in milliseconds. Being INSIDE the narrowed surface
// fails by the same comparison an element below it fails — the door's offset is
// greater than `#held`'s opening tag's — so containment needs no HTML parser.
//
// BOTH DIRECTIONS, the discipline quote-check.mjs uses: REQUIRED below names
// the elements that must carry the attribute, so a later edit cannot silently
// un-cover the rule by deleting it.
//
//   node tools/narrows-check.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'public', 'index.html');

/** Every element that must declare what it narrows, and why it is on this list.
 *  An id here with no `data-narrows` is a FAILURE, never a skip. */
const REQUIRED = {
  '#situation-open': 'the door to where you are and how long you have — both are inputs to the offer',
  '#where-note': 'the only line saying the offer and the pile have been narrowed by place',
  '#how-long-note': 'the only line saying they have been narrowed by time',
  '#with-note': 'and by who is with you — the third axis, added 2.26.0',
  '#lens-row': 'the lens chooser — it narrows the held cards',
  '#lens-note': 'the line stating law 1 while the lens is on',
};

// COMMENTS ARE NOT MARKUP, and this file is mostly comments. The first run of
// this gate reported the door as still inside `#held` — because the comment
// explaining the move quotes `<section id="held">`, and an offset search does
// not know prose from a tag. Blanked to spaces rather than deleted, so every
// offset below is still an offset into the real file and a line number stays a
// line number. (The same shape as the sentinel region that swallowed fourteen
// lines of privacy-patterns.mjs: a gate's own explanation is inside its input.)
const html = readFileSync(FILE, 'utf8')
  .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

/** Where an id's element STARTS in the file. Matching `id="x"` and walking back
 *  to the `<` of its own tag gives the opening tag's offset, which is what
 *  containment turns on: a child's offset is always greater than its parent's. */
const startOf = (id) => {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) return -1;
  return html.lastIndexOf('<', at);
};

/** The whole opening tag for an id, so attributes can be read off it. */
const tagOf = (id) => {
  const start = startOf(id);
  if (start < 0) return null;
  const end = html.indexOf('>', start);
  return end < 0 ? null : html.slice(start, end + 1);
};

console.log('\nEverything that narrows a surface renders above it\n');

// --- Direction one: every declaration points upward. ----------------------
const declared = new Set();
for (const m of html.matchAll(/<[^>]*\sdata-narrows="([^"]+)"[^>]*>/g)) {
  const tag = m[0];
  const idm = /\sid="([^"]+)"/.exec(tag);
  if (!idm) { fail(`a data-narrows declaration is on an element with no id: ${tag.slice(0, 60)}`); continue; }
  const id = idm[1];
  declared.add(`#${id}`);
  const mine = startOf(id);
  for (const raw of m[1].split(',')) {
    const sel = raw.trim();
    if (!sel.startsWith('#')) { fail(`#${id} narrows "${sel}" — only #id selectors are supported`); continue; }
    const theirs = startOf(sel.slice(1));
    if (theirs < 0) { fail(`#${id} narrows ${sel}, which does not exist in index.html`); continue; }
    if (mine < theirs) {
      ok(`#${id} comes before ${sel}, which it narrows`);
    } else {
      const inside = html.slice(theirs, mine).lastIndexOf(`</${/^<(\w+)/.exec(tagOf(sel.slice(1)))?.[1]}>`) < 0;
      fail(`#${id} narrows ${sel} and renders ${inside ? 'INSIDE' : 'BELOW'} it — a filter you meet after the thing it filtered is a filter nobody finds`);
    }
  }
}

// --- Direction two: nothing on the list quietly stops declaring. ----------
for (const [sel, why] of Object.entries(REQUIRED)) {
  if (declared.has(sel)) continue;
  if (startOf(sel.slice(1)) < 0) fail(`${sel} is required to declare data-narrows and is not in index.html at all`);
  else fail(`${sel} carries no data-narrows — ${why}`);
}

console.log(`\n${failed === 0 ? 'Every filter stands in front of what it filters.' : `${failed} placement failure${failed === 1 ? '' : 's'}.`}\n`);
process.exit(failed === 0 ? 0 : 1);
