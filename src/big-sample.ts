// A set with everything in it (1.16.0, ADR-0067).
//
// `src/sample.ts` is the DEMONSTRATION set: fourteen things, tidy, human, for
// somebody trying the app out. This is a different act. It exists to be looked
// at hard, on a real device, by somebody hunting for the places the app says
// something wrong — so it is built out of the shapes that have historically
// broken things here rather than out of a pleasant afternoon.
//
// ## Why it exists at all
//
// Measured when this was written: the app emits 70 of its 90 event kinds, and
// the demonstration set contained 8 of them. Sixty-two emitted kinds appeared in
// no sample at all — every merge, every dependency, every decision, the whole
// Not Now ledger, the whole trash, Composed Today, focus and resume, capacity
// and weight. Every surface built since 0.22.0 had never been seen with data in
// it except whatever happened to be in one person's store. `tools/sample-
// coverage.mjs` is what stops that happening again: a kind is in this set, or
// this file says in words why it is not.
//
// ## It is a FILE, not an append
//
// The demonstration set appends to your store and its own words admit the
// consequence — "yours to sort out afterwards". At this size that trade is not
// fair, and there is no verb in this app that takes just these back out (there
// must not be: that is `import.merged` in costume). So the caller writes this to
// a file and the ordinary import brings it in, seeding a fresh store with the
// warning it already gives. Your own copy is how you come back.
//
// ## Everything here goes through the real write boundary
//
// Nothing is privileged. The caller runs `admit` over these events exactly as a
// keystroke is run through it, and `test/big-sample.test.ts` asserts every one
// is admitted. A set that needed a private door would be demonstrating a state
// the app does not permit — and `inspectExport` refuses a file that folds to
// even one silent node, so a privileged set would not import anyway.
//
// PURE and DETERMINISTIC. `now`, the zone and the stamping are injected, and the
// variety comes from a seeded generator rather than `Math.random` — a failure
// nobody can reproduce is not a finding.

import type { AppEvent, ClarifyRoute, NodeId } from './events.ts';
import { MENU_CATEGORIES } from './menu.ts';
import { deriveKey, KDF_ITERATIONS } from './journal.ts';
import { seal } from './seal.ts';
import { endOfLocalDay, localDayKey, atMidnight} from './time.ts';

/** Structurally the UI's `StampContext`, restated so this module does not import
 *  from `src/ui` and stays usable from a script and a test — the same shape
 *  `sample.ts` uses, for the same reason. */
export interface BigSampleContext {
  at: string;
  device: string;
  vault: string;
  zone: string;
  seq: () => number;
  id: () => string;
}

/**
 * Roughly how many things the set contains.
 *
 * One number, because "bigger" should be one edit. It has to clear every cap in
 * the app — SEARCH_CAP, BRANCH_CAP, the trash and ledger caps are all 25 — with
 * enough room that a cap's "N of M" line is exercised rather than assumed.
 */
export const BIG_SAMPLE_SIZE = 420;

/** The journal in this set really is sealed, and this opens it. Stated beside
 *  the button, because a journal nobody can open demonstrates nothing — and
 *  inventing a passphrase the reader has to guess is worse than not shipping
 *  one. */
export const BIG_SAMPLE_PASSPHRASE = 'the quiet keeper opens this';

/**
 * A small deterministic generator.
 *
 * Not `Math.random`. Two runs of this set must be identical, or a defect it
 * surfaces cannot be reproduced by running it again — which is the whole value
 * of a fixture over a live store.
 */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    // Numerical Recipes' LCG. Any decent one would do; what matters is that it
    // is seeded and stated rather than ambient.
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// --- the words -------------------------------------------------------------
//
// Civilian errands and ordinary work, original, in the app's own voice. No
// trigger-list material (those lists are copyrighted), nothing that reads as a
// personality, and nothing diagnosis-flavoured.

const AREAS = [
  'Household paperwork', 'The garden', 'Money', 'The car', 'Family',
  'The flat', 'Work', 'Health appointments', 'Photography', 'Reading',
];

// PROJECTS, EACH WITH THE STEPS THAT ACTUALLY BELONG TO IT (2.0.4).
//
// This was two flat lists — fourteen project names and twenty action names —
// and the generator paired them AT RANDOM. So the sample produced things like
// "Photograph the meter" under "Plan the trip north" and "Take the old one to
// the tip" under "Find a new dentist": grammatical, plausible in isolation, and
// meaningless together.
//
// That is not a cosmetic problem in test data. Every step of every action title
// here is a FRAGMENT — "order the part", "ring them back", "take the old one to
// the tip" — because that is how people actually write things down. A fragment
// is legible exactly when the thing above it supplies the missing noun. Pair it
// with an unrelated project and the card is worse than a bare fragment, because
// now the app is confidently showing you a wrong context.
//
// So a project owns its steps. Nothing is paired by chance.
export const PROJECTS: { title: string; area: string; steps: string[] }[] = [
  { title: 'Get the kitchen tap fixed', area: 'The flat', steps: [
    'Ring the plumber back', 'Measure the gap under the sink',
    'Find the receipt for the tap', 'Take the old tap to the tip',
    'Clear everything out from under the sink'] },
  { title: 'Sort the loft out', area: 'The flat', steps: [
    'Buy more of the big storage boxes', 'Take the old cot to the charity shop',
    'Find the spare key',
    'Check the loft hatch ladder is safe', 'Label the boxes that are staying'] },
  { title: 'Renew the house insurance', area: 'Money', steps: [
    'Compare the two insurance quotes', 'Read the buildings cover properly',
    'Photograph the meter for the reading', 'Cancel the old policy'] },
  { title: 'Plan the trip north', area: 'Family', steps: [
    'Book the room for the Friday night', 'Check what time the ferry runs',
    'Ask Sam whether the dates still work', 'Print the walking map'] },
  { title: 'Repaint the back door', area: 'The flat', steps: [
    'Buy the exterior primer', 'Sand the old paint back',
    'Take the door furniture off', 'Check the weather for a dry run of days'] },
  { title: 'Set up the new printer', area: 'Work', steps: [
    'Find where the network password is written down',
    'Order the right ink cartridges', 'Recycle the old printer',
    'Test it prints from the phone'] },
  { title: 'Clear the guttering', area: 'The flat', steps: [
    'Borrow the long ladder', 'Check the downpipe at the back is clear',
    'Book someone if the ladder will not reach'] },
  { title: 'Find a new dentist', area: 'Health appointments', steps: [
    'Ask which practices are taking people on',
    'Get the notes moved from the old dentist', 'Book the first appointment'] },
  { title: 'Rebuild the compost bin', area: 'The garden', steps: [
    'Order the timber', 'Take the broken panels to the tip',
    'Move the compost that is already there'] },
  { title: 'Get the bike serviced', area: 'The car', steps: [
    'Ring the bike shop about a slot', 'Find the spare inner tubes',
    'Ask what the lead time is on the brake pads'] },
  { title: 'Sort out the recycling collection', area: 'Household paperwork', steps: [
    'Ring the council about the bin collection',
    'Order a replacement blue box', 'Check which week the garden waste goes'] },
  { title: 'Replace the bathroom light', area: 'The flat', steps: [
    'Order the part for the bathroom light',
    'Check the warranty on the old fitting', 'Take the old one to the tip'] },
  { title: 'Fix the fence panel', area: 'The garden', steps: [
    'Measure the gap where the panel was', 'Order the new panel',
    'Ask next door before starting'] },
  { title: 'Replace the broken window', area: 'The flat', steps: [
    'Get the measurements signed off', 'Order the glass', 'Book the fitter',
    'Confirm the access arrangements', 'Tape the crack until it is done',
    'Chase the quote for the glazing'] },
  { title: 'Get the survey done', area: 'Household paperwork', steps: [
    'Ring the surveyor back', 'Call the surveyor', 'Surveyor — ring back',
    'Chase the surveyor’s invoice', 'Read the survey when it comes',
    'Find the spare key'] },
  { title: 'Reseal the bathroom', area: 'The flat', steps: [
    'Strip the old sealant', 'Buy the sealant gun', 'Let it dry properly before using it'] },
  { title: 'Book the boiler service', area: 'Household paperwork', steps: [
    'Find the service record from last year', 'Ring them back about a date',
    'Move the stuff out of the airing cupboard'] },
];

// EVERYTHING TO DO WITH THE MOVE — the deliberately over-cap container, with
// steps that belong to a move rather than a numbered list of unrelated verbs.
// It used to read "Photograph the meter — 7 of the move list", which counted
// something nobody can act on.
export const MOVE_STEPS = [
  'Book the van', 'Get boxes from the shop on the corner', 'Tell the bank the new address',
  'Redirect the post', 'Take the curtains down', 'Read the electricity meter on the day',
  'Cancel the milk', 'Give the spare keys back', 'Defrost the freezer',
  'Ring the council about the council tax', 'Pack the kitchen last',
  'Label the boxes by room', 'Find the loft insurance documents',
  'Take the garden pots to the new place', 'Book the cleaner for the last day',
  'Change the address on the driving licence', 'Tell the vet the new address',
  'Sort out the broadband for the new place', 'Empty the shed',
  'Take the old sofa to the tip', 'Check the meter readings match the bill',
  'Ask the neighbours to take a parcel', 'Put the plants somewhere safe',
  'Find the spare curtain hooks', 'Wrap the mirrors properly',
  'Photograph the room before handing the keys back', 'Return the parking permit',
  'Take a copy of the tenancy paperwork', 'Ring the removal firm to confirm',
  'Check nothing is left in the loft', 'Post the keys through the letterbox',
];

// STANDS ON ITS OWN — for anything with NO parent.
//
// A loose item has nothing above it to supply the missing noun, so a fragment
// there is unreadable no matter how good the rest of the sample is. These read
// the way somebody writes when there is no project to lean on: they carry their
// own subject. Real stores are full of these, and since 2.0.0 an unsorted
// capture is offered as work, so this is the pool the offer surface meets most.
export const STANDALONE = [
  'Put the recycling out', 'Water the plants in the back room',
  'Take the blue coat to the dry cleaner', 'Change the batteries in the smoke alarm',
  'Send Priya the photos from the weekend', 'Descale the kettle',
  'Renew the library books', 'Move the winter coats up to the loft',
  'Get a spare key cut', 'Top up the windscreen washer',
  'Sew the button back on the grey shirt', 'Clean out the fridge shelves',
  'Take the glass to the bottle bank', 'Back up the photos off the phone',
  'Sharpen the kitchen knives', 'Book the car in for its MOT',
  'Return the library DVD', 'Wash the car mats',
];

const PEOPLE = [
  'Alex', 'Sam', 'Priya', 'Tom', 'Ada O’Neill', 'Jo', 'Ravi', 'Marguerite',
];

const WISHES = [
  'Read the big atlas properly, a country at a time',
  'Build the shelf for the hallway', 'Try making bread again',
  'Go and see the long barrow', 'Look into the night classes',
  'Learn to develop film at home', 'Walk the whole ridge in one go',
  'Try the good coffee place across town',
];

const UPKEEP = [
  'Change the water filter', 'Descale the kettle', 'Back up the photographs',
  'Check the smoke alarms', 'Water the plants properly', 'Clean the extractor',
];

const WEIGHTS = [
  'The thing with the roof', 'The conversation I have not had',
  'Money being tighter than it was', 'How the appointment went',
];

const JOURNAL = [
  'The kitchen was warm this evening and nobody needed anything.',
  'Walked to the end of the lane and back. That was the whole of it.',
  'A slow day. Not a wasted one.',
];

const NOTES = [
  'Reference number is in the drawer.\nSecond line, so the note is not one line.',
  '=SUM(A1:A9) — this looks like a formula on purpose, so the export guards meet one.',
  'Nothing complicated. Just do not lose the receipt again.',
];

/**
 * A title at the cleaner's own 200-character cap, and one carrying diacritics
 * and CJK.
 *
 * Both are real content, not gibberish: search folds diacritics with `normalize`
 * and nothing outside a unit test has ever handed it one, and a title at exactly
 * the cap is what finds a card that assumes titles are short.
 */
export const AWKWARD_TITLES = [
  'Ask the council whether the pavement outside the shop is theirs or the landlord’s, because the last two people I asked each said it was the other one and the crack is getting wider every week now',
  'Café — the piñata for Zoë’s birthday (漢字 too)',
  '=1+1 and a leading equals, which a spreadsheet would run',
];

/**
 * The whole set.
 *
 * ASYNC because the journal is really encrypted: a set whose journal cannot be
 * opened would demonstrate the locked state and nothing else. The key is derived
 * ONCE — PBKDF2 at 600,000 iterations is deliberately expensive, and deriving it
 * per entry would make generating the set take seconds for no benefit.
 *
 * Ordered so `admit` can accept it: it folds each event against the state the
 * previous ones produced, so a parent exists before a child names it, a node
 * exists before a clock lands on it, and a merge target exists before anything
 * folds into it.
 */
export async function bigSampleEvents(
  ctx: BigSampleContext, nowIso: string,
): Promise<AppEvent[]> {
  const out: AppEvent[] = [];
  const rand = rng(20260803);
  // A SECOND, INDEPENDENT STREAM for roles (2.6.0) — see the note at its use.
  const roleRand = rng(20260817);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
  const int = (lo: number, hi: number): number => lo + Math.floor(rand() * (hi - lo + 1));

  const stamp = (kind: string, node: string | null, payload: unknown): AppEvent => {
    const e = {
      id: ctx.id(), vault: ctx.vault, at: ctx.at, device: ctx.device, seq: ctx.seq(),
      kind, node, payload,
    } as unknown as AppEvent;
    out.push(e);
    return e;
  };

  /** End of a local day, `days` from now. Clocks here are end-of-day instants
   *  (ADR-0009). Offsets reach far enough either side of today that a DST
   *  boundary is crossed whenever this is generated, which is deliberate. */
  const day = (days: number): string => endOfLocalDay(nowIso, atMidnight(ctx.zone), days);

  const node = (nodeKind: string, title: string, parent?: NodeId): NodeId => {
    const id = ctx.id();
    stamp('node.created', id, {
      nodeKind, title, provenance: { for: 'self' },
      ...(parent === undefined ? {} : { parent }),
    });
    return id;
  };
  const clock = (id: NodeId, clockKind: string, days: number): void => {
    stamp('clock.set', id, { clockKind, at: day(days), source: 'sample' });
  };

  // --- people, first, because everything else links to them -----------------
  //
  // `person.created` IS the creation — a person node is not a `node.created`
  // with a kind on it (fold.ts). One of them carries an apostrophe, which is
  // what the report's CSV and Markdown guards have never met outside a test.
  const people = PEOPLE.map((name) => {
    const id = ctx.id();
    stamp('person.created', id, { name });
    return id;
  });

  // --- contexts, next, because actions attach to them (2.2.0, ADR-0092) ------
  //
  // Four, because that is what a real set looks like: two places and two means.
  // `context.created` IS the creation, exactly as `person.created` is — a
  // context is not a `node.created` carrying a kind.
  const CONTEXTS = ['At home', 'At work', 'Out and about', 'On the phone'];
  const contexts = CONTEXTS.map((name) => {
    const id = ctx.id();
    stamp('context.created', id, { name });
    return id;
  });

  // --- roles, on the other axis (2.6.0, ADR-0096) ----------------------------
  //
  // Three, and deliberately FEWER than the contexts: a person has a handful of
  // identities and a great many places, and a sample that gave them the same
  // cardinality would teach the wrong shape. They are named as identities rather
  // than as areas — an area holds work, a role runs THROUGH areas — because the
  // whole reason this is a link and not a container is that the two differ.
  // `role.created` IS the creation, exactly as `context.created` is.
  const ROLES = ['Parent', 'The photography', 'Keeping the house running'];
  const roles = ROLES.map((name) => {
    const id = ctx.id();
    stamp('role.created', id, { name });
    return id;
  });

  // --- the spine: areas, projects, actions, at scale ------------------------
  //
  // Real containment, several levels of it, and one container deliberately over
  // BRANCH_CAP so the tree's per-branch reveal states a true remainder rather
  // than a number nobody has counted.
  const areas = AREAS.map(t => node('area', t));
  for (const a of areas) clock(a, 'review', int(3, 40));

  const goal = node('goal', 'Have the flat in a state I am not apologising for');
  const outcome = node('outcome', 'The back of the house is watertight', goal);
  clock(outcome, 'due', 120);

  const projects: NodeId[] = [];
  for (let i = 0; i < PROJECTS.length; i++) {
    // UNDER THE AREA IT BELONGS TO, not by index. This was
    // `areas[i % areas.length]`, which put "Rebuild the compost bin" under
    // Photography and "Get the bike serviced" under Reading — the same
    // random-pairing defect as the titles, one level up, and just as visible
    // on a card: the place line reads "in Get the bike serviced · under
    // Reading".
    const p = node('project', PROJECTS[i]!.title, areas[AREAS.indexOf(PROJECTS[i]!.area)]);
    clock(p, 'review', int(5, 30));
    projects.push(p);
  }
  // NAME THE PROJECT, NEVER THE INDEX. `projects[5]` is whatever happens to be
  // fifth in a list somebody will reorder, and every fixture below used one —
  // which is how a glazing chain ended up under "Set up the new printer" and
  // four surveyor calls under "Find a new dentist". The place line renders that
  // to the reader as fact.
  const proj = (title: string): NodeId => {
    const i = PROJECTS.findIndex(p => p.title === title);
    if (i < 0) throw new Error(`sample: no project named ${title}`);
    return projects[i]!;
  };

  // Roles: an execute project and a tracked one, because the portfolio line
  // reads differently for each and only one of them has ever had data.
  stamp('project.role.set', projects[0]!, { role: 'execute' });
  stamp('project.role.set', projects[1]!, { role: 'track' });

  // The over-cap container. BRANCH_CAP is 25; this holds more than that on
  // purpose.
  const big = node('project', 'Everything to do with the move', areas[0]);
  clock(big, 'review', 14);
  for (let i = 0; i < 31; i++) {
    const c = node('action', MOVE_STEPS[i % MOVE_STEPS.length]!, big);
    clock(c, i % 3 === 0 ? 'due' : 'start', int(-4, 60));
  }

  // The bulk, spread across the projects, at several distances including the
  // past — there is no past bucket (law 3), and a passed date is a present
  // decision.
  const made = () => out.filter(e => e.kind === 'node.created' || e.kind === 'capture.recorded').length;
  while (made() < BIG_SAMPLE_SIZE) {
    // A PROJECT'S OWN STEP, or a title that stands alone. Never a fragment
    // under something it has nothing to do with, and never a fragment loose.
    const pi = Math.floor(rand() * PROJECTS.length);
    const parented = rand() < 0.75;
    const a = parented
      ? node('action', pick(PROJECTS[pi]!.steps), projects[pi])
      : node('action', pick(STANDALONE));
    // WHERE IT CAN BE DONE (2.2.0, ADR-0092). Most things get one; some get two,
    // because a thing can be doable at home AND out; and a good number get none,
    // which is the honest majority — an unlabelled thing is doable anywhere and
    // is never filtered away. Deterministic like everything else here.
    const cRoll = rand();
    if (cRoll < 0.55) {
      stamp('context.attached', a, { node: a, context: contexts[Math.floor(rand() * contexts.length)]! });
      if (cRoll < 0.12) {
        stamp('context.attached', a, { node: a, context: contexts[Math.floor(rand() * contexts.length)]! });
      }
    }

    // WHO IT IS FOR (2.6.0, ADR-0096). Rarer than a place, because a role is
    // something you attach on purpose to work that is genuinely OF that identity
    // and not to every errand — and the honest majority carrying none is what
    // keeps a role from reading as a required field.
    // ITS OWN STREAM, and that is not fussiness. Drawing from `rand` would shift
    // every subsequent draw in the generator, silently reshaping a sample that
    // dozens of assertions are written against — the first version of this did,
    // and the membership gate immediately reported that the set no longer held a
    // waiting-for with a passed date. A new label must ADD a case, never quietly
    // delete somebody else's.
    const rRoll = roleRand();
    if (rRoll < 0.3) {
      stamp('role.attached', a, { node: a, role: roles[Math.floor(roleRand() * roles.length)]! });
      if (rRoll < 0.06) {
        stamp('role.attached', a, { node: a, role: roles[Math.floor(roleRand() * roles.length)]! });
      }
    }
    const roll = rand();
    if (roll < 0.15) clock(a, 'due', int(-14, -1));        // passed: a replan card
    else if (roll < 0.45) clock(a, 'due', int(0, 21));
    else if (roll < 0.7) clock(a, 'start', int(-3, 45));
    else if (roll < 0.8) clock(a, 'park', int(-6, 30));    // some parks already back
    else if (roll < 0.9) clock(a, 'review', int(1, 400));  // one over a year out
    else stamp('menu.item.added', a, { category: pick(MENU_CATEGORIES) });
    if (rand() < 0.12) stamp('node.field.set', a, { field: 'note', value: pick(NOTES) });
    if (rand() < 0.1) stamp('estimate.recorded', a, { durationMinutes: int(5, 90), basis: rand() < 0.5 ? 'guess' : 'prior' });
  }

  // A date more than a year out, which is the only case that makes a rendered
  // date state its year — indistinguishable from this September otherwise.
  const farOff = node('action', 'Renew the passport before it runs out');
  clock(farOff, 'due', 400);

  // The awkward titles, each on something ordinary so they turn up on real
  // surfaces rather than in a corner of their own.
  for (const t of AWKWARD_TITLES) {
    const id = node('action', t, pick(projects));
    clock(id, 'due', int(1, 12));
  }

  // --- rename, re-kind, re-parent, un-parent --------------------------------
  // A place put on and taken off again (2.2.0) — the detach verb exercised, so
  // the sample carries every context event rather than only the additive half.
  const replaced = node('action', 'Take the old paint to the tip');
  stamp('context.attached', replaced, { node: replaced, context: contexts[0]! });
  stamp('context.attached', replaced, { node: replaced, context: contexts[2]! });
  stamp('context.detached', replaced, { node: replaced, context: contexts[0]! });
  clock(replaced, 'due', int(2, 12));

  // A role put on and taken off again (2.6.0) — the detach verb exercised, so
  // the sample carries every role event and not only the additive half. Taking
  // one role off must leave the other alone, which is the scoping the projection
  // depends on.
  const reroled = node('action', 'Send the prints to be framed');
  stamp('role.attached', reroled, { node: reroled, role: roles[1]! });
  stamp('role.attached', reroled, { node: reroled, role: roles[2]! });
  stamp('role.detached', reroled, { node: reroled, role: roles[2]! });
  clock(reroled, 'due', int(2, 12));

  const renamed = node('action', 'Ring the man about the thing');
  clock(renamed, 'due', 3);
  stamp('node.renamed', renamed, { title: 'Ring the roofer about the ridge tiles' });

  const promotedKind = node('action', 'Sort out the whole garden', areas[1]);
  clock(promotedKind, 'due', 30);
  stamp('node.kind.changed', promotedKind, { from: 'action', to: 'project' });

  const moved = node('action', 'Find the spare key', proj('Sort the loft out'));
  clock(moved, 'due', 6);
  // BOTH ENDS NAMED. This moved to `projects[3]` from `projects[2]` — indices,
  // so the fixture demonstrated a move by putting "Find the spare key" under
  // "Plan the trip north". A move has to land somewhere the title still reads,
  // or the fixture proves the mechanism and breaks the data.
  stamp('node.parented', moved, {
    parent: proj('Get the survey done'), priorParent: proj('Sort the loft out') });
  const loosed = node('action', 'Decide about the shed', projects[4]);
  clock(loosed, 'due', 9);
  stamp('node.unparented', loosed, { priorParent: projects[4]! });

  // --- upkeep, at several points across its comfort window ------------------
  //
  // One decay primitive runs everything temporal, and the interesting states are
  // the ones either side of the window rather than the tidy middle.
  for (let i = 0; i < UPKEEP.length; i++) {
    const u = node('upkeep', UPKEEP[i]!, rand() < 0.5 ? pick(areas) : undefined);
    const interval = [7, 14, 30, 60, 90, 180][i % 6]!;
    stamp('upkeep.interval.set', u, { intervalDays: interval, comfortWindowDays: Math.max(2, Math.round(interval / 4)) });
    // Done at a spread of distances: inside the window, at its edge, past it.
    stamp('done.marked', u, { at: day(-Math.round(interval * [0.2, 0.6, 0.95, 1.1, 1.4, 0.4][i % 6]!)) });
  }
  // One that was marked done and then un-marked — the state a mis-tap leaves.
  const untick = node('action', 'Take the meter reading');
  clock(untick, 'due', 2);
  stamp('done.marked', untick, { at: day(-1) });
  stamp('done.unmarked', untick, {});

  // --- waiting on people, opened and closed ---------------------------------
  for (let i = 0; i < 6; i++) {
    const w = node('waiting-for', `${pick(['Quote for', 'Answer about', 'The form for', 'Confirmation of'])} ${pick(['the guttering', 'the survey', 'the refund', 'the appointment'])}`);
    const who = people[i % people.length]!;
    stamp('person.linked', w, { node: w, person: who, relation: 'waiting-on' });
    stamp('waiting.opened', w, { person: who, forWhat: 'the written answer', since: day(-int(2, 30)) });
    clock(w, 'suspense', int(-3, 12));
  }
  const closed = node('waiting-for', 'The replacement part from the supplier');
  stamp('person.linked', closed, { node: closed, person: people[2]!, relation: 'waiting-on' });
  stamp('waiting.opened', closed, { person: people[2]!, forWhat: 'the part', since: day(-20) });
  stamp('waiting.closed', closed, { outcome: 'It arrived, and it is the right one' });

  // --- situations somebody named (2.21.0) -----------------------------------
  //
  // Two saved and one forgotten, because the forgetting is the half nothing
  // else exercises. Both shapes are here — a place with a length, and a length
  // with no place — since a set carrying only one would measure one and look
  // like it measured two.
  stamp('situation.saved', null, { name: 'The Tuesday standup', context: contexts[0] ?? null, minutes: 15 });
  stamp('situation.saved', null, { name: 'A free weekend', context: null, minutes: 120 });
  stamp('situation.saved', null, { name: 'Waiting somewhere', context: null, minutes: 5 });
  stamp('situation.forgotten', null, { name: 'Waiting somewhere' });

  // --- the other direction: promises, kept and taken back (2.20.0) ----------
  //
  // Four standing, so "With other people" renders both its lists rather than
  // one. One RELEASED, because the release is the half nothing else exercises:
  // its whole point is that the work survives it, and a fixture that only ever
  // promised things would leave that unproven on any real store.
  //
  // No ageing anywhere near these, deliberately. `waiting.opened` above carries
  // a `since` because how long somebody has owed YOU something is a fact about
  // a date; the same field pointed this way would be a record of how long you
  // have been failing, which is the ledger `src/requests.ts` refuses.
  for (let i = 0; i < 4; i++) {
    // No name in the TITLE — the name is on the link, and a title carrying one
    // too would go stale the moment somebody is renamed. `personName` resolves
    // it through state, which is the rule `withWhom` already follows.
    const pr = node('action', `${pick(['Send', 'Write up', 'Return', 'Book'])} ${pick(['the photos', 'the notes', 'the borrowed drill', 'the table'])}`);
    stamp('person.linked', pr, { node: pr, person: people[i % people.length]!, relation: 'promised-to' });
    clock(pr, 'due', int(1, 21));
  }
  const letGo = node('action', 'Dig out the old photographs');
  stamp('person.linked', letGo, { node: letGo, person: people[1]!, relation: 'promised-to' });
  clock(letGo, 'due', 9);
  // Not promised any more, and STILL HERE — the work outlives the undertaking.
  stamp('promise.released', letGo, { person: people[1]! });

  // --- the meeting half: OPR, stakeholders, decisions, a report -------------
  stamp('opr.assigned', projects[0]!, { person: people[0]! });
  stamp('person.linked', projects[0]!, { node: projects[0]!, person: people[0]!, relation: 'opr' });
  for (const p of [people[1]!, people[4]!]) {
    stamp('person.linked', projects[0]!, { node: projects[0]!, person: p, relation: 'stakeholder' });
    stamp('stakeholder.added', projects[0]!, { person: p });
  }
  stamp('stakeholder.removed', projects[0]!, { person: people[4]! });
  stamp('decision.logged', projects[0]!, { text: 'Going with the second quote, on the lead time rather than the price', at: day(-4) });
  stamp('decision.logged', projects[0]!, { text: 'Not moving the date; the tiles can wait until after', at: day(-1) });
  stamp('status.report.exported', null, { format: 'markdown', scope: 'everything' });

  // --- dependencies, deep enough for the arithmetic to be real --------------
  // BY NAME, not by index. These three are a glazing sequence and `projects[5]`
  // was whatever happened to be fifth in the list — "Set up the new printer" at
  // the time this was found, so the dependency arithmetic was demonstrated on a
  // chain filed under something it had nothing to do with.
  const glazing = proj('Replace the broken window');
  const chain = [
    node('action', 'Get the measurements signed off', glazing),
    node('action', 'Order the glass', glazing),
    node('action', 'Book the fitter', glazing),
  ];
  for (const c of chain) clock(c, 'due', int(10, 40));
  // No `suspense` in these payloads (1.17.4): the field was only ever noise —
  // no fold case reads it — and nothing writes it any more.
  stamp('dependency.declared', chain[0]!, { feeds: chain[1]!, leadEstimateDays: 5 });
  stamp('dependency.declared', chain[1]!, { feeds: chain[2]!, leadEstimateDays: 7 });
  const released = node('action', 'Confirm the access arrangements', glazing);
  clock(released, 'due', 15);
  stamp('dependency.declared', released, { feeds: chain[2]!, leadEstimateDays: 2 });
  stamp('dependency.released', released, { feeds: chain[2]! });
  stamp('suspense.set', chain[2]!, { at: day(25), label: 'the fitter’s first free week' });

  // --- a routine held together by completions rather than by dates (1.30.0) --
  //
  // Three steps where each one IS the cue for the next, which is the case a
  // datetime cannot express: the second step has no date, no rhythm and no
  // parent under a clock, and is covered by law 1 clause (e) alone. That is the
  // point of putting it in the set — the sample is what the write boundary is
  // exercised against, so the clause has to be represented by a real node whose
  // coverage would vanish if the clause were removed.
  const routine = [
    node('action', 'Strip the old sealant', proj('Reseal the bathroom')),
    node('action', 'Let the frame dry out'),
    node('action', 'Re-seal the frame'),
  ];
  clock(routine[0]!, 'due', int(3, 9));
  stamp('after.set', routine[1]!, { after: routine[0]! });
  stamp('after.set', routine[2]!, { after: routine[1]! });
  // And one that was set and then thought better of — the anchor cut, the gate
  // giving it a clock of its own, which is the whole of `after.cleared`.
  const unanchored = node('action', 'Chase the quote for the glazing', proj('Replace the broken window'));
  stamp('after.set', unanchored, { after: chain[0]! });
  stamp('after.cleared', unanchored, {});

  // --- put down, and picked back up (1.32.0) --------------------------------
  //
  // The exit that is neither done nor deleted. One that stayed down and one that
  // came back, because the way back is the half that makes the verb usable and a
  // set with only the one-way case would exercise half the machinery.
  const putDown = node('action', 'Learn the tenor recorder');
  stamp('node.released', putDown, { at: day(-40) });
  const backUp = node('action', 'Repaint the hallway');
  stamp('node.released', backUp, { at: day(-60) });
  stamp('node.reclaimed', backUp, {});

  // --- capture, triage, and every route -------------------------------------
  //
  // An inbox with nothing in it teaches nothing, and the routes are where a
  // capture stops being a note and becomes a decision.
  const captures: NodeId[] = [];
  for (let i = 0; i < 24; i++) {
    const id = ctx.id();
    stamp('capture.recorded', id, { text: `${pick(STANDALONE)} (${pick(['from the post', 'off the noticeboard', 'somebody mentioned it', 'saw it in passing'])})`, source: 'sample' });
    captures.push(id);
  }
  const ROUTES: ClarifyRoute[] = ['do-now', 'next-action', 'waiting-for', 'someday', 'reference', 'trash'];
  for (let i = 0; i < ROUTES.length * 2; i++) {
    const id = captures[i]!;
    const route = ROUTES[i % ROUTES.length]!;
    stamp('heat.set', id, { heat: rand() < 0.5 ? 'hot' : 'cold' });
    stamp('clarify.routed', id, { route });
  }
  // One sorted and then unsorted again — the undo somebody actually takes.
  stamp('clarify.reopened', captures[1]!, { from: 'next-action' });
  // TWO do-nows that were actually timed, and they are REAL SPANS.
  //
  // It was one event whose start and end were the same instant, which is a span
  // of zero — dropped by the fold, since "between 0 minutes and 4h" says nothing
  // true about either end. So the set demonstrated the noun and nothing else,
  // and the surface that shows what a thing has taken had nothing to render.
  //
  // Two of them, minutes apart in length, so the sample shows a RANGE rather
  // than a single value — which is the whole point of the projection.
  const timedStart = Date.parse(day(-1)) - 120 * 60_000;
  stamp('do-now.timed', captures[0]!, {
    startedAt: new Date(timedStart).toISOString(),
    endedAt: new Date(timedStart + 25 * 60_000).toISOString(),
  });
  stamp('do-now.timed', captures[0]!, {
    startedAt: new Date(timedStart + 40 * 60_000).toISOString(),
    endedAt: new Date(timedStart + 95 * 60_000).toISOString(),
  });

  // --- bothers, all three ownerships ----------------------------------------
  //
  // `bother.received` IS the creation — there is no `node.created` in front of
  // it, and the gate refuses one (verified by running it). The three endings are
  // the three the flow actually writes, copied from `bother-intents.ts` rather
  // than invented: mine-to-solve becomes an ordinary action and enters triage,
  // mine-to-track parks for a week, and not-mine-to-carry declines and parks —
  // it does NOT go in the bin, which is the correction ADR-0056 made.
  const botherTexts = ['The noise from upstairs', 'The letter I have not opened', 'Whether the warranty still stands'];
  for (let i = 0; i < 3; i++) {
    const b = ctx.id();
    stamp('bother.received', b, { text: botherTexts[i]! });
    const own = (['mine-to-solve', 'mine-to-track', 'not-mine-to-carry'] as const)[i]!;
    stamp('bother.owned', b, { ownership: own });
    if (own === 'mine-to-solve') {
      stamp('bother.routed', b, { route: 'inbox' });
      stamp('node.kind.changed', b, { from: 'bother', to: 'action' });
    } else if (own === 'mine-to-track') {
      stamp('bother.routed', b, { park: true });
      stamp('park.set', b, { returnAt: day(7), reason: 'bother:mine-to-track' });
    } else {
      stamp('bother.routed', b, { park: true });
      stamp('request.declined', b, { person: null, what: botherTexts[i]!, reason: 'bother' });
      stamp('park.set', b, { returnAt: day(21), reason: 'not-now-ledger' });
    }
  }

  // --- requests declined, and one carried after all -------------------------
  stamp('request.slot.set', null, { recurrence: 'weekly:thu' });
  for (let i = 0; i < 28; i++) {
    // Past the ledger's cap of 25, so its true-count line is exercised.
    const r = node('action', `${pick(['Look at', 'Sit in on', 'Cover', 'Review'])} ${pick(['the rota', 'the draft', 'the handover', 'the spreadsheet'])} for someone`);
    clock(r, 'due', int(1, 30));
    stamp('request.declined', r, { person: people[i % people.length]!, what: 'a thing somebody asked for', reason: 'detail' });
    stamp('park.set', r, { returnAt: day(int(3, 40)), reason: 'not-now-ledger' });
  }
  const carried = node('action', 'Take the minutes on Thursday');
  clock(carried, 'due', 4);
  stamp('request.declined', carried, { person: people[3]!, what: 'Take the minutes', reason: 'detail' });
  stamp('park.set', carried, { returnAt: day(9), reason: 'not-now-ledger' });
  stamp('clock.cleared', carried, { clockKind: 'park' });   // carried after all

  // --- replan, the surface law 3 exists for ---------------------------------
  const replanned = node('action', 'Send the renewal back before it lapses');
  clock(replanned, 'due', -9);
  stamp('replan.resolved', replanned, { choice: 'new-date' });
  clock(replanned, 'due', 5);

  // WHEN THIS SAMPLE'S DAY ENDS (V2 stage 5). Midnight, stated rather than left
  // unsaid — the sample demonstrates the noun without moving the demonstration's
  // own day, so every date in the set reads exactly as it did before the
  // boundary existed. A sample that quietly ran on a 3am day would be showing
  // arithmetic nobody looking at it had chosen.
  stamp('day.boundary.set', null, { hour: 0 });

  // --- focus, interruption, and the resume card -----------------------------
  stamp('timer.length.set', null, { minutes: 25 });
  const focused = projects[6]!;
  stamp('focus.started', null, { node: focused });
  // `interrupt.captured` names its OWN new node — it is an inbox item, not a
  // note about the session (`focus-intents.ts`, and the fold sets kind and title
  // from it). With `node: null` the gate refuses the batch.
  stamp('interrupt.captured', ctx.id(), { text: 'The parcel came while I was in the middle of this', duringFocus: focused });
  stamp('focus.ended', null, { reason: 'interrupted' });
  const card = node('resume-card', 'Where you left off — the printer setup');
  stamp('resume.card.created', card, { forNode: focused, cue: 'the driver page was open' });
  clock(card, 'due', 1);
  const spentCard = node('resume-card', 'Where you left off — the insurance');
  stamp('resume.card.created', spentCard, { forNode: projects[2]!, cue: null });
  clock(spentCard, 'due', -1);
  stamp('resume.card.spent', spentCard, {});
  const lapsedCard = node('resume-card', 'Where you left off — the loft');
  stamp('resume.card.created', lapsedCard, { forNode: projects[1]!, cue: null });
  clock(lapsedCard, 'due', -3);
  stamp('resume.card.expired', lapsedCard, { toReviewQuestion: true });

  // --- the Menu: wanted, never owed ----------------------------------------
  //
  // Demand-free by law: nothing here carries a clock, and the gate refuses one.
  const wishes = WISHES.map((t, i) => {
    const id = node('aspiration', t);
    stamp('menu.item.added', id, { category: MENU_CATEGORIES[i % MENU_CATEGORIES.length]! });
    return id;
  });
  // The one category that carries numbers.
  const saveFor = node('aspiration', 'The good enlarger, second hand');
  stamp('menu.item.added', saveFor, { category: 'save-for' });
  stamp('save-for.updated', saveFor, { target: 450, saved: 180 });
  // Taken off the Menu, and one promoted into real work.
  //
  // The removed one gets NO clock, and the gate is why: it is still an
  // `aspiration`, which is demand-free, so a date on it is refused outright
  // (verified by running it). Coming off the Menu is not the same act as
  // becoming work — `menu.item.promoted` is, and it carries the new kind, which
  // is what makes a clock legal on the second one.
  stamp('menu.item.removed', wishes[0]!, { from: MENU_CATEGORIES[0]! });
  stamp('menu.item.promoted', wishes[1]!, { toKind: 'project' });
  clock(wishes[1]!, 'review', 10);

  // --- weight, and a day with less in it ------------------------------------
  stamp('capacity.declared', null, { level: 'low' });
  for (const w of WEIGHTS.slice(0, 3)) {
    const p = node('pebble', w);
    stamp('pebble.raised', p, { magnitude: pick(['pebble', 'rock', 'boulder'] as const), affects: [pick(projects)] });
  }
  const settled = node('pebble', WEIGHTS[3]!);
  stamp('pebble.raised', settled, { magnitude: 'rock', affects: [] });
  stamp('pebble.settled', settled, {});
  stamp('node.trashed', settled, { reason: 'pebble:settled' });

  // --- the journal, really sealed -------------------------------------------
  //
  // The salt goes in the LOG, because that is the only way the same passphrase
  // opens the same entries on a second device. Derived once: 600,000 iterations
  // is expensive on purpose.
  const salt = 'cXVpZXRrZWVwLXNhbXBsZS1zYWx0';        // fixed, so the set is reproducible
  stamp('journal.sealed', null, { salt, iterations: KDF_ITERATIONS });
  const key = await deriveKey(BIG_SAMPLE_PASSPHRASE, salt, KDF_ITERATIONS);
  for (const text of JOURNAL) {
    const j = node('journal', '');
    const sealed = await seal(key, { text });
    stamp('journal.entry.written', j, { v: sealed.v, iv: sealed.iv, ct: sealed.ct });
  }

  // --- duplicates, folded — including the case 1.9.2 was written for --------
  const dupA = node('action', 'Ring the surveyor back', proj('Get the survey done'));
  clock(dupA, 'due', 7);
  const dupB = node('action', 'Call the surveyor', proj('Get the survey done'));
  clock(dupB, 'due', 11);
  stamp('decision.logged', dupB, { text: 'Agreed the survey happens before the offer, not after', at: day(-6) });
  stamp('node.merged', dupB, { into: dupA });
  // Three deep, so the chain-following reader has something to follow.
  const dupC = node('action', 'Surveyor — ring back', proj('Get the survey done'));
  clock(dupC, 'due', 13);
  stamp('node.merged', dupC, { into: dupB });
  // And one folded then split back out, because unmerge has never had data.
  const dupD = node('action', 'Chase the surveyor’s invoice', proj('Get the survey done'));
  clock(dupD, 'due', 17);
  stamp('node.merged', dupD, { into: dupA });
  stamp('node.unmerged', dupD, {});

  // --- things let go, past the trash view's cap ----------------------------
  for (let i = 0; i < 27; i++) {
    const t = node('action', `${pick(STANDALONE)} — decided against`);
    clock(t, 'due', int(1, 20));
    stamp('node.trashed', t, { reason: 'let-go' });
  }
  const backAgain = node('action', 'Order the replacement filter');
  clock(backAgain, 'due', 8);
  stamp('node.trashed', backAgain, { reason: 'let-go' });
  stamp('node.untrashed', backAgain, {});

  // --- a bulk act, so the log can explain a pile ----------------------------
  stamp('range.acted', null, { scope: 'Everything under Household paperwork', verb: 'park', count: 6 });

  // --- the optional modules -------------------------------------------------
  stamp('module.enabled', null, { module: 'today' });
  stamp('module.enabled', null, { module: 'comms' });
  stamp('module.disabled', null, { module: 'comms' });

  // The comms sweep, as the app REALLY writes it — an upkeep node carrying a
  // field, not a kind of its own.
  //
  // The first version of this stamped `comms.sweep.scheduled` and
  // `comms.sweep.ran`, and `emitters:check` caught it: those two nouns are
  // recorded as unemitted and SUPERSEDED (ADR-0042 ships the sweep as
  // `COMMS_FIELD` on an upkeep, because it decays, completes and renders exactly
  // like one). A sample writing them would demonstrate a design the app
  // abandoned — a log asserting something this app cannot cause.
  const sweep = node('upkeep', 'a pass through your messages');
  stamp('node.field.set', sweep, { field: 'comms-sweep', value: true });
  stamp('upkeep.interval.set', sweep, { intervalDays: 1, comfortWindowDays: 1 });
  stamp('clock.set', sweep, { clockKind: 'review', at: day(1), source: 'comms:start' });
  stamp('done.marked', sweep, { at: day(-1) });

  // --- a named period, and one that has come round -------------------------
  //
  // `anchor` was this set's one node-kind exemption when the coverage gate
  // shipped in 1.16.0: an anchor was a silent node, so `admit` refused it and
  // the whole file would have been refused on import. 1.17.0 paid ADR-0057's
  // stated price (a gate change plus a shipped surface, in one release), and the
  // exemption came out.
  //
  // The firing carries the watermark, because a firing without one is the
  // degraded at-only cut `reportedBefore` exists to avoid — and a sample that
  // demonstrated the degraded path would teach the wrong thing.
  const staffCall = ctx.id();
  stamp('anchor.defined', staffCall, { name: 'the staff call', recurrence: 'Thursdays' });
  stamp('anchor.fired', null, { anchor: staffCall, at: day(-7), upToSeqByDevice: { [ctx.device]: 40 } });
  stamp('anchor.defined', ctx.id(), { name: 'the monthly catch-up', recurrence: '' });

  // --- Composed Today, last, and only for TODAY ----------------------------
  //
  // After `module.enabled`, because the strip does not render otherwise. And the
  // day it names can only be the day the reader is in: `composedFor` answers for
  // the current local day and nothing else (ADR-0051), so a choice stamped for
  // any other day is invisible by design — which means a set that stamped
  // yesterday's would silently demonstrate nothing.
  const today = localDayKey(nowIso, atMidnight(ctx.zone));
  for (const c of chain) stamp('today.chosen', c, { day: today });
  stamp('today.released', chain[2]!, { day: today });

  return out;
}

export interface BigSampleSummary {
  events: number;
  nodes: number;
}

/** Counted from the events, never from a number typed beside them — a
 *  hand-maintained count is a claim that goes stale the first time somebody adds
 *  a row (the `sampleSummary` rule, and for the same reason). */
export function bigSampleSummary(events: readonly AppEvent[]): BigSampleSummary {
  const nodes = new Set<string>();
  for (const e of events) {
    if (e.node === null) continue;
    if (e.kind === 'node.created' || e.kind === 'capture.recorded'
        || e.kind === 'person.created' || e.kind === 'context.created'
        || e.kind === 'role.created') {
      nodes.add(e.node);
    }
  }
  return { events: events.length, nodes: nodes.size };
}

/**
 * What to say beside the button, and it has to be honest about three things:
 * this is not your work, bringing it in REPLACES what is on the device, and the
 * way back is the copy you take first.
 */
export function bigSampleWords(s: BigSampleSummary): string {
  return `${s.nodes} invented things in ${s.events} records, dated around today, with something of every kind in it. ` +
    'It saves as a file. Bringing that file in replaces what is on this device — so take a copy of your own first, and bring that back when you are done looking. ' +
    `The journal in it opens with: ${BIG_SAMPLE_PASSPHRASE}`;
}
