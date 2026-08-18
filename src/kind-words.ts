// WHAT A THING IS, IN WORDS A READER HAS (2.4.0, ADR-0094).
//
// Reported from a device, looking at the work surface: *"nothing indicates that
// some of these are projects or goals or anything other than todos"*. That was
// exactly right, and it was true everywhere. The app has fourteen node kinds and
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
