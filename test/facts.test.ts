// Facts a session gets wrong from its prior, and that no other test holds.
//
// The head of CLAUDE.md names, for each fact, the test or gate that fails when
// it is broken. Most already have one. These two did not: a clock on a role was
// tested only for an aspiration, and the site's content policy was asserted by
// nothing but the walks that run under it. Each test is named for the fact.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { admit } from '../src/gate.ts';
import { fold, emptyState } from '../src/fold.ts';
import { DEMAND_FREE_KINDS, type AppEvent } from '../src/events.ts';

const at = (minute: number): string => `2026-01-01T09:${String(minute).padStart(2, '0')}:00.000Z`;

test('a role is demand-free, so the gate refuses a clock on one', () => {
  assert.ok((DEMAND_FREE_KINDS as readonly string[]).includes('role'), 'role is a demand-free kind');
  const base: AppEvent[] = [
    { id: 'v', vault: 'personal', at: at(0), device: 'd0', seq: 0,
      kind: 'vault.created', node: null, payload: { name: 'personal', domain: 'personal' } },
    { id: 'r', vault: 'personal', at: at(1), device: 'd0', seq: 1,
      kind: 'role.created', node: 'role-parent', payload: { name: 'Parent' } },
  ];
  const state = fold(admit(base, emptyState()));
  const clock: AppEvent = { id: 'c', vault: 'personal', at: at(2), device: 'd0', seq: 2,
    kind: 'clock.set', node: 'role-parent', payload: { clockKind: 'due', at: '2026-02-01T09:00:00.000Z' } };
  assert.throws(() => admit([clock], state), /cannot carry a clock/);
});

test('the content policy allows scripts and styles from the site own files only', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  const line = headers.split('\n').find(l => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(line, 'public/_headers carries a Content-Security-Policy');
  const directives = new Map<string, string>(
    line.trim().slice('Content-Security-Policy:'.length).split(';')
      .map(d => d.trim()).filter(Boolean)
      .map(d => { const i = d.indexOf(' '); return i < 0 ? [d, ''] : [d.slice(0, i), d.slice(i + 1).trim()]; }) as [string, string][],
  );
  assert.equal(directives.get('default-src'), "'none'");
  assert.equal(directives.get('script-src'), "'self'");
  assert.equal(directives.get('style-src'), "'self'");
  assert.doesNotMatch(line, /unsafe-inline|unsafe-eval/);
});
