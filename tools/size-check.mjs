#!/usr/bin/env node
// HOW MUCH DOES A PERSON HAVE TO READ? — the measurement nobody was taking.
//
// Reported 2026-08-09, on a real device, in the plainest possible terms: finding
// how to send something to the calendar took minutes of scrolling and reading,
// and the app reads like an encyclopedia. It did. The shell held 5,702 words and
// 148 controls, in an app whose thesis is *one thing, chosen for you*, built for
// people who lose the thread when there is too much on screen.
//
// THE MECHANISM IS THE POINT, because it will do this again. Every rule in the
// doctrine says explain it, say why, never let anything be silent, add the hint,
// state the reason. Applied release by release they are all defensible and each
// addition is small. Nothing ever measured the SUM. There were eleven gates in
// this repo and not one of them counted anything a reader has to get through, so
// the total grew for weeks with every gate green.
//
// A budget is the only thing that turns "keep it short" from an intention into a
// gate. These numbers are not aspirations — they are slightly above what the app
// measures today, so the next thing that pushes past them has to be worth
// pushing past them, and somebody has to decide that on purpose.
//
// WHAT IT MEASURES, and each is a different way of being too long:
//   1. Words in the shell — total reading, wherever it hides.
//   2. Rendered height of EVERY destination at phone width — scroll distance,
//      which is what "I could not find it" actually feels like. Words alone miss
//      this: the same text in bigger type is a longer scroll.
//   3. Controls — 148 buttons is its own kind of unreadable, and cutting prose
//      does not touch it.
//
// PER SURFACE, NOT PER PANEL (1.40.0). This measured `#about-body` alone, when
// the ⓘ was the only screen and the four groups folded inside it. Splitting them
// into their own sheets made that number fall by three quarters without a word
// being cut — the reading did not go anywhere, it went somewhere the gate could
// not see. A budget that a refactor satisfies is not measuring the thing it was
// written to measure.
//
// RAISING A BUDGET IS ALLOWED. Lowering it silently is not the point either.
// What is refused is drifting past one without noticing, which is exactly what
// happened.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Set 2026-08-09, just above what the app measures after the reduction from
// 5,702 words. A ceiling to stop drift, NOT a claim that the current numbers are
// right — 199 controls is a lot for this product and the honest thing is to say
// so here rather than to launder it as a target that has been met. Cutting
// controls is a different and larger job than cutting prose; this stops the
// number growing while nobody is looking, which is the failure that happened.
const BUDGET = {
  // 3300 -> 3340 on 2026-08-17 (ADR-0096). Roles add one labelled field to the
  // detail sheet with its hint, and one readout sheet whose whole content is a
  // sentence saying it is NOT a score. That sentence is the thing that makes the
  // readout legal under law 7, so cutting it to fit a word budget would cut the
  // safeguard and keep the numbers — exactly backwards.
  // 3340 -> 3390 on 2026-08-17 (ADR-0098). One Settings block: a heading, two
  // sentences of scope, a label and the note. The scope sentences ARE the
  // feature — the request was for a size that touches this app and nothing else,
  // so a control that did not say so would be answering a different question.
  // 3390 -> 3394 on 2026-08-22 (2.20.0): two words in the relation picker
  // ("I said I would") and the second count line in "With other people". The
  // section was already there and already said what it was for; it had one of
  // its two halves. This is the smaller half arriving, not a new surface.
  // 3394 -> 3455 on 2026-08-22 (2.21.0): the situation sheet. A heading, one
  // paragraph saying what the two inputs do and that nothing is taken away
  // (the law-1 sentence every filter surface here carries), a label, a
  // placeholder and a hint. **The two inputs themselves moved rather than
  // arrived** — they were in the pile and the pile is the last place somebody
  // answering "what is my situation" looks. What a reader meets on the first
  // screen goes DOWN by two rows and up by one door; this budget counts words
  // in the markup and cannot see that, which is the fourth time in six
  // releases it has read the wrong way round.
  // 3455 -> 3467 on 2026-08-22 (2.23.0): the six Menu category words and a
  // hidden label, on a picker beside a button that already existed. The words
  // were ALREADY in the app — the sort sheet's bulk picker has offered the same
  // six since 1.3.1. This is the single-item route catching up with them.
  // 3467 -> 3490 on 2026-08-22 (2.23.0): the six Menu category words, plus a
  // label, placeholder and hint for the first-step field on the detail sheet.
  // Neither is a new idea — the six have been in the sort sheet's bulk picker
  // since 1.3.1, and the first-step flow has been on the offer card since
  // 1.24.0. Both are single-item routes catching up with machinery that was
  // already shipped and reachable from exactly one place.
  // 3490 -> 3500 on 2026-08-23 (2.24.0): two <h3>s in the roles sheet, which now
  // holds TWO readouts — what each role is carrying, and where the time actually
  // went. This gate refused the release at 3498 and it was right to.
  //
  // The first answer was to drop both headings and name the lists with
  // `aria-label`, which costs nothing here because an attribute is not shell
  // text. Then the sheet was rendered and looked at: without headings it reads
  // "Parent — 1 thing", a paragraph, "Parent — no timed work", with nothing
  // saying those are two different readouts, which looks like a contradiction.
  //
  // So the words are bought deliberately, which is the only way this number is
  // allowed to move. Nothing on the first screen changes — both headings are
  // inside a sheet behind a door that is hidden until a role exists.
  // 3500 -> 3506 on 2026-08-23 (2.26.0): the third filter axis. Six words —
  // the "Who is here" label, and the sheet's opening sentence naming three
  // things where it named two. Bought deliberately: the axis is entry 24's
  // best-evidenced of the three, and a chooser nobody can read the purpose of
  // is a control that does not work.
  //
  // Nothing on the first screen changes. Both live inside `#sheet-situation`,
  // behind a door, and the chooser itself is hidden until somebody has been
  // named.
  // 3506 -> 3512 on 2026-08-23 (2.27.0): six words in the detail sheet's place
  // hint, and they are honesty rather than polish. It read "a thing with no
  // place at all can be done anywhere", which stopped being true the moment a
  // place on a project began reaching the work inside it. A sheet that is
  // quietly wrong about what the app does is worse than one that says less, and
  // the first rewrite cost fifteen words before being cut to six.
  // 3512 -> 3530 on 2026-08-23 (2.28.0): eighteen words for the ask-once row —
  // a label, a button, and the sentence that makes it visibly declinable.
  //
  // That sentence is not decoration and is the reason this is not a smaller
  // number. Entry 23 requires the ask be "worded as declinable as Not this
  // already is", and entry 8 is why: a non-optional request produces resistance,
  // and visibly preserving choice measurably reduces it. A bare field with a
  // button is a demand wearing a question mark.
  //
  // The first draft cost twenty-four. The label now matches the chooser it
  // replaces — same slot, same words, two states — and the hint lost a clause
  // that repeated what the sentence after it already said.
  //
  // Nothing on the first screen changes: the row is inside the situation sheet,
  // behind a door, and it is hidden the moment a place exists.
  // 3530 -> 3534 on 2026-08-23 (2.29.0): "How it works", the manual's link, in
  // the footer beside the accessibility statement. Four words including the
  // separator, on every screen, for a page that answers every question this app
  // can be asked. The alternative was another destination inside the ⓘ, which
  // is already six deep and held to 3,000px each.
  // 3534 -> 3570 on 2026-08-23 (2.31.0): the intro now says to add Quietkeep to
  // the home screen BEFORE offering to keep the data, shown only when the
  // display mode says this is not an installed launch. 33 words.
  //
  // WORTH IT, and the trade is worth stating rather than assuming. Reported from
  // a device: in a tab the browser refuses that ask nearly every time, and the
  // panel's answer only mentioned the home screen AFTER the refusal. So the
  // first screen anybody sees invited a press, produced a no, and printed the
  // remedy underneath — which reads as the app being broken, on the one screen
  // where a reader has no way to tell the difference.
  //
  // Thirty-three words that stop a failure are cheaper than the failure. The
  // first draft was sixty and it also pushed the standing-prose budget past
  // 11,000px; it was cut to thirty-three and that budget passes untouched at
  // 10,893px, which is the version of "deliberate" this file actually wants —
  // raise the one that had to move, not both.
  // 3570 -> 3576 on 2026-08-23 (2.33.0): "The places you have", the heading over
  // the new readout on the attention sheet. Four words plus its own id.
  //
  // Reported from a device: "I do not know how I would view my list of projects
  // to see what came through, or my contexts." `allContexts` was called in
  // exactly two places in the whole app — the situation sheet's chooser and an
  // item's own panel — so a place existed only inside a control that filters BY
  // it, and there was nowhere to ask what you have. A heading is what makes the
  // block findable; the line under it is rendered, so it costs nothing here.
  // 3576 -> 3588 on 2026-08-24 (3.0.0). Twelve words: the hub's heading, the way
  // back, and the (+)'s spoken name. Every door's text is DERIVED from the
  // section it opens, so the list itself adds nothing here however long it gets.
  // 3588 -> 3650 on 2026-08-25 (3.1.0). Fifty-nine words, and all of them are
  // the names of choices: *whatever your device is set to*, *light*, *dark*, and
  // the record's *newest first* / *oldest first* with the four sizes it can
  // arrive in. The words ARE the control — an option named in a sentence is the
  // difference between choosing and guessing, and the alternative to every one
  // of them was the app deciding silently, which is how both were reported.
  // 3650 -> 3700 on 2026-08-25 (3.4.0). Thirty-three words: five palette names,
  // the label, the button and one sentence saying they are all held to the same
  // floors. The names ARE the control — PALETTES.md and Doctrine §4 both refuse a
  // row of swatches, because a coloured square alone asks the reader to tell
  // colours apart in order to work a colour control.
  // 3700 -> 3705 on 2026-08-28 (3.8.0). Five words: "commas between them" in the
  // place hint and again in the role hint.
  //
  // THE APP WAS ALREADY MAKING THIS PROMISE AND NOT KEEPING IT. The place
  // field's placeholder has read `at home, out, on the phone` since 2.2.0, and
  // the whole string went in as ONE label — so a real store carries a place
  // named after the instruction the app gave, and the reader who followed the
  // example got a place they could not find the way to remove. The behaviour is
  // fixed; these five words are the hint saying out loud what the placeholder
  // has always implied, because a placeholder vanishes the moment you type and
  // is the wrong place for the only statement of a rule.
  //
  // Nothing on the first screen changes: both lines are inside the detail sheet,
  // behind a door, under a field nothing requires you to fill.
  // 3705 -> 3709 on 2026-08-29 (3.9.2). Four words, and they are one rename
  // counted twice: the way-to-everything door and the heading of the panel it
  // opens both went from `Everything else` to `Elsewhere in the app`.
  //
  // A LEFTOVER LABEL WAS SITTING FIRST. *Else* is fine modifying WHERE and wrong
  // modifying WHAT — the second says the contents are the remainder, and behind
  // that door are seven rooms nobody would call leftovers. 3.4.3 retired `More`
  // for naming a quantity instead of a destination and wrote down the reason —
  // these are the app rather than your work — without ever putting it on the
  // control. It is on the control now, which is what the two extra words buy.
  //
  // `Other places` was the draft and cost nothing, and it collided with the
  // reader's own filing: a *place* is a thing somebody types on the detail
  // sheet, it is a kind word, and two live controls say `Narrow the places` to a
  // screen reader. Four words that do not lie beat two that do.
  // 3709 -> 3712 on 2026-08-29 (3.9.2). Three words on the `+` inside a job.
  // It was named "Put something down" — the capture field's OWN label — on a
  // control whose handler calls `leave()` first and ends the job you are in.
  // Walked as a reader it looked like a second capture box beside the one
  // already on screen; it is the way out with a plus on it. "Leave this and put
  // something down" is what it does, and somebody mid-task can now decide
  // whether the thought is worth the place. Three words to stop a control
  // costing somebody their place in a job is the cheapest raise in this list.
  // 3712 -> 3717 on 2026-08-30 (3.12.0). Five words: "What is on this line",
  // the heading of the reverse walk on a role's own sheet.
  //
  // EVERY LINK IN THIS APP WAS TRAVERSED FORWARD ONLY. `rolesOf` says which
  // identities a thing carries, `servesNode` which horizon it serves,
  // `dependencyView` what it feeds — and nothing answered the other direction.
  // A repo-wide search for `roles.includes` returned one hit, the fold's own
  // dedupe. So the attention readout could say attention went somewhere and
  // there was no way to see what was there.
  //
  // Five words for the direction that was missing is the cheapest raise in this
  // list by some distance, and it costs no new surface: a role is an ordinary
  // node, so its own sheet is the home, exactly as a person's is.
  // 3717 -> 3744 on 2026-08-30 (3.16.0). Twenty-seven words, all of them the
  // meeting: "Who is in it?", the one line under the toggles saying what more
  // than one person makes, and the room's own chrome — its title, the sentence
  // above its lists, and the two group labels that appear when the work in it
  // sits under a horizon or carries a line. Nothing was removed to pay for it,
  // and nothing here is prose a reader has to get past to work: the picker is
  // one label and one hint, and the rest is a surface that only exists once a
  // meeting has been named.
  // 3744 -> 3749 on 2026-08-30 (3.17.0). Five words: the whole-review sheet's
  // heading and its Close. The sentence above its list is rendered from the
  // same `reviewWords` the surface already uses, so it costs the shell nothing,
  // and the rows are built from the store rather than written here — a store
  // with forty findings behind the total adds not one word to this file.
  words: 3749,
  // Per DESTINATION, and every one is held to it. 3,000px is a shade over three
  // phone screens — far enough to be a scroll, near enough that the bottom of a
  // screen is a place you can get to rather than a place you give up before.
  //
  // Set from what the four sheets actually measure at 1.40.0 (Settings is the
  // tallest and has the most headroom to lose). It replaces `panelPx: 9000`,
  // which was set against a thirteen-screen panel and was never a limit anybody
  // could hit — a budget nothing can exceed is a comment.
  // NO WIDE BUDGET, AND THAT IS A DECISION (3.2.0, ADR-0109). The wide
  // arrangement puts the hub beside the job; it adds no content. These budgets
  // are measured at 390px, where prose reflows TALLEST, and a wider viewport can
  // only make the same words shorter. 390 stays the binding case, so a second
  // measurement here would be a number that can never be the one that fails —
  // which this file already calls a comment rather than a budget.
  // 3000 -> 3400 on 2026-08-26 (3.5.0), and ONLY Settings needs it — every other
  // destination is between 518 and 2,492, so this is one surface's raise wearing
  // a shared number. That is the flaw in having one ceiling for six rooms, and it
  // is recorded rather than fixed here: fixing it means a per-surface budget, and
  // a budget nobody has measured against is worse than a shared one everybody has.
  // What bought it: the colour picker became five pictures (see `allSurfacesPx`).
  // 3400 -> 3000 on 2026-08-26 (3.5.1), BACK DOWN, which is the half of a
  // ratchet that never happens on its own. That raise was bought by the colour
  // tiles crowding Settings; colour is its own door now, Settings measures 2,656
  // and the tiles measure 1,226, and neither is near 3,000. Leaving the number
  // at 3,400 would have banked 744px of headroom nothing paid for — a budget
  // that keeps the space a move just freed has stopped being a budget.
  surfacePx: 3000,
  // The sum, so that "make it six screens instead of one" cannot pass by
  // dividing. What a person has to get through does not shrink because it was
  // filed, and this number is here to say so out loud: splitting Settings into
  // three destinations in 1.40.0 moved 10,830px around and cut NOTHING. Travel
  // was the complaint and travel is what the per-surface budget fixes; the total
  // is still an app with ten screens of explanation in it.
  //
  // Set just above today's measurement, as a ratchet. It is not a target that
  // has been met — the honest thing is to say here that it is too high rather
  // than to launder it as an achievement.
  // 11000 -> 11300 on 2026-08-25 (3.1.0). Two controls a reader asked for, each
  // with one line saying what it does: light-or-dark in Settings, and the
  // record's two readings under Your data. About 250px between them, and the
  // per-destination numbers barely moved — Settings 2,650 and Your data 2,486,
  // both well inside 3,000.
  //
  // This measures SCROLL, so a control counts as prose here; the note at
  // `controls` records the same confusion from the other end. The ratchet is
  // still a ratchet and this is still too high, which the line below has always
  // said and this raise does not change.
  // 11300 -> 11650 on 2026-08-25 (3.4.0). The palette picker and its one
  // sentence, in Settings, which is 2,650px of a 3,000px budget and unmoved by
  // this. Same note as the raise below it: this measures SCROLL, so a control
  // counts as prose, and the ratchet is still too high.
  // 11660 -> 12050 on 2026-08-26 (3.5.0). THE COLOUR PICKER BECAME PICTURES.
  // Five tiles, one per family, each cut on a diagonal so day and night are one
  // image. That is 371px of SCROLL and close to none of what this budget is
  // actually protecting against, which is reading burden: five pictures are
  // less work to compare than five names with a sentence each, and the sentence
  // each is what was there before. This file already says the quiet part at the
  // `controls` note — it measures scroll, so a control counts as prose — and a
  // picture is the case where that overstates the cost most.
  // WHAT WAS TRIED FIRST. Smaller tiles: 6.5rem to 5rem saves 174px and makes
  // them 80px wide, at which you can see a light half and a dark half and not
  // much else. A preview too small to judge is not a preview, so the pixels
  // were paid rather than the feature hollowed out.
  // AND THE THING TO WATCH. Settings is now the largest destination by a
  // distance. If it needs another raise, the answer is probably not a bigger
  // number: colour has a heading, five pictures and its own explanation, and
  // that is a door rather than a block in somebody else's panel.
  // 11650 -> 11660 on 2026-08-26 (3.4.3). FOUR PIXELS, and the smallest raise
  // this file has ever taken, so it is worth saying exactly what bought them:
  // the colour picker had NO HEADING. Every other block in Settings has one, and
  // the section a reader lands on for "which colours" opened straight into a
  // sentence. That is a heading's worth of pixels for a real defect.
  // The PROSE around it went DOWN, not up, and deliberately: this raise paid for
  // the heading alone. The replacement copy was longer than what it replaced and
  // pushed three budgets at once — words, Settings and this — which is exactly
  // the drift this file exists to refuse, so it was cut back past the original
  // rather than accommodated. Settings ended at 2,995 of 3,000, having been over.
  // The ratchet is still a ratchet and this is still too high.
  // 12050 -> 12600 on 2026-08-26 (3.5.1), and this one goes UP for a reason the
  // per-surface number cannot see. Splitting a destination in two ADDS to the
  // total even as it lowers every surface in it: the new sheet carries its own
  // title and its own way out, and the tiles it was built for are now full width
  // rather than two-up, which is the entire point of moving them. Settings fell
  // 3,299 -> 2,656 and Colours arrived at 1,226, so the total moved +583.
  // This is the trade the two numbers exist to price separately. Travel is what
  // the per-surface budget protects and it improved; sprawl is what this one
  // refuses and it got worse, deliberately, by one door.
  allSurfacesPx: 12600,
  // The current release's notes, measured alone. Their own budget rather than a
  // share of the ratchet above, because they rotate out and standing prose does
  // not — see the long note at the measurement.
  //
  // 1200. Two reader-facing bullets measure 606px; four longer ones measured
  // 1049px before two were cut for being about the test suite rather than about
  // the app (§5). So this is room for a genuinely big release to say what it did
  // AND what it did not fix, and not room for an essay — ten bullets would be
  // near 3,000 and would fail.
  //
  // IT WAS 600 FOR TEN MINUTES AND THAT NUMBER WAS WRONG. It came from the
  // DELTA between this release's notes and the previous one's (390px), not from
  // the height of the block itself (1,049px) — a number measured for one purpose
  // and reused for another without re-reading what it was. The gate then failed
  // by six pixels, which is the exact trap hub LESSONS §62 records: three pixels
  // short, with the product's honesty measurably worse. Six pixels is never a
  // reason to cut a sentence.
  // 1200 -> 1300 on 2026-08-19 (2.10.1). Four pixels over, and this file's own
  // note twenty lines up settles it: "six pixels is never a reason to cut a
  // sentence" — hub LESSONS §62, where three pixels of headroom were bought by
  // making the product measurably less honest. The release that reports having
  // finally LOOKED at the screen is not the one to trim for four pixels.
  //
  // 1300 -> 1400 THE SAME DAY, IN THE SAME RELEASE, and the second raise is the
  // one worth reading. 1300 was set against six bullets and then a seventh was
  // written — the `#menu-open` move, which `controls.mjs` REQUIRES in the running
  // release's notes — so the budget had been fitted to a block that was not
  // finished. Raising a ceiling to clear a measurement taken before the work was
  // done is not a deliberate raise, it is a ratchet chasing its own tail.
  //
  // The seventh bullet was first folded into the third to save the height. IT
  // SAVED NOTHING — 1330px before and 1330px after, because the height is the
  // words and the words did not change — and it cost the declaration the shape
  // `controls.mjs` asks for, which leads with WHERE. Merging prose to satisfy a
  // pixel budget is the §62 trap wearing a disguise: it looks like editing and it
  // is the same trade, honesty for headroom, with the honesty spent on layout
  // instead of on a cut sentence.
  //
  // So: seven bullets measure 1330. 1400 is that with one line spare, and ten
  // bullets are still near 3,000 and still fail, which is what this number is
  // actually for.
  // 1400 -> 1650 on 2026-08-25 (3.1.0). Eight bullets, for a release that fixed
  // three separately reported defects and added a chooser. They were 2,234px
  // when first written and are 1,599 now: two were cut for being about the
  // building rather than about the change, and five were tightened word by word
  // with nothing dropped. What is left is the ⓘ's own rule — six pixels is never
  // a reason to cut a sentence, and 199 is one sentence.
  //
  // The budget was fitted to SEVEN bullets at 1,330. This is eight, and the
  // ceiling now says so out loud rather than being cleared by an edit that makes
  // the product say less. Ten bullets are still near 3,000 and still fail, which
  // is what this number is actually for.
  notesPx: 1650,
  // 205 -> 210 on 2026-08-09, ONE COMMIT after this gate was written, because it
  // caught its own author: adding navigation ("More", five destinations and a
  // close) took the count from 199 to 207.
  //
  // Raised on purpose and with a reason, which is the whole contract. The trade
  // is deliberate — eight controls that exist ONLY to make the other 199
  // reachable are not the same as eight more things to do, and an app with no
  // navigation is what put everything behind one button in the first place.
  // If this ever needs raising for eight more FEATURES, that is a different
  // argument and it should be a harder one to win.
  //
  // 210 -> 212 on 2026-08-11 (ADR-0088), and it is the same argument as the
  // raise above rather than the harder one. Two sheets took the place of two
  // inline folds; a sheet owes its own Close, outside the scrolling body, or
  // the way out scrolls away (§4). So this is +2 controls that exist ONLY to
  // leave surfaces that already existed — and the change DELETED scroll rather
  // than adding any: the ⓘ went from 2281px to 2084px in the same commit, and
  // the workspace shed up to 43,277px of fold.
  //
  // Worth stating plainly since the count only ever rises here: nothing on the
  // workspace gained a control, and the two it did gain cannot be reached
  // without first pressing something that was already there.
  //
  // 212 -> 213 on 2026-08-12 (ADR-0089), and it is the third instance of the
  // same trade rather than a new one: the Menu became a sheet, and a sheet owes
  // its own Close outside the scrolling body or the way out scrolls away (§4).
  // One control, unreachable without first pressing `#menu-open`, which has
  // been on that surface all along.
  //
  // THE COUNT IS NOT THE MEASUREMENT THAT MATTERED HERE, and saying so is the
  // point of a comment rather than a number: this release took 2,597px of fold
  // off the work surface, and the three ADR-0088/0089 sheets between them took
  // 45,874px. A gate that can only see +1 control would have read all of that
  // as a regression. It is a ratchet against sprawl, not a scoreboard.
  //
  // 213 -> 214 on 2026-08-12 (ADR-0090), and this one is the HARDER argument,
  // so it gets the longer reason: it adds a control to the work surface, which
  // is the surface this budget exists to protect, and it is not a way out of a
  // sheet like the last three.
  //
  // What buys it: the affordance is not new. `.skip` has said "Skip to what you
  // are holding" since the first release and is positioned off-screen until
  // focused, so it has served a keyboard and a screen reader and nobody else —
  // and `#capture` carries `autofocus`, so it is not even in the forward tab
  // order. This makes an existing decision reachable by finger rather than
  // adding a new capability.
  //
  // And it is CONDITIONAL, which nothing else counted here is: it renders only
  // when a section is live above the list and the list has rows. On a quiet day
  // and on an empty store the count is 213, not 214. This number is the worst
  // case, which is the right thing for a ceiling to measure.
  // 214 -> 215 on 2026-08-12 (ADR-0091) for the way BACK. Reported from a
  // device, as a question: how do I get back. There was no answer — nothing
  // anywhere in the app returned the reader to the top, so the jump added the
  // release before was a one-way trip up to five screens down.
  //
  // A budget that refuses the return leg of a route it already permitted is a
  // budget being read as a score. The ceiling exists to stop sprawl, and a way
  // out of somewhere the app sent you is not sprawl.
  // 215 -> 219 on 2026-08-17 (ADR-0092), and this is the FEATURE argument the
  // 205->210 note said should be harder to win. It is won on what was missing
  // rather than on what is being added.
  //
  // The four: the context input and its Add on the detail sheet, the "Where you
  // are" chooser on the work surface, and the offered card's title becoming a
  // button. The last one is a control that was ALREADY THERE and was a <p> — the
  // one item the app actively hands you was the only thing on the screen that
  // could not be opened, so changing it meant navigating away to find it again.
  //
  // Contexts are the axis this app did not have. The tree gives a thing one
  // parent — where it LIVES. Nothing said where it could be DONE, so every list
  // was every list and "show me what I can do at home" had no answer. That is a
  // planner's building block, not an embellishment, and this budget exists to
  // stop sprawl rather than to stop the app being finished.
  // 219 -> 222 on 2026-08-17 (ADR-0093), and this trio REMOVES reading rather
  // than adding it, which is the only argument this ceiling should accept twice
  // in one day.
  //
  // The three: a Contents door in the header beside More, a second at the end of
  // the held list beside Back to the top, and the Close on the sheet they open.
  // The rows inside are not a fourth — they are one per live block, they replace
  // travelling past that block, and they exist only while the block does.
  //
  // IT IS THREE AND NOT TWO because the door is not fixed, and that cost a
  // control. A floating one measured taking the tap from three Done buttons
  // (ADR-0093), so there are two in flow instead — one at each end of the page.
  // A budget is the wrong instrument for arbitrating that: the choice was
  // between a cheaper control that steals presses and a dearer one that does
  // not.
  //
  // The count this budget actually measures is CONTROLS, and the thing it is
  // protecting is the reader's effort. Those come apart here: the page was
  // measured at 3.0 screens on thirteen sample things and 8 live blocks on a
  // real store, with no index of what was even on it and no way to reach any
  // block but the two at the ends. Two controls that answer "what is here and
  // how do I get to it" buy back more than they cost, and refusing them on a
  // count would be the budget read as a score — the failure its own 214 -> 215
  // note names.
  // 222 -> 226 on 2026-08-17 (ADR-0096), and this is the FEATURE argument again
  // rather than the cheap one. The four: the role input and its Add on the
  // detail sheet, the "Where the attention is" door, and that sheet's Close.
  //
  // It is the same trade contexts won at 215 -> 219 and it is won on the same
  // ground: an axis the app did not have. The tree says where a thing LIVES and
  // a context says where it can be DONE; nothing said WHO it was for, so "am I
  // putting enough into each part of my life" had no answer anywhere in the
  // product. Two of the four exist only to leave or reach a surface, and the
  // door is hidden entirely until a role has been named — on a store with none,
  // the count is 224.
  // 226 -> 228 on 2026-08-17 (ADR-0098): the size chooser and its Set, in
  // Settings, beside the timer length and the day boundary they are shaped after.
  // Both are set calmly rather than in the moment they would matter, which is
  // the same reason the timer's length lives there.
  //
  // It BUYS BACK reading rather than adding it, which is the argument this
  // ceiling accepts: a reader who sets the app smaller fits more of their own
  // work on a screen, and every measurement this month has been about how far
  // somebody has to travel to reach their own list.
  // 228 -> 229 on 2026-08-18 (ADR-0099), and the +1 is an ACCOUNTING artefact
  // of this rule, not growth. Three doors left the runway: `#sort-open` (a
  // button, counted) and the two `<summary>` elements on the worry and load
  // entries (NOT counted — this regex reads button/input/select/textarea, and a
  // summary is none of them). Two sheet Closes arrived, both counted. So the
  // page shed three controls a finger can press and the number went UP by one.
  //
  // THE REGEX IS THE DEFECT, and it is the same one 2.8.0 found in the a11y
  // walk's target audit an inch away from here: a hand-written list of element
  // TYPES that omits the ones this app happens to use as controls. It is not
  // widened in this release because doing so reprices every historical figure
  // in this comment at the same time as a layout change, and then neither the
  // count nor the layout could be read against what came before. It is worth
  // doing on its own.
  //
  // What the release actually did to the first screen was measured rather than
  // counted, at 390x844: fourteen controls to thirteen on an empty store,
  // fifteen to fourteen with the sample on, and Next up from 0.48 screens to
  // 0.43.
  // 229 -> 230 on 2026-08-19 (2.10.1): "Start smaller" is a door now. The card
  // carried an always-open text field, a filled submit beside it and four lines
  // of prose explaining what a first step is — a manual printed on the thing you
  // are trying to begin. One button replaces the standing form, so the COUNT
  // goes up by one and what is on the card at rest goes down by three, plus the
  // paragraph. This budget counts controls in the markup and cannot see that,
  // which is the second time in three releases it has read the wrong way round;
  // the note is the record, as it is meant to be.
  //
  // 230 -> 232 on 2026-08-22 (2.18.0): "What you're working toward" is a sheet,
  // so it costs a door and a Close, the same two every sheet here costs. Neither
  // is on the first screen at rest: the door is `hidden` until a horizon exists,
  // which for a store that has never made one is always, and the Close lives
  // inside the dialog. So the count goes up by two and what a new reader meets
  // does not change at all — the third time in five releases this budget has
  // read the wrong way round, and the note is the record.
  //
  // 232 -> 233 on 2026-08-22 (2.19.0): "How long you have" is one chooser, and
  // unlike the place chooser beside it, it is never hidden — an unestimated
  // thing fits every answer, so it works on the first day and withholding it
  // would be withholding a control that works. It sits inside `#held`, so it is
  // one more control on the pile's own row and none on the first screen.
  // 233 -> 237 on 2026-08-22 (2.21.0): a door, a Close, a name field and its
  // button. The two choosers moved into the sheet rather than being added, so
  // the count rises by exactly the four the sheet itself costs — the same two
  // per sheet every other one here costs, plus the one control that makes a
  // situation recallable and nothing else.
  // 237 -> 238 on 2026-08-22 (2.22.0): "Show me" beside the report's four
  // export buttons. It is inside the ⓘ panel, so nothing on the first screen
  // changes — and it is the one control there that WRITES NOTHING, which is
  // why it exists: every other route records the export and moves the mark, so
  // reading the report cost you the period you read it for.
  // 238 -> 239 on 2026-08-22 (2.23.0): one picker beside "Put on the Menu",
  // inside the detail sheet. Nothing on the first screen changes. It is what
  // `docs/nd-collisions.md` entry 26 permits and the whole of what it permits:
  // the category chosen at write time instead of silently defaulting, fixing a
  // six-value field that was dead code in the shipped app.
  // 239 -> 241 on 2026-08-22 (2.23.0): the Menu category picker, and the
  // first-step field and its button. All three are inside the detail sheet, so
  // nothing on the first screen changes. The first-step flow had ONE route into
  // it for eleven months — the offer card — so it could only shape whatever the
  // app happened to hand you.
  // 241 -> 242 on 2026-08-23 (2.26.0): one `<select>` — who is here — inside
  // the situation sheet, beside the two choosers already there. Hidden until a
  // person has been named, so on a store that has named nobody the control
  // count of every screen is unchanged.
  // 242 -> 244 on 2026-08-23 (2.28.0): the ask-once field and its button, inside
  // the situation sheet. They REPLACE the place chooser rather than joining it —
  // the two states are never on screen together — so the count on any one screen
  // rises by one, not two, and only on a store that has never named a place.
  // 244 -> 245 on 2026-08-24 (2.36.0, for a control added in 2.34.0): "Not a
  // place", the ghost button beside the place chooser. A real export carried
  // thirteen labels that were not places among eight that were, so the app has
  // to be TOLD, once, by the only person who knows — and this is the control
  // that lets it be told without a settings screen. It lives inside the
  // situation sheet, so nothing on the first screen changes.
  //
  // THE RAISE IS LATE, AND THAT IS THE FINDING. This gate went red on 2.34.0
  // and stayed red through 2.34.1 and 2.35.0 — three releases pushed to staging
  // and promoted to production with a Spine step failing — because the step's
  // one FAIL line sits four hundred lines up a log that ends with twenty green
  // ones. Every step after it carries `if: ${!cancelled()}` on purpose, so the
  // run does not stop at the first failure; the cost of that is a red job whose
  // tail reads exactly like a green one. Cloudflare deploys on push and does
  // not consult the Spine, so all three shipped, and "pushed and verified
  // against the remote" was true every time.
  //
  // This is hub LESSONS 53 wearing different clothes: a push is not a release,
  // and now also A GREEN TAIL IS NOT A GREEN RUN. Read the job's conclusion,
  // never its last screen.
  // 245 -> 247 on 2026-08-24 (3.0.0). The way back and the **+**, in the row
  // that rides inside every job. They are the two controls the hub model owes
  // the reader: a screen with no way out is a trap, and capture that cannot be
  // reached from inside a job is capture you must leave the job to use — which
  // is how a thought gets lost, and the whole thing this app is a rebuttal to.
  //
  // NOTHING ELSE ROSE, and that is the number worth reading. The hub's doors are
  // rendered from the live sections rather than written into the shell, so the
  // landing view costs the markup nothing; and the runway's fifteen blocks are
  // unchanged, they are simply no longer all on screen at once. What a reader
  // MEETS went from fifteen blocks to a list of doors, which this budget counts
  // in the markup and cannot see — the fourth time in this file's history it has
  // read the wrong way round, and the note is the record.
  // 247 -> 251 on 2026-08-25 (3.1.0). Four, and every one of them is a choice a
  // reader asked for rather than a control the app needed: light-or-dark and its
  // Set, and the record's two readings — how it is ordered and how much arrives
  // at once. The alternative to each was the app deciding on the reader's behalf
  // and offering no way to say otherwise, which is what both were reported as.
  //
  // A CHOICE IS NOT SPRAWL, and this budget cannot tell the difference — it
  // counts controls in the markup, and four selects that replace four decisions
  // taken for somebody look identical to four things added for their own sake.
  // That is the fifth time this file's note has had to say which way round a
  // rise reads. Nothing else moved: no destination gained a row and no surface
  // gained a step.
  // 251 -> 253 on 2026-08-25 (3.4.0). Two: the palette list and its Set. The
  // second axis of a choice PALETTES.md §6 rules should ship as options rather
  // than be decided for everybody — five families that all pass, offered.
  // 253 -> 257 on 2026-08-26 (3.5.0). FOUR, and they are the same choice as
  // above wearing a different control: one `<select>` of five names became five
  // radios with a picture each. The number of decisions a reader can take did
  // not move — it is still "which of five" — and the note directly above says
  // this budget cannot tell that difference, which is the sixth time.
  // The radio is VISIBLE and real, deliberately: selection had to be carried by
  // the control's own state and not by a coloured ring round the chosen tile,
  // which would be colour as the sole carrier (Doctrine §4) and would put a
  // fourteenth pair on screen that the inventory knows nothing about.
  // 257 -> 259 on 2026-08-26 (3.5.1). A door costs exactly two: the button that
  // opens it and the way back out. Nothing else was added — the five tiles and
  // their control moved, they did not multiply.
  // 259 -> 258 on 2026-08-26 (3.5.2), DOWN, because *Set the colours* was
  // removed: tapping a tile already repainted the app, so the confirm changed
  // nothing visible and read as a control that did not work. A ceiling left
  // above what the app actually has is a ceiling that stops counting.
  // 258 -> 259 on 2026-08-30 (3.16.0), UP by exactly one: the room's Close. The
  // controls inside it are rendered from the store rather than written in the
  // shell, so a meeting with nine people costs the shell nothing — which is the
  // shape this budget is trying to protect and the reason the number moved by
  // one rather than by a screenful.
  // 259 -> 261 on 2026-08-30 (3.17.0), UP by two, and only one of them is new
  // furniture: the whole-review sheet's Close. The other is the review total
  // itself, which was a `<p>` and is a button now — the release is that change,
  // so the count moving is the feature rather than drift beside it.
  controls: 261,
};

const launchOpts = process.env.PLAYWRIGHT_CHROMIUM
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM }
  : {};

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

// --- 1 · words, straight off the shipped markup ------------------------------
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const visible = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ');
const words = visible.split(/\s+/).filter(Boolean).length;
const controls = (html.replace(/<!--[\s\S]*?-->/g, '').match(/<button|<input|<select|<textarea/g) ?? []).length;

console.log('\nHow much is there to get through\n');
(words <= BUDGET.words ? ok : fail)(`${words} words in the shell (budget ${BUDGET.words})`);
(controls <= BUDGET.controls ? ok : fail)(`${controls} controls (budget ${BUDGET.controls})`);

// --- 2 · scroll distance, rendered, at the width it is read on ---------------
const { server, url } = await serve(ROOT);
const browser = await chromium.launch(launchOpts);
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },   // a phone, which is the hard case
    timezoneId: 'America/Denver', locale: 'en-US',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready=true]');
  await page.click('#tour-skip').catch(() => {});

  // Every destination More can land somebody on, measured at its own scroller.
  // The names are the reader's, not the ids, because the number means nothing
  // without knowing which screen it is.
  const SURFACES = [
    ['the ⓘ', 'about', '#about-body'],
    ['How it works', 'sheet-group-why', '#sheet-group-why .sheet-body'],
    ['Help', 'sheet-group-help', '#sheet-group-help .sheet-body'],
    ['Your data', 'sheet-group-data', '#sheet-group-data .sheet-body'],
    ['Things you can do', 'sheet-group-actions', '#sheet-group-actions .sheet-body'],
    ['Settings', 'sheet-group-extras', '#sheet-group-extras .sheet-body'],
    // The seventh, 3.5.1. A destination that is not in this list is not measured
    // and its prose does not count toward the total — so the move that took the
    // colour picker out of Settings would have looked like 700px of saving.
    ['Colours', 'sheet-group-colour', '#sheet-group-colour .sheet-body'],
  ];
  let total = 0;
  for (const [name, id, scroller] of SURFACES) {
    await page.evaluate((want) => {
      for (const d of document.querySelectorAll('dialog')) if (d.id !== want && d.open) d.close();
      const t = document.querySelector('#' + want);
      if (t && !t.open) {
        if (want === 'about') document.querySelector('#open-about')?.click();
        else t.showModal();
      }
    }, id);
    await page.waitForSelector(`#${id}[open]`);
    const px = await page.evaluate((sel) => document.querySelector(sel)?.scrollHeight ?? 0, scroller);
    // THIS RELEASE'S PATCH NOTES ARE NOT STANDING PROSE, AND THE RATCHET IS
    // ABOUT STANDING PROSE.
    //
    // The total below is a ratchet against sprawl — its own comment says so:
    // "an app with ten screens of explanation in it". Explanation accumulates
    // and never leaves, which is what makes a ratchet the right instrument.
    //
    // The current release's notes are the opposite. Only the newest release is
    // shown and the previous one folds away, so this block ROTATES rather than
    // accumulating, and its size is whatever this release happened to change.
    // Measured on 2026-08-11: a four-bullet note costs 390px, and the ratchet
    // had 98px of headroom. So a perfectly ordinary release fails it, and the
    // only edit that makes the number go down is deleting patch notes — which
    // Doctrine §7d requires, INCLUDING what is still broken.
    //
    // That is hub LESSONS §62 exactly: a height budget that costs the product a
    // sentence every time it binds is measuring a state nobody reads in. There,
    // five bullets became three and three became shorter, buying 272px and
    // leaving the next release facing the same squeeze from a worse start. The
    // per-surface budgets are nowhere near their limit here — the ⓘ is 2,671
    // against 3,000 — so the READER's experience was never in question.
    //
    // So the notes are measured on their own terms and excluded from the
    // ratchet. Not exempted: `notesPx` bounds them, and it bounds the thing that
    // could actually go wrong — one release writing an essay.
    const notesPx = id === 'about'
      ? await page.evaluate(() => {
        const list = document.querySelector('#about-body .note-list');
        return list ? Math.round(list.getBoundingClientRect().height) : 0;
      })
      : 0;
    if (notesPx) {
      (notesPx <= BUDGET.notesPx ? ok : fail)(
        `this release's notes are ${notesPx}px of that (budget ${BUDGET.notesPx}) — they rotate, so they are not in the total`);
    }
    // THE SAME EXCLUSION, IN BOTH PLACES (3.1.0). The notes were taken out of
    // the ratchet and left inside the per-surface number, and the note above
    // says why that was not noticed: the ⓘ measured 2,671 against 3,000, so it
    // had headroom and the question never came up.
    //
    // It cannot be right either way round. The ⓘ carries 1,744px of standing
    // prose and the notes are allowed 1,400 of their own, which is 3,144 — so a
    // release that spends its full notes allowance fails the ⓘ by construction,
    // and the only edit that brings it down is deleting patch notes. That is
    // §62 exactly, and escaping it is what `notesPx` was created for. Measuring
    // the same block against two ceilings, one of them set without the other in
    // view, is one budget doing the other's job badly.
    //
    // So the per-surface number is standing prose too, and `notesPx` is the
    // whole of what bounds the notes. Nothing is unmeasured: the ⓘ's permanent
    // content is held to 3,000 like every other destination, and an essay in a
    // release still fails on its own line.
    const standing = px - notesPx;
    total += standing;
    (standing <= BUDGET.surfacePx ? ok : fail)(
      `${name} is ${standing}px of scroll at 390px wide (budget ${BUDGET.surfacePx})`
      + (notesPx ? `, not counting ${notesPx}px of notes that rotate out` : ''));
  }
  (total <= BUDGET.allSurfacesPx ? ok : fail)(
    `${total}px of standing prose across all ${SURFACES.length} destinations (budget ${BUDGET.allSurfacesPx})`);
} finally {
  await browser.close();
  server.close();
}

console.log('');
if (failed) {
  console.error(`${failed} budget(s) exceeded.\n`);
  console.error('Raising a budget is allowed and should be deliberate. Drifting past');
  console.error('one without noticing is what this exists to stop.\n');
  process.exit(1);
}
console.log('Within budget.\n');
