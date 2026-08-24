// Bringing work in from another planner (a requirement: import an OmniFocus
// export and really test at scale?").
//
// The tests that carry weight:
//
// **Hierarchy survives.** Containment is the shape a flat list cannot express and
// the main reason importing at scale is worth doing — if nesting collapses, the
// import produced a pile and proved nothing.
//
// **Every event passes the real `admit`.** Thousands of rows from somebody else's
// planner is the largest untrusted input this app will ever take, and it must go
// through the same door as a keystroke.
//
// **Dates land on the day they displayed in the other app**, in both hemispheres.
//
// **Nothing is silently discarded.** A tag that does not come across is reported.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  depthOf, importFacts, importSummary, isCalendarDay, parseAnyExport, parseCsv,
  parseOmniFocusCsv, parseTaskPaper, taskPaperEvents, isPastDay,
  type ImportContext, type ImportSummary,
} from '../src/taskpaper.ts';
import { admit, gateOptionsFor, heldNodes, silentNodes } from '../src/gate.ts';
import { fold, noteOf } from '../src/fold.ts';
import { localDayKey, atMidnight} from '../src/time.ts';
import { calendarCount } from '../src/ics.ts';
import { allContexts, contextsOf, placesReaching } from '../src/contexts.ts';
import { estimateOf } from '../src/duration.ts';
import { replanAll } from '../src/replan.ts';

// The summary as ONE string. The app never composes it: the lead goes into a
// live region and the facts render as a navigable list beside it, because a
// hundred and twenty words fired at a live region cannot be paused, re-read or
// skipped. So this lives here, in the tests that want to read the whole thing
// at once, rather than in the module as a second rendering with no caller.
const importWords = (s: ImportSummary): string => {
  const { lead, facts } = importFacts(s);
  return facts.length === 0 ? lead : `${lead} ${facts.join(' ')}`;
};

const DENVER = 'America/Denver';
const KIRITIMATI = 'Pacific/Kiritimati';
const NOW = '2026-07-29T18:00:00.000Z';

function ctxFor(zone = DENVER): ImportContext {
  let n = 0;
  return { at: NOW, device: 'imp', vault: 'personal', zone, seq: () => n, id: () => `i${n++}` };
}

const build = (text: string, zone = DENVER) => {
  const { lines, unreadable } = parseAnyExport(text);
  const offered = taskPaperEvents(ctxFor(zone), lines);
  const admitted = admit(offered, fold([]), gateOptionsFor(zone));
  return { lines, unreadable, offered, admitted, state: fold(admitted) };
};

const SAMPLE = `Kitchen refit:
\t- Ring the plumber @due(2026-08-05)
\t- Measure the gap @defer(2026-08-01)
\tSome note about the taps
Paperwork:
\t- Compare renewals @due(2026-08-12) @flagged
\t- Old thing @done
- A loose action @due(2026-08-03)
`;

// --- THE ONE THAT MATTERS ---------------------------------------------------

test('THE ONE THAT MATTERS: nesting survives, so containment actually arrives', () => {
  const { state } = build(SAMPLE);
  const held = heldNodes(state);
  const kitchen = held.find(n => n.title === 'Kitchen refit');
  const plumber = held.find(n => n.title === 'Ring the plumber');
  assert.ok(kitchen, 'the project exists');
  assert.equal(kitchen.kind, 'project');
  assert.ok(plumber, 'the action exists');
  assert.equal(plumber.parent, kitchen.id, 'and it sits UNDER the project');

  const paperwork = held.find(n => n.title === 'Paperwork');
  const renewals = held.find(n => n.title === 'Compare renewals');
  assert.equal(renewals?.parent, paperwork?.id, 'a second project keeps its own children');
  assert.notEqual(paperwork?.id, kitchen.id);

  const loose = held.find(n => n.title === 'A loose action');
  assert.equal(loose?.parent, null, 'and a top-level action has no invented parent');
});

test('and every imported event passes the real write boundary', () => {
  const { offered, admitted, state } = build(SAMPLE);
  for (const e of offered) {
    assert.ok(admitted.some(a => a.id === e.id), `${e.kind} was refused`);
  }
  assert.deepEqual(silentNodes(state).map(n => n.title), [],
    'and nothing arrived silent');
});

test('at scale: two thousand rows parse, map and admit', () => {
  // "Really test at scale" was the ask. This is the largest untrusted input the app
  // will ever take, and the interesting failure is not slowness — it is a gate cure
  // storm, or a parent map that quietly stops resolving past some depth.
  const lines: string[] = [];
  for (let p = 0; p < 100; p++) {
    lines.push(`Project ${p}:`);
    for (let a = 0; a < 19; a++) {
      lines.push(`\t- Action ${p}.${a}${a % 3 === 0 ? ' @due(2026-09-01)' : ''}`);
    }
  }
  const { lines: parsed, state } = build(lines.join('\n'));
  assert.equal(parsed.length, 100 * 20, 'every row was read');
  const held = heldNodes(state);
  assert.equal(held.length, 100 * 20, 'and every row landed');
  assert.deepEqual(silentNodes(state), [], 'with nothing silent');
  // Parents resolved for all of them, not just the early ones.
  const projects = new Set(held.filter(n => n.kind === 'project').map(n => n.id));
  const parented = held.filter(n => n.parent !== null && projects.has(n.parent));
  assert.equal(parented.length, 100 * 19, 'every action found its own project');
});

// --- dates ------------------------------------------------------------------

test('a due date lands on the day it displayed in the other planner', () => {
  const { state } = build('- Ring the plumber @due(2026-08-05)\n');
  const n = heldNodes(state)[0]!;
  assert.ok(n.clocks.due, 'it has a due clock');
  assert.equal(localDayKey(n.clocks.due.at, atMidnight(DENVER)), '2026-08-05');
});

test('and on the other side of the world, the same day', () => {
  // UTC+14. A date that shifts by a day on import is the worst kind of wrong: it
  // looks right, and it is wrong for everybody east or west of whoever tested it.
  const { state } = build('- Ring the plumber @due(2026-08-05)\n', KIRITIMATI);
  const n = heldNodes(state)[0]!;
  assert.equal(localDayKey(n.clocks.due!.at, atMidnight(KIRITIMATI)), '2026-08-05');
});

test('an imported date is a date somebody CHOSE, so a calendar may carry it', () => {
  // The point of importing at scale is partly to have real dates to test the
  // calendar with — and `due` is the kind that survives `CALENDAR_KINDS`.
  const { state } = build('- Ring the plumber @due(2026-08-05)\n');
  assert.equal(calendarCount(state, NOW, DENVER), 1);
});

test('a defer date becomes a start clock, not a due date', () => {
  const { state } = build('- Measure the gap @defer(2026-08-01)\n');
  const n = heldNodes(state)[0]!;
  assert.ok(n.clocks.start, 'start');
  assert.equal(n.clocks.due, undefined, 'and not a deadline nobody set');
});

test('a date that is not a date is refused rather than invented', () => {
  assert.equal(isCalendarDay('2026-02-31'), false, 'February has no 31st');
  assert.equal(isCalendarDay('2026-13-01'), false);
  assert.equal(isCalendarDay('not a date'), false);
  assert.equal(isCalendarDay('2026-08-05'), true);
  const { lines } = parseTaskPaper('- Thing @due(2026-02-31)\n');
  assert.equal(lines[0]!.due, null, 'no clock invented from nonsense');
  assert.ok(lines[0]!.dropped.includes('due'), 'and it says the date did not come across');
});

test('a date with a time keeps the day and drops the hour', () => {
  for (const form of ['2026-08-05 17:00', '2026-08-05T17:00:00']) {
    assert.equal(parseTaskPaper(`- Thing @due(${form})\n`).lines[0]!.due, '2026-08-05', form);
  }
});

// --- what does not come across, and says so ---------------------------------

test('a flag comes across as HEAT, and the CSV writes it as 1 rather than true', () => {
  // Reversed in 2.34.0. Dropping it was defended as "this app has no priority
  // field" — still true, and not the whole argument: discarding somebody's own
  // deliberate mark is a decision to lose data, which is the same argument this
  // importer already makes about carrying tags. Heat is a two-state fact the
  // reader stated, it breaks a tie only inside one tier, and the card says it
  // out loud — so the distinction survives and nothing gets ranked.
  const { lines } = parseTaskPaper('- Thing @flagged\n');
  assert.equal(lines[0]!.flagged, true);
  assert.equal(lines[0]!.dropped.includes('flagged'), false, 'no longer a loss to report');

  const { state } = build('- Thing @flagged\n');
  const n = heldNodes(state).find(x => x.title === 'Thing')!;
  assert.equal(n.heat, 'hot');

  // A REAL EXPORT WRITES 1 AND 0, and the check for the string "true" matched
  // none of it — three flagged rows were neither carried nor reported.
  for (const [written, want] of [['1', true], ['true', true], ['YES', true], ['0', false], ['', false]] as const) {
    const csv = `Name,Type,Flagged\nThing,Action,${written}\n`;
    assert.equal(parseOmniFocusCsv(csv).lines[0]!.flagged, want, `Flagged=${written}`);
  }
});

test('a container is never made hot — a project is not offered', () => {
  const { state } = build('Move house: @flagged\n\t- Book the van\n');
  const proj = heldNodes(state).find(n => n.title === 'Move house')!;
  assert.notEqual(proj.heat, 'hot');
});

test('a rhythm and an unreadable estimate are dropped, and reported rather than swallowed', () => {
  // This app has no priority field: pressure comes from the decay primitive, never
  // from a star set in a better mood. Recording a flag as a fake clock would invent
  // a demand nobody made — but discarding it silently would be a different lie.
  //
  // THIS TEST USED TO ASSERT `['context', 'estimate', 'flagged']` and that is the
  // whole point of changing it (2.33.0). Two of those three were the person's own
  // words and are carried now; only the flag is a decision this app gets to make.
  const { lines } = parseTaskPaper('- Thing @repeat(weekly) @estimate(a while)\n');
  assert.deepEqual(lines[0]!.dropped.sort(), ['estimate', 'repeat']);
  const { facts } = importFacts(importSummary(lines, []));
  // Both are reported, and EACH IS REPORTED ONCE (2.36.0). The rhythm has a
  // sentence of its own that says what to do about it; the estimate nobody can
  // parse has nothing but the bare list, which is why the list still exists.
  const rhythm = facts.filter(f => /repeats on a rhythm/.test(f));
  const list = facts.filter(f => /will not come with them/.test(f));
  assert.equal(rhythm.length, 1, 'the rhythm gets its own sentence');
  assert.equal(list.length, 1, 'and there is one list of the rest');
  assert.match(list[0]!, /estimate/, 'the estimate that could not be read is in it');
  assert.ok(!/repeat/.test(list[0]!), 'and the rhythm is not said a second time');
});

test('the tags somebody wrote come across as places, in their own words', () => {
  // The defect this closes: an OmniFocus store's tags ARE its contexts, and they
  // were dropped at the door. A 1,432-item import arrived carrying one context.
  const { lines } = parseTaskPaper('- Ring the bank @Errands @Phone\n');
  assert.deepEqual(lines[0]!.tags, ['Errands', 'Phone'], 'raw case, as written');

  const { state } = build('- Ring the bank @Errands @Phone\n');
  const places = allContexts(state).map(c => c.title).sort();
  assert.deepEqual(places, ['Errands', 'Phone']);
  const item = heldNodes(state).find(n => n.title === 'Ring the bank')!;
  assert.equal(contextsOf(state, item).length, 2, 'and the item is attached to both');
});

test('a tag that CARRIES the place uses the value, never the word "context"', () => {
  // Shipped wrong and caught an hour later by reading the regex against a real
  // store's report: `@context(Office)` made a place called "context", holding
  // everything, under a word nobody typed. The test beside this one asserted
  // only what was DROPPED, so it passed the whole time.
  const { lines } = parseTaskPaper('- Thing @context(Office)\n');
  assert.deepEqual(lines[0]!.tags, ['Office']);

  const many = parseTaskPaper('- Thing @tags(Errands, Phone)\n');
  assert.deepEqual(many.lines[0]!.tags, ['Errands', 'Phone']);

  // An empty one names nothing, and inventing a place from it would be a guess.
  const bare = parseTaskPaper('- Thing @context\n');
  assert.deepEqual(bare.lines[0]!.tags, []);
  assert.deepEqual(bare.lines[0]!.dropped, ['context']);

  const { state } = build('- Thing @context(Office)\n');
  assert.deepEqual(allContexts(state).map(c => c.title), ['Office']);
});

test('one place, however many things carry it and however it was capitalised', () => {
  // Two nodes for one word would split the work between them and put the same
  // place twice in the chooser — and `allContexts` sorts by title, so the pair
  // would not even sit beside each other.
  const { state } = build('- One @Errands\n- Two @errands\n- Three @ERRANDS\n');
  assert.equal(allContexts(state).length, 1);
  assert.equal(allContexts(state)[0]!.title, 'Errands', 'the first spelling wins');
  for (const t of ['One', 'Two', 'Three']) {
    const n = heldNodes(state).find(x => x.title === t)!;
    assert.equal(contextsOf(state, n).length, 1, t);
  }
});

test('a place on a project reaches the work inside it', () => {
  // Which is the whole reason to carry a tag on a container: one label covers
  // everything under it, through `placesReaching`.
  const { state } = build('Move house: @Home\n\t- Book the van\n');
  const child = heldNodes(state).find(n => n.title === 'Book the van')!;
  assert.equal(contextsOf(state, child).length, 0, 'nothing of its own');
  assert.equal(placesReaching(state, child).length, 1, 'and one inherited');
});

test('an estimate comes across as an estimate, in every shape that appears', () => {
  for (const [written, minutes] of [['20m', 20], ['1h', 60], ['1.5h', 90], ['90', 90], ['1h30m', 90]] as const) {
    const { lines } = parseTaskPaper(`- Thing @estimate(${written})\n`);
    assert.equal(lines[0]!.estimateMinutes, minutes, written);
  }
  const { state } = build('- Thing @estimate(45m)\n');
  const n = heldNodes(state).find(x => x.title === 'Thing')!;
  assert.equal(estimateOf(n), 45);
});

test('an estimate that cannot be read is dropped and named, never guessed', () => {
  // A guessed duration is worse than an absent one — `estimateOf` refuses a
  // non-positive value for the same reason.
  const { lines } = parseTaskPaper('- Thing @estimate(a while)\n');
  assert.equal(lines[0]!.estimateMinutes, null);
  assert.deepEqual(lines[0]!.dropped, ['estimate']);
});

test('the CSV door carries the same labels as the tag door', () => {
  // The same person's same labels arrive through whichever way they exported.
  const csv = 'Name,Type,Project,Tags,Estimated Minutes\n'
    + 'Ring the bank,Action,,Errands;Phone,20\n';
  const { lines } = parseOmniFocusCsv(csv);
  assert.deepEqual(lines[0]!.tags, ['Errands', 'Phone']);
  assert.equal(lines[0]!.estimateMinutes, 20);
});

test('a line that is only tags is reported, not turned into "(untitled)"', () => {
  const { lines, unreadable } = parseTaskPaper('- @flagged\n- Real thing\n');
  assert.equal(lines.length, 1);
  assert.equal(lines[0]!.title, 'Real thing');
  assert.equal(unreadable.length, 1, 'and the odd line is kept so somebody can look');
});

test('notes do not become tasks', () => {
  const { lines } = parseTaskPaper('Project:\n\t- Do it\n\tjust a note\n');
  assert.equal(lines.filter(l => l.kind === 'note').length, 1);
  const { state } = build('Project:\n\t- Do it\n\tjust a note\n');
  assert.equal(heldNodes(state).some(n => n.title === 'just a note'), false);
});

// --- the shapes of the format ------------------------------------------------

test('a project line ending in a colon is a project even with tags after it', () => {
  // Stripping tags first made "Ship it: @due(...)" look like an action, which
  // silently flattened a whole subtree under the wrong thing.
  const { lines } = parseTaskPaper('Ship it: @due(2026-08-05)\n\t- A step\n');
  assert.equal(lines[0]!.kind, 'project');
  assert.equal(lines[0]!.due, '2026-08-05');
  assert.equal(lines[1]!.kind, 'action');
});

test('tabs and two-space indents both count, including mixed', () => {
  // OmniFocus writes spaces when the preference says spaces, and mixed files exist.
  // Counting only tabs flattens an entire tree without any error at all.
  assert.equal(depthOf('\t\t- x'), 2);
  assert.equal(depthOf('    - x'), 2);
  assert.equal(depthOf('\t  - x'), 2);
  assert.equal(depthOf('- x'), 0);
  const { state } = build('Top:\n  - Spaced child\n');
  const child = heldNodes(state).find(n => n.title === 'Spaced child');
  assert.equal(child?.parent, heldNodes(state).find(n => n.title === 'Top')?.id);
});

test('a deeper level attaches to the nearest container above it, not to a sibling', () => {
  const { state } = build('A:\n\t- one\nB:\n\t- two\n');
  const held = heldNodes(state);
  assert.equal(held.find(n => n.title === 'two')?.parent,
    held.find(n => n.title === 'B')?.id, 'B replaced A at that depth');
});

// --- CSV --------------------------------------------------------------------

test('a quoted CSV field with commas and newlines survives', () => {
  // A naive split mangles every note containing a comma, which is most of them.
  const rows = parseCsv('Name,Notes\n"Ring, then email","line one\nline two"\n');
  assert.deepEqual(rows[1], ['Ring, then email', 'line one\nline two']);
});

test('doubled quotes inside a quoted field are one quote', () => {
  assert.deepEqual(parseCsv('Name\n"Reply was ""no"""\n')[1], ['Reply was "no"']);
});

test('CSV columns are found by NAME, so a reordered export still works', () => {
  // A positional reader breaks on the next OmniFocus update, silently, by reading
  // dates out of the notes column.
  const a = 'Type,Name,Project,Due Date\ntask,Ring the plumber,Kitchen,2026-08-05\n';
  const b = 'Due Date,Project,Name,Type\n2026-08-05,Kitchen,Ring the plumber,task\n';
  const one = parseOmniFocusCsv(a).lines[0]!;
  const two = parseOmniFocusCsv(b).lines[0]!;
  assert.deepEqual({ ...one }, { ...two });
  assert.equal(one.title, 'Ring the plumber');
  assert.equal(one.due, '2026-08-05');
  assert.equal(one.parentName, 'Kitchen');
});

test('a CSV project named by a child but never listed is created, not dropped', () => {
  // The alternative is silently reparenting somebody's task to nothing — an import
  // that loses structure without losing rows, which nobody notices.
  const { state } = build('Type,Name,Project\ntask,Ring the plumber,Kitchen\n');
  const held = heldNodes(state);
  const kitchen = held.find(n => n.title === 'Kitchen');
  assert.ok(kitchen, 'the project was created for it');
  assert.equal(kitchen.kind, 'project');
  assert.equal(held.find(n => n.title === 'Ring the plumber')?.parent, kitchen.id);
});

test('a CSV project listed AFTER its children is not duplicated', () => {
  const { state } = build(
    'Type,Name,Project\ntask,Ring the plumber,Kitchen\nproject,Kitchen,\ntask,Measure,Kitchen\n');
  const kitchens = heldNodes(state).filter(n => n.title === 'Kitchen');
  assert.equal(kitchens.length, 1, 'one Kitchen, not two');
  assert.equal(heldNodes(state).filter(n => n.parent === kitchens[0]!.id).length, 2);
});

test('a completed row is not brought in at all', () => {
  // Reversed in 2.34.1. It used to arrive marked done, which imports somebody
  // else's HISTORY: a real export carried 216 finished rows into a store of
  // 1,429, fifteen per cent of a pile somebody believes they are carrying.
  // The record of what happened stays in the app it happened in, and the file
  // still has it — and the summary says the number before the button is
  // pressed, which is the difference between a decision and a discovery.
  const { state } = build('Type,Name,Completion Date\ntask,Old thing,2026-07-01\n');
  assert.equal(heldNodes(state).some(n => n.title === 'Old thing'), false);
});

test('a finished container does not take its live children with it', () => {
  // The children fall back to the nearest container above, exactly as they
  // would if the line had not been in the file. Nothing dangles.
  const { state } = build('Move house:\n\tOld phase: @done\n\t\t- Book the van\n');
  const van = heldNodes(state).find(n => n.title === 'Book the van');
  assert.ok(van, 'the live child still arrives');
  assert.equal(heldNodes(state).some(n => n.title === 'Old phase'), false);
  const move = heldNodes(state).find(n => n.title === 'Move house')!;
  assert.equal(van!.parent, move.id, 'and lands under the container above');
});

test('the format is sniffed from the content, not the filename', () => {
  // A file renamed on the way between two apps is the normal case, and refusing a
  // good file over its extension is the pedantry that makes people give up.
  assert.equal(parseAnyExport('Type,Name\ntask,Thing\n').format, 'csv');
  assert.equal(parseAnyExport('Project:\n\t- Thing\n').format, 'taskpaper');
  // A TaskPaper line containing a comma is still TaskPaper.
  assert.equal(parseAnyExport('- Ring, then email\n').format, 'taskpaper');
});

// --- the summary ------------------------------------------------------------

test('the summary counts the parse, and the words state all three outcomes', () => {
  const { lines, unreadable } = parseTaskPaper(SAMPLE);
  const s = importSummary(lines, unreadable);
  // The counts are of what ARRIVES (2.34.1), which is why the finished one is
  // not in `actions` — promising a pile that never turns up is the same defect
  // as the note count that once counted lines instead of notes that attach.
  assert.equal(s.projects, 2);
  assert.equal(s.actions, 4);
  assert.equal(s.notes, 1);
  assert.equal(s.done, 1);
  const w = importWords(s);
  assert.match(w, /2 projects and 4 actions/);
  assert.match(w, /already finished and .*not brought in/);
});

test('an empty or unreadable file says so and changes nothing', () => {
  assert.match(importWords(importSummary([], [])), /Nothing in that file could be read/);
  assert.match(importWords(importSummary([], [])), /Nothing has been changed/);
  const { offered } = build('\n\n   \n');
  assert.deepEqual(offered, []);
});

test('the words never claim more than the file held', () => {
  // One line is the smallest file anybody brings, and it is the case the lead
  // sentence first got wrong: "1 action come in." Exact, not a substring: the
  // point is that NOTHING else is claimed of a one-line file.
  const s = importSummary(parseTaskPaper('- One thing\n').lines, []);
  const { lead, facts } = importFacts(s);
  assert.equal(lead, '1 action comes in.');
  assert.deepEqual(facts, []);
  assert.equal(importWords(s), '1 action comes in.');
});

test('the pile line comes last, after the findings about this file', () => {
  // It is the standing fact rather than a finding about this file, and it is the
  // one that says the arrival is not a debt — so it reads after the findings.
  const { lines, unreadable } = parseTaskPaper(SAMPLE);
  const { facts } = importFacts(importSummary(lines, unreadable));
  assert.match(facts[facts.length - 1]!, /filing was never asked for/);
  assert.equal(facts.filter(f => /filing was never asked for/.test(f)).length, 1);
});

// --- dates that already went by ---------------------------------------------
//
// a real OmniFocus export: 1,173 due dates, EVERY ONE in the past, earliest
// June 2019. Imported as due dates they became 1,173 things needing a new plan on
// the morning of the import — seven years of residue arriving as today's demands.

test('THE ONE FROM THE REAL EXPORT: a date that already went by does not come in as a date', () => {
  const { state, offered } = build('- Download the baseball pictures @due(2019-06-11)\n');
  const n = heldNodes(state)[0]!;
  assert.equal(n.title, 'Download the baseball pictures', 'the work still arrives');
  assert.equal(offered.some(e => e.kind === 'clock.set'), false,
    'and no due clock is manufactured from a date seven years gone');
  // It is still held and still not silent — the gate cures it like anything dateless.
  assert.deepEqual(silentNodes(state), []);
  assert.equal(heldNodes(state).length, 1);
});

test('and it therefore does not arrive demanding a new plan', () => {
  // The whole point. A passed date in another planner is a record of a commitment
  // somebody did not keep, not one they are carrying today.
  const { state } = build('- Old thing @due(2019-06-11)\n');
  assert.equal(replanAll(state, NOW, DENVER).length, 0);
});

test('a date still ahead is untouched', () => {
  const { state } = build('- Ring the plumber @due(2026-08-05)\n');
  assert.ok(heldNodes(state)[0]!.clocks.due, 'a real commitment still arrives as one');
  assert.equal(calendarCount(state, NOW, DENVER), 1);
});

test('today itself still counts as a date, not as residue', () => {
  // The boundary. "Due today" is a live commitment and must not be discarded as
  // though it had gone.
  const today = localDayKey(NOW, atMidnight(DENVER));
  const { state } = build(`- Due today @due(${today})\n`);
  assert.ok(heldNodes(state)[0]!.clocks.due, `${today} is not past`);
});

test('the boundary is the READER\'s day, not UTC\'s', () => {
  // At 18:00Z on the 29th it is still the 29th in Denver and already the 30th in
  // Kiritimati. A row dated the 29th is live for one and residue for the other, and
  // getting that backwards would silently discard a live commitment.
  assert.equal(isPastDay('2026-07-29', NOW, DENVER), false, 'still today in Denver');
  assert.equal(isPastDay('2026-07-29', NOW, KIRITIMATI), true, 'yesterday in Kiritimati');
});

test('the summary says how many dates had gone, and why they did not come', () => {
  const text = '- A @due(2019-06-11)\n- B @due(2020-01-02)\n- C @due(2026-08-05)\n';
  const { lines } = parseAnyExport(text);
  const s = importSummary(lines, [], NOW, DENVER);
  assert.equal(s.staleDates, 2);
  assert.equal(s.withDates, 1, 'and only the live one is counted as having a date');
  const w = importWords(s);
  assert.match(w, /2 dates had already gone by/);
  assert.match(w, /without a date rather than as something asking today/);
});

test('one stale date is described in the singular', () => {
  const { lines } = parseAnyExport('- A @due(2019-06-11)\n');
  assert.match(importWords(importSummary(lines, [], NOW, DENVER)), /One date had already gone by/);
});

test('the summary and the store agree about which dates came across', () => {
  // Two counters for one fact is the shape that has caused more defects here than
  // any other, so they are checked against each other rather than each on its own.
  const text = '- A @due(2019-06-11)\n- B @due(2026-08-05)\n- C @defer(2019-01-01)\n- D\n';
  const { lines } = parseAnyExport(text);
  const s = importSummary(lines, [], NOW, DENVER);
  const events = taskPaperEvents(ctxFor(), lines);
  assert.equal(events.filter(e => e.kind === 'clock.set').length, s.withDates);
  assert.equal(s.staleDates, 2);
});

test('1.4.0: CSV notes are CARRIED — the field event lands on the right row, and the summary says so', () => {
  // History of this exact spot: the first importer read the Notes cell and
  // threw it away with the summary reporting zero (audit); 1.2.3 counted and
  // stated the loss; 1.4.0 carries them. The count is now of notes that ATTACH.
  const csv = [
    'Task ID,Type,Name,Status,Project,Notes',
    '1,Action,call the dentist,,,remember to ask about the crown',
    '2,Action,plain thing,,,',
    '3,Project,Boy Scouts,,,pack meeting is first Tuesdays',
  ].join('\n');
  const { lines, unreadable } = parseAnyExport(csv);
  const s = importSummary(lines, unreadable);
  assert.equal(s.notes, 2, 'both note-bearing rows counted, the empty one not');
  const words = importWords(s);
  assert.match(words, /2 notes come across with their items/);
  assert.doesNotMatch(words, /not carried/, 'the loss sentence is gone because the loss is');

  const events = taskPaperEvents(ctxFor(), lines);
  const noteEvents = events.filter(e => e.kind === 'node.field.set');
  assert.equal(noteEvents.length, 2, 'one field event per note-bearing row');
  const created = new Map(events.filter(e => e.kind === 'node.created')
    .map(e => [(e.payload as { title: string }).title, e.node]));
  const noteOn = (title: string): unknown =>
    (noteEvents.find(e => e.node === created.get(title))?.payload as { value?: unknown } | undefined)?.value;
  assert.equal(noteOn('call the dentist'), 'remember to ask about the crown');
  assert.equal(noteOn('Boy Scouts'), 'pack meeting is first Tuesdays');
  assert.equal(noteOn('plain thing'), undefined, 'no event for the empty cell');
});

test('1.4.0: TaskPaper note lines attach to the item ABOVE them, consecutive lines as ONE note', () => {
  // The association is positional — the only one the format has. Two events on
  // one field would be LWW overwriting itself, so consecutive lines join.
  const text = '- A thing\n  first line of its note\n  second line of it\n- Another thing\n';
  const { lines, unreadable } = parseTaskPaper(text);
  const s = importSummary(lines, unreadable);
  // Corrected 1.17.4 (seam-t1): this asserted `notes === 2` — counting LINES —
  // four lines above its own proof that the mapper writes ONE event. The
  // summary now counts the way the mapper writes.
  assert.equal(s.notes, 1, 'two consecutive lines are ONE joined note');
  assert.match(importWords(s), /One note comes across/);
  const events = taskPaperEvents(ctxFor(), lines);
  const notes = events.filter(e => e.kind === 'node.field.set');
  assert.equal(notes.length, 1, 'consecutive lines are ONE note, one event');
  const a = events.find(e => e.kind === 'node.created'
    && (e.payload as { title: string }).title === 'A thing')!;
  assert.equal(notes[0]!.node, a.node, 'and it landed on the item above');
  assert.equal((notes[0]!.payload as { value: string }).value,
    'first line of its note\nsecond line of it');
});

test('1.4.0: a note line before any item has nothing to belong to — dropped, and NOT counted as carried', () => {
  const { lines, unreadable } = parseTaskPaper('an orphan header note\n- A thing\n  a real note\n');
  const s = importSummary(lines, unreadable);
  assert.equal(s.notes, 1, 'only the attached note counts — counting the orphan would be the old lie inverted');
  const events = taskPaperEvents(ctxFor(), lines);
  assert.equal(events.filter(e => e.kind === 'node.field.set').length, 1);
});

test('1.4.0: an imported note folds to where the sheet reads it', () => {
  const csv = [
    'Task ID,Type,Name,Status,Project,Notes',
    '1,Action,call the dentist,,,ask about the crown',
  ].join('\n');
  const { state } = build(csv);
  const n = [...state.nodes.values()].find(x => x.title === 'call the dentist')!;
  assert.equal(noteOf(n), 'ask about the crown', 'noteOf — the one reader — sees it');
});

test('repeats are COUNTED, not just named — the unnumbered-loss shape again (1.8.0)', () => {
  // A 400-row export with sixty repeating tasks used to say only "These will
  // not come with them: repeat." — the same shape as the pre-1.4.0 note bug.
  const text = '- water plants @repeat(FREQ=WEEKLY)\n- pay rent @repeat(FREQ=MONTHLY)\n- one-off thing\n';
  const s = importSummary(parseAnyExport(text).lines, [], NOW, DENVER);
  assert.equal(s.repeats, 2);
  const w = importWords(s);
  assert.match(w, /2 of them repeat on a rhythm/);
  assert.match(w, /rebuild the real ones as upkeep/);
});

test('a repeat-free file says nothing about rhythms', () => {
  const s = importSummary(parseAnyExport('- just a thing\n').lines, [], NOW, DENVER);
  assert.equal(s.repeats, 0);
  assert.doesNotMatch(importWords(s), /rhythm/);
});

// ——— THE ARRIVAL IS A FACT, NOT A DEBT (2.25.0, entry 23) ———
//
// The catalogue's measured case is a 1,173-item import leaving eleven of
// fourteen node kinds at zero: the app arrives able to filter by place, person
// and container, and none of it can do anything because nobody has been asked
// for a word. What the summary never said is that this is not a backlog the
// reader has already failed to clear.
//
// Modelled on the amnesty (ADR-0043) and held to its one hard constraint: an
// amnesty that sounds like absolution implies there was something to forgive.

test('the summary says nothing is filed, and says why, so the pile is not a debt', () => {
  const { lines } = parseTaskPaper('Kitchen:\n\t- Fix the tap\n\t- Order a filter\n');
  const w = importWords(importSummary(lines, []));
  assert.match(w, /Nothing is filed/, 'it states the fact');
  assert.match(w, /filing was never asked for/,
    'and the reason, which is what stops it reading as a failure the reader already committed');
  assert.match(w, /in the words it was written in/,
    'and that the pile is usable as it stands');
});

test('the arrival line never reassures, because reassurance implies a fault', () => {
  const { lines } = parseTaskPaper('Kitchen:\n\t- Fix the tap\n');
  const w = importWords(importSummary(lines, []));
  assert.ok(!/don.t worry|no need to|it.s fine|take your time|whenever you.re ready/i.test(w),
    `"${w}" comforts, and an amnesty that sounds like absolution implies there was something to forgive`);
  assert.ok(!/you can file|sort them|organise|tidy|clean up|get to it/i.test(w),
    'and it never promises the reader will file it later, which is the debt restated politely');
});

test('one item is not a pile, so it gets no sentence about filing', () => {
  // The existing exact-match assertion above is what caught this: `Found 1
  // action.` and nothing else. One action invites no sorting, so explaining
  // that it has not been sorted answers a question nobody asked.
  const w = importWords(importSummary(parseTaskPaper('- One thing\n').lines, []));
  assert.ok(!/Nothing is filed/.test(w), 'no arrival sentence for a single item');
  const two = importWords(importSummary(parseTaskPaper('- One thing\n- Another\n').lines, []));
  assert.match(two, /Nothing is filed/, 'and it appears as soon as there is a pile');
});

test('a file with nothing readable does not get the arrival line', () => {
  // Nothing arrived, so there is nothing to say about how it arrived. The
  // early return already handles this; asserted because a later edit that moves
  // the sentence above the return would produce a cheerful line about an empty
  // import, which is the shape LESSONS 100 calls a check about nothing.
  const w = importWords(importSummary([], []));
  assert.ok(!/Nothing is filed/.test(w), 'no arrival sentence when nothing arrived');
  assert.match(w, /Nothing has been changed/);
});
