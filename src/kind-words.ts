// WHAT A THING IS, IN WORDS A READER HAS (2.4.0, ADR-0094).
//
// Found on a device, on the work surface: nothing on a card said which KIND of
// thing it was — a project, a goal, an area and an ordinary next action all read
// as todos. That was exactly right, and it was true everywhere. The app has fourteen node kinds and
// **not one reader-facing word for any of them** — `kind` was a discriminator
// the code branched on and nothing else. A project with children showed "7 under
// it"; a project with none, a goal, an area and an outcome showed nothing at
// all, so every row in the list drew identically and the whole surface read as
// one long to-do list because that is what it looked like.
//
// ## Where the words come from
//
// Each one is the app's OWN existing copy wherever it already had some, quoted
// rather than invented. "Waiting for" is `clarify.ts`'s route label; "Upkeep" is
// its section heading; "Something on you" is the pebble form's label; "Where you
// left off" is the title `focus-intents.ts` writes onto a resume card. Inventing
// a second vocabulary for things the app already names is the app disagreeing
// with itself about its own words, which is the defect ADR-0089 records for the
// word *Menu*.
//
// ## `action` has no word, and that is the design
//
// It is the unmarked case. A to-do list row already reads as a thing to do, so
// stamping "Action" on several hundred of them adds a word per row and
// distinguishes nothing — and this is an app whose size gate exists because
// nobody was counting how much there is to read. The kinds that need naming are
// the ones a reader cannot tell apart from an action by looking, which is every
// other kind.
//
// ## Exhaustive by the TYPE, not by a test
//
// `Record<NodeKind, ...>` will not compile if a kind is added without words.
// That is the same shape `MENU_WORDS` uses for categories, and it is stronger
// than a test because it fails at the point the kind is added rather than at the
// point somebody runs the suite.

import type { NodeKind } from './events.ts';

/** What each kind is called where a person can see it, or null for the
 *  unmarked case. */
export const KIND_WORDS: Record<NodeKind, string | null> = {
  // The unmarked case — see above.
  action: null,

  // The containers (`tree.ts` CONTAINER_KINDS). These are the four the report
  // was about: they hold work rather than being work, and nothing said so.
  project: 'Project',
  outcome: 'Outcome',
  area: 'Area',
  goal: 'Goal',

  // `clarify.ts`'s own route label, to the letter — a thing routed as "Waiting
  // for" must not then describe itself with a different phrase.
  'waiting-for': 'Waiting for',
  // Its own section heading.
  upkeep: 'Upkeep',

  // The demand-free kinds (law 6). None of these is work, and each was
  // indistinguishable from work on a row.
  //
  // `aspiration` is "A wish" and NOT "On the Menu": being on the Menu is a
  // separate fact the sheet already states, and an aspiration can be taken off
  // the Menu and still be an aspiration. Naming the kind after the place it
  // usually sits would be wrong for exactly the case where the difference
  // matters.
  aspiration: 'A wish',
  // The pebble form's own label. "Pebble" is the app's word for the WEIGHT of
  // one of these ("a pebble / a rock / a boulder"), so using it for the kind as
  // well would make one word mean two things on the same screen.
  pebble: 'Something on you',
  person: 'Person',
  // "Since when" is where these are made, and each one names a period.
  anchor: 'A named period',
  // The entry itself, never its contents: a journal node carries no title by
  // construction, because a title would be plaintext in the log.
  journal: 'Journal entry',

  // A worry, in `bother.ts`'s own first line. Its flow asks whose it is before
  // it asks anything else, and calling it a task on a row pre-empts that.
  bother: 'A worry',
  // The title `focus-intents.ts` writes onto one.
  'resume-card': 'Where you left off',
  // Where work can be DONE, which is not a thing to do (ADR-0092).
  context: 'A place',
  // WHO work is for (2.6.0, ADR-0096). An identity that crosses areas, in the
  // reader's own noun — not "identity", which is diagnosis-adjacent copy this
  // app does not write, and not "hat", which is the cute register the voice
  // rules refuse.
  role: 'Role',
};

/** The reader's word for a kind, or null when there is deliberately none. */
export const kindWords = (kind: NodeKind): string | null => KIND_WORDS[kind] ?? null;

/** What the app already calls the moment a waiting-for is answered. It is
 *  `log-words.ts`'s own sentence for `waiting.closed` — *"It arrived."* — in the
 *  participle this slot takes, because every other word here is a noun phrase
 *  on a row and a sentence would read as one thing among labels. Quoted rather
 *  than invented, which is this file's rule. */
export const ARRIVED_WORD = 'Arrived';

/**
 * THE KIND'S WORD, EXCEPT WHERE A FACT ABOUT THE NODE HAS SUPERSEDED IT.
 *
 * A waiting-for whose answer has come back still read **Waiting for** on every
 * row, in the sheet and in the tree — the seventh cold read met it as a dead
 * end, and the structural assessment carried it as one of Phase 0's six. The
 * kind is right and must not change: `ADR-0040`'s *Arriving is not finishing*
 * says an arrival takes the thing off what you are owed, keeps its clock and
 * does not mark it done, because the signed form landing on your desk is the
 * moment the work becomes POSSIBLE rather than the moment it is over. So the
 * node stays a `waiting-for` and the WORD stops claiming somebody else still
 * has it.
 *
 * `waitingOutcome` is the fact, not `arrived` — that one is the importer's
 * latch for a row that came in with a file, and branching on it here would have
 * named every imported thing arrived. `waiting.opened` clears the outcome
 * (`fold.ts:1044`), so reopening a thread puts the word back with no second
 * rule to remember.
 *
 * STRUCTURAL PARAMETER ON PURPOSE. Taking `NodeState` would make this module
 * import `fold.ts`, and this file is PURE and is imported by three surfaces and
 * a projection. The two fields it reads are the whole of what it needs.
 *
 * The sheet's `sorted as` line is deliberately left alone: its duplicate check
 * compares against the KIND's word, so a row reading **Arrived** now also says
 * **sorted as waiting for**, which is two different true facts rather than one
 * said twice — the case that line's own comment says it earns its keep for.
 */
export const nodeWords = (
  n: { kind: NodeKind; waitingOutcome: string | null },
): string | null => (
  n.kind === 'waiting-for' && n.waitingOutcome ? ARRIVED_WORD : kindWords(n.kind)
);
