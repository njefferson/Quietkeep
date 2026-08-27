#!/usr/bin/env node
// WHAT THE DEPLOYED HOST ACTUALLY SERVES. — 2026-08-27
//
// LESSONS 53 is "a push is not a release — check the DEPLOY for that exact
// SHA". This is the rung above it: a green deploy step is a fact about a
// workflow, and what a reader loads is a fact about a host. They have come
// apart in this repo before.
//
// REACHABILITY IS SESSION CONFIGURATION, NOT A PROPERTY OF THE TREE. `pages.dev`
// answers only when `*.pages.dev` is on the session's network allowlist; NOTES
// records a session in which it was not, and every host was refused 403 at
// CONNECT. So an unreachable host here is a SKIP with the reason printed, never
// a failure — a gate that goes red because of how a container was configured
// teaches people to ignore red.
//
// A 200 PROVES NOTHING, AND THAT IS THE WHOLE CARE OF THIS FILE. Cloudflare
// Pages serves `index.html` for any unknown path, so a page that does not exist
// answers 200 with the app shell inside it. Measured: production returns 200 for
// `/paths`, which it does not have, and hands back 189KB of Quietkeep. Every
// assertion below reads CONTENT.
//
//   node tools/deployed-check.mjs                 staging
//   node tools/deployed-check.mjs --prod          production + the sync edition

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// NODE'S BUILT-IN FETCH DOES NOT READ `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY`
// is set, and it is read at STARTUP — setting it in-process is too late, which
// this file learned by trying. Without it every request comes back 403 from the
// proxy with an allowlist message in the body, which reads exactly like the host
// being blocked rather than like the client not asking properly.
//
// So it re-execs itself once. The alternative is a tool that works from
// `npm run` and fails when somebody runs it directly, which is a trap.
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

let failed = 0, skipped = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };
const skip = (m) => { console.log(`  --    ${m}`); skipped++; };

/** The triplet this tree would ship, read from the worker rather than restated. */
const want = (read('public', 'sw.js').match(/const CACHE = 'quietkeep-([0-9.]+)'/) ?? [])[1];
if (!want) {
  console.error('\nCannot read the release triplet out of public/sw.js.\n');
  process.exit(1);
}

const prod = process.argv.includes('--prod');
const hosts = prod
  ? [['production', 'https://quietkeep.pages.dev', 'quietkeep'],
     ['the sync edition', 'https://quietkeep-sync.pages.dev', 'quietkeep-sync']]
  : [['staging', 'https://staging.quietkeep.pages.dev', 'quietkeep']];

// Every page the app links to — derived, never listed, the same way help-check
// derives it. A page added to the app and not to this check is the hole.
const shell = read('public', 'index.html').replace(/<!--[\s\S]*?-->/g, ' ');
const linked = [...new Set([...shell.matchAll(/href="\/([a-z0-9-]+\.html)"/g)].map((m) => m[1]))];

const get = async (url) => {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return { status: res.status, body: await res.text() };
  } catch (e) {
    return { error: String(e).slice(0, 120) };
  }
};

console.log(`\nWhat the deployed host serves — this tree carries ${want}\n`);

for (const [name, base, cachePrefix] of hosts) {
  const sw = await get(`${base}/sw.js`);
  if (sw.error) {
    skip(`${name} is unreachable — ${sw.error}`);
    skip(`  ${base} answers only when *.pages.dev is on the session's allowlist. Not a defect in this tree.`);
    continue;
  }

  const got = (sw.body.match(new RegExp(`const CACHE = '${cachePrefix}-([0-9.]+)'`)) ?? [])[1];
  if (!got) {
    fail(`${name}: could not read a ${cachePrefix} triplet out of the served sw.js`);
    continue;
  }
  (got === want ? ok : fail)(
    `${name} serves ${got}${got === want ? '' : ` — this tree carries ${want}, so what is deployed is NOT this`}`);

  // CONTENT, not status. The shell answers 200 for everything.
  //
  // THE SHELL IS IDENTIFIED BY ASKING THE HOST, not by a title typed in here.
  // The first version tested for `<title>Quietkeep</title>`, which is the
  // default edition's title and not the sync edition's — so the sync host
  // reported a page it does not have, at 185KB, which is the app. A check whose
  // pattern is narrower than the thing it checks passes exactly where it should
  // fail, and this repo has paid for that shape more than once.
  const root = await get(`${base}/`);
  if (root.error || !root.body) {
    skip(`${name}: could not read the root document, so a fallback cannot be told from a page`);
    continue;
  }
  for (const file of linked) {
    const page = await get(`${base}/${file}`);
    if (page.error) { skip(`${name} ${file}: ${page.error}`); continue; }
    const isShell = page.body === root.body;
    (!isShell ? ok : fail)(
      `${name} serves ${file} itself${!isShell ? ` (${Math.round(page.body.length / 1024)}KB)` : ' — byte-identical to the root document, so the page is NOT there'}`);
  }
}

if (skipped > 0 && failed === 0) {
  console.log(`\nNothing contradicted, ${skipped} check(s) skipped as unreachable.\n`);
} else {
  console.log(failed === 0
    ? '\nThe host serves what this tree says it should.\n'
    : `\n${failed} check(s) failed — the deployed host and this tree disagree.\n`);
}
process.exit(failed === 0 ? 0 : 1);
