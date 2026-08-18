# The collision catalogue — how ND users collide with planning systems, and how Quietkeep routes each

> Commissioned 2026-08-04. Compiled from research and community knowledge and
> checked entry by entry against this repo's laws, ADRs and code.

## Read this before using anything below

**This file was a false receipt in both directions, and it is worth saying so
here rather than in a commit message nobody will find.** It was written once and
touched once more, to scrub attributions — while FIVE of its routing proposals
shipped. So it claimed as unbuilt things that were built (the first-step verb,
the place line, the approach vocabulary, capture context, and weight), and it
carried its warrants at a confidence none of them had been checked at. A
catalogue that is wrong about what exists is worse than no catalogue: it is
consulted, and it answers.

Rewritten V2 stage 7 with three things it never had:

- **An EVIDENCE line on every entry**, from a closed set. This is the correction
  that matters most. The entries were written in one voice, so a well-replicated
  experimental finding and a phrase somebody coined on a forum read identically —
  and the app was built against both without anyone having to notice which was
  which.
- **A SINCE WRITTEN line** wherever the world moved, so a proposal cannot go on
  being proposed after it ships.
- **Corrections stated as corrections**, not quietly edited away. Entry 15's
  warrant was disproven and its routing survives on a different footing; entry
  16's central citation replicates poorly and ADR-0060's cap now rests on the
  better-evidenced claim underneath it. Both decisions stand. Both reasons
  changed, and the record says so.

**The evidence marks, and what each licenses:**

- **Strong** — replicated experimental work, or meta-analytic. Safe to build a
  mechanism on.
- **Moderate** — consistent findings from a smaller or younger literature. Build,
  but keep the mechanism cheap to reverse.
- **Contested** — genuinely disputed. Refuse, or build only what is right for
  other reasons as well.
- **Community** — described consistently by the people it happens to, and not
  measured. Enough to REFUSE on, and enough to build a filter over facts the app
  already holds. Never enough to build an inference on.
- **Disproven** — claimed and not supported. It goes to the refusals in NOTES.md
  with its reason, so the idea cannot come back as a fresh thought.

**And the frame the whole catalogue sits in.** This app is a PROSTHESIS, not a
treatment: the 2025 Lancet Psychiatry component network meta-analysis found
non-pharmacological interventions lack demonstrated efficacy on core adult ADHD
symptoms, and what survives is external scaffolding at the point of performance.
No entry below may be read as a therapeutic claim, and nothing here is ever
framed as skill-building or as reducing the need for the app — that redefines
continued use as failure, which is a shame surface with no red pixels in it.

**Routing marks:** **V2-candidate** (buildable against the V2 plan), **later**
(real, not yet), **refuse** (best served by NOT building — the refusals are
load-bearing). Ranking proposals stay behind Q-11/Q-12 per NOTES.md's own rule.

Every routing proposal is written against the invariants: no "overdue", no
streaks, no scores, no red walls, no shame surfaces, no prescriptive "should",
rest is legitimate, one decay primitive, demand-free types, additive-only data
model.

---

### 1. Task initiation cost — knowing exactly what to do and being unable to begin

- **WHAT HAPPENS** — The gap between intention and action is the core ADHD deficit Barkley locates "at the point of performance": the knowledge is intact, the launch mechanism is not. Activation cost is highest when the task is large, vague, or aversive, and the cost is paid before any progress exists to reward it. The person sits in front of the task, fully aware, unable to start — which observers misread as unwillingness.
- **EVIDENCE** — **Strong.** The intention–action gap at the point of performance is among the best-replicated findings in the adult ADHD executive-function literature. What is weaker is any claim about *which* intervention closes it — see the prosthesis note in the header.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — A long list raises the activation threshold of every item on it, and priority matrices demand a comparison at exactly the moment comparison is impossible.
- **WHAT QUIETKEEP ALREADY DOES** — The single computed Next-up card ("one thing, chosen for you"); the offer capped at two unalike options so choosing is preference, not comparison (ADR-0060); the do-now timer as a cheap entry price showing presence, never progress or countdown (ADR-0059); "Not this" cycles freely and records nothing. The azimuth check honestly names initiation as one of the thin halves.
- **SINCE WRITTEN** — **SHIPPED — 1.28.0.** The first-step verb is on the offer itself (`#nextup-bite`), writing an ordinary child node under the offered item, exactly as proposed. The offer then holds the bite.
- **ROUTING PROPOSAL** — **SHIPPED** in 1.28.0, corrected from *V2-candidate* on 2026-08-17 — its own SINCE WRITTEN said built while the mark said candidate. A "smaller bite" verb on the offer card itself: name a first physical action without leaving the surface, writing an ordinary `node.created` parented under the offered item (covered by clause (d)), and the offer then holds the bite. Same pattern as 1.19.0's `filed` route — put the act where the stuckness is, instead of a trip through the detail sheet.

### 2. The wall of awful — emotional debt accumulated on an avoided task

- **WHAT HAPPENS** — Brendan Mahan's wall of awful: every avoidance, failure, and disappointment attached to a task adds a brick, until what stands between the person and a ten-minute chore is a wall of feeling that must be climbed before the chore even starts. The task's difficulty is no longer the task; it is the history. This is why "it'll only take ten minutes" persuades nobody.
- **EVIDENCE** — **Community.** A coined model (Mahan) that describes something people recognise instantly and that has no controlled measurement behind it. It earns its place here as a description of what the interface must not do, not as a mechanism to build on.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Overdue-red and visible reschedule counts render the wall in the interface — "postponed 14 times" is the brick count read aloud — and each app-open adds mortar.
- **WHAT QUIETKEEP ALREADY DOES** — The load-bearing refusals: no "overdue" anywhere because shame produces the avoidance that made the thing late (ADR-0010); "Not this" and "Not now" are event-free forever, so the app structurally cannot recite your avoidance back to you (ADR-0056); a passed date becomes a replan card — a present decision, never a failure state (law 3); the amnesty never implies there was something to forgive (ADR-0043).
- **SINCE WRITTEN** — **SHIPPED as WEIGHT rather than as a pebble — 1.34.0.** "This one is heavy" is now said on the item in three words, and a low day reaches for lighter work instead of shortening the list. The pebble route was not taken: load is about the DAY and weight is about the THING, and conflating them would have made a fact about the work into a fact about the person. The refusal of avoidance *detection* stands unchanged.
- **ROUTING PROPOSAL** — **refuse**, reversed from *V2-candidate* on 2026-08-17 after reading it against this entry's own paragraphs. The proposal was: let the detail sheet raise a pebble whose `affects` names the item, and let the app plot the co-occurrence. **That plot is the wall, rendered.** This entry's refusal is *"any avoidance detection — an inferred wall is the ledger this app exists to not keep"*, and a surface showing *the thing you keep not doing, beside what you said was weighing on you* is that ledger whether the app computed the link or the person drew it. The entry was arguing with itself: its SINCE WRITTEN already recorded the pebble route as not taken, with the reason, while its routing mark still said candidate. **`affects` stays in the vocabulary and stays unwritten** — the field is in `pebble.raised`, the fold copies it, `raisePebbleEvents` takes it with a default of `[]`, and no surface passes one. That is deliberate now rather than merely true. The half worth having shipped as WEIGHT in 1.34.0: said by the person, about the THING, with no day attached.

### 3. Out of sight, out of mind — a thing that leaves the visual field leaves existence

- **WHAT HAPPENS** — Colloquially "no object permanence"; mechanically it is cue-dependent prospective memory failure (Einstein & McDaniel): intentions fire on external cues, and an item with no cue never fires. Filed means gone. The person keeps everything on the desk, the counter, and forty open tabs, because visible is the only kind of remembered.
- **EVIDENCE** — **Strong.** Cue-dependent prospective memory failure is experimental work with decades behind it (Einstein & McDaniel), and Gilbert's offloading studies make the cost of raising cue-setting effort measurable. This is the best-evidenced entry in the catalogue and it is the thesis.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Filing and archiving are the *virtues* of conventional systems — inbox zero is literally the instruction to put everything where it can no longer cue you.
- **WHAT QUIETKEEP ALREADY DOES** — This collision is the thesis. Law 1's return engine: every node is on a surface, under a clock, on the Menu, or parented to something under a clock, and the write gate refuses anything else. The coverage gauge shows the proof ("everything returns · 0 silent"). 1.19.0's `filed` route makes the place, and the place carries the clock so its contents come back with it (ADR-0073).
- **SINCE WRITTEN** — **SHIPPED in part — V2 stage 1.** The offer now says WHERE a thing sits (`#nextup-place`), which is the half of this that did not need the owner's use to settle. The bounded contents-on-return card is still the open half and still waits on real filing use.
- **AND THE PROOF MOVED TO WHERE IT CAN BE READ — 2.8.1 (ADR-0099).** This entry names the coverage gauge as the mechanism, and the gauge was the first thing INSIDE the held list — 2.73 screens down on a phone, measured. So the one line that answers *is it still there* was only ever read by somebody who had already scrolled to the thing it was reassuring them about, which is a cue nobody uncertain about the app was reaching. It is now directly under capture. The same release put three entries behind Contents, and this collision is exactly why one of them — the load entry — reports its own state on the row that reaches it: a surface that goes quiet the moment it is out of sight commits the failure this entry describes.
- **ROUTING PROPOSAL** — **V2-candidate, and it is already named as owed.** When a place's review comes round, its return card carries a bounded view of contents (capped per law 8) — the 1.19.0 log entry records this exact question and says to ask the owner after he has used filing, not to guess. That sequencing is the proposal.

### 4. Time blindness — the future is not real until it is now

- **WHAT HAPPENS** — Barkley's temporal myopia: time exists as "now" and "not now", and things in "not now" carry no motivational weight until they cross the horizon and become an emergency. Duration estimation is also impaired in both directions. The person is not careless about deadlines; the deadline genuinely does not exist for them yet.
- **EVIDENCE** — **Strong for the phenomenon, moderate for the model.** Duration misestimation in both directions is replicated. Barkley's temporal-myopia framing is a well-argued account of it rather than a separately tested finding, and this document previously stated it as though it were the latter.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — A due date as the sole representation of time is a cliff: everything is silent until it is suddenly red, which is exactly the now/not-now boundary reproduced in software.
- **WHAT QUIETKEEP ALREADY DOES** — The decay primitive makes time continuous — pressure rises as a gradient with no cliff to print (ADR-0010). Dependency dates compute latest-start and buffer burn from lead estimates, and a miss auto-replans (0.12.0). `.ics` export with `VALARM` puts the alarming in the OS calendar, which fires with the app shut (T1). Duration estimates are logged from v1 by deliberate decision so the data exists before the learning does.
- **SINCE WRITTEN** — **SHIPPED — the approach vocabulary exists** (`approachOf` in `src/nextup.ts`), stating the computed fact in words on the card. Time itself was widened in V2 stage 5: the day now ends when the person says it does, and duration reads as a RANGE from their own history rather than a mean.
- **ROUTING PROPOSAL** — **SHIPPED**, corrected from *later* on 2026-08-17: this entry's own SINCE WRITTEN already recorded the approach vocabulary as built while its mark still said later. Verified in code — `approachOf` (`src/nextup.ts`) is computed on every offered item and rendered at `#nextup-approach`, over `dependencies.ts`'s latest-start and buffer arithmetic. Speak approach the way decay is already spoken: where an offered item feeds a suspense, the card states the computed fact in words. Facts, not urgency theatre; the fold already knew every number.

### 5. Interest-based motivation — importance does not start the engine; INCUP does

- **WHAT HAPPENS** — William Dodson's interest-based nervous system: activation follows Interest, Novelty, Challenge, Urgency, and Passion, not importance or consequence. A task can be acknowledged as critical and still produce nothing, while a fascinating trivial one produces hours. This is a different ignition system, not a values defect.
- **EVIDENCE** — **Community.** INCUP is a clinical coinage (Dodson), widely recognised by the people it describes and without controlled support as a taxonomy. Treat it as vocabulary, never as a rank.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — The Eisenhower quadrant assumes importance activates — its entire top row is a dead letter for this nervous system — and "just prioritize" moralizes the mismatch.
- **WHAT QUIETKEEP ALREADY DOES** — The heat pass is a two-tap interest read (`heat.set`, ADR-0029); the Menu gives wants a home that owes nothing (law 6); a wish rides in every offer and structurally cannot become work (ADR-0060). But the azimuth check found that nothing about interest reaches `nextUp` — everything ranks on *when*.
- **SINCE WRITTEN** — **SHIPPED — 2.7.0 ([ADR-0097](adr/0097-the-offer-reads-interest.md)), exactly as proposed.** Heat now breaks the tie inside the `ready` tier: hot, then unsaid, then cold, then creation order. The Q-11 gate was discharged by MEASUREMENT rather than by asking — every tier of `nextUp` was found to be temporal and the only tie-break inside one to be pressure then creation order (ADR-0095), which is the fact the guess was needed for. Q-12 is untouched: this reads a signal given deliberately in a flow that asks, and still learns nothing from declines. The entry's own binding is honoured three ways — it is a two-state fact the reader stated and not a computed score, it breaks a tie inside one tier rather than reordering any, and **the card says it out loud**, because an interest read that silently reorders the offer IS the hidden rank this entry forbids.
- **AND WHAT THIS ENTRY REFUSED, which mattered more.** The alternative on the table was ranking on IMPORTANCE — making "serves a goal" outrank "serves nothing", using the lineage ADR-0095 had just built. This entry forbids it in terms: the Eisenhower top row is a dead letter for this nervous system, and importance does not activate. It was drafted, and it was going to be put to the owner as a policy question. It did not need his ruling; it needed this paragraph read.
- **ROUTING PROPOSAL** — **SHIPPED** in 2.7.0, and it read *later, explicitly gated on Q-11 and Q-12* until then. The mechanism named here is the one that shipped: heat informing which candidate fills the offer's `ready` slot. The rule that held it — *do not build past Q-11 on a guess* — was right, and it was only half a decision, because nobody went and got the fact that would end the guess.

### 6. Autistic inertia and task-switching cost — hard to start, hard to stop, monotropism underneath

- **WHAT HAPPENS** — Murray, Lesser & Lawson's monotropism: attention pools deeply in few channels rather than spreading thinly across many, so entering and leaving a task are both expensive state changes (Buckle et al. documented inertia as difficulty starting *and* stopping, independent of willingness). A forced switch does not just cost minutes; it can end the day's capacity.
- **EVIDENCE** — **Moderate for monotropism, community for inertia.** Monotropism has a stated theory and growing empirical work behind it; autistic inertia is described consistently by autistic people and has little formal measurement. Both are strong enough to REFUSE against, which is what this entry does.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Time-blocked calendars and pomodoro rotations slice the day into forced transitions, charging the switching toll a dozen times before lunch.
- **WHAT QUIETKEEP ALREADY DOES** — Focus is state-level; the resume card is written *at the interruption*, in the same transaction, because "you do not get to press a button on your way out of the room" (ADR-0039); the five-word cue is invited later, never required; the comms sweep appears only on the focus-exit ramp when its own decay has come round, consolidating the check habit instead of adding interruptions (ADR-0042).
- **ROUTING PROPOSAL** — **refuse** any scheduled-rotation or timeboxing feature: a planner that initiates switches is charging the toll the design exists to avoid. The exit side is well routed; the entry side is entry 1's proposal, not a second mechanism.
- **THE OPEN QUESTION THIS ENTRY NOW OWNS — 2.8.1 (ADR-0099).** Three entries moved off the runway and behind a door, which trades a SCROLL for a SWITCH. This entry says switches are expensive and that is not a hypothetical to wave at; entry 1 says a screen of options is a wall in front of a start. They pull opposite ways here and neither settles it from a chair. The measurement that would: whether reaching the worry box through Contents is cheaper or dearer than scrolling past it was, in use, over days. That is not a refusal and not a proposal — it is a named thing to find out, and the release that raised it is reversible on purpose.

### 7. Hyperfocus — the gift that eats the day

- **WHAT HAPPENS** — Hyperfocus (reviewed by Ashinoff & Abu-Akel) is total absorption with collapsed time perception and suppressed interoception — meals, appointments, and the rest of the plan vanish. It is the same monotropic pull as entry 6 running in your favor, until the day is gone to one thing and the exit lands with guilt about everything unmoved.
- **EVIDENCE** — **Moderate.** Hyperfocus has been measured and has instruments, but the literature is young and the construct's boundaries are argued over.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Conventional tools either spam interruptions (breaking the one genuinely productive state) or stay silent and let the dentist appointment die; none distinguish "a fact you must not miss" from noise.
- **WHAT QUIETKEEP ALREADY DOES** — The hard landscape leads `nextUp`, so real appointments outrank everything; `.ics`/`VALARM` export means the OS alarm fires even with the app shut (T1); the focus surface's elapsed clock is the one thing that runs on its own, ticks in minutes, and writes nothing (ADR-0039).
- **SINCE WRITTEN** — **SHIPPED — 2.7.1, and the delay is worth recording.** The line and its projection (`nextFixedToday`/`nextFixedWords`) were built in V2 stage 5 and rendered on the **work surface only** — the one an absorbed person has already left. So the routing proposal read as outstanding while its mechanism sat finished on the wrong screen, which is hub LESSONS §95's shape exactly: a feature that exists where the reader is not. It now renders on the focus surface too, from the SAME projection rather than a copy, so the two can never disagree. The words are a NAME and never a countdown, as proposed.
- **ROUTING PROPOSAL** — **SHIPPED** in 2.7.1, and it read *V2-candidate* until then. One fact line on the focus surface: the next hard-landscape item today, in words — no countdown, because a countdown is a deadline and adds aversion (ADR-0059's own reasoning). The OS alarm remains the guarantee; the line is the ambient horizon the absorbed person can catch peripherally.

### 8. Demand avoidance — a demand, including your own, triggers refusal

- **WHAT HAPPENS** — PDA (Elizabeth Newson's coinage; the community reframe is "pervasive drive for autonomy"): a perceived demand produces visceral avoidance regardless of the task's appeal, and *self-imposed* demands count — writing "go for a walk" on a list can make the walk impossible. The threat is to autonomy, and the response is not chosen.
- **EVIDENCE** — **Contested.** Demand avoidance as a distinct profile is genuinely disputed in the literature — recognised clinically in some places, rejected as a separate entity in others. The routing here is a refusal, which is the safest thing to build on contested ground.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Every conventional planner is a demand generator: due-dated everything, nagging reminders, "you should", a daily plan that is a wall of obligations by 9am.
- **WHAT QUIETKEEP ALREADY DOES** — This is the best-defended collision in the app. Demand-free kinds are enforced at the write gate — a clock on a Menu item or pebble is *rejected*, not hidden (ADR-0014); acting on a want is a deliberate promotion, never an obligation that accrued (law 6); "Not this"/"Not now" record nothing, forever; the app plots and never prescribes (law 7); rest mode puts the Menu forward.
- **ROUTING PROPOSAL** — **refuse** further building. The remaining ask — even Next up is technically an ask — is already answered by the Menu, the wish, and rest mode; softening the one offer the app makes would dismantle its purpose. The protection here is structural, and additions would only be copy.

### 9. Waiting mode — the 3pm appointment that consumes the whole day

- **WHAT HAPPENS** — Community-named "waiting mode": an upcoming fixed event makes the preceding hours unusable, because working memory must hold vigilance against missing it, and starting anything risks the hyperfocus of entry 7 swallowing the appointment. The hours exist on the clock and not in capacity.
- **EVIDENCE** — **Community.** Waiting mode is near-universally described and essentially unstudied. The routing proposal is a filter over facts the app already holds, which is what makes it safe to build on a community account.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Calendars show the block but say nothing about the gap, and task lists keep offering two-hour work at 1:40 — reinforcing that nothing is startable, so nothing is started.
- **WHAT QUIETKEEP ALREADY DOES** — The honest half, and it ships: the header clock states how much of the local day is left and how many open things are dated today — a count, never a list, and only clocks a PERSON set. Duration estimates have been logged since v1 so a later feature would not start empty-handed, and the `.ics` alarm holds the vigilance from outside the app, which is the part that makes a gap usable at all.
- **ROUTING PROPOSAL** — **refuse** the time-of-day model this proposal needs, and with it the proposal — decided by the evidence in this file, not by the owner. It proposed something unbuildable for as long as it has existed. The proposal read: prefer items whose estimate fits the gap, and say "About an hour before Dentist." **The app does not know when anything happens.** Every clock is day-granular — `clock.set` takes a datetime and every writer in the app builds it with `endOfLocalDay`, and there is no time input anywhere in the markup — so both halves of that sentence are fabricated numbers, which is the one thing ADR-0010 exists to refuse. There is no "later today" to compute a gap against and no "next" among today's dated things to name, because with a day-granular clock they are all equally today.
  - **ADR-0075 already recorded this, about itself**: a release planned the same countdown, could not build it, and wrote down that "a capability was designed before the data model it needed was checked". This entry is that mistake a second time, in a different file, surviving because a research document proposes and an architecture record decides — and nothing held the two to each other.
  - **And the evidence in this catalogue decides the dependency against itself.** A time of day on a clock means a time field on every date control — which raises the effort of setting a cue, on every dating act in the app. Entry 6 grades that cost **Strong** and calls itself "the best-evidenced entry in the catalogue and it is the thesis": Gilbert's offloading studies make the cost of raising cue-setting effort *measurable*, and at high load it abolishes the benefit of offloading entirely. Waiting mode, the only thing the time would serve, is graded **Community** — near-universally described and essentially unstudied. **Strong evidence against, community evidence for.** That is not a close question and it is not a matter of taste.
  - **It was already decided once, in the release most likely to have added one.** The person-set day boundary moved where the day's edge falls and `docs/event-vocabulary.md` records, in the same breath, that it "adds no time-of-day to any clock — clocks stay day-granular (ADR-0010)".
  - **So this was never the owner's to decide, and putting it in his column was the defect** — the same one the status record already names: a question answered by the evidence, handed over as a preference. What remains true is only the cost note from ADR-0075/0076 (it would touch `clock.set`, every date control, the `.ics` export and the replan path), and cost is not the reason. The correct build here is nothing, and the honest surface already ships.

### 10. Spoon budgeting — capacity is finite, variable, and invisible to the plan

- **WHAT HAPPENS** — Christine Miserandino's spoon theory: energy is a small, countable, day-variable budget, and tasks draw it down unevenly. Overextension borrows from tomorrow at punitive interest. A plan built for the good-day self meets the actual day's self and loses.
- **EVIDENCE** — **Community for the metaphor, moderate for pacing.** Spoon theory (Miserandino) is a lived-experience metaphor; the pacing evidence it is often used to carry is real but comes from post-exertional conditions, and that is a DIFFERENT population from the one activation evidence comes from — the conflict this app resolves by asking once and obeying.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Rigid daily plans assume constant capacity; streaks and velocity metrics turn a low-capacity day into a visible failure rather than a fact about the body.
- **WHAT QUIETKEEP ALREADY DOES** — `capacity.declared` is believed on its own — the app has no standing to ask for evidence about how you are (law 7, ADR-0065); pebbles record load with magnitude, three small things or one boulder narrow the offer — never below one, and the wish stays; the note reads "Fewer things, while you have this much on", where *while* is load-bearing: co-occurrence, never causation.
- **SINCE WRITTEN** — **THE PREMISE WAS WRONG, checked 2026-08-17.** *"Down a sheet"* was never true: `#capacity-level` sits inside `<details id="load-entry">`, on the work surface, above every section and directly under capture. So the open question was never placement. What IS true is that the disclosure's summary reads *"Something weighing on you?"* — which names raising a pebble, a different act — and the capacity declaration lives behind it unannounced. **The reach defect is the LABEL, not the location**, and that is a smaller and more specific thing than the entry claimed.
- **ROUTING PROPOSAL** — **SHIPPED** in 2.7.2, and re-aimed by the check above before it was: the work was to make the one control's door say that BOTH acts live behind it, not to move a control that was already in the right place. The summary now reads *"How you are, and anything weighing on you"* — four words became eight, which the word budget had room for. It stays a collapsed door rather than becoming a standing question: an app that asks every morning how you are is a demand, and this is the best-defended part of the product against exactly that (entry 8).

### 11. All-or-nothing restart failure — one missed day reads as ruin

- **WHAT HAPPENS** — Burns' all-or-nothing distortion compounded by Marlatt's abstinence violation effect: a single break is experienced as the destruction of the whole endeavor, so the rational-feeling move is abandonment. Restarting means facing the accumulated pile, which is the highest-activation task imaginable, so the lapse becomes permanent.
- **EVIDENCE** — **Community, with a moderate analogue.** The lived account is unmeasured; the abstinence-violation effect in the relapse literature is the nearest measured thing and is not the same claim.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Streaks are this collision built as a feature — ADR-0010 says it exactly: a streak's real function is the moment it breaks — and the re-entry screen of a conventional app is a wall of red.
- **WHAT QUIETKEEP ALREADY DOES** — Re-entry is the *primary designed path* (law 8, ADR-0043): the greeting is bounded by its return type — counts only, no arrays, so no future surface can render the backlog; a weekend is not a lapse; the amnesty resolves every passed date to the Menu, marking nothing done and deleting nothing; Composed Today expires at midnight with no residue, and "what did I choose yesterday and not do" is structurally uncomputable (ADR-0051); a never-done item reads "ready again", never the loudest band (1.18.3).
- **ROUTING PROPOSAL** — **refuse.** This is the app's most completely routed collision. Anything added here — even a gentle "welcome back" flourish — risks becoming the record of absence the type system was built to make unwritable.

### 12. Novelty decay — every system works until it becomes familiar

- **WHAT HAPPENS** — Dodson's N: novelty itself supplies activation, so a new planner runs beautifully for three weeks on the dopamine of newness, then the newness is metabolized and the system joins the graveyard. Guilt about the abandoned system then blocks return to *any* system.
- **EVIDENCE** — **Moderate.** The retention numbers are solid — median 30-day retention in this category sits near 3–4%. Attributing the drop-off to novelty decay specifically is an inference, and this entry previously read as though the mechanism were established.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Conventional systems depend on a daily tending ritual, so the moment novelty stops funding the ritual, the model collapses — and the return visit is greeted by the pile.
- **WHAT QUIETKEEP ALREADY DOES** — The thesis makes resurfacing *structural, not habitual* — the app cannot depend on the user remembering to review, because that is the capacity it compensates for; levels push down so no review ritual is load-bearing (ADR-0013); the `.ics` half keeps working from the OS calendar while the app sits unopened; and when interest returns, re-entry is the designed path, not a fire exit.
- **ROUTING PROPOSAL** — **refuse** manufactured novelty (themes, seasonal refreshes, gamified variety) — renting engagement from the mechanism that ends it. The honest residual risk is real, and the dogfood gate is already the instrument that measures whether the app survives familiarity.

### 13. Urgency addiction — only a closing door produces motion

- **WHAT HAPPENS** — Dodson's U, formalized in Steel's temporal motivation theory: motivation scales steeply with deadline proximity, so everything happens in the panic window and the person learns to manufacture crises to function. It works, at compounding cost to health and quality, and it is the only lever that has ever reliably worked.
- **EVIDENCE** — **Community.** Widely described, and the closest measured relative is arousal-and-performance work that does not say what this entry says. Kept because the REFUSAL it justifies — never fabricate urgency — is right on other grounds.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Fake urgency everywhere — everything red, everything "due today" — teaches the nervous system to ignore the signal entirely, destroying the one working lever.
- **WHAT QUIETKEEP ALREADY DOES** — It refuses to counterfeit urgency (no red walls, no cliff), and it computes *real* urgency honestly: latest-start from lead estimates, buffer burn, auto-replan on miss (0.12.0). The gradient never lies, so a rising signal stays credible.
- **SINCE WRITTEN** — **SHIPPED with entry 4**, and corrected here on 2026-08-17: this was folded into entry 4's approach vocabulary, that vocabulary is built (`approachOf`, `#nextup-approach`), and so this mark was stale by exactly as long. The refusal half was never at risk — nothing in the app fabricates urgency, and 2.7.0 re-tested that by refusing to let an interest read cross a tier ahead of a real date.
- **ROUTING PROPOSAL** — **SHIPPED**, folded into entry 4's approach vocabulary: real deadlines surfaced early and factually give an urgency-calibrated nervous system a *true* closing door at a survivable distance. The refusal to fabricate urgency is the mechanism; keeping the true signal legible is the work.

### 14. Transition costs between contexts — "just quickly" shreds the day

- **WHAT HAPPENS** — Task-switch costs (Monsell) are amplified several-fold in ADHD and autism: each context change pays a re-entry toll on the abandoned context, so five "quick" interruptions do not cost five minutes — they cost five re-immersions. The day ends with motion everywhere and progress nowhere.
- **EVIDENCE** — **Strong.** Task-switching costs are basic, replicated cognitive psychology, independent of any ADHD or autism claim.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Notification-driven tools initiate switches by design, and context tags label the contexts without ever paying down the return cost.
- **WHAT QUIETKEEP ALREADY DOES** — The interruption *is* a capture (`interrupt.captured`) and the way back is written in the same transaction (ADR-0039); resume cards rank second, behind only a hard date; the comms sweep exists precisely because "each check is cheap, all of them together are the whole day" (ADR-0042); the lens changes what you look at, never what is held (ADR-0054).
- **ROUTING PROPOSAL** — **refuse** anything push-shaped beyond T0/T1. The routing here is subtractive: the app's job is to make interruption cheap to record and return cheap to find, both built — not to become another source of switches.

### 15. Rejection sensitivity meeting reminders — a nudge that lands as reproach

- **WHAT HAPPENS** — Dodson's rejection sensitive dysphoria: perceived criticism or disappointment produces disproportionate pain, and a machine's neutral reminder is read with the same raw nerve — "You still haven't…" from an app is a disappointed voice. The adaptive response is to stop opening the app, and then the system is dead.
- **EVIDENCE** — **Disproven as stated; strong underneath.** RSD is not a distinct diagnostic entity and has no measure of its own — it is now a named refusal (NOTES.md). Emotional dysregulation in adult ADHD is well evidenced, and it carries everything this entry needs. The routing is unchanged; the warrant is corrected.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Overdue counts, red badges, and guilt-flavored nudge copy make every app-open an indictment; the badge number is a running tally of your failures on your home screen.
- **WHAT QUIETKEEP ALREADY DOES** — Voice is enforced, not intended: the banned-vocabulary CI gate; "ready again" and pressure gradients in place of accusation; the greeting states a fact and never apologises on your behalf — a test asserts the absence of eleven specific formulations (ADR-0043); "Stopped. It is waiting for you", never "abandoned"; the sweep says "Last pass through your messages was 6 days ago", never "you haven't checked since Tuesday" (ADR-0042).
- **SINCE WRITTEN** — **SHIPPED — the voice gate covers notification copy** (`tools/notify-voice.mjs`, in the battery). It landed in the V2 stage-7 run and this entry still read as a candidate until 2026-08-17, which is the stale-record defect this repo has now found in four places in one day. The constraint is in force BEFORE T2 exists, which was the whole point of asking for it early.
- **ROUTING PROPOSAL** — **SHIPPED**, and it read *V2-candidate, as a constraint rather than a feature* until then. T2 push is on the v2 Could list, and a push notification is this collision's delivery mechanism: the voice gate covers notification copy so no sentence leaves the app unmeasured. Cheap then, impossible to retrofit after the first bad push.

### 16. Choice overload — twenty options produce zero actions

- **WHAT HAPPENS** — Iyengar & Lepper's classic finding, with Scheibehenne's meta-analytic caveat the thesis already records: the paralysis effect is real specifically where options are similar and stakes ambiguous — which describes every task list ever written. For someone already paying entry 1's activation cost, the comparison step is a second wall in front of the first.
- **EVIDENCE** — **Contested, and this is the correction that matters most here.** The classic choice-overload demonstration replicates poorly and meta-analysis puts the average effect near zero. ADR-0060's cap is still right, but it stands on the ACTIVATION cost of comparison at the moment of stuckness — a different and better-evidenced claim — rather than on choice overload as a general law. The decision does not change; the reason in the record does.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — The list *is* the interface: forty comparable rows, each a small demand, presented as the precondition to doing anything.
- **WHAT QUIETKEEP ALREADY DOES** — Triage shows one card and asks one question, forced choice (ADR-0029); the offer is capped at two, at most one per reason, unalike by construction so choosing is preference rather than weighing (ADR-0060); even the timer's length options live in Extras, not at the point of starting, because "showing options to someone stuck at activation is choice overload where it costs most" (ADR-0059).
- **ROUTING PROPOSAL** — **refuse.** ADR-0060's own overturn clause holds the line: a third and fourth offer class is a comparison again. Routed; the work is to keep it routed.

### 17. Working-memory loss between capture and action — "why did I write this"

- **WHAT HAPPENS** — Working memory (Baddeley) holds the context that made a captured fragment meaningful, and it drops that context within hours. The capture succeeds; the retrieval cue rots. At triage, "call about the thing" is a stranger's note, so the item is routed blind, or trashed, or — worse — kept out of vague guilt.
- **EVIDENCE** — **Strong.** Working-memory limits and the loss of encoding context are foundational and uncontroversial.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Inbox-zero pressure demands fast processing of exactly these stale fragments, and the interface shows the bare text as if the words were ever the whole message.
- **WHAT QUIETKEEP ALREADY DOES** — Capture is zero-chrome and demands nothing at write time, which is correct — the moment of capture cannot afford questions. Interrupt captures pair automatically with the focus they interrupted (ADR-0039), which is context by construction; the note field and the resume card's five-word cue exist for deliberate context. An ordinary dump capture, though, arrives at triage as bare words.
- **SINCE WRITTEN** — **SHIPPED — 1.29.0.** The triage card states capture context as assembled fact (`src/capture-context.ts`), pure projection over the log, co-occurrence only.
- **ROUTING PROPOSAL** — **SHIPPED** in 1.29.0, corrected from *V2-candidate* on 2026-08-17 — its own SINCE WRITTEN said built while the mark said candidate. The triage card states capture context as assembled fact — when it was written, and what was in focus if anything was. Pure projection over the log; every datum already exists; zero new events; co-occurrence only (law 7). The same "context assembled" move law 3 already makes for replan cards, applied one surface earlier.

### 18. The planning/doing gap — planning as the most respectable procrastination

- **WHAT HAPPENS** — Sirois & Pychyl's finding that procrastination is short-term mood repair explains why system-tending is its favorite disguise: reorganizing the list *feels* like progress, repairs the mood, and defers the aversive task — while looking, to yourself and everyone else, like diligence. Meta-work expands to fill the anxiety available.
- **EVIDENCE** — **Community.** Recognised everywhere, measured nowhere in this form. The refusal it justifies is cheap and reversible, which is the right posture for evidence of this strength.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Conventional systems reward tending: grooming, tagging, re-prioritizing, and perfecting the setup are always available, always virtuous-feeling, and infinitely deep.
- **WHAT QUIETKEEP ALREADY DOES** — Law 4 is the structural answer: the runway is the only workspace, altitude views are inspection modes, the user never climbs (ADR-0013); Review is exceptions-first — a top handful of computed problems, never a tree to garden; goals and areas are cheap, optional, and demand no maintenance; there is very little surface *to* polish.
- **SINCE WRITTEN** — **THE CONSTRAINT WAS HONOURED when the work it constrained shipped — 2.5.0.** Law 4's downward projection now exists ([ADR-0095](adr/0095-what-a-thing-is-for.md)) and it arrives as exactly what this entry demanded: a computed line saying what a thing serves, explicitly *never a destination*, with no door to a horizon and nothing to rearrange. The entry did its job by being read before the build rather than after.
- **ROUTING PROPOSAL** — **refuse** curation surfaces, permanently — and carry this entry as a design constraint on the law-4 projection work: when higher horizons inform the runway, they must arrive as computed signal, never as a new place to rearrange things.

### 19. Body doubling and external accountability — another person's presence unlocks the start

- **WHAT HAPPENS** — Body doubling (from the ADHD coaching community, often credited to coach Linda Anderson): the quiet presence of another person dramatically lowers initiation cost — not through supervision but through co-regulation and a gentle anchor to the present task. External accountability similarly externalizes the launch mechanism that entry 1 shows is impaired.
- **EVIDENCE** — **Community.** Body doubling has enormous lived support and very little controlled work. The routing refuses to simulate it, which needs no evidence at all.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Productivity apps counterfeit it as surveillance — shared streaks, public commitments, shame-as-a-service — which converts a co-regulation need into a rejection-sensitivity trap (entry 15).
- **WHAT QUIETKEEP ALREADY DOES** — Nothing, and mostly rightly: no accounts, no social features, no telemetry are named refusals on the Won't list. The timer's pulsing presence mark is the app's one, honest "something is here with you" gesture (ADR-0059).
- **ROUTING PROPOSAL** — **refuse** simulated or networked accountability. An offline single-user app cannot ethically fake a person, and attendance-keeping is the forbidden ledger. What it can honestly do already exists: the printable today-card is a sharable artifact the owner can hand to a real human — a partner, a colleague, a body-doubling call — on his own terms, with the app never knowing.

### 20. Special-interest integration — interests as fuel, not guilt

- **WHAT HAPPENS** — For autistic and AuDHD people, special interests are the deepest and most renewable motivational reservoir (the monotropism literature treats them as attention's home state, not a distraction from it). Systems that classify interest time as "unproductive" convert the person's best energy source into a guilt source, and the guilt then contaminates the interest itself.
- **EVIDENCE** — **Moderate.** Interest-driven engagement in autistic people is studied; the planning-tool application here is an extrapolation from it.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Eisenhower files interests under not-urgent/not-important; "reward yourself after the real work" frames the interest as dessert that must be earned — an obligation gate on the one thing that never needed one.
- **WHAT QUIETKEEP ALREADY DOES** — The Menu is a first-class, structurally safe home for wants — a clock on one is rejected at the gate, so wanting never becomes owing (ADR-0014); a wish rides in every offer as a door, not a demand, and on a heavy day "the thing you actually wanted is the most appropriate offer in the set, not the least" (ADR-0065); rest mode puts the Menu forward.
- **SINCE WRITTEN** — **BOTH GATES DISCHARGED 2026-08-17, and the answer is a REFUSAL rather than a build.** Q-11 fell to entry 5's interest-aware offering ([ADR-0097](adr/0097-the-offer-reads-interest.md), 2.7.0). Q-12 was then answered from this document: learning what pulls somebody from what they DECLINE is avoidance data, which entry 2 refuses as *"an inferred wall"* and entry 8 refuses as further building on the best-defended collision in the app. **A signal somebody chose to give is not the same object as one inferred from what they avoided**, and the app now has the first — so it can be interest-aware without ever keeping the second.
- **ROUTING PROPOSAL** — **refuse** anything algorithmic here, reversed from *later* now that both its gates are answered. The routing is the existing guarantee, worth stating as such in the app's own words: time on the Menu is never measured, compared, or earned.

### 21. Follow-through on other people's pieces — delegated things evaporate

- **WHAT HAPPENS** — Prospective memory (Einstein & McDaniel) fails hardest for intentions with no natural cue, and "waiting for Sam's reply" has none: no artifact on the desk, no scheduled moment. The choice degrades to obsessive checking or total evaporation, and the evaporation is discovered three weeks later, in front of the person it inconvenienced.
- **EVIDENCE** — **Community.** A description of what happens, not a finding.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Most tools model only your own actions; a waiting-for is either a fake task that clutters the list or a note that never resurfaces.
- **WHAT QUIETKEEP ALREADY DOES** — The waiting-for route is one tap in triage and lands with a three-day return clock (ADR-0029); the person lens attributes it when a name exists and shows the unattributed honestly, because one-tap capture makes unattributed the commonest kind (ADR-0040); request slots and the Not Now ledger keep decisions about other people's asks (ADR-0056); suspenses and the delta report carry the tracked-portfolio half (ADR-0041, ADR-0068).
- **ROUTING PROPOSAL** — **refuse** new mechanism; the machinery is unusually complete. The azimuth check's "waiting-for: zero after real use" reads as a places problem (nothing could be filed anywhere pre-1.19.0), not a missing feature — let the `filed` route bed in before concluding otherwise.

### 22. Rest guilt — the inability to rest without the rest being spoiled

- **WHAT HAPPENS** — After a lifetime of "lazy" as the explanation for executive dysfunction, rest arrives pre-poisoned: the person is too depleted to work and too guilty to recover, achieving neither. Burnout research in autistic adults (Raymaker et al.) names sustained masking and overextension without recovery as the mechanism; rest is not a luxury input here, it is maintenance.
- **EVIDENCE** — **Community.** Widely described, unmeasured, and the routing is a refusal, so the evidence bar for acting on it is low by construction.
- **HOW CONVENTIONAL SYSTEMS MAKE IT WORSE** — Streak-keeping and activity graphs make a rest day visibly emptier than every other day — the calendar heat-map's pale square is a small public accusation.
- **WHAT QUIETKEEP ALREADY DOES** — "Rest is legitimate" is law 8, not copy: rest mode exists; a weekend is not a lapse; absence is greeted with "You were away a fortnight. Everything you put down is still here" — a fact, not a bill (ADR-0043); nothing anywhere renders a completion count over time, so a rest week cannot produce a lower number on any surface.
- **ROUTING PROPOSAL** — **refuse.** Any activity summary, however kind its intent, creates the comparison that spoils the rest. The epigraph is the routing: it holds the rest, so you can rest.

---

## TOP 5 ROUTING PROPOSALS — **four of these five have since SHIPPED**

**Read the status line before the ranking.** This list was written once, as a
ranking of what to build next, and was never revised as its items were built —
while each entry above recorded its own `SINCE WRITTEN — SHIPPED` line the whole
time. One document, two answers, and this was the half nobody maintained. That is
the same defect the file's own header describes and the gate was built to stop;
the gate held the ENTRIES honest and never looked here. It does now
(`tools/collisions.mjs`), so a shipped proposal cannot sit in this list again.

1. **Place-return-with-contents (entry 3)** — **SHIPPED, 1.27.0.** A place that
   comes round names what it is holding rather than counting it. Asserted by the
   smoke walk.
2. **Capture context on the triage card (entry 17)** — **SHIPPED, 1.29.0.** The
   card says when the item was written, and never how long ago.
3. **The "smaller bite" verb on the offer (entry 1)** — **SHIPPED, 1.28.0.**
   `#nextup-bite` writes an ordinary child under the offered item, and the offer
   then holds the bite.
4. **The pocket offer for waiting mode (entry 9)** — **REFUSED, and this line was
   wrong in its own way.** It said "both inputs exist" and named the missing
   piece as a fold field for `estimate.recorded`. Both halves are false: the app
   has no time of day at all, so there is no gap to fit a duration into and no
   "later today" to measure one against. Entry 9 now carries the refusal and the
   evidence behind it — strong against, community for. **Two statements of one
   fact, in one file, both wrong and wrong differently**, which is exactly the
   failure the header above describes and the reason the entry gate exists; this
   list is the half that keeps finding new ways to say the wrong thing.
5. **"This one is heavy" from the detail sheet (entry 2)** — **SHIPPED as WEIGHT
   rather than as a pebble, 1.34.0.** The shape changed on the way in, which is
   why the entry says so rather than claiming the proposal landed unaltered.

Deliberately absent from this list: every interest-signal and ranking proposal (entries 5, 13, 20), because Q-11 is asked and not answered, and the repo's own rule — *do not build past this on a guess* — outranks any ranking here.

---
