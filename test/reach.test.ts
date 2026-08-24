// Arriving at a control, pinned (3.0.0, ADR-0108).
//
// These four are not a sample. They are the four faults that actually cost
// releases on the day this module was written, and every one of them was
// SILENT — a walk that declines to navigate looks exactly like a walk with
// nothing to do, so each was found only by a slower machine failing thirty
// seconds later somewhere else.
//
// Stub document, like `contents.test.ts` and `doors.test.ts` and for the same
// reason: this repo carries no DOM in its unit tests, and the projection here
// is small enough that a dependency would be a thing to maintain rather than a
// check to trust. What a real browser has to answer instead — that pressing a
// door shows the job — is asserted in `tools/smoke.mjs`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reach, unfold, jobsOf } from '../src/reach.ts';

/** A node with just enough of an element to answer what `reach` asks it. */
interface Node {
  tag: string;
  id?: string;
  attrs: Record<string, string>;
  kids: Node[];
  parent?: Node;
  open?: boolean;
  hidden?: boolean;
  clicks: number;
}

const el = (tag: string, attrs: Record<string, string> = {}, kids: Node[] = []): Node => {
  const n: Node = { tag, attrs, kids, clicks: 0 };
  if (attrs.id !== undefined) n.id = attrs.id;
  for (const k of kids) k.parent = n;
  return n;
};

/**
 * Only the selector shapes `reach` actually uses — but ALL of them.
 *
 * The first version of this understood tags and attributes and not classes, so
 * `.hub-go[data-stance-id="triage"]` and `.route` matched nothing and three
 * tests failed against a module that was right. A double that cannot express
 * the thing under test does not test it (hub LESSONS 138), and it fails in the
 * direction that looks like a real defect, which is the expensive direction.
 *
 * Descendant combinators are matched on their LAST token only. That is enough
 * here and it is stated rather than implied: every compound this module builds
 * is uniquely identified by its own tail.
 */
const matches = (n: Node, sel: string): boolean =>
  sel.split(',').map((s) => s.trim()).filter(Boolean).some((part) => {
    const token = part.replace(/^:scope >\s*/, '').split(/\s+/).pop() ?? '';
    const bits = token.match(/^[a-z]+|#[^.#[\s]+|\.[^.#[\s]+|\[[^\]]+\]/g);
    if (!bits) return false;
    return bits.every((b) => {
      if (b.startsWith('#')) return n.id === b.slice(1);
      if (b.startsWith('.')) return (n.attrs.class ?? '').split(/\s+/).includes(b.slice(1));
      if (b.startsWith('[')) {
        const am = /\[([^=\]]+)(?:="([^"]*)")?\]/.exec(b);
        if (!am) return false;
        const [, name, value] = am;
        if (!(name! in n.attrs)) return false;
        return value === undefined || n.attrs[name!] === value;
      }
      return n.tag === b;
    });
  });

const walk = (n: Node, fn: (x: Node) => void): void => { fn(n); n.kids.forEach((k) => walk(k, fn)); };

const docOf = (root: Node): Document => {
  const all: Node[] = [];
  walk(root, (n) => all.push(n));
  const api = (n: Node): any => ({
    id: n.id ?? '',
    hidden: n.hidden ?? false,
    open: n.open ?? false,
    tagName: n.tag.toUpperCase(),
    click: () => { n.clicks++; },
    getAttribute: (k: string) => (k in n.attrs ? n.attrs[k] : null),
    hasAttribute: (k: string) => k in n.attrs,
    matches: (s: string) => matches(n, s),
    closest: (s: string) => {
      for (let p: Node | undefined = n; p; p = p.parent) if (matches(p, s)) return api(p);
      return null;
    },
    querySelector: (s: string) => {
      const sub: Node[] = [];
      walk(n, (x) => { if (x !== n) sub.push(x); });
      const hit = sub.find((x) => matches(x, s.replace(/^:scope >\s*/, '')));
      return hit ? api(hit) : null;
    },
  });
  return {
    querySelector: (s: string) => { const hit = all.find((x) => matches(x, s)); return hit ? api(hit) : null; },
    getElementById: (i: string) => { const hit = all.find((x) => x.id === i); return hit ? api(hit) : null; },
  } as unknown as Document;
};

/** A page with a hub, two jobs, and a door for each. */
const page = (opts: { stance?: string; doors?: string[]; opener?: boolean; routed?: boolean } = {}) => {
  const doors = (opts.doors ?? ['triage', 'held']).map((id) =>
    el('button', { class: 'hub-go', 'data-stance-id': id }));
  const triageKids: Node[] = [el('button', { id: 'triage-card' })];
  if (opts.opener) triageKids.push(el('button', { id: 'triage-open', 'data-stance-opener': '' }));
  if (opts.routed) triageKids.push(el('button', { class: 'route' }));
  const runwayAttrs: Record<string, string> = { id: 'runway', 'data-hub': '' };
  if (opts.stance) runwayAttrs['data-stance'] = opts.stance;
  const root = el('body', {}, [
    el('button', { id: 'stance-back' }),
    el('ul', { id: 'hub-doors' }, doors),
    el('div', runwayAttrs, [
      el('section', { id: 'triage', 'data-stance-name': 'Sort' }, triageKids),
      el('section', { id: 'held', 'data-stance-name': 'Holding' }, [el('div', { id: 'cards' })]),
    ]),
  ]);
  return { root, doc: docOf(root), find: (id: string) => { let f: Node | undefined; walk(root, (n) => { if (n.id === id) f = n; }); return f!; },
    door: (id: string) => doors.find((d) => d.attrs['data-stance-id'] === id)! };
};

test('THE ONE THAT ONLY CI CAUGHT: a job stood in but not opened still gets its opener pressed', () => {
  // `#triage-card` is a button that EXISTS and is EMPTY until the inbox is
  // opened, and an empty button has zero size — so waiting for it to become
  // visible waits for something nothing will render. Standing in the job is not
  // the same as having opened it, and the shim short-circuited on the stance.
  const p = page({ stance: 'triage', opener: true });
  assert.deepEqual(reach('#triage-card', p.doc), { at: 'here' });
  assert.equal(p.find('triage-open').clicks, 1, 'the opener was pressed');
});

test('and a job already in progress is never reset by somebody arriving at it', () => {
  // The opener resets the surface to its first question. Pressing it on a job
  // mid-flow throws away a half-answered place picker.
  const p = page({ stance: 'triage', opener: true, routed: true });
  reach('#triage-card', p.doc);
  assert.equal(p.find('triage-open').clicks, 0, 'a live job is left alone');
});

test('a control in another job goes through that job’s door', () => {
  const p = page({ stance: 'held' });
  assert.deepEqual(reach('#triage-card', p.doc), { at: 'here' });
  assert.equal(p.door('triage').clicks, 1, 'the door was pressed');
  assert.equal(p.find('stance-back').clicks, 1, 'and the old job was left first');
});

test('a selector whose element does not exist yet still names its job', () => {
  // The element is RENDERED BY arriving, so looking for it before deciding
  // where to go waits for a thing only the waiting prevented.
  const p = page({ stance: 'held' });
  assert.deepEqual(reach('#triage-prompt', p.doc), { at: 'here' },
    'nothing in the page answers to #triage-prompt, and the name is enough');
  assert.equal(p.door('triage').clicks, 1);
});

test('a job whose door is not on the hub yet says so, rather than declining', () => {
  // A decline is indistinguishable from "nothing needed", which is what made
  // every one of these silent.
  const p = page({ stance: 'held', doors: ['held'] });
  assert.deepEqual(reach('#triage-card', p.doc),
    { at: 'waiting', door: '#hub-doors .hub-go[data-stance-id="triage"]' });
});

test('a fold is never toggled shut by the press that was going to open it', () => {
  const summary = el('summary', { id: 'held-fold-summary' });
  const details = el('details', {}, [summary, el('div', { id: 'cards' })]);
  const doc = docOf(el('body', {}, [details]));
  unfold('#held-fold-summary', doc);
  assert.equal(summary.clicks, 0, 'the caller’s own press is the one that opens it');
});

test('an element that narrows two surfaces belongs to both', () => {
  // Collapsing this to a first answer is what made the app and the walk
  // disagree about what was on screen.
  const n = el('div', { 'data-narrows': '#nextup,#held' });
  docOf(el('body', {}, [n]));
  const api = docOf(el('body', {}, [n])).querySelector('[data-narrows]')!;
  assert.deepEqual(jobsOf(api as unknown as Element), ['nextup', 'held']);
});
