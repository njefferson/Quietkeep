// Bringing work in from another planner (OmniFocus and anything TaskPaper-shaped).
//
// The requirement: import an OmniFocus export and test at real scale.
//
// ## Why TaskPaper and not the archive
//
// OmniFocus exports several ways. `.ofocus-archive` is a bundle of zipped XML
// transaction files — the richest and by far the most brittle, and parsing somebody
// else's private sync format is a maintenance promise this project should not make.
// **TaskPaper is a line format**: indentation is hierarchy, `@tags` carry the
// metadata, and it is plain text a person can read and correct before importing.
// OmniFocus writes it natively (Export, or Copy as TaskPaper), and so do Things,
// Taskpaper.app, Bike, and a dozen others — so one parser serves everybody rather
// than one vendor.
//
// It is also the format that FAILS HONESTLY. A malformed XML bundle produces a
// stack trace; a malformed line produces one line somebody can look at.
//
// ## What maps, and what deliberately does not
//
// - a `Project:` line becomes a **project**, and its indented children are parented
//   to it — the containment a flat list cannot express, which is the main reason
//   importing at scale is worth doing at all;
// - `- an action` becomes an **action**;
// - `@due(2026-08-05)` becomes a **`due` clock** — a date somebody chose, so it is
//   one of the few kinds a calendar may carry (`CALENDAR_KINDS`);
// - `@defer(...)` / `@start(...)` becomes a **`start` clock**;
// - `@done` / `@done(date)` becomes **`done.marked`**;
// - `@flagged` becomes **HEAT** (2.34.0), reversing a decision that stood from
//   the first importer. It used to be dropped, on the reasoning that a flag is a
//   priority mark and this app has no priority field — which is still true, and
//   is not the whole argument. The rest of it: reading somebody's own deliberate
//   mark and discarding it is not neutrality, it is a decision to lose data, and
//   it is the SAME argument this file already makes about carrying tags.
//   Heat is where it belongs and nowhere else would do. It is a two-state fact
//   the reader stated, it breaks a tie only INSIDE one tier of the offer, it can
//   never accumulate into a score, and the card says it out loud rather than
//   silently reordering anything (ADR-0097). So the distinction survives the
//   move and the refusal of ranking-on-importance is untouched.
//   Recording it as a clock would still be inventing a demand nobody made.
// - `@estimate`, `@context`, `@tags` other than the above are dropped for now, and
//   the importer SAYS SO rather than quietly discarding them.
// - **notes are carried** (1.4.0) — TaskPaper note lines attach to the item
//   above them (consecutive lines join as one note; a leading note with no item
//   to belong to is dropped and not counted), and the CSV Notes column lands in
//   full. Both ride `node.field.set{field:'note'}` right after the row's
//   creation. History: the first importer dropped every note silently (audit —
//   a 1,445-row import lost every body with the summary reporting zero); 1.2.3
//   stated the loss; this carries them.
//
// ## Dates
//
// TaskPaper dates are local wall-clock, usually `YYYY-MM-DD` and sometimes with a
// time. They are converted with `endOfDayKey` in the reader's zone, so a due date
// imported from another planner lands on the same DAY it displayed there — not
// shifted by however many hours separate that planner's idea of midnight from UTC.
//
// PURE. No store, no clock of its own, no DOM.

import type { AppEvent } from './events.ts';
import { cleanNote } from './note.ts';
import { endOfLocalDay, isValidIso, localDayKey, localParts, utcMs, atMidnight} from './time.ts';

export interface ImportContext {
  at: string;
  device: string;
  vault: string;
  zone: string;
  seq: () => number;
  id: () => string;
}

/** One line, understood. Exported because the tests assert the PARSE separately
 *  from the event mapping — two stages, two failure modes, told apart. */
export interface TaskLine {
  /** Indentation depth in levels, tabs or runs of spaces. */
  depth: number;
  kind: 'project' | 'action' | 'note';
  title: string;
  /** `YYYY-MM-DD`, already validated as a real calendar date. */
  due: string | null;
  start: string | null;
  done: boolean;
  /** Tags present that this app deliberately does not carry. */
  dropped: string[];
  /** Tags that ARE carried, as places, in the words they were written in
   *  (2.33.0). OmniFocus tags are its context system, so this is where a
   *  store's whole situational vocabulary lives — see the header. */
  tags: string[];
  /** `@estimate(30m)` in minutes, or null. Their own word about how long
   *  something takes, which is exactly what `estimate.recorded` holds. */
  estimateMinutes: number | null;
  /** Flagged in the other planner (2.34.0). Carried as HEAT, never as a
   *  priority — see the header. */
  flagged: boolean;
  /** A parent named EXPLICITLY rather than by indentation. OmniFocus CSV has a
   *  "Project" column instead of nesting, and rows can arrive before the project
   *  they belong to — so a name is resolved by lookup, and a project named by a
   *  child but never listed itself is created rather than dropped. */
  parentName?: string;
  /** CSV only: the row's Notes value, kept in full (1.4.0). TaskPaper notes
   *  arrive as their own `kind: 'note'` lines instead, text in `title`. */
  note?: string;
}

export interface ImportSummary {
  projects: number;
  actions: number;
  notes: number;
  done: number;
  withDates: number;
  /** Tag names seen but not carried, deduplicated and sorted. */
  droppedTags: string[];
  /** Lines that could not be understood at all, with their text kept so somebody
   *  can go and look rather than being told a number. */
  unreadable: string[];
  /** Dates that had already gone by at the moment of import, and therefore did NOT
   *  come across as dates. Counted so the summary can say so plainly. */
  staleDates: number;
  /** Distinct places that came across, and how many things carry at least one
   *  (2.33.0). Both, because "twelve places" and "nine hundred things placed"
   *  answer different questions and a store can have a lot of one and little of
   *  the other. */
  places: number;
  placed: number;
  /** Things that arrived with their own estimate of how long they take. */
  estimates: number;
  /** Things flagged in the other planner, arriving hot (2.34.0). */
  flagged: number;
  /** Rows whose repeat/rhythm was dropped-and-named. COUNTED (1.8.0): the bare
   *  tag list said "repeat" once for a file where sixty things repeat — the
   *  same unnumbered-loss shape as the pre-1.4.0 note bug. Rebuilding real
   *  rhythms as upkeep is a guided act only if the number is stated. */
  repeats: number;
}

const TAG = /@([A-Za-z][A-Za-z0-9_-]*)(?:\(([^)]*)\))?/g;

/** Tag names that are NOT places, and must never become one.
 *
 *  `flagged` is a priority mark and this app has no priority field (see the
 *  header). `repeat` is counted and reported separately, because rhythms are
 *  not carried and the number matters. Everything else a person typed is their
 *  own word for where or how work gets done, which is what a context IS. */
const NOT_A_PLACE = new Set(['repeat', 'repeatrule', 'estimate', 'estimated', 'duration']);

/** Tag names that CARRY the place in their value rather than being one.
 *
 *  `@context(Office)` is the older OmniFocus spelling and `@tags(Errands, Phone)`
 *  appears in exports and converters. The first version of this read the NAME in
 *  both cases and created a place called "context" — a bucket holding everything,
 *  under a word nobody typed. Found by reading the regex against a real store's
 *  report an hour after it shipped; the test that should have caught it asserted
 *  only what was DROPPED and never what was kept. */
const PLACE_IS_THE_VALUE = new Set(['context', 'contexts', 'tag', 'tags']);

/**
 * `@estimate(30m)` as minutes.
 *
 * The shapes that actually appear: `30m`, `1h`, `1.5h`, `90`, `1h30m`. A value
 * that is not one of those is left alone and the tag falls through to `dropped`,
 * because a guessed duration is worse than an absent one — `estimateOf` refuses
 * a non-positive value for the same reason.
 */
export function minutesOf(value: string | undefined): number | null {
  if (value === undefined) return null;
  const v = value.trim().toLowerCase();
  if (v === '') return null;
  const hm = /^(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?$/.exec(v);
  if (hm) {
    const mins = Math.round(Number(hm[1]) * 60 + Number(hm[2] ?? 0));
    return Number.isFinite(mins) && mins > 0 ? mins : null;
  }
  const m = /^(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?$/.exec(v);
  if (m) {
    const mins = Math.round(Number(m[1]));
    return Number.isFinite(mins) && mins > 0 ? mins : null;
  }
  const bare = /^(\d+(?:\.\d+)?)$/.exec(v);
  if (bare) {
    const mins = Math.round(Number(bare[1]));
    return Number.isFinite(mins) && mins > 0 ? mins : null;
  }
  return null;
}

/** A real calendar date, not merely date-shaped: `2026-02-31` is refused. */
export function isCalendarDay(text: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  // utcMs, not raw Date.UTC: with the two-digit-year trap the probe for a year
  // below 100 lands in the 1900s and a REAL day gets refused as unreal.
  const probe = new Date(utcMs(y, mo, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === mo - 1 && probe.getUTCDate() === d;
}

/** The day part of a TaskPaper date value, or null. Accepts `2026-08-05`,
 *  `2026-08-05 17:00` and `2026-08-05T17:00`, because all three appear in the
 *  wild and the DAY is the only part this app keeps. */
const dayOf = (value: string | undefined): string | null => {
  if (value === undefined) return null;
  const first = value.trim().split(/[T\s]/)[0] ?? '';
  return isCalendarDay(first) ? first : null;
};

/** How deep a line sits. A tab is one level; so is every two spaces, which is what
 *  OmniFocus writes when the preference says spaces. Mixed files happen and both
 *  have to count, or a whole subtree silently flattens. */
export function depthOf(line: string): number {
  let depth = 0;
  let spaces = 0;
  for (const ch of line) {
    if (ch === '\t') { depth++; spaces = 0; continue; }
    if (ch === ' ') { spaces++; if (spaces === 2) { depth++; spaces = 0; } continue; }
    break;
  }
  return depth;
}

/**
 * Parse TaskPaper text into lines.
 *
 * Never throws. A file from another application is INPUT, and the whole point of
 * choosing a text format was that one bad line costs one line.
 */
export function parseTaskPaper(text: string): { lines: TaskLine[]; unreadable: string[] } {
  const lines: TaskLine[] = [];
  const unreadable: string[] = [];

  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '') continue;
    const depth = depthOf(raw);
    const body = raw.replace(/^[\t ]+/, '');

    const dropped: string[] = [];
    const tags: string[] = [];
    let due: string | null = null;
    let start: string | null = null;
    let done = false;
    let flagged = false;
    let estimateMinutes: number | null = null;
    for (const m of body.matchAll(TAG)) {
      const raw = m[1] ?? '';
      const name = raw.toLowerCase();
      const value = m[2];
      if (name === 'due') { due = dayOf(value); if (due === null && value !== undefined) dropped.push('due'); continue; }
      if (name === 'defer' || name === 'start') {
        start = dayOf(value);
        if (start === null && value !== undefined) dropped.push(name);
        continue;
      }
      if (name === 'done' || name === 'completed') { done = true; continue; }
      if (name === 'flagged') { flagged = true; continue; }
      if (name === 'estimate' || name === 'estimated' || name === 'duration') {
        const mins = minutesOf(value);
        if (mins === null) dropped.push(name);
        else estimateMinutes = mins;
        continue;
      }
      // A PLACE, IN THE WORDS IT WAS WRITTEN IN (2.33.0).
      //
      // This branch used to be `dropped.push(name)` for everything left, and
      // the header said so — "@context, @tags other than the above are dropped
      // for now". For a store that came out of OmniFocus that is the whole
      // situational vocabulary: tags ARE contexts there, and places, and people.
      // A 1,432-item import arrived carrying ONE context because of this line.
      //
      // Carrying it is not the inference `docs/nd-collisions.md` entry 23
      // refuses — that refusal is about deducing a place from BEHAVIOUR. This is
      // the person's own word, typed by them, in the system they typed it in,
      // which is exactly what entry 24 says a context node is for.
      //
      // The raw name, not the lowercased one: `@Errands` is how they wrote it.
      if (NOT_A_PLACE.has(name)) { dropped.push(name); continue; }
      if (PLACE_IS_THE_VALUE.has(name)) {
        // Several places in one value is the ordinary case for `@tags(...)`.
        for (const one of (value ?? '').split(/[,;]/).map(t => t.trim()).filter(t => t !== '')) {
          if (!tags.includes(one)) tags.push(one);
        }
        // A bare `@context` with nothing in it names nothing, and inventing a
        // place from an empty value would be the guess this must not make.
        if ((value ?? '').trim() === '') dropped.push(name);
        continue;
      }
      if (!tags.includes(raw)) tags.push(raw);
    }

    const title = body
      .replace(TAG, '')
      .replace(/^\s*-\s*/, '')
      .replace(/:\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (title === '') {
      // A line that is nothing but tags. Kept as unreadable rather than creating
      // an untitled node, because a planner full of "(untitled)" is worse than a
      // planner that told you about six lines it could not use.
      unreadable.push(raw.trim());
      continue;
    }

    // A project line ends with a colon BEFORE the tags are stripped. Checking
    // after stripping would make "Ship it: @due(...)" look like an action.
    const isProject = /:\s*(@[^\s]+\s*)*$/.test(body.trimEnd()) && !/^\s*-\s/.test(body);
    const isAction = /^\s*-\s/.test(body);
    lines.push({
      depth,
      kind: isProject ? 'project' : isAction ? 'action' : 'note',
      title, due, start, done, flagged, dropped, tags, estimateMinutes,
    });
  }
  return { lines, unreadable };
}

/**
 * Lines to events.
 *
 * Every node lands legally: it either carries a date somebody set, or it is
 * parented to something that does, or — failing both — it gets nothing here and
 * the gate cures it at creation exactly as a typed capture is cured. That last
 * case is why this does not need to invent clocks: the write boundary already has
 * a correct answer for "no clock yet", and inventing a different one here would
 * put two rules in the app for the same question.
 */
/**
 * Has this day already gone, in the reader's own zone?
 *
 * One definition, used by both the mapper and the summary, because they must agree
 * about every single row — a count that disagreed with what was written would be a
 * summary describing a different import.
 */
export const isPastDay = (day: string, nowIso: string, zone: string): boolean =>
  day < localDayKey(nowIso, atMidnight(zone));

export function taskPaperEvents(
  ctx: ImportContext,
  parsed: readonly TaskLine[],
): AppEvent[] {
  const out: AppEvent[] = [];
  const stamp = (kind: string, node: string | null, payload: unknown): void => {
    out.push({
      id: ctx.id(), vault: ctx.vault, at: ctx.at, device: ctx.device, seq: ctx.seq(),
      kind, node, payload,
    } as unknown as AppEvent);
  };

  /** Depth -> the id of the most recent CONTAINER at that depth. A note or an
   *  action never becomes a parent, so a child of an action attaches to that
   *  action's own parent instead of dangling. */
  const containerAt = new Map<number, string>();
  /** Project title -> id, for the CSV shape where a parent is NAMED rather than
   *  nested, and can be named by a child before it is listed itself. */
  const projectByTitle = new Map<string, string>();

  /** Place name -> id, created once and reused (2.33.0).
   *
   *  Matched case-insensitively but CREATED in the words it was first written
   *  in: `@errands` and `@Errands` are one place to a reader, and making two
   *  would put the same word twice in the chooser and split the work between
   *  them. `allContexts` sorts by title, so the duplicate would not even sit
   *  beside itself. */
  const contextByName = new Map<string, string>();
  const ensureContext = (name: string): string => {
    const key = name.toLowerCase();
    const found = contextByName.get(key);
    if (found !== undefined) return found;
    const id = ctx.id();
    stamp('context.created', id, { name });
    contextByName.set(key, id);
    return id;
  };

  /** A project named by a child but never listed. Created rather than dropped:
   *  the alternative is silently reparenting somebody's task to nothing, which is
   *  how an import loses structure without losing rows and nobody notices. */
  const ensureProject = (title: string): string => {
    const found = projectByTitle.get(title);
    if (found !== undefined) return found;
    const id = ctx.id();
    stamp('node.created', id, { nodeKind: 'project', title, provenance: { for: 'self' } });
    projectByTitle.set(title, id);
    return id;
  };

  /** The most recent item CREATED (or re-met), so a TaskPaper note line —
   *  which belongs to the item above it by position, the only association the
   *  format has — knows what it is a note ON. Consecutive note lines are ONE
   *  note joined with newlines, emitted as a single `node.field.set`: two
   *  events would be per-field LWW overwriting itself, keeping only the last
   *  line. A note line before any item has nothing to belong to and is
   *  dropped; the summary counts only what actually attaches. */
  let lastItemId: string | null = null;
  let noteBuf: string[] = [];
  const flushNote = (): void => {
    if (lastItemId !== null && noteBuf.length > 0) {
      const value = cleanNote(noteBuf.join('\n'));
      if (value !== '') stamp('node.field.set', lastItemId, { field: 'note', value });
    }
    noteBuf = [];
  };

  for (const line of parsed) {
    // ALREADY FINISHED SOMEWHERE ELSE, AND NOT BROUGHT IN (2.34.1).
    //
    // A real export carried 216 completed rows into a store of 1,429 — fifteen
    // per cent of the pile, finished, sitting in the count of what somebody
    // believes they are carrying. Importing them imports HISTORY, and this app
    // is not where somebody else's history goes: the record of what happened
    // lives in the log of the app it happened in, and that file still exists.
    //
    // NOT SILENT. `importSummary` counts them and `importWords` says the number
    // BEFORE the button is pressed — which is the difference between a decision
    // stated at the door and a loss discovered later. That is the whole
    // complaint about how flags used to be handled, and it is not repeated here.
    //
    // A finished PROJECT is skipped with the rest, and its children ride the
    // ordinary parent rule: an indented child of a skipped container falls back
    // to the nearest container above it, exactly as it would if the line had not
    // been in the file. Nothing dangles, because `containerAt` is only written
    // by lines that are actually created.
    if (line.done) continue;
    if (line.kind === 'note') {
      if (lastItemId !== null) noteBuf.push(line.title);
      continue;
    }
    flushNote();

    // Named parent wins over indentation: a CSV row states its project outright,
    // and guessing from a synthesised depth would be inventing a fact.
    let parent: string | undefined;
    if (line.parentName !== undefined && line.parentName !== '') {
      parent = ensureProject(line.parentName);
    } else {
      for (let d = line.depth - 1; d >= 0; d--) {
        const candidate = containerAt.get(d);
        if (candidate !== undefined) { parent = candidate; break; }
      }
    }
    const id = line.kind === 'project' && projectByTitle.has(line.title)
      // Already created as somebody's named parent — do not make a second one.
      ? projectByTitle.get(line.title)!
      : ctx.id();
    const alreadyThere = line.kind === 'project' && projectByTitle.has(line.title);

    // Does anything the file said about WHEN survive the past-date rule below?
    // Computed here because `node.created` is stamped before the clocks are,
    // and the answer decides whether this row lands in the inbox.
    const keepsADate =
      (line.due !== null && !isPastDay(line.due, ctx.at, ctx.zone))
      || (line.start !== null && !isPastDay(line.start, ctx.at, ctx.zone));

    if (!alreadyThere) {
      stamp('node.created', id, {
        nodeKind: line.kind === 'project' ? 'project' : 'action',
        title: line.title,
        provenance: { for: 'self' },
        ...(parent === undefined ? {} : { parent }),
        // ONLY A ROW THAT ARRIVES WITH NOTHING TO GO ON. `arrived` puts a row
        // in the inbox so the offer can hand it over one at a time — and a row
        // that kept a real future date needs none of that: it already carries a
        // clock, is already covered, and already reaches the offer through
        // `hard-date` or `ready`. Marking it too took it OFF THE CALENDAR,
        // because an unsorted inbox item is not a dated commitment, which a
        // test caught before this shipped.
        //
        // A project is excluded for a different reason: it is a container, and
        // offering one is the alignment theatre `docs/horizon-models.md`
        // refuses by name.
        ...(line.kind === 'project' || keepsADate ? {} : { arrived: true as const }),
      });
    }
    lastItemId = id;

    // A CSV row carries its note ON the line; TaskPaper notes arrive as the
    // following note-lines and land through flushNote instead.
    if (line.note !== undefined) {
      const value = cleanNote(line.note);
      if (value !== '') stamp('node.field.set', id, { field: 'note', value });
    }

    // THE PLACES THEY WROTE, ATTACHED (2.33.0). On projects as well as actions:
    // a place on a container reaches everything inside it (`placesReaching`), so
    // one tag on a project is worth more here than the same tag on each of its
    // children — and OmniFocus tags projects routinely.
    for (const tag of line.tags) {
      const cid = ensureContext(tag);
      stamp('context.attached', id, { node: id, context: cid });
    }
    // Their own word about how long, which is what `fitsWithin` reads. `guess`
    // and not `prior`: it came from a field somebody filled in, not from this
    // app watching them finish anything.
    if (line.estimateMinutes !== null) {
      stamp('estimate.recorded', id, { durationMinutes: line.estimateMinutes, basis: 'guess' });
    }
    // A FLAG IS HEAT (2.34.0). Not a priority — see the header for why heat is
    // the only place it could go and why that leaves the no-ranking rule alone.
    // Never on a project: heat informs which candidate fills one slot of the
    // offer, and a container is not offered.
    if (line.flagged && line.kind !== 'project') stamp('heat.set', id, { heat: 'hot' });

    if (line.kind === 'project') {
      projectByTitle.set(line.title, id);
      containerAt.set(line.depth, id);
      // Anything deeper than this belongs to it, not to a sibling it replaced.
      for (const d of [...containerAt.keys()]) if (d > line.depth) containerAt.delete(d);
    }

    // A date from another planner is a date somebody CHOSE, which is why it lands
    // as `due` and is therefore one a calendar may carry.
    //
    // **Unless it has already gone.** A real OmniFocus export carried 1,173 due
    // dates and EVERY ONE of them was in the past — the earliest from June 2019.
    // Imported as due dates they became 1,173 things needing a new plan on the
    // morning of the import: seven years of residue arriving as today's demands.
    //
    // A date that passed years ago in another planner is not a commitment somebody
    // is carrying, it is a record of one they did not keep, and manufacturing a
    // fresh obligation from it is the same mistake as putting the app's own clocks
    // in a calendar. So the day is DROPPED and the row arrives without one; the
    // gate cures it like any dateless thing, and the summary says how many and why.
    // The alternative — importing them and hiding the wall behind a cap — would
    // leave the app quietly asserting a thousand demands nobody made today.
    if (line.due !== null && !isPastDay(line.due, ctx.at, ctx.zone)) {
      stamp('clock.set', id, { clockKind: 'due', at: dayToInstant(line.due, ctx.zone), source: 'import:taskpaper' });
    }
    if (line.start !== null && !isPastDay(line.start, ctx.at, ctx.zone)) {
      stamp('clock.set', id, { clockKind: 'start', at: dayToInstant(line.start, ctx.zone), source: 'import:taskpaper' });
    }
    if (line.done) stamp('done.marked', id, { at: ctx.at });
  }
  flushNote();
  return out;
}

/**
 * A calendar day to the end-of-local-day instant this app stores.
 *
 * Via `endOfLocalDay` on a midday anchor rather than by string surgery, so the
 * result is the same instant the app would have produced had somebody typed the
 * date in — one definition of "the end of that day", not two.
 */
function dayToInstant(day: string, zone: string): string {
  const anchor = `${day}T12:00:00.000Z`;
  if (!isValidIso(anchor)) return anchor;
  // Midday UTC can be the previous or next local day at the extremes, so the
  // offset is measured and corrected rather than assumed.
  const p = localParts(anchor, zone);
  const drift = utcMs(p.year, p.month, p.day) - utcMs(
    Number(day.slice(0, 4)), Number(day.slice(5, 7)), Number(day.slice(8, 10)));
  const corrected = new Date(Date.parse(anchor) - drift).toISOString();
  return endOfLocalDay(corrected, atMidnight(zone), 0);
}

// --- CSV, because OmniFocus exports that too ---------------------------------
//
// One tolerant reader rather than a second importer: the columns are found BY
// HEADER NAME, case- and space-insensitively, so a version that renames "Due Date"
// to "Due" or reorders the file still works. A positional reader would break on the
// next OmniFocus update, silently, by reading dates out of the notes column.

/** RFC 4180 enough: quoted fields, doubled quotes inside them, newlines inside
 *  quotes. Written out because a naive `split(',')` mangles every note containing
 *  a comma, which is most of them. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; continue; }
        quoted = false;
        continue;
      }
      field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const norm = (h: string): string => h.toLowerCase().replace(/[^a-z]/g, '');

/** Header name to index, by normalised name, first match wins. */
function columns(header: readonly string[]): Map<string, number> {
  const at = new Map<string, number>();
  header.forEach((h, i) => { const k = norm(h); if (!at.has(k)) at.set(k, i); });
  return at;
}

const pick = (row: readonly string[], at: Map<string, number>, ...names: string[]): string => {
  for (const n of names) {
    const i = at.get(norm(n));
    if (i !== undefined && (row[i] ?? '').trim() !== '') return (row[i] ?? '').trim();
  }
  return '';
};

/** OmniFocus-shaped CSV to the same lines TaskPaper produces. */
export function parseOmniFocusCsv(text: string): { lines: TaskLine[]; unreadable: string[] } {
  const rows = parseCsv(text);
  const unreadable: string[] = [];
  if (rows.length < 2) return { lines: [], unreadable: rows.map(r => r.join(',')) };
  const at = columns(rows[0]!);
  const lines: TaskLine[] = [];

  for (const row of rows.slice(1)) {
    const title = pick(row, at, 'Name', 'Title', 'Task');
    if (title === '') { unreadable.push(row.join(',')); continue; }
    const type = pick(row, at, 'Type').toLowerCase();
    const status = pick(row, at, 'Status').toLowerCase();
    const projectName = pick(row, at, 'Project', 'Parent');
    const due = dayOf(pick(row, at, 'Due Date', 'Due'));
    const start = dayOf(pick(row, at, 'Defer Date', 'Start Date', 'Defer', 'Start'));
    const completion = pick(row, at, 'Completion Date', 'Completed');
    const dropped: string[] = [];
    // TRUE, 1, YES — because this column is not one format (2.34.0). A real
    // OmniFocus CSV export writes `1` and `0`, and the check for the string
    // "true" matched none of it: three flagged rows were neither carried NOR
    // reported as dropped, so the summary said nothing about them at all.
    const flagged = ['true', '1', 'yes'].includes(pick(row, at, 'Flagged').toLowerCase());
    if (pick(row, at, 'Repeat') !== '') dropped.push(norm('Repeat'));

    // THE SAME CARRY AS THE TAG PATH (2.33.0), because the same person's same
    // labels arrive through whichever door they exported by. These two columns
    // were read only to be named in the "will not come with them" list.
    //
    // OmniFocus writes several tags into one cell; comma and semicolon are both
    // seen in the wild, and a tag can contain a space, so the split is on the
    // separators rather than on whitespace.
    const tags = pick(row, at, 'Tags', 'Context', 'Contexts')
      .split(/[,;]/).map(t => t.trim()).filter(t => t !== '');
    const estimateMinutes = minutesOf(pick(row, at, 'Estimated Minutes', 'Duration', 'Estimate'));
    if (estimateMinutes === null && pick(row, at, 'Estimated Minutes', 'Duration', 'Estimate') !== '') {
      dropped.push(norm('Estimated Minutes'));
    }

    const isProject = type === 'project' || (type === '' && projectName === '' && due === null);
    lines.push({
      depth: isProject ? 0 : 1,
      kind: isProject ? 'project' : 'action',
      title, due, start,
      done: completion !== '' || status === 'completed' || status === 'done',
      dropped, tags, estimateMinutes, flagged,
      // Only for non-projects, and only when named — a project claiming itself as
      // its own parent would be a cycle the write boundary would rightly refuse.
      ...(isProject || projectName === '' || projectName === title ? {} : { parentName: projectName }),
      // Carried in full (1.4.0) — an earlier version read this cell and threw
      // it away, losing every note in a 1,445-row export with the summary
      // implying nothing was there (audit).
      ...(pick(row, at, 'Notes', 'Note') !== '' ? { note: pick(row, at, 'Notes', 'Note') } : {}),
    });
  }
  return { lines, unreadable };
}

/**
 * Read whichever of the two it is.
 *
 * Sniffed from the CONTENT, not from the filename: a file renamed on the way out of
 * one app and into another is the normal case, and refusing a good file because its
 * extension is wrong is the sort of pedantry that makes people give up.
 */
export function parseAnyExport(text: string): { lines: TaskLine[]; unreadable: string[]; format: 'taskpaper' | 'csv' } {
  const first = text.split(/\r?\n/).find(l => l.trim() !== '') ?? '';
  const looksCsv = first.includes(',')
    && ['name', 'title', 'task'].some(n => columns(parseCsv(first)[0] ?? []).has(n));
  return looksCsv
    ? { ...parseOmniFocusCsv(text), format: 'csv' }
    : { ...parseTaskPaper(text), format: 'taskpaper' };
}

/** What arrived, counted from the parse rather than from the events — the two are
 *  different questions and reporting one as the other is how a summary starts
 *  lying about a file. */
export function importSummary(
  parsed: readonly TaskLine[],
  unreadable: readonly string[],
  nowIso?: string,
  zone?: string,
): ImportSummary {
  const tags = new Set<string>();
  for (const l of parsed) for (const t of l.dropped) tags.add(t);
  const repeats = parsed.filter(l => l.dropped.some(t => t === 'repeat' || t === 'repeatrule')).length;
  const gone = (d: string | null): boolean =>
    d !== null && nowIso !== undefined && zone !== undefined && isPastDay(d, nowIso, zone);
  const live = (l: TaskLine): boolean =>
    (l.due !== null && !gone(l.due)) || (l.start !== null && !gone(l.start));
  const placeNames = new Set<string>();
  for (const l of parsed) for (const t of l.tags) placeNames.add(t.toLowerCase());
  return {
    places: placeNames.size,
    placed: parsed.filter(l => l.tags.length > 0).length,
    estimates: parsed.filter(l => l.estimateMinutes !== null).length,
    flagged: parsed.filter(l => l.flagged && l.kind !== 'project' && !l.done).length,
    // WHAT ARRIVES, not what the file held (2.34.1). Finished rows are no
    // longer brought in, so counting them here would promise a pile that never
    // turns up — the same shape as the note count being of notes that ATTACH.
    projects: parsed.filter(l => l.kind === 'project' && !l.done).length,
    actions: parsed.filter(l => l.kind === 'action' && !l.done).length,
    // Notes that actually ATTACH (1.4.0), counted the way the mapper WRITES
    // them (1.17.4): consecutive TaskPaper note lines are joined into ONE
    // `node.field.set`, so this used to count LINES and claim "3 notes come
    // across" for a single three-line note. This is the mapper's own walk —
    // buffer a run while an item exists to attach to, count the run when it
    // would flush non-empty — restated over the parse, so the number and the
    // events agree by construction. CSV rows still carry their note on the
    // line, one each, through the same `cleanNote` non-empty rule.
    notes: (() => {
      let count = parsed.filter(l => l.note !== undefined && cleanNote(l.note) !== '').length;
      let met = false;
      let run: string[] = [];
      const flush = (): void => {
        if (met && run.length > 0 && cleanNote(run.join('\n')) !== '') count++;
        run = [];
      };
      for (const l of parsed) {
        if (l.kind === 'note') { if (met) run.push(l.title); continue; }
        flush();
        met = true;
      }
      flush();
      return count;
    })(),
    done: parsed.filter(l => l.done).length,
    // Only dates that actually came across, so this number and the store agree.
    withDates: parsed.filter(live).length,
    droppedTags: [...tags].sort(),
    unreadable: [...unreadable],
    staleDates: parsed.filter(l => gone(l.due) || gone(l.start)).length,
    repeats,
  };
}

/**
 * What to say about it, before anything is written.
 *
 * States what came, what did NOT come, and what could not be read — all three,
 * because an importer that reports only its successes is how somebody discovers a
 * year later that half a planner never arrived.
 */
export function importWords(s: ImportSummary): string {
  const bits: string[] = [];
  if (s.projects > 0) bits.push(s.projects === 1 ? '1 project' : `${s.projects} projects`);
  if (s.actions > 0) bits.push(s.actions === 1 ? '1 action' : `${s.actions} actions`);
  if (bits.length === 0) return 'Nothing in that file could be read as work. Nothing has been changed.';

  const parts = [`Found ${bits.join(' and ')}`];
  if (s.withDates > 0) parts.push(`${s.withDates} with a date`);
  let out = `${parts.join(', ')}.`;
  if (s.done > 0) {
    // ITS OWN SENTENCE, because it changed meaning (2.34.1). It used to be a
    // clause inside the count — "1385 actions, 215 already finished" — which
    // read as "and these are coming too". They are not brought in at all now,
    // and a number that quietly means the opposite of what it did is worse than
    // a new sentence.
    out += ` ${s.done === 1 ? 'One was' : `${s.done} were`} already finished and`
      + ` ${s.done === 1 ? 'is' : 'are'} not brought in — that history stays in`
      + ' the app it happened in, and the file still has it.';
  }
  if (s.notes > 0) {
    // Inverted at 1.4.0: notes come across now. The 1.2.3 version of this
    // sentence stated the loss; before that, a silent zero cost a 1,445-row
    // import every note it had (audit). The count is of notes that ATTACH.
    out += ` ${s.notes === 1 ? 'One note comes' : `${s.notes} notes come`} across with ${s.notes === 1 ? 'its item' : 'their items'}, readable on each item's own sheet.`;
  }
  if (s.staleDates > 0) {
    // Said in full, because it is the single most surprising thing about importing
    // a long-running planner and somebody will otherwise think the dates were lost.
    out += ` ${s.staleDates === 1 ? 'One date had' : `${s.staleDates} dates had`} already gone by, so ${s.staleDates === 1 ? 'it comes' : 'they come'} in without a date rather than as something asking today.`;
  }
  if (s.repeats > 0) {
    // The number, not just the tag name (1.8.0): rhythms are not carried, and
    // the honest next step — rebuilding the real ones as upkeep — needs to
    // know whether that is three things or sixty.
    out += ` ${s.repeats === 1 ? 'One of them repeats' : `${s.repeats} of them repeat`} on a rhythm — rhythms are not carried; rebuild the real ones as upkeep when they matter.`;
  }
  if (s.droppedTags.length > 0) {
    out += ` These will not come with them: ${s.droppedTags.join(', ')}.`;
  }
  if (s.unreadable.length > 0) {
    out += ` ${s.unreadable.length === 1 ? 'One line' : `${s.unreadable.length} lines`} could not be read.`;
  }
  // THE ARRIVAL IS A FACT, NOT A DEBT (2.25.0 — entry 23's routing proposal).
  //
  // Everything above this line counts what came. None of it says the thing a
  // large import most needs said, which is that the pile is not a backlog the
  // reader has already failed to clear. The catalogue's measured case is a
  // 1,173-item import leaving eleven of fourteen node kinds at zero: the app
  // arrives knowing how to filter by place, by person and by container, and
  // none of it can do anything, because nobody has been asked for a word.
  //
  // MODELLED ON THE AMNESTY (ADR-0043) AND ON ITS ONE HARD CONSTRAINT: an
  // amnesty that sounds like absolution implies there was something to forgive.
  // So this states the fact and the reason and stops. It does not reassure, it
  // does not say "don't worry", and it does not promise the reader will file it
  // later — which would be the debt, restated politely.
  //
  // Last on purpose: after what came and what did not, because the sentence is
  // about the whole arrival rather than about any one count in it.
  //
  // AND ONLY WHEN SOMETHING ARRIVED THAT FILING IS A QUESTION ABOUT. The first
  // version appended unconditionally and an existing assertion caught it: the
  // summary for a one-line file is held to exactly `Found 1 action.`, on the
  // rule that it never claims more than the file held. That rule is right. One
  // action is not a pile, nothing about it invites sorting, and a sentence
  // explaining that it has not been sorted is clutter answering a question
  // nobody asked. The entry's case is the pile; this is where the pile starts.
  if (s.projects + s.actions > 1) {
    // ARRIVAL AS A FACT, NOT A DEBT — `docs/nd-collisions.md` entry 23, whose
    // wording this follows. What changed in 2.33.0 is that half of it had
    // become untrue: the tags somebody wrote now come across as places, so
    // "nothing is filed" would be a sentence about a store that IS partly
    // filed, and by their own hand rather than by this app's guess.
    out += s.places > 0
      ? ` ${s.places === 1 ? 'One place comes' : `${s.places} places come`} with them,`
        + ` in the words you wrote — ${s.placed} of these things carry at least one.`
        + ' Nothing else is filed, because filing was never asked for.'
      : ' Nothing is filed, because filing was never asked for — it all arrives'
        + ' as work, in the words it was written in.';
  }
  if (s.flagged > 0) {
    // NAMED AS WHAT IT BECOMES, not as what it was. "Flagged" is the other
    // planner's word; heat is this app's, and saying "hot" is what makes the
    // sentence checkable against the thing the reader will actually see.
    out += ` ${s.flagged === 1 ? 'One was flagged' : `${s.flagged} were flagged`}, and`
      + ` ${s.flagged === 1 ? 'comes' : 'come'} in hot — this app has no priority,`
      + ' so what you marked is kept as interest rather than as a rank.';
  }
  if (s.estimates > 0) {
    out += ` ${s.estimates === 1 ? 'One says' : `${s.estimates} say`} how long`
      + ` ${s.estimates === 1 ? 'it takes' : 'they take'}, and that comes too.`;
  }
  return out;
}
