#!/usr/bin/env node
// Refuses a commit that changes the rendered app while `.a11y-stamp` still
// records the previous markup. See tools/a11y-stamp.mjs for why this exists.
//
//   node tools/a11y-fresh.mjs --staged   (the pre-commit path)
//   node tools/a11y-fresh.mjs            (check the working tree)

import { execFileSync } from 'node:child_process';
import { UI_SOURCES, uiHash, readStamp } from './a11y-stamp.mjs';

const STAGED = process.argv.includes('--staged');

if (STAGED) {
  const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' })
    .split('\n').map((l) => l.trim()).filter(Boolean);
  if (staged.length === 0) process.exit(0);
  // Only the sources that change what the walk would MEASURE. A commit touching
  // docs, tools or tests cannot make the last walk wrong.
  if (!UI_SOURCES.some((src) => staged.includes(src))) process.exit(0);
}

const now = uiHash();
const recorded = readStamp();
if (recorded === now) process.exit(0);

console.error('');
console.error('  REFUSED — this commit changes the rendered app, and the accessibility');
console.error(`  walk has not been run against it (.a11y-stamp says ${recorded ?? 'nothing'}, the tree is ${now}).`);
console.error('');
console.error('  Twenty-five static gates and the picture-taking walks all passed on');
console.error('  2.23.1 and CI went red on this one. It measures what no static read');
console.error('  can: contrast per state, focus rings, target separation, axe, and the');
console.error('  320px-at-200% reflow. LESSONS 126.');
console.error('');
console.error('      npm run a11y');
console.error('');
console.error('  About four minutes. It writes the receipt itself when it passes — and');
console.error('  only when it passes, so there is no way to stamp a failing walk.');
console.error('');
process.exit(1);
