// Run what CI runs, in the order CI runs it, from the SAME file CI reads.
//
// This exists because of two failures on one day, and they are the same failure.
//
// `size:check` went red on 2.34.0 and stayed red through 2.34.1 and 2.35.0 —
// three releases pushed and promoted while a Spine step was failing. And 2.36.0
// changed the import summary's opening words, which six waits in the smoke walk
// depended on; the unit tests were green, the accessibility walk was green, and
// the walk that presses the real file picker had not been run at all.
//
// Both times the gates were assembled BY HAND. There are around thirty of them,
// there is no single command that runs the set, and so a session picks the ones
// it can think of. What it cannot think of does not get run, and the thing it
// cannot think of is by definition the thing it forgot it changed.
//
// **The list is not written here.** It is read out of `.github/workflows/spine.yml`
// at run time, because a second copy of thirty step names is a copy that goes
// stale in exactly the way this is meant to stop. A step added to CI is run by
// this the same day, with no edit here.
//
//   node tools/spine.mjs                 everything the workflow runs
//   node tools/spine.mjs --list          what it would run, and what it cannot
//   node tools/spine.mjs --from 20       from step 20 on, after a failure
//   node tools/spine.mjs --only a11y     one step, by any part of its command
//   node tools/spine.mjs --parity        every script is in CI, or says why not
//
// THE PARITY CHECK IS THE OTHER DIRECTION, and it is a different question. The
// run above asks "does everything CI runs pass here". `--parity` asks "does CI
// run everything there is" — a gate written, wired into package.json and never
// added to the workflow looks exactly like a gate that is running, from every
// angle except this one. Each script is either in a workflow or declared in
// `.spine-exempt` with a reason; a new one fails by default. Hub LESSONS 127.
//
// IT KEEPS GOING PAST A FAILURE, deliberately, and for the reason the workflow
// does: one red step must not hide the twenty after it. That has a cost — the
// tail of a failed run reads like a passed one — so the last thing printed is
// always the verdict. Hub LESSONS 139.
//
// WHAT IT CANNOT RUN IS PRINTED, NEVER SKIPPED IN SILENCE. Checkout, `npm ci`,
// installing chromium and the hub-gate steps that need a checked-out hub are
// listed as skipped with the reason. A gate suite that quietly drops a third of
// itself is the fail-open shape this whole family of tools keeps rediscovering.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = join(ROOT, '.github', 'workflows', 'spine.yml');

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? '') : null;
};
const LIST = process.argv.includes('--list');
const PARITY = process.argv.includes('--parity');
const FROM = Number(arg('from') ?? 0);
const ONLY = arg('only');

if (PARITY) {
  const { readFileSync, readdirSync } = await import('node:fs');
  const scripts = Object.keys(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts);
  const dir = join(ROOT, '.github', 'workflows');
  const all = readdirSync(dir).filter(f => /\.ya?ml$/.test(f))
    .map(f => readFileSync(join(dir, f), 'utf8')).join('\n');

  // The word boundary has to exclude `:` and `-`, or `npm run manual:check`
  // counts as a run of `manual` and a generator gets credit for its own gate.
  const inCi = (n) => new RegExp(`npm run ${n.replace(/[:]/g, '\\:')}(?![\\w:-])`).test(all);

  const exemptFile = join(ROOT, '.spine-exempt');
  const declared = new Map();
  for (const line of readFileSync(exemptFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (t === '' || t.startsWith('#')) continue;
    const m = /^(\S+)\s+—\s+(.+)$/.exec(t);
    // A malformed line is a FAILURE, not a skip. An exemption nobody can read
    // is an exemption nobody reviewed.
    if (!m) { console.log(`  FAIL  .spine-exempt: "${t}" is not "name — reason"`); process.exit(1); }
    declared.set(m[1], m[2]);
  }

  console.log('\nEvery gate is in CI, or says why not\n');
  const failures = [];
  for (const n of scripts) {
    if (inCi(n)) continue;
    const why = declared.get(n);
    if (why) console.log(`  --    ${n} — ${why}`);
    else failures.push(n);
  }
  // BOTH DIRECTIONS, so a script that later joins CI cannot leave a stale
  // exemption standing — the reason would go on reading as current.
  for (const [n, why] of declared) {
    if (!scripts.includes(n)) failures.push(`${n} is declared here but is not a script any more — ${why}`);
    else if (inCi(n)) failures.push(`${n} is declared as not in CI, but a workflow runs it — ${why}`);
  }
  console.log('');
  if (failures.length === 0) {
    console.log(`Every one of the ${scripts.length} scripts is run by a workflow or declared. Nothing is quietly not running.\n`);
    process.exit(0);
  }
  console.log(`${failures.length} script(s) unaccounted for:`);
  for (const f of failures) console.log(`  ${f}`);
  console.log('\nAdd it to a workflow, or to .spine-exempt with the reason it does not belong there.\n');
  process.exit(1);
}

// The same PyYAML call `tools/workflows.mjs` makes, for the same reason: it is
// on this machine and on every runner, and a node YAML parser in
// devDependencies to read three files would be the worse trade.
const raw = execFileSync('python3', ['-c', `
import yaml, json, sys
d = yaml.safe_load(open(sys.argv[1]))
out = []
for job in d.get('jobs', {}).values():
    for s in job.get('steps', []):
        out.append({
            'name': s.get('name', ''),
            'run': s.get('run', ''),
            'uses': s.get('uses', ''),
            'if': str(s.get('if', '')),
        })
print(json.dumps(out))
`, WORKFLOW], { encoding: 'utf8' });

const steps = JSON.parse(raw);

// WHAT THIS MACHINE CANNOT DO, and why — one reason per shape, so a new
// un-runnable step is described rather than silently dropped.
const cannot = (s) => {
  if (s.uses) return `uses ${s.uses} — an action, not a command`;
  // A step gated on `failure()` runs only when the run has ALREADY failed, and
  // in CI that is the terminal verdict. This tool prints its own verdict at the
  // bottom, so running the workflow's would just be a guaranteed red step.
  if (/failure\(\)/.test(s.if)) return 'only runs when the run has already failed — this prints its own verdict';
  if (!s.run.trim()) return 'has no command';
  if (/^npm ci\b/.test(s.run.trim())) return 'installs dependencies; this runs against the tree you have';
  if (/playwright(-core)? install/.test(s.run)) return 'installs a browser; this machine already has one';
  // The hub-gate steps run `.hub-gates/...`, a path that only exists on a runner
  // after the checkout step. The same gates run from `../noahjefferson` here,
  // which is what a session actually does, so they are named rather than faked.
  if (/\.hub-gates/.test(s.run)) return 'runs the hub gates from a CI-only checkout — run them from ../noahjefferson';
  return null;
};

// A step with no `name:` is displayed as its command — GitHub does the same, and
// a blank label in a list of thirty is a step nobody can ask about.
const label = (s) => s.name || s.run.trim().split('\n')[0] || s.uses;

const runnable = [];
const skipped = [];
for (const s of steps) {
  const why = cannot(s);
  if (why) skipped.push({ name: label(s), why });
  else runnable.push({ ...s, name: label(s) });
}

const chosen = runnable
  .map((s, i) => ({ ...s, n: i + 1 }))
  .filter(s => s.n >= FROM)
  .filter(s => ONLY === null || s.run.includes(ONLY) || s.name.toLowerCase().includes(ONLY.toLowerCase()));

console.log(`\nWhat the Spine runs, read from ${WORKFLOW.replace(ROOT + '/', '')}\n`);

for (const s of skipped) console.log(`  --    ${s.name} — ${s.why}`);
if (skipped.length) console.log('');

if (LIST) {
  for (const s of chosen) console.log(`  ${String(s.n).padStart(2)}   ${s.name}\n       ${s.run.trim().split('\n')[0]}`);
  console.log(`\n${chosen.length} step(s) would run, ${skipped.length} cannot run here.\n`);
  process.exit(0);
}

if (!existsSync(join(ROOT, 'public', 'app.js'))) {
  console.log('  note  public/app.js is not built. `npm run build` first, or the browser walks measure nothing.\n');
}

const failed = [];
for (const s of chosen) {
  const started = process.hrtime.bigint();
  // The in-progress line is overwritten by the result with `\r`, which only
  // works on a terminal. Piped to a file or read by a session it doubles every
  // line, so it is written only where it can be taken back.
  if (process.stdout.isTTY) process.stdout.write(`  ..   ${String(s.n).padStart(2)} ${s.name}`);
  const r = spawnSync('bash', ['-lc', s.run], { cwd: ROOT, encoding: 'utf8' });
  const secs = Number(process.hrtime.bigint() - started) / 1e9;
  const took = secs >= 1 ? ` (${secs.toFixed(0)}s)` : '';
  if (r.status === 0) {
    process.stdout.write(`${process.stdout.isTTY ? '\r' : ''}  ok   ${String(s.n).padStart(2)} ${s.name}${took}\n`);
  } else {
    process.stdout.write(`${process.stdout.isTTY ? '\r' : ''}  FAIL ${String(s.n).padStart(2)} ${s.name}${took}\n`);
    // The failing step's own words, not a summary of them. A gate here says what
    // is wrong in the last lines it prints; paraphrasing that is how a session
    // ends up fixing the wrong thing.
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trimEnd().split('\n');
    for (const line of out.slice(-14)) console.log(`       ${line}`);
    console.log('');
    failed.push(s);
  }
}

// THE VERDICT IS THE LAST THING PRINTED. See the header, and hub LESSONS 139:
// a run that continues past a failure ends in whatever ran last, and everybody
// reads the bottom.
console.log('');
if (failed.length === 0) {
  console.log(`Every step the Spine runs passes here — ${chosen.length} of them.`);
  if (skipped.length) console.log(`${skipped.length} could not run on this machine and are named above.`);
  console.log('');
  process.exit(0);
}
console.log(`${failed.length} STEP(S) FAILED:`);
for (const s of failed) console.log(`  ${s.name} — ${s.run.trim().split('\n')[0]}`);
console.log('');
process.exit(1);
