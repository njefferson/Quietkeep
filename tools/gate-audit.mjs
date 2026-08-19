#!/usr/bin/env node
// WHICH OF THESE GATES HAS ANYBODY WATCHED FAIL?
//
// A gate that has never been seen red is a hypothesis. This repo found five in
// one day: a gate that was not in CI, a walk re-enacting a state by hand, the
// most consequential safeguard in the app audited in the one state where it
// guards nothing, a renderer producing a state no person can reach, and a
// pre-commit hook that regenerated ten files on every commit and refused
// nothing — that last one documented in its own header, named by the script
// that called it, described in a release note, and absent from the code.
//
// Hub LESSONS §104 calls that shape the family's most expensive: a mechanism
// whose ABSENCE looks identical to its presence from every angle except the one
// nobody checked. This is the check.
//
// For each gate: plant the defect it exists to catch, run the exact command CI
// runs, and require a non-zero exit. Then restore, and require green again —
// because a "gate" that fails on everything is equally useless and would sail
// through the first half of this.
//
//   node tools/gate-audit.mjs            (all of them)
//   node tools/gate-audit.mjs plain      (one, by name fragment)
//
// A GATE WITH NO PLANT IS REPORTED, NOT SKIPPED. Skipping is how a partial
// audit comes to look like a complete one, which is the defect this file is
// about, one level up.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))[0] ?? null;

/**
 * One entry per gate script in package.json.
 *
 * `plant` mutates the tree so the gate SHOULD fail and returns a restore
 * function. `slow` marks the ones that drive a browser; they are audited too,
 * because "it takes a minute" is not a reason to leave the app's most expensive
 * checks unverified — it is a reason nobody has.
 */
/**
 * A PLANT THAT DID NOT APPLY IS NOT A GATE THAT DID NOT FIRE.
 *
 * `String.replace` returns the original string when its pattern is not found —
 * silently — so a plant written against a line that has since been reworded
 * mutates nothing, the gate correctly stays green, and this audit reports the
 * gate as broken. The first run did exactly that and blamed seven gates, most
 * of them innocent.
 *
 * That is the defect this whole file exists to hunt, reproduced inside the
 * hunter within an hour of writing it — which is worth saying out loud rather
 * than quietly fixing, because it is the second time today (`tools/look.mjs`
 * rendered a state no person can reach) that the instrument had the fault it
 * was built to find.
 */
const edit = (rel, fn) => {
  const path = join(root, rel);
  if (!existsSync(path)) throw new Error(`plant targets ${rel}, which does not exist`);
  const before = readFileSync(path, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`plant made no change to ${rel} — the pattern it edits is gone`);
  writeFileSync(path, after);
  return () => writeFileSync(path, before);
};

const GATES = [
  {
    name: 'brand:check',
    catches: 'the brand words and colours drifting from what is declared',
    // A DECLARED COLOUR PAIR, which is what `:check` actually measures — it
    // reports `warm/surface`, `line/bg` and so on, computed from the tokens.
    // Two earlier plants edited the wordmark and then the icon file; rendering
    // the assets is `npm run brand`, and `:check` reads the palette, so both
    // were aimed at a gate that was doing exactly its job.
    plant: () => edit('public/app.css', (s) =>
      s.replace(/--line:\s*#[0-9A-Fa-f]{6}/, '--line: #F3F0E8')),
  },
  {
    name: 'changelog:check',
    catches: 'CHANGELOG.md disagreeing with the app\'s own release notes',
    plant: () => edit('CHANGELOG.md', (s) => s.replace('## 2.12.0', '## 2.12.0 (edited by hand)')),
  },
  {
    name: 'tour:check',
    catches: 'the walkthrough\'s photographs being of a previous version',
    plant: () => edit('public/app.css', (s) => `${s}\n/* plant */\n.gate-audit-plant { color: red; }\n`),
  },
  {
    name: 'headers:check',
    catches: 'a security header going missing from the deploy config',
    plant: () => edit('public/_headers', (s) => s.replace(/^\s*Content-Security-Policy.*$/m, '')),
  },
  {
    name: 'editions:check',
    catches: 'the two editions\' generated files falling out of step',
    // A sync marker inside the DEFAULT bundle, which is the exact claim this
    // gate exists to hold: the sync module is absent from the default build,
    // verified by reading the built artefact rather than the entry point.
    plant: () => edit('public/app.js', (s) => `${s}\nconst plant = 'beginPairing';\n`),
  },
  {
    name: 'workflows:check',
    catches: 'a workflow file that does not parse or has no trigger',
    plant: () => edit('.github/workflows/spine.yml', (s) => `${s}\n  : [unbalanced\n`),
  },
  {
    name: 'vocabulary',
    catches: 'the banned words reaching src/ — "overdue" and "streak" (ADR-0010)',
    plant: () => edit('src/held.ts', (s) => `${s}\n// the overdue pile\n`),
  },
  {
    name: 'storage:check',
    catches: 'localStorage or sessionStorage appearing anywhere it is banned',
    plant: () => edit('src/held.ts', (s) => `${s}\nconst x = localStorage.getItem('a');\n`),
  },
  {
    name: 'thesis:check',
    catches: 'the published thesis page drifting from its source',
    plant: () => edit('public/why.html', (s) => s.replace('<h1', '<h1 data-plant="1"')),
  },
  {
    name: 'events:check',
    catches: 'an event kind in the code that the vocabulary does not name',
    plant: () => edit('docs/event-vocabulary.md', (s) => s.replace('capture.recorded', 'capture.recordedX')),
  },
  {
    name: 'writegate:check',
    catches: 'a write path that does not go through the admitting boundary',
    // A raw write from a module that has no business doing one — which is the
    // invariant in one line: nothing outside the gate touches the store's write
    // API, because `admit()` is what refuses a write that would leave a node
    // with no surface, no clock and no clocked parent.
    plant: () => edit('src/held.ts', (s) => `${s}\nexport const plant = (store) => store.append([]);\n`),
  },
  {
    name: 'emitters:check',
    catches: 'an event emitted from somewhere that is not allowed to emit it',
    // A noun that nothing writes and nothing reads — the exact shape that let
    // `export.written` be recorded and read by nothing for a whole phase while
    // the types compiled and every other gate stayed green.
    // REMOVE A REAL KIND'S ENTRY. This gate tracks only nouns that exist in the
    // code, so an INVENTED entry is correctly none of its business — two plants
    // added one and blamed the gate for ignoring it. What it holds is that every
    // real kind has an entry, and that an unwritten one says so.
    plant: () => edit('docs/event-vocabulary.md', (s) =>
      s.replace(/^- \*\*`capture\.recorded`.*$/m, '')),
  },
  {
    name: 'sample:check',
    catches: 'the sample store no longer covering every node kind',
    // Take a KIND out of the sample. The gate's job is that the sample covers
    // every node kind, so removing one is the defect. The first plant edited a
    // string that is not in this file and silently changed nothing.
    // `src/big-sample.ts`, NOT `src/sample.ts`. This gate builds its store from
    // the big set — the one generated to try things on — and two plants aimed at
    // the small sample changed a file it never reads, so the count stayed at
    // 16 of 16 and the gate was blamed twice for being right.
    plant: () => edit('src/big-sample.ts', (s) => s.replace(/'aspiration'/g, "'outcome'")),
  },
  {
    name: 'plain:check',
    catches: 'a line on the offer card that never says whether it survives the worst day',
    plant: () => edit('public/index.html', (s) =>
      s.replace('<p id="nextup-fixed"', '<p id="nextup-planted"></p>\n    <p id="nextup-fixed"')),
  },
  {
    name: 'reasons:check',
    catches: 'an offer reason with no sentence to say why it was chosen',
    plant: () => edit('src/nextup.ts', (s) => s.replace("'hard-date'", "'hard-dateX'")),
    expectFailure: 'any',
  },
  {
    name: 'controls:check',
    catches: 'a core control moving or being relabelled without the release saying so',
    plant: () => edit('public/index.html', (s) =>
      s.replace('<button id="menu-open"', '<button id="gate-audit-decoy" type="button">Decoy</button>\n  <button id="menu-open"')),
  },
  {
    name: 'collisions:check',
    catches: 'a research entry whose routing mark or evidence grade is missing',
    plant: () => edit('docs/nd-collisions.md', (s) => s.replace('**EVIDENCE**', '**EVIDENCEX**')),
  },
  {
    name: 'adr:check',
    catches: 'a decision record with no row in the index',
    plant: () => {
      const p = join(root, 'docs/adr/0999-gate-audit-plant.md');
      writeFileSync(p, '# ADR-0999 · plant\n\n**Status:** Accepted · **Date:** 2026-08-19\n');
      return () => rmSync(p);
    },
  },
  {
    name: 'notify:check',
    catches: 'notification copy breaking the voice rules before the feature exists',
    // This gate walks all of `src/` plus the worker, so the copy can be planted
    // anywhere in it. There is no `src/notify.ts` — the first plant named a file
    // that has never existed and threw, which is at least loud.
    // BOTH HALVES. This gate inspects only files that actually ask a browser to
    // show a notification, and nothing in the app does yet — so it reports
    // itself armed and dormant, and a banned word sitting in an unrelated const
    // is correctly none of its business. The plant has to be a real emitter
    // carrying real copy, which is the commit the gate was written to meet.
    plant: () => edit('src/held.ts', (s) =>
      `${s}\nexport const plantNotify = (reg) =>\n`
      + `  reg.showNotification('You are overdue — do not break your streak!');\n`),
  },
  {
    name: 'release:check',
    catches: 'a change to the app with no triplet bump, so the cache never retires',
    plant: () => edit('src/held.ts', (s) => `${s}\n// a change with no release\n`),
  },
  {
    name: 'size:check',
    catches: 'the surfaces growing past their budgets',
    // PLANTED IN THE BUILT ARTEFACT, because this gate renders the app and
    // measures what a person actually has to read. A plant in `src/` without a
    // rebuild never reaches it — the first attempt padded `changelog.ts`, the
    // gate measured the unchanged bundle, stayed green, and was reported as not
    // doing its job. Measuring the built output is the gate being right.
    plant: () => edit('public/index.html', (s) =>
      s.replace('</main>', `<p>${'Padding that no budget should permit. '.repeat(400)}</p>\n</main>`)),
  },
];

// --- running ----------------------------------------------------------------

const run = (script) => {
  try {
    execSync(`npm run ${script}`, { cwd: root, stdio: 'pipe' });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
};

const chosen = only ? GATES.filter((g) => g.name.includes(only)) : GATES;
if (chosen.length === 0) {
  console.error(`\n  No gate matches "${only}".\n`);
  process.exit(2);
}

console.log('\nEvery gate, watched failing\n');
let broken = 0;
let unverified = 0;
const results = [];

for (const gate of chosen) {
  if (!gate.plant) {
    unverified += 1;
    results.push(`  ????  ${gate.name} — NO PLANT WRITTEN. This gate is unverified.`);
    continue;
  }

  // GREEN FIRST. A gate that is already red proves nothing when it goes red on
  // a plant, and this audit would report it as working.
  const before = run(gate.name);
  if (before !== 0) {
    broken += 1;
    results.push(`  FAIL  ${gate.name} — already failing before the plant, so this proves nothing.`);
    continue;
  }

  let restore = null;
  let planted = null;
  try {
    restore = gate.plant();
    planted = run(gate.name);
  } catch (err) {
    results.push(`  FAIL  ${gate.name} — the plant itself threw: ${err.message}`);
    broken += 1;
    if (restore) restore();
    continue;
  } finally {
    if (restore) restore();
  }

  // AND GREEN AGAIN. A gate left red by a restore that did not restore would
  // poison every gate after it, and the audit would blame the wrong one.
  const after = run(gate.name);

  if (planted === 0) {
    broken += 1;
    results.push(`  FAIL  ${gate.name} — PASSED with the defect planted. It does not catch: ${gate.catches}`);
  } else if (after !== 0) {
    broken += 1;
    results.push(`  FAIL  ${gate.name} — went red on the plant, but the restore did not bring it back.`);
  } else {
    results.push(`  ok    ${gate.name} — red on the plant, green again after (exit ${planted})`);
  }
}

for (const line of results) console.log(line);

console.log(`\n  ${chosen.length} gate(s) audited · ${broken} not doing their job · ${unverified} unverified\n`);
if (unverified) {
  console.log('  A gate with no plant has not been checked. Write one, or delete the gate —');
  console.log('  an unverified gate is a hypothesis wearing a green tick.\n');
}
process.exit(broken || unverified ? 1 : 0);
