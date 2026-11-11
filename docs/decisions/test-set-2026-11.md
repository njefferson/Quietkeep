# A test set, 2026-11

Decisions for the release that grows "Make a set to try things on" so that the two
newest staged surfaces, the weeks ahead on the first screen and the roles in the
order of their last act, can be seen working on a store a reader can load. The
release is 3.28.2, an iteration. Nothing is stored that was not stored before: no
event kind is added, the rule of the last act (`src/attended.ts`) is untouched, and
the thirteen-item set in `src/sample.ts` is not changed.

## 1. What each existing set holds

The demonstration set, `src/sample.ts`, holds thirteen things, tidy and human. It
holds no role, no thing with both a start and a due date, and no past act of any
kind. It reaches the weeks ahead only as a handful of dated things and a few
captures.

The big set, `src/big-sample.ts`, holds about fifteen hundred things and some
3,790 records before this release, of which one thousand are the unsorted pile. By
reading it reaches: days in the next seven and days out to thirty that hold
something, with roughly a hundred things due in the first three weeks so that every
day holds more than the three a day shows; six people waited on and a seventh with
the answer closed; many unsorted captures; a stalled project, passed dates, a
tracked project, a worry mid-flow, a save-for with numbers, things on the Menu and
a resume card.

What it does not reach, and so what this release adds:

- No thing is drawn as a stretch. No node carries both a start and a due.
- The roles review has nothing to order. Three roles carry live work, but the
  generator stamps every record at the one moment of loading, so all three have a
  last act of nought days back: one distance, and an order of one distance is no
  order. A fourth role, The allotment, carries nothing live, which is the quiet
  line and not the order.

## 2. The states the test set reaches

For the weeks ahead, folded and read at the moment of loading:

- Days in the next seven that hold something, and days out to thirty that hold
  something. The four new carriers fall on days 3, 8, 14 and 26 from loading, so
  both halves are held by the growth and not only by the older bulk.
- One day holding more than three things. Five new things share day 5, against the
  three a day shows, so the line that says how many more is drawn.
- Things drawn as a stretch: three, with a start and a due each. One lies wholly
  ahead (days 2 to 12), one has begun (started 4 days back, due on day 21), and one
  runs past the thirty days (day 9 to day 44).
- Somebody waited on: one new waiting-for with a person linked, opened 5 days back,
  with a date to look again on day 4.
- Things still to sort: three new captures, unsorted.

For the review of roles:

- Four roles carrying live work whose last acts lie 1, 6, 19 and 47 days back. With
  the older three at nought days the order holds five distances, oldest first:
  47, 19, 6, 1, 0.
- One role carrying nothing live, The allotment, beside them.

One state is deliberately not reached. A role carrying live work with no act on
record is not a state any loadable set can reach: attaching a role to a thing is
itself an act, and the write boundary refuses an event whose time is not a real
instant, so no admitted event can leave a role without a counted act. That state
stays held by the unit tests in `test/attended.test.ts`, which build it from a log
no import could contain.

What the notes ask of a sample, and the set already carries: a stalled project, a
passed date, a tracked project, a worry mid-flow, a save-for with numbers,
something on the Menu and a resume card.

Size. The growth adds 20 things (4 roles, 4 carriers, 3 stretches, 5 on the crowded
day, 1 waited on, 3 captures) and 42 records. The set stays at the size of the
measured store in the notes (1,445 rows) and inside the read budget that
`test/read-perf.test.ts` states, which is untouched and still passes.

## 3. How it is made

A generator in `src/big-sample.ts`, appended after the last existing block and
drawing from a stream of its own, so every id, every sequence number and every draw
before it is what it was. Every date and every record time is computed from the
moment of loading.

Past acts are `role.attached` records, the event a real attach writes, stamped with
their own time a number of days back. Each role, its carrier and the carrier's
due date are stamped before the act, because the fold orders by time and an attach
ahead of its carrier would name nothing. The carrier is created with the sample
arrival, which the rule of the last act does not count, so the attach is the one
counted act under it.

Two consequences. The write boundary refuses a batch not in (time, device,
sequence) order, so the generator returns its records in that order; for everything
that shares the one loading time this changes nothing. And the gate adds its usual
review date to each new thing at creation, as it does to every other thing in the
set; for the four carriers that date lies in the past, which is a passed date like
any other and puts none of them off the weeks ahead.

## 4. How a reader loads it

By the existing button, Make a set to try things on, grown. It adds no control. A
third set would owe markup in `public/index.html`, the accessibility walk, the
manual and the flowcharts, the help check, the precache list and the tour; the
growth owes none of those because the shell is unchanged.

Loading does to a store that already holds something what it does today: it makes a
file, and bringing the file in replaces what is on the device after the copy-first
step. Nothing about that is touched.

The tests of the big set are untouched and pass as they stand. None pins a count
that the growth moves: the sweep, the caps, the quiet-line test (still exactly one
quiet line, still off the screen by the cap) and the sample check count by
property. The two figures stated in prose, "fifteen hundred invented things" in the
page and 1,530 things in a comment dated 2.32.0 at the head of the pile, are a
round figure and a dated measurement; the first is still true to the round number
and the second is left as the measurement it was.

## 5. The words

Every title is invented and nobody's. The roles are The reading group, Volunteering
at the library, The village hall committee and Evening classes. The things that carry them are
Finish the book for the next meeting, Check the rota for the Saturday shift, Send
round the minutes from the last meeting and Sign up for the spring term. The
stretches are Get the spare room ready for visitors, Plan the autumn planting and
Learn the new phone properly. The crowded day is Collect the framed print, Book the
table for Saturday, Renew the bus pass, Water the neighbors' plants and Buy a
birthday card. The waiting-for is The reply about the hall booking, linked to one of
the set's existing invented people. The captures say they were seen in passing, as
the older captures do.

The line on the surface that says what the set is stays the page's own: invented
things, dated around today, a file to bring in, and a copy of your own first. No
real person, employer, place or product is named.

## 6. Files, tests, release, and what it does not do

Changed: `src/big-sample.ts` (the growth, an optional time on its stamp, the sorted
return, and the head comment that called the thirteen-item set fourteen things);
`src/ui/changelog.ts` and `CHANGELOG.md` (3.28.2); `public/sw.js` (the cache name,
`quietkeep-3.28.2`); `NOTES.md` (the staged line and the sentence on which sample
sets exist). Created: `test/test-set.test.ts` and this record.

Tests, in `test/test-set.test.ts`. Each state of part two is asked of the folded
set. Two loads ten days apart are the same set with every record time and every
clock date shifted by ten days, to within the hour a clock change moves. The roles
order holds the distances 47, 19, 6 and 1 and at least five distinct distances.
Every offered record is admitted, and the gate adds nothing but review dates. And a
break is planted for each state, by taking out exactly the part that makes it,
with the named state required to go red: two of the five on the crowded day, the
start dates of the stretches, the person waited on, the added captures, the acts
brought to the moment of loading, the due dates of the carriers, and the finished
mark of the quiet role.

Release: 3.28.2, an ITERATION, because it refines a set that already exists and
gives the reader nothing to do that the button did not already do. The cache name
carries the same triplet. The release note says what is still not right.

What the set does not do. It shows whether the two staged surfaces work on a store
of a real size. It cannot show whether the paper beside the app goes away, which
only a real day shows, and it is not one.
