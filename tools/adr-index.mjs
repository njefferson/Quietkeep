#!/usr/bin/env node
// EVERY ADR IS IN THE INDEX, AND EVERY ROW POINTS AT A REAL RECORD.
//
// docs/adr/README.md went FIFTEEN records stale before anyone noticed — 0074 to
// 0088, every record written between 5 and 11 August 2026, including the one
// written by the session that found the gap.
//
// A missing row is invisible in a way a wrong row is not. The index reads as
// complete whatever is absent from it: there is no gap on the page, no dangling
// link, nothing that looks unfinished. It is the same shape the hub's CLAUDE.md
// records under *one file, two answers* — a document that is authoritative about
// a set, kept by hand, with nothing checking it against the set.
//
// It is also hub LESSONS §93 in its own small way: the rule "add the record to
// the index" was written down, agreed with by everybody, and did not happen
// fifteen times. A rule that lives only in prose is doing less than a comment.
//
// BOTH DIRECTIONS, because they fail differently:
//   - a record with no row is a decision nobody browsing will find
//   - a row with no record is a link that 404s, and it survives a file rename
//
//   node tools/adr-index.mjs        (exits non-zero on either)

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ADR = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'adr');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log('\nThe ADR index against the ADRs themselves\n');

const files = readdirSync(ADR)
  .filter((f) => /^\d{4}-.+\.md$/.test(f))
  .sort();

const index = readFileSync(join(ADR, 'README.md'), 'utf8');

// Rows look like:  - **[0083](0083-four-destinations.md)**
// The FILENAME is what is checked, not the number: a row can carry the right
// number and a filename that no longer exists, and that is the rename case.
const rows = [...index.matchAll(/^- \*\*\[(\d{4})\]\(([^)]+)\)\*\*/gm)]
  .map((m) => ({ number: m[1], file: m[2] }));

// --- every record has a row --------------------------------------------------
const indexed = new Set(rows.map((r) => r.file));
const missing = files.filter((f) => !indexed.has(f));
if (missing.length === 0) {
  ok(`all ${files.length} records are in the index`);
} else {
  fail(`${missing.length} record(s) in docs/adr/ with no row in README.md:`);
  for (const m of missing) console.log(`          ${m}`);
}

// --- every row has a record --------------------------------------------------
const present = new Set(files);
const dangling = rows.filter((r) => !present.has(r.file));
if (dangling.length === 0) {
  ok(`all ${rows.length} rows point at a record that exists`);
} else {
  fail(`${dangling.length} row(s) in README.md pointing at no file:`);
  for (const d of dangling) console.log(`          [${d.number}] -> ${d.file}`);
}

// --- and the number in the link agrees with the file it points at ------------
// Cheap, and it catches the copy-paste that gives two records the same row.
const mismatched = rows.filter((r) => present.has(r.file) && !r.file.startsWith(`${r.number}-`));
if (mismatched.length === 0) {
  ok('every row number matches the record it links to');
} else {
  fail(`${mismatched.length} row(s) whose number and filename disagree:`);
  for (const m of mismatched) console.log(`          [${m.number}] -> ${m.file}`);
}

const dupes = rows.map((r) => r.file).filter((f, i, a) => a.indexOf(f) !== i);
if (dupes.length === 0) ok('no record is listed twice');
else fail(`listed more than once: ${[...new Set(dupes)].join(', ')}`);

// --- AND EVERY OTHER LINK RESOLVES TOO (2.12.2) ------------------------------
//
// The three checks above read one link per row — the `- **[NNNN](file)**` that
// opens it. Every OTHER link to a record was unchecked: the `extends` /
// `narrows` / `supersedes` links in the Status line beneath each row, and the
// cross-references inside the records themselves. Those are the ones written
// from memory, and five of them were broken when this was added.
//
// The failure is invisible in the same way a missing row is: a link is a link
// on the page, and it reads as a live cross-reference right up until somebody
// presses it. Two were in the index's own Status lines and three inside
// records, all naming a plausible slug the file has never had —
// `0083-the-panel-stops-folding.md` for `0083-four-destinations.md`, which is
// what the record is ABOUT rather than what it is CALLED.
const linkers = [...files, 'README.md'];
const broken = [];
for (const from of linkers) {
  const text = readFileSync(join(ADR, from), 'utf8');
  for (const m of text.matchAll(/\]\((\d{4}-[a-z0-9-]+\.md)\)/g)) {
    if (!present.has(m[1])) broken.push({ from, to: m[1] });
  }
}
if (broken.length === 0) {
  ok(`every cross-reference between records resolves (${linkers.length} files read)`);
} else {
  fail(`${broken.length} link(s) to a record that does not exist:`);
  for (const b of broken) console.log(`          ${b.from} -> ${b.to}`);
}

if (failed > 0) {
  console.error(`\n${failed} problem(s) with the index.\n`);
  console.error('An ADR that is not in the index is a decision nobody browsing');
  console.error('will find, and the index looks complete either way. Add the row');
  console.error('in the same commit as the record.\n');
  process.exit(1);
}
console.log('\nThe index and the records agree.\n');
