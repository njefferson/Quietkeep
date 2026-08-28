# Changelog

What changed, written for the person using Quietkeep rather than for whoever
wrote it (Doctrine §5). Patch notes tell the truth: no absolutes the tests do
not back (§14).

Numbering is `version.capability.iteration` (§7). Each release is exactly one
kind — **VERSION** changes what the app is, **CAPABILITY** means it can do
something it could not, **ITERATION** refines something that already exists.

**Releases do not have names.** No monikers, no codenames — a release is its
triplet and what it did for you.

> Generated from `src/ui/changelog.ts`, which is what the app itself shows in
> its (i) panel. Edit that, then run `npm run changelog`. Don't edit this file.

## 3.8.1 — ITERATION

*2026-08-28*

- **Hot and cold now count everywhere, not only among things you had already sorted.** Marking something hot while it is still an unsorted capture used to record the answer and change nothing — on a store of 33 things put down, 33 answers given and 10 of them sorted, twenty-three of those answers moved nothing at all. They all move something now.
- **Nothing about the running order changed.** A real date still comes before everything, a step whose blocker just finished still comes second, and things with rising pressure are still sorted by pressure. Hot and cold break the tie inside each of those, which is what they always did inside one of them.
- **And the screen now says the thing the app has always done: cold is never hidden.** *Still comes back — nothing is ever hidden* sits under the Cold button. It sorts last, it still counts, and it still gets offered when it is all there is. That was true from the day the question was added and there was nowhere to read it, which is a fair reason to stop trusting a two-tap triage.

## 3.8.0 — CAPABILITY

*2026-08-28*

- **The suggestion list that kept taking the cursor out of the box is gone.** Typing a place, a role or a name used to bring up the browser’s own list of what you already had. On a tablet that list takes the cursor with it mid-word, so you type two letters, tap back into the box, and type two more. It has been taken off all three boxes.
- **What you already have is a row of taps under the box instead.** Adding a place you have used before is now one tap and no typing, which is what you are usually doing. The box is for names that are new. Nothing about that row is the browser’s — it takes the colours you chose, it is the right size for a finger, and it can be checked, which the old one could not be.
- **Commas make separate places.** The box has suggested *at home, out, on the phone* since places were added and then took the whole line as ONE place, so following the example gave you a place named after the example. Type three and you get three. The same on *Who is this for?*
- **And a place you did not mean to make can be taken out where you made it.** Saying a label is not a place has worked for a while, but the only route to it was on the situation screen, after choosing that label as where you are — so a place typed by mistake had no visible way out at all. *Something here is not a place* now sits under the row. It stops being offered and stops narrowing anything you can see; nothing you wrote is deleted, and the record still says it was there.
- **“A few things you could pick up” has moved down onto the list it is about.** It sat directly under the offered item’s own buttons, three lines above the list, and read as a note about that item. It is now on top of the list, and it ends in a colon rather than a full stop — a sentence that stops is about what came before it.
- **What is still not right, and it is the bigger half:** marking things hot or cold only changes the order among things you have already sorted. Mark something hot while it is still an unsorted capture and the answer is recorded and nothing moves. Cold is never hidden from you — it sorts last, still comes back, and still fills the offer when it is all there is — but the app has never said so anywhere you can read it.

## 3.7.1 — ITERATION

*2026-08-28*

- **The capture box is now the first thing on the screen; it was third.** *Everything else* and *On this page* used to sit above it — two ways of going somewhere else, before the thing this app is for. They are still there, just below the box and what it says back to you. The name and the ⓘ stay at the top.
- **Reported from a device, and the code already agreed with you.** The comment sitting beside the capture box read *"Capture first, and it is the thing that has focus on arrival."* It did have the focus. It was third. The screen is what a reader gets.
- **A focus ring on the situation screen was being cut off**, four pixels at the sides, in both light and dark. That box can be scrolled with a keyboard, so it takes focus and draws a ring — and its ring was painted outside a box that deliberately runs to the edge of the panel. It is drawn inside the box now.
- **Which was found because the ring check stopped needing to be told what to look at.** It took a hand-written list of controls per screen, so a screen was checked only if somebody had written one — and eighteen of them never had. Nothing had gone wrong on those eighteen; nobody had looked. It works the list out for itself now, and a check holds every measured screen to having one, so the gap cannot come back.

## 3.7.0 — CAPABILITY

*2026-08-27*

- **Every path through Quietkeep — a new page, linked at the bottom of the screen beside *How it works*.** Every way in, every way through and every way out, drawn as the steps you take rather than as the app is built underneath. Thirty-four of them, and the shape of each drawing tells you how much there is to it: some are one move.
- **It is not a tutorial you have to finish.** It is a reference to dip into when you want to know how something works, or what a screen will do before you press it. Each path also says what it will never do, which is usually the useful half.
- **Nothing on it was written twice.** The sorting choices, what each kind of thing is called, the name of every screen — all read straight out of the app. If a button is renamed and this page still says the old word, that now fails before it can ship.
- **It carries no webfont and makes no network request.** The whole page is words and boxes on the colours you already chose, so it works offline like the rest of the app and costs nothing to open.
- **What is still not right:** the three older pages behind the same kind of link — *How it works*, *Planning for Humans* and the plan — have never had an accessibility check of any kind. This new one does. The others are a real gap and they are named as one rather than quietly left.

## 3.6.2 — ITERATION

*2026-08-27*

- **The manual called one of the sorting choices by the wrong name.** It listed *do it now*; the button says **Do now**. Small, and the kind of thing that makes you doubt the rest of a page — if the manual names a button you cannot find, the honest conclusion is that the manual is old.
- **Found by a new check rather than by reading.** Every set of words the app puts on screen — the sorting choices, what each kind of thing is called, the name of each screen — is now read straight out of the app and held against the manual, the walkthrough and the new flowcharts. If a button is renamed and the help still says the old word, that now fails before it can ship.
- **It was written because of what happened last release.** Renaming one control left the flowcharts saying the old name, on a page that had been rebuilt and republished the same day. Everything about it looked current. Nothing was checking the words themselves.

## 3.6.1 — ITERATION

*2026-08-27*

- **“How it hangs together” is called “Your projects, areas and goals” now.** Same screen, same contents, same place — behind *What you are holding*. Only the words on the button changed.
- **Because the old name never said the thing it holds.** The app calls something a *project* when you make one, and again when you file something under one, and then the one screen that lists them all was named after its shape instead. If you went looking for your projects, nothing you could see said that is where they are.
- **Last release fixed the inside of it, and that was only half.** The rows say *Project*, *Area* and *Goal* now, which is worth having — but you have to already be in there to read them. The name on the button is what decides whether you open it.
- **It is not called “Projects”, deliberately.** Your goals and areas are in there too, and calling it Projects would be untrue about two of the three. It is also not somewhere to work: it is a way of seeing what you have, and the app never needs you to go there to plan a day.

## 3.6.0 — CAPABILITY

*2026-08-27*

- **You can get to the thing something is filed under.** A screen has always said *Part of ⟨name⟩* at the top, and that was a sentence — it told you the name and gave you no way to go there. It is a button now. Tapping it opens that thing’s own screen.
- **Reported from a device in those words:** something was made into a place by filing a task under it, and then there was no way to see the place. That was accurate. Every list on that screen travelled downward — the things underneath were already doors — and nothing at all travelled up.
- **So the chain walks both ways now**, one step at a time, in whichever direction you are asking. Going up is not something you have to do to plan a day, and nothing asks you to.
- **“How it hangs together” says what each row is.** Every line in it was a bare title with an indent — a project, an area and a task all drew identically. A project now says project, an area says area. Plain tasks stay unmarked, which is how they read everywhere else.
- **That word was already yours.** The app says *Project* when you make one and again when you file something under one, and then the one screen whose whole job is listing them never said it again.
- **What is still not right:** there is no screen called *Projects*. *How it hangs together*, behind *What you are holding*, is where they all are, and it is named after the shape rather than the thing. Whether that name changes is a decision, not an oversight.
- **Also still not right:** the little splash your phone or tablet shows before an installed app opens still uses the original colours whichever set you pick. That is decided when you save the app to your home screen.

## 3.5.2 — ITERATION

*2026-08-26*

- **Close works on the Colours screen.** It did nothing at all. The button was there, the right size, in the right place, and connected to nothing — so the only way out was the back gesture. Reported from a device, and it was exactly as described.
- **Why it happened, since it is the kind of thing that repeats:** the list of screens that get a working Close was typed by hand. Colours was the sixth and the list had five. It is worked out from the screens themselves now, so a new one cannot arrive without its way out.
- **Tapping a set of colours is now the whole decision.** There was a *Set the colours* button under the pictures and it has gone. Tapping already repainted the app, so pressing it afterwards changed nothing you could see — a confirm button with no visible effect, which reads as a control that does not work. Tap the one you want; it is kept. Close just closes.
- **And leaving a mode or a text size without pressing Set now puts it back.** Those two still have a Set button, because they sit among the other settings where one is expected. Changing them used to preview immediately and save nothing until you confirmed, so leaving without confirming kept the preview on screen while the app remembered something else. Whichever way you leave, what you see is what is saved.

## 3.5.1 — ITERATION

*2026-08-26*

- **Colours has its own place now.** It was a block near the bottom of *Settings*; it is its own door behind *Everything else*, next to *Settings* rather than inside it. Nothing about it changed except where it lives and how big it is.
- **Which is what makes the pictures worth having.** Two to a row inside Settings, each half of each picture came out about 75 pixels wide on a phone — you could see that one side was light and the other dark, and not much else. One to a row here, and a half is about 155. The whole argument for a picture is that you can see it.
- **Settings got shorter by about a fifth**, which is the other half of the same move. It had been the longest thing behind that button.
- **Light or dark stayed in Settings**, on purpose. How bright the app is and which set of colours it uses are two separate choices, and putting them both here would have made this door mean "anything to do with how it looks", which is what Settings already means.
- **What is still not right:** the little splash your phone or tablet shows before an installed app opens still uses the original colours whichever set you pick. That is decided when you save the app to your home screen and nothing the app does afterwards can change it.

## 3.5.0 — CAPABILITY

*2026-08-26*

- **You can see the colour sets now, instead of reading their names.** Five pictures, side by side, one per set — the same little sample of the app painted in each. Pick by looking.
- **Each picture is the same view twice: day on the left, night on the right.** Every set comes in light and dark, and ten pictures would be a wall — so one picture carries both, and every part of it appears on both sides. The button is in both, the card is in both, so you are comparing like with like rather than looking at two different things.
- **The pictures are made from the same file the app gets its colours from**, so a set cannot look like one thing in the chooser and paint another once you pick it. They are only redrawn when the colours actually change.
- **Which one is chosen is still shown by a button, not by a coloured outline.** The whole point of this screen is colour, so colour is the one thing that must not also be carrying "this is the one you have".
- **Four of the five have been redrawn, because they were the same set four times.** Building the pictures showed it at once: in dark, four of them were within a few points of each other and two were identical to the eye, while their descriptions claimed real differences — *exact-neutral*, *cool*, *lowest glare* — that you could not see. They had each been checked for being readable and never checked against each other for being different.
- **So they are now genuinely different things.** *Instrument* is cool and crisp. *Paper* is a warm kraft page with white cards and a deep teal for anything you can press. *Mono* has no hue at all. *Soft* is dimmed, with a night that is grey rather than black. *Quietkeep* is untouched. All five still clear the same contrast floors — that was checked after every change, and it takes a quarter of a second.
- **What is still not right:** the little splash your phone or tablet shows before an installed app opens still uses the original colours, whichever set you pick. That is decided when you save the app to your home screen and nothing it does afterwards can change it.

## 3.4.3 — ITERATION

*2026-08-26*

- **The button that said *More* now says *Everything else*.** More of what? The only way to find out was to press it. What is behind it has not changed — settings, your data, help, how it works, what this app is, and the things you can do like printing today or sending to your calendar. Now the button says so.
- **And *Contents* now says *On this page*.** Those two sit next to each other and are exactly complementary: one is what is here, the other is what is not. They now sound like the pair they are.
- **Inside a job, the way out now says *Choose where to be*.** It said *Everywhere else*, which was fine on its own and impossible next to *Everything else* — a letter apart to the ear, and one means your other work while the other means the app itself. It takes you to *Where do you want to be?*, so now it says that.
- **The colours section has a heading, and says what it actually means.** It had no heading at all, and told you the five sets were *held to the same contrast floors*, which is a phrase for whoever built it. What it means is: every one is checked to the same standard for being readable, so which you pick is a matter of taste and not of one being easier to read.
- **Nothing moved and nothing was added.** Same buttons, same places, same order, same things behind them. Only the words.

## 3.4.2 — ITERATION

*2026-08-26*

- **The app arrives already wearing the colours you chose.** If you had picked something other than the original, opening the app showed you a moment of the original first, then settled. It does not any more — the colours are right on the very first thing drawn.
- **And the same for light or dark, which was the bigger one.** If your device is set to dark and you asked for light, you were getting a beat of night before the day you asked for. That is gone too. It was the same cause and the same one-line answer.
- **Why it took until now, honestly:** the answer written down last release was that this could not be fixed without keeping your choice somewhere this app refuses to keep things. That was wrong — true of one place, not of all of them. The part of the app that lets it work offline can read your settings, and it is what hands the page over, so it now hands over a page that already knows. Nothing new is stored anywhere.
- **Considered and not done:** covering the screen for a moment while it looks your choice up. That swaps a colour settling for a blank screen — worse on a light device, not better — makes everyone wait on a cold start, and adds a way for the app to sit blank if anything goes wrong reading. The way it works now is earlier than any of that could be.
- **What is still not right:** the little splash the phone or tablet shows in the half-second before an installed app opens still uses the original colours. That one is decided when you save the app to your home screen, and nothing the app does afterwards can change it. It is a separate piece of work and it has not been done.

## 3.4.1 — ITERATION

*2026-08-25*

- **The ring that shows where you are was being cut off.** Tap into the box you type in and a ring is drawn round it, so you can see that is where your typing will go. Five pixels of that ring were missing on every side — clearest on the left, where the box runs closest to the edge. It was happening to nearly every control in the app, not only that one, and it had been since the beginning.
- **Why, in one sentence:** a box that scrolls has to cut off whatever falls outside it, and the ring is drawn just *outside* the control it belongs to. The three boxes that scroll now leave it six pixels to be drawn in. Nothing on screen has moved.
- **And the same thing at the bottom of the panels.** Ten controls across the settings, the item detail, the record and the rest lost the bottom of their ring when you moved down to them with a keyboard, because the panel scrolled them exactly flush with its own edge. They stop a little short of it now.
- **The automated check could not see this at all, which is the more useful half.** It asked whether a ring was *set*, and one was — three pixels wide, in every colour set, on every screen it visits. Whether those pixels reached the screen was a question nothing was asking. It now builds the ring’s own outline and checks it against every box that could cut it, on every control it already tests, at no extra cost.
- **What is still not right:** this checks the screens the automated walk visits. A screen it cannot reach has its rings unchecked, exactly as before.

## 3.4.0 — CAPABILITY

*2026-08-25*

- **Five sets of colours to choose from, not two.** *Quietkeep* (the one you have), *Instrument*, *Paper*, *Mono* and *Soft*. Each comes in light and dark, and light-or-dark stays a separate choice — so it is two decisions, not ten: which colours, and how bright.
- **They are named, never a row of coloured squares.** A swatch on its own asks you to tell colours apart to use the control, which is the one thing this app will not do. The name says which it is and the note under it says what it is for.
- **Every one clears the same contrast floors as the original.** Not a promise — all ten are checked against the thirteen colour pairs this app actually puts on screen, and the check takes a quarter of a second. That is what last release was for.
- **Where they come from:** four of them were worked out for this family of apps by a design council and verified independently, and were sitting in the shared notes unused. *Instrument* is the one that council recommended; *Soft* is the lowest glare; *Mono* has no hue at all.
- **One place decides the colours now.** They used to be written in four places in the stylesheet; five sets would have made that twenty blocks that must never disagree. There is one file, and the stylesheet is generated from it.
- **What is still not right:** if you pick something other than the one you start with, you will see a moment of the original when the app first opens, before it can read your choice back. It will be in the right brightness — light or dark is answered before anything is drawn — so what you see is a hue settling, not day turning into night. It cannot be fixed without storing the choice somewhere this app deliberately does not store things.

## 3.3.0 — CAPABILITY

*2026-08-25*

- **A real fault, and you would have seen it:** if your device is set to dark and you chose *light* in the app, the app went light and every dropdown, date box and text area stayed dark — white on grey, a hole in the page, on exactly the setting that control exists to provide. Fixed. They follow your choice now, not the device.
- **Colour checking got about a hundred times cheaper, and stricter.** The automated check used to render the whole app in every colour set and measure roughly 830 pairs each time — four minutes of browser per set. It now measures the app ONCE to learn which colour pairs it actually puts on screen, and checks each colour set against that by arithmetic. It turns out the whole app is thirteen distinct pairs.
- **So more colour sets can be added without slowing anything down.** A new one is a list of seven colours; it is checked in about a millisecond and it either clears the contrast floors or it does not ship. That is the same standard as before, arrived at without rendering anything.
- **And it found something invisible.** Thirteen controls in this app — every dropdown, the date picker, the text areas — are painted by your browser rather than by the app, so no colour set can change them. That was true before and nothing could see it, because they were being measured like any other colour and passing. They are written down now, each with a reason, and the check refuses any new one that turns up undeclared.
- **What is still not right:** this makes checking a colour set cheap; it does not make the app check itself in places the automated walk never visits. A screen the walk does not reach has its colours unchecked, exactly as before.

## 3.2.0 — CAPABILITY

*2026-08-25*

- **On a wide screen you can see where you are AND what you are doing, at the same time.** Go into a job on a tablet in landscape and the list of places stays on the left while the job fills the rest. Below about 900 pixels nothing changes at all — one job on screen, and the list is somewhere you come back to.
- **It uses the room that was there.** The page has been capped at the same width since the shell was built, so from 768 pixels upward every screen showed the same phone-shaped column: 132 pixels of nothing each side on a tablet in landscape, 272 at desktop width. The number 900 is measured rather than chosen — the list of places asks for 276 pixels, the job needs at least 560, and with the spacing that is 896.
- **Nothing about the job itself changed.** Same screens, same controls, same order, same words. What changed is where the two boxes sit. *Everywhere else* is still there too — the list being visible does not mean the way back should vanish, and a control that moves because the screen got bigger is a control you have to find again.
- **One job beside the list, not several.** Two panes is the idea proved and measured; more than one job at once is a later question and is written down as one rather than left looking forgotten.
- **What is still not right:** the automated accessibility check measures one screen size and now a wide one, but the wide pass covers the arrangement — whether anything runs past the edge, whether two controls touch, what the checker makes of it — rather than re-measuring every screen at that width. Colours are not re-checked there on purpose, because the arrangement moves boxes and does not change what is in them.

## 3.1.3 — ITERATION

*2026-08-25*

- **Nothing on screen changes and nothing you do is different.** This release is about the checks that guard the app, and it is here because a shipped file was edited — which means the version has to move whether or not you would ever notice.
- **Three screens were being checked the cheap way.** The last release said so: the walkthrough, the stopping-for-now note and the replan card have the right shape, but the automated check had no way to actually open them, so it could not look at them on a real screen the way it looks at the other eighteen. Two of them can be opened now — twenty screens are measured rather than eighteen.
- **What is still not right:** the replan card is the one left. Opening it needs something in your list whose date has already passed, and manufacturing that inside the check would tangle it with the part of the check that is hardest to keep steady. It is still named in the output rather than quietly left out, which is the whole point.

## 3.1.2 — ITERATION

*2026-08-25*

- **On a tablet, the bar at the top no longer folds away sooner than it used to.** Keeping the way back on screen inside a job cost it a whole row last release, and a taller bar folds into ordinary page content at a smaller text size. *Everywhere else* and the **+** now sit in the top row beside *More* and *Contents*, which was already a row that wraps — so on a tablet they cost six pixels instead of sixty, and the size at which the bar folds is back where it was before.
- **And the way back is still pinned.** That was the point of last release and it has not been given back: at 100% and at 150% on a tablet it stays on screen however far you scroll a job. Measured at four sizes across all three versions rather than reasoned about.
- **What is still not right, on a phone:** at 125% text and above the bar still folds, and once it folds the way back scrolls with everything else. It is not this change that put it there — at that size the bar was already within seven pixels of folding before any of this, so it was going to fold on any addition at all. On a narrow screen the top row wraps, and a wrapped row costs the same as the row it replaced.
- **The box you type into is now the sixth control in the reading order; it was the fourth.** *What do you want to put down?* has not moved on the screen — *Everywhere else* and the **+** have, from under the box to the row above it, and that is what changed its number. If you reach for it by feel it is exactly where it was.
- **Nothing else moved.** Same controls, same names, same order relative to each other.
- **And a note about the checks, because this release found a real fault with them:** moving those two controls made the top row run past the right edge of a 320-pixel screen at 200% text, in both light and dark. The accessibility check caught it before it left the machine — but it had no way to write down what it found, so reading its answer meant running the whole four-minute check a second time. It leaves a note now, the way the other browser check already did.

## 3.1.1 — ITERATION

*2026-08-25*

- **Inside a job, the way back no longer scrolls away.** *Everywhere else* and the **+** sat in the scrolling part of the screen, so once you had scrolled a card they went off the top — and scrolling back up made them appear from under the fixed bar, which read as the app coming apart. Reported from a device. Measured on a tablet with ONE card in the job: at a normal scroll the way out was 36 pixels above the top of the screen, and at the end of the list it was 97. They stay put now.
- **It is the same fix as the last release, on the screen that matters most.** 3.1.0 moved the way out of six panels outside the part that scrolls. This one had it too, and it was the main screen.
- **What it costs, and you should judge this on the device:** the bar at the top is now one row taller while you are inside a job, so it folds away into ordinary page content at a smaller text size than before — 150% rather than 200% on a tablet, 125% rather than 150% on a phone. Nothing is lost when it folds: the page simply scrolls as a whole, which is how it worked before the bar existed. On the front screen nothing changed at all, because the row is not there.
- **What is still not right:** once the bar has folded away, at those larger text sizes, the way back scrolls with everything else again. That is the folding working as intended rather than a new fault, and it is measured either way — but it means the fix above only holds while the bar is up. If the text size you use puts you past that point, say so, and the way back moves in beside *More* and *Contents* instead, which costs no height at all.

## 3.1.0 — CAPABILITY

*2026-08-25*

- **Leaving “Sort things out” no longer means scrolling the whole batch.** Close was the last thing in a list that could run to hundreds, so getting out meant travelling past all of it. The title now stays at the top and the way out at the bottom; only the middle moves.
- **And the same on five more screens** — the item panel, *More*, the replan card, the stopping-for-now note and the walkthrough. Every screen now keeps its way out under your thumb, and a new one cannot ship without.
- **The record reads newest first, and you say how much.** It showed fifty at a time, oldest first, with no way to ask for anything else — so the thing that had just happened sat at the bottom and every visit began by pressing *Show more*. Choose 50, 250, 1,000 or everything; both choices are remembered on this device.
- **Oldest first is still there**, in the same menu. Reading forwards is how a correction lands under the thing it corrected.
- **Sync no longer stops partway when you re-pair a device.** Pairing, erasing, pairing again and syncing left the exchange refusing most of what arrived and halting halfway — the two devices ended up part-synced, with a message saying it had stopped. Nothing was ever lost; the store refused the repeats rather than writing them. Fixed: the same thing arriving several times in one delivery is now recognised as one thing.
- **You can choose light or dark.** It is in the (i) panel, under *Light or dark*, next to the text size. Changing the dropdown previews it and nothing is remembered until you press the button. Only this app, only on this device — your phone’s own setting is left alone.
- **Three answers, not a switch.** Light, dark, or whatever your device is set to. The last one is how it has always behaved and it stays the default, so if you liked it following your device at sunset, do nothing.
- **What is still not right:** three screens — the walkthrough, the replan card and the stopping-for-now note — have the right shape but are not yet measured on a real screen, because the automated walk has no way to open them. It names them rather than leaving them out quietly.

## 3.0.2 — ITERATION

*2026-08-25*

- **Nothing on screen changes.** The app does exactly what it did. What is new is that it now says, to itself, when it has finished writing something down — and nothing about that is shown to you.
- **Why it matters anyway:** the automated checks that guard this app used to wait a guessed number of milliseconds after every action, because the app never said when it was done. There were 143 of those guesses. Several were right on one machine and wrong on a slower one, which is how a check comes to pass in one place and fail in another without anything actually being broken.
- **134 of them now ask instead of guessing.** The remaining ten are waiting for real time to pass — a timer running out — and no amount of quiet makes a clock go faster.
- **What is still not right:** the app tells this to a machine and not to you. If a write were ever slow enough to notice, there is nothing on screen that would say so. Whether there should be is a question about the product, and it is not answered here.

## 3.0.1 — ITERATION

*2026-08-24*

- **The app behaves exactly as it did in 3.0.0.** Nothing on screen has moved and nothing you do has changed. This release is about the checks that guard it, and it is here because a file the app ships was edited — which means the version has to move, whether or not you would ever notice.
- **What changed underneath:** the app and its automated checks used to work out separately how you reach a control — which screen owns it, whether that screen has to be opened first. Two answers to one question drift apart, and this one did, repeatedly. There is one answer now, and both read it.
- **What is still not right:** the checks still wait fixed intervals in about forty places rather than waiting for the thing they need. That is why one of them passed and then failed on identical code, and it is not fixed yet.

## 3.0.0 — VERSION

*2026-08-24*

- **The app has places now.** It used to be one long page holding fifteen blocks, and you had a position in it rather than somewhere to be — scroll away and you lost your place, which on a page this long meant losing the thought too.
- **You land on a list of doors.** Each one opens a single job and says what is behind it in your words: what to sort, what slipped, what you are holding. A door only appears when there is something behind it.
- **Inside a job, that job is the whole screen.** Nothing else is on it. There is one way back — the same one everywhere — and a **+** for putting a thought down without leaving what you are doing.
- **Nothing is hidden from you.** Coming back up shows everything waiting, everywhere, so there is never a place you have to remember to go and check. That is the difference between this and tabs, and it is why it is not tabs.
- **What you are on, and what you just did, follow you.** The thing you are working on now and the way to undo the last thing stay on screen wherever you are — they are not one of the jobs.
- **What’s the situation? is now the seventeenth control on the page; it was the fifteenth.** The row that carries the way back and the **+** sits above it, so it moved down by two. Nothing about it changed otherwise.
- **Your work is untouched.** Nothing about how anything is stored has changed, so there is nothing to import again and nothing to migrate.

## 2.38.0 — CAPABILITY

*2026-08-24*

- **A whole planner brought in is no longer something you answer one card at a time.** *Sort things out* has always had a batch called **Loose things brought in from another planner**, and since an import started landing in the inbox that batch has been empty — so it never appeared, and the only way through an import was card by card. It holds your import again. Pick it, choose **All of them at once**, and *Let go* takes the whole batch; a copy is saved first and it can be undone.
- **Hot or cold is not asked about things you brought in.** That question leads whenever four or more things want it, so a thousand-row import put it in front of every single card — and heat removes nothing, it only decides what gets offered first. It is a feel about a handful you just put down. You can still mark anything hot or cold from its own sheet.
- **And an import is not a number saying how far behind you are.** The count in the app’s chrome is about what you put down, not what you carried in from somewhere else. Everything you imported is still there and still sortable — it just does not follow you around as a headline.

## 2.37.0 — CAPABILITY

*2026-08-24*

- **The list of places says it is yours.** After an import the chooser can hold every label you ever wrote, and some of them are not places at all — a topic, a tool, somebody’s name. You could already tell the app so, and there was nothing on screen saying you could: the control only appears once you have picked one, so opening the list and looking at it answered nothing.
- **A line under the chooser now says it, before you pick anything.** Pick a label and the way to say it is not a place is right there, as it always was.
- **It tells you once.** The moment you put any label down the line stops, because you know the route. It is not a standing instruction on a screen you open every day.
- **Still no way to rename one.** A label comes in as you wrote it and stays that way; putting it down and naming a new one is the only route today.

## 2.36.1 — ITERATION

*2026-08-24*

- **A line the importer cannot use now says what was wrong with it.** It used to say only "15 lines could not be read", which on a real export was the biggest thing in the summary you could do nothing about — no way to tell whether fifteen pieces of work had just gone missing.
- **They had not.** A line is left behind for one reason: it has no name on it — an empty name column, or nothing but labels. The summary says that now, so you can stop wondering about it.

## 2.36.0 — CAPABILITY

*2026-08-24*

- **What a file will do to your work is now a list you can read, not a paragraph you have to get through.** Choosing an export used to answer with one block of a hundred and twenty words — what arrives, what changes on the way and what does not come at all, all run together, at the moment you have the least patience for it.
- **It is one fact per line now, in three groups**: what comes with your work, what changed on the way in, and what stays behind. The line saying nothing is filed comes last, because it is the standing fact rather than something about your file.
- **Each loss is stated once.** A repeating thing was reported twice — once as a rhythm to rebuild, and again six lines later in a bare list of what will not come. Two ways of saying one thing reads as two things.
- **The screen is measured now.** Nothing had ever rendered this list, so its colours and spacing had never been checked in either theme; the accessibility walk chooses a file of its own and reads what comes back.

## 2.35.0 — CAPABILITY

*2026-08-24*

- **Bringing a file in now lands you somewhere that says what just happened.** It used to reload into a plain work surface holding everything you had imported and no account of where any of it came from — which is the moment of not knowing where to begin.
- **It is the screen that already existed for exactly this**, and it could never appear here. *Welcome back* fires on how long you have been away, and an import starts a fresh store, so the absence is zero the instant it lands. The one time it was most needed was the one time it was unable to show.
- **It does not pretend you were away.** No "you were away 0 days" — it says everything is here and that nothing is filed, because filing was never asked for. It tells you how many things are waiting to be sorted, and the way into sorting them is on it.
- **Shown once, on the device you imported on.** Whether you have seen your own arrival is not part of your work, so it is not written into the log and does not follow you to another device.

## 2.34.1 — ITERATION

*2026-08-24*

- **Work you already finished elsewhere is no longer brought in.** A real export carried 216 completed things into a store of 1,429 — fifteen per cent of a pile you believe you are carrying. That history belongs to the app it happened in, and your file still has it. The summary says the number before you press the button.
- **And the report now says how many finished things are in the count.** They are grouped away under *Done* and they were still counted as work you are holding, with nothing saying so.
- **“Put them down” now says where they go: nowhere.** It reads as though it must have a destination, and it has not — things stay exactly where they are and stop asking. Beside *Let them go* the two were near-synonyms with no way to tell them apart until you had already chosen.

## 2.34.0 — CAPABILITY

*2026-08-24*

- **Anything you had flagged now comes in hot.** It used to be dropped, on the grounds that this app has no priority field — which is still true and was never the whole argument. Reading a mark you made deliberately and discarding it is not neutrality. Heat is a two-state fact you stated, it only ever breaks a tie between two things already offered, it can never add up to a score, and the card says it out loud.
- **And the flag was not even being read.** A real export writes that column as 1 and 0; the app was looking for the word "true", so flagged things were neither carried nor reported as lost. Three of them, silently.
- **A place can now be told it is not one.** Tags from another planner are not all places — a real export carried eight places and thirteen other things: people, topics, a waiting state, a priority. **Not a place** takes one out of the question, and is offered where you meet it: in the chooser, when it has just been suggested as somewhere you might be standing.
- **Which matters more than tidiness.** Once a thing carries any place it stops turning up everywhere — so something tagged only "Health" disappears the moment you say you are at home. Five things in that export were reachable by nothing but a label that was not a place.
- **Nothing is asked at the door**, and nothing asks what the label is instead. One tap, when it is in front of you, and only for the ones you actually meet.

## 2.33.2 — ITERATION

*2026-08-23*

- **The file picker no longer looks like a progress bar that has stopped.** With a file chosen it was a rounded bordered box holding a button, a grey block and the filename — and the grey block, which is the browser’s own thumbnail of your file, read as a half-filled track. On the screen you use to bring in a thousand things, that is the worst thing it could have looked like.
- **The box was ours; the grey block is not.** The browser draws that and it cannot be styled. Removing our border leaves nothing for it to look like the end of, and the row reads as what it is: a button, then what you picked.

## 2.33.1 — ITERATION

*2026-08-23*

- **A place written as `@context(Office)` is now called Office.** It was called "context" — the word, not your word — and everything tagged that way landed in one bucket under a name nobody typed. `@tags(Errands, Phone)` had the same fault and becomes two places.
- **Shipped wrong an hour earlier and found by reading a real store’s report.** The test beside it checked only what was thrown away, never what was kept, so it passed the entire time.

## 2.33.0 — CAPABILITY

*2026-08-23*

- **The tags you wrote now come across as places.** They were dropped at the door. If you came from OmniFocus that is your whole context system — places, locations, people — and a store that had one arrived carrying a single context, with one sentence in the summary naming what had just been thrown away.
- **Which is why nothing that narrows what you are offered seemed to do anything.** Anything unlabelled fits every answer, deliberately, so a store with no places is never shown an empty screen. That protection was working perfectly on a store that had places.
- **A tag on a project comes too, and reaches everything inside it.** One label on a container is worth more than the same label on each of its children.
- **How long something takes comes across as well**, from an estimate you had already written down. Flags still do not — this app has no priority field, and the summary says so rather than dropping it quietly.
- **And there is somewhere to see what you have.** *Where the attention is* now lists **The places you have** and how much each one reaches. Until now a place existed only inside the control that filters by it, so there was nowhere to ask what you had named.
- **Nothing here is guessed.** No setup screen, no template, no percentage of how organised you are, and nothing inferred from what you do — only words you typed, in the system you typed them in.

## 2.32.0 — CAPABILITY

*2026-08-23*

- **The invented set now looks like a real store, not a tidy one.** It was built to contain one of every kind, and to manage that three quarters of it sat inside a project and over half carried a place. A store read from a real device is the other way round — 1,432 things, 1,255 of them with no project, no place, nobody named and no estimate. The set is about fifteen hundred things now and most of them are unsorted.
- **That matters because it is what everything gets judged against.** Anything that helps you narrow what you are offered works beautifully on a set where everything is labelled, and does almost nothing on a store where nothing is. A set tidier than reality does not fail — it agrees with you.
- **The manual now covers *Things you can do*.** Sending an item to your calendar, replaying the walkthrough, printing today, telling someone where things are and its four formats, bringing work in from elsewhere, and both sets of invented work — including which one touches your store and which one only writes a file.
- **And *Every one of them*** — the fold that opens the complete list — **is described at last.** The manual said *What you are holding* was the complete list without saying how to see it.

## 2.31.2 — ITERATION

*2026-08-23*

- **The way into the full list looks like a control now, instead of a heading with a triangle stuck to it.** Reported from a device: the triangle stopped it reading as a heading, and the heading weight stopped it reading as something that opens, so it read as neither.
- **It carries exactly the chrome of the controls beside it** — the same border, the same corners, the same weight as *How it hangs together* and *Back to the top*. It was set in heading weight on a surface where every control is lighter, which is what made it look like a title.
- **And the marker is a real chevron** that turns when it opens, rather than the browser’s own ten-pixel triangle. The words never said it opened; now the shape does.

## 2.31.1 — ITERATION

*2026-08-23*

- **The home-screen line is shorter.** Same thing said in half the words, because the first screen anybody sees is the worst place to add reading.

## 2.31.0 — CAPABILITY

*2026-08-23*

- **The walkthrough now tells you to add Quietkeep to your home screen BEFORE it asks to keep your writing.** It used to offer the button, let the browser refuse, and only then mention the home screen. In a tab this browser nearly always says no; on the home screen it nearly always says yes. Being set up to fail and told why afterwards reads as the app being broken, on the first screen anybody sees.
- **Button names look like buttons now, instead of being italic.** *Not this*, *Just one thing*, *Hold it* — the walkthrough named them in italics, which means emphasis and has never meant "this is a thing on the screen". They are set apart with an outline instead. Not the filled look of a real button, so a name in the middle of a sentence does not invite you to tap the sentence.
- **The i button is introduced before it is relied on.** Two screens referred to it as though you already knew where it was and what it did. The last screen now says what it is, where it is, and what is behind it.
- **And the walkthrough was written for somebody who already knew the app.** It explained why choices were made rather than what the app does. It reads as a welcome now: what this is, what the screen in front of you holds, what each button does, and what happens on a day you can do less.
- **Nothing about how the app behaves has changed** — only what it tells you, and when.

## 2.30.2 — ITERATION

*2026-08-23*

- **Tapping the version number no longer hides the report’s own buttons.** It opened the report scrolled so far down that *Copy it* and *Save it as a file* sat above the top of the panel — measured at 156px and 104px out of sight. They appear only once the report exists, so they were being revealed where nobody could see them, and there was no way to get the report out of the app.
- **It lands on the buttons now, with the report directly beneath them.** Which is the order it reads in anyway. What the keyboard and a screen reader land on has not changed — that is still the report itself.
- **Both taps, not just the first.** Tapping the version number again while the report was already open landed the same wrong way, and fixing only the first would have left half of it.
- **And the walk now takes that door.** Every check on the report passed throughout, because they all reached it the short way and measured the screen rather than the route. Arriving the way a finger does is its own thing to test, and it is tested now.

## 2.30.1 — ITERATION

*2026-08-23*

- **The manual now covers the report the app writes about itself.** It never mentioned it at all — not what it is, not the two ways to reach it, not that it contains counts and nothing you wrote. *How it works* has a *When something is wrong* section now.
- **Including what *What the situation can narrow* is telling you.** Those numbers explain something that otherwise looks broken: if almost nothing carries a place, answering *where are you* changes almost nothing, because anything unlabelled turns up wherever you are. That is the design, and now the manual says so as well as the report.
- **And a pointer from where the question actually comes up** — the situation section of the manual now says where to look when an answer seems to do nothing.
- **Nothing in the app changed.** This release is documentation of what already shipped.

## 2.30.0 — CAPABILITY

*2026-08-23*

- **The report now says whether the situation questions can narrow anything.** Under *What the situation can narrow*: how many things are reached by a place — their own or one they inherit — how many name somebody, and how many carry a time estimate.
- **Because a full store can have nothing for those questions to bite on.** Anything unlabelled fits every answer, deliberately, so a store with one place answers *where are you* with almost everything. That is the design working. Until now nothing said so, and answering a question and seeing no change looked identical to a broken feature.
- **It says where the leverage is.** A place on a project reaches everything inside it, so the report counts what sits inside something, and how many containers already carry a place. Those are the few answers that cover the most.
- **A low number is never listed as a fault.** Filing is optional in this app, always. These are facts about a store, they sit with the other counts, and nothing about them appears under *What is wrong*.
- **Still nothing you wrote.** Counts and states only — no place names, no people’s names, nothing else. The report is swept for every one of them on the way out.

## 2.29.0 — CAPABILITY

*2026-08-23*

- **There is a manual now — *How it works*, linked at the bottom of every screen.** Everything the app can do, what each screen is for, and where to look when something is not where you expected.
- **It is written in three depths and you are meant to stop early.** *In a minute* is the whole idea in five points. *When you want to* is how to do a particular thing. *Every screen* is the complete list, for when something is in front of you and you do not know what it is.
- **It is not in the ⓘ**, on purpose. That answers what this app is and how to install it; a reference is a different kind of reading, and burying it there would have made both harder to use.
- **And it cannot quietly go out of date.** It is generated from one source, and a check refuses to build if any screen exists that the manual does not name, or if the manual names one that has been removed. A manual that is merely current would be worse than none — it reads as authoritative and is wrong.
- **The reasoning is still separate**, in *Why it works this way*, which the manual links to. That is where the research, the sources and the things that turned out not to be true live.

## 2.28.0 — CAPABILITY

*2026-08-23*

- **The app asks where you are, once, at the moment it would matter.** Open *What’s the situation?* before you have named anywhere and it now asks, instead of showing you a chooser with nothing in it. Name one and it is applied straight away — you do not have to go and find it again.
- **It asks once and then never again.** The question is replaced by the ordinary chooser the moment a place exists, so there is nothing to dismiss and nothing that comes back.
- **Saying no costs nothing.** Close the sheet, or do not type. Nothing needs a place, and anything without one turns up wherever you are — which the sheet says out loud rather than leaving you to find out.
- **What is deliberately NOT here.** No setup screen, no template to pick, and nothing asking you to get organised before you can use the app. The research this came from refuses all three by name, and it refuses guessing a place from what you do even more firmly.
- **And nothing similar was added for roles or projects**, though the plan had it. The place question works because you opened a screen to answer it and half the answer was missing. There is no equivalent moment for a role, and inventing one would be a setup prompt wearing a question mark.

## 2.27.0 — CAPABILITY

*2026-08-23*

- **A place you put on a project now reaches everything inside it.** Before this, saying where something could be done meant saying it on every single item — which on a planner brought in from somewhere else is hundreds of statements, and nobody was ever going to make them. One statement on the project does it now, and it reaches down through however many levels are between.
- **Nothing you already set has changed.** A thing keeps its own places as well as the ones it inherits, so a place put on an item is never cancelled by one further up.
- **And a thing with no place anywhere above it still shows everywhere**, exactly as before. Saying where you are cannot empty the screen.
- **The place field says this now**, because it used to say something that stopped being true: a thing with no place of its own goes where it lives.
- **What is still true and still not fixed.** An item’s own panel lists only the places you set on it, not the ones it inherits — so if something surprises you by showing up, the reason is on whatever it sits inside rather than on the thing itself.

## 2.26.0 — CAPABILITY

*2026-08-23*

- **You can say who is with you, and the app answers with what is between you and them.** It sits beside *where you are* and *how long you have*, and the three work together on the one thing you are offered — never three separate screens to choose between. Anything with nobody named on it still shows, the same way anything with no place still shows, so saying who is here can never empty the screen.
- **Something you wrote this morning is no longer buried under an imported file.** Things you have not sorted yet are offered last, and inside that group they were ordered by when they arrived — so a planner you brought in put hundreds of its own items ahead of anything you wrote afterwards, permanently. Your own captures come first now. Nothing imported is excluded; it is behind, not gone.
- **What is deliberately NOT here.** Nothing counts who you spend time with, nothing is stored about who you were with or when, and there is no list of people ranked by anything. Who is with you is a setting on this device and never an event.
- **What is still true and still not fixed.** A saved situation remembers where you are and how long you have, but not who is with you. And a place you put on a project still does not reach the things inside it.

## 2.25.0 — CAPABILITY

*2026-08-23*

- **Bringing a planner in no longer reads as a backlog you have already fallen behind on.** The summary now says that nothing is filed, and that filing was never asked for — because it was not. Everything arrives as work, in the words you wrote it in, and it is usable before you have sorted any of it.
- **You can say you have a long stretch, and the app stops pretending that is a filter.** Four hours was not on the list at all. It is now, and choosing it does not narrow anything — it says so, and points at the Menu instead. A free afternoon is rarely short of time; it is short of the thing you actually want to do, and the Menu is the one list where nothing is asking.
- **What is deliberately NOT here.** Nothing sorts your import for you, nothing guesses which things belong where, and there is no progress bar for how organised you are. The research this came from refuses all three by name.
- **What is still true and still not fixed.** A place you put on a project still does not reach the things inside it, so labelling in bulk is not possible yet.

## 2.24.1 — ITERATION

*2026-08-23*

- **Two headings on the roles screen, so you can tell its two lists apart.** It now shows what each role is carrying and where your time went, and without headings those read as one list saying two contradictory things about the same name.
- **One sentence removed that said the same thing twice.** The line under the first heading opened by repeating the heading.
- **What is still true and still not fixed.** If you have never run a timer the time list reads zero for everything — it says so, and says what would fill it.

## 2.24.0 — CAPABILITY

*2026-08-22*

- **“Where the attention is” now shows where your time actually went.** That screen has been called that since it was built, and all it showed was how many things each of your roles is carrying — which is a different question. A role can be carrying nine things and have had none of your time, and that gap is the reason you would open it.
- **It counts the work you finished too.** An hour spent on something you completed is still an hour of your attention. The list above it, of what each role is carrying, still leaves finished things out — that one is about what is still open.
- **It comes from the timer, not from ticking things off.** Nothing here counts completions, so there is no way to make a number go up by finishing more.
- **It says how many separate runs the time came from**, because ninety minutes in one sitting and ninety across nine are not the same thing about a day.
- **In name order, never in order of size**, and with no target, no share of a whole and no bar. Ordering your own identities by how much each got is a ranking of your life.
- **What is still true and still not fixed.** If you have never run a timer, every line reads zero — so it says so, and says what would fill it, rather than showing you a blank screen. And only timed work is in it, which makes it a sample of your attention rather than the whole of it. It says that too.

## 2.23.2 — ITERATION

*2026-08-22*

- **“Just one thing” had grown a filter, and it should never have one.** Moving the situation control to the top of the screen last release accidentally left it standing in the mode built for the worst day — along with the two lines about what your list has been narrowed to. That mode exists to hand you one thing and take the choosing away; asking *where are you, how long have you got* is two more questions to answer before anything can start. All three are gone from it again.
- **Nothing else about the mode changed**, and the control is exactly where it was on the ordinary screen.

## 2.23.1 — ITERATION

*2026-08-22*

- **“What’s the situation?” is now the first thing under the box you type in; it was down inside *What you are holding*.** So are the two lines telling you the list has been narrowed — *You are at home* and *You have 30 minutes*. They were 2129px below *Next up* on a phone, which is nearly four screenfuls of scrolling, and *Next up* is the thing they change. You could be handed something you cannot do where you are standing, with the way to say so four screens away.
- **The Menu button is one place further down the tab order**, because there is one more button above it now. Nothing about it changed otherwise.
- **What is still true and still not fixed.** Nothing else moved. The lens, the tree and the rest of *What you are holding* are exactly where they were.

## 2.23.0 — CAPABILITY

*2026-08-22*

- **When you put something on the Menu you can say what kind of thing it is** — read, try, go, make, look into, save for. The Menu already sorted itself into those six and everything you put there was filed as *read*, so it only ever showed one heading. Now it shows what you actually have.
- **One tap unless you want the choice.** It still says *read* unless you change it, so nothing takes longer than it did.
- **And you can change your mind afterwards**, on the thing itself. No taking it off the Menu and putting it back.
- **And you can name a first step on anything, not just whatever you were handed.** *Get the oil change done* is not a bad plan and it is not stale — it is unformed, and what unblocks it is saying *ring the garage*. That has been on the offer card for a while and had no other way in, so it only worked on the one thing the app chose to show you. Now it is on every thing’s own panel.
- **What is deliberately NOT here.** Nothing tracks whether you look at the Menu, nothing suggests items, nothing frames any of it as a reward you earned by doing something else. The research this came from refuses all of that by name, and the reason is that attaching strings to the one part of your list that never had any is how it stops working.

## 2.22.0 — CAPABILITY

*2026-08-22*

- **You can look at what has changed without sending it to anybody.** *Show me*, beside the copy and save buttons. Until now the only way to read it was to copy it or save it — and doing that tells the app you have reported, so the next one starts from that moment. Look twice and the second look was empty, with nothing saying why.
- **Looking costs you nothing.** It writes no record and moves nothing. Copy, save and print still do, because those are you handing it over, which is a different act.
- **And when nothing has moved it says so, and says why.** Time passing does not write anything down — a week away with nobody touching it changes no records at all. That is an ordinary answer rather than an empty screen. What did change while you were gone is which things came round, and *Welcome back* is where that is said.

## 2.21.0 — CAPABILITY

*2026-08-22*

- **One place to answer what your situation is.** *What’s the situation?* holds where you are and how long you have — the two questions that change what the app should offer you. They were buried in the list of everything you are holding, which is the last place you would look when you have twenty minutes before you leave.
- **And you can name a situation, so it comes back in one tap.** *The Tuesday standup* — at the office, fifteen minutes. Set it once, name it, and it is one tap after that. Nothing reminds you it exists, nothing counts how often you use it, and nothing notices when you stop.
- **The line saying what is narrowed stays where you can see it.** The controls went behind a door; what they are doing did not. A filter you cannot see is an app that looks broken.
- **Forgetting a situation leaves the situation set.** The shortcut goes, not the answer. Letting go of a place you named leaves the situations that mentioned it working — they simply stop mentioning it.

## 2.20.0 — CAPABILITY

*2026-08-22*

- **You can say you promised something, and see everything you promised.** Pick *I said I would* when you name a person, and it appears under *With other people* — the same place that already showed what other people owe you, now showing both directions.
- **It never says how long.** The things other people owe you say *for three weeks*, because that is a fact about their side. Nothing on your side does, and nothing ever will: a running tally of how long you have kept somebody waiting is the one kind of record this app is built not to keep.
- **You keep a promise by doing the thing.** There is no separate step and nothing to tick twice — mark the work done and the promise goes with it.
- **And you can take one back without dropping the work.** *No longer promised* takes off the undertaking and leaves the thing exactly where it was, with its date and everything else. You might still mean to do it; that is yours to decide, not the app’s.
- **It is on the printed card too**, beside what you are waiting on from other people.

## 2.19.1 — ITERATION

*2026-08-22*

- **The work surface now says what today actually commits you to.** *Nothing is dated today* or *2 things are dated today* — the dates you set yourself, nothing inferred. It answers whether you can stop, and the answer that lets you stop is the one that used to be missing.
- **It was already worked out and you could not get at it.** The app has counted this since the header clock, and only ever said it inside that clock — which is off unless you turn it on, and buries it after the time and how much of the day is left. Somebody wondering whether they can finish early should not have to switch on a clock to find out.
- **Just the count, not the countdown.** How much of the day is left stays where it is. A number ticking down beside something you are avoiding makes it worse, which is why it came off this card in the first place.
- **Gone when you have said enough, and gone in "Just one thing".** Settling for the day is finishing early, so the question has already been answered; and a day cut down to one thing is not a day for weighing the whole plate.

## 2.19.0 — CAPABILITY

*2026-08-22*

- **You can say how long you have, and the app answers with things that fit.** Twenty minutes before you leave, five while the kettle boils. It sits beside *where you are* on the pile, and it narrows what the app offers you, not just what you can scroll.
- **Anything you never put a time on still shows.** Most things never get one, and the app does not know how long they take — so it does not pretend they do not fit. The line under the chooser says exactly that, rather than leaving you to wonder why the list looks short.
- **It uses your own estimate, never a correction of it.** If you said ten minutes and it took forty, it still counts as ten. What actually happened is on the thing itself for you to weigh; it is not the app’s to weigh for you.
- **Nothing is hidden from you, only from this view.** Everything still has its clock, still counts, and still comes back. Clear the chooser and it is all there.

## 2.18.2 — ITERATION

*2026-08-22*

- **Resting something on the Menu no longer changes what it is.** Put a goal on the Menu and bring it back and you got a plain task — the goal was gone, and nothing told you. A repeating thing came back as a task too, still quietly repeating underneath. Now everything comes back as whatever it was.
- **Except a wish, which is the whole point of bringing one back.** Something you put down as *maybe one day* becomes real work when you pick it up. That was the only case this was ever meant to do, and it was doing it to everything.
- **This was the thing last release said was still broken.** It turned out to be worse than described — not just a leftover rhythm, but the kind itself being rewritten every time.

## 2.18.1 — ITERATION

*2026-08-22*

- **When you pick a place to put something, it now says what kind of place it is.** *A calmer house — goal*, *Re-do the hallway — project, in A calmer house*. Until you could make goals and areas, every place in that list was a project and the names alone were enough; now they are not, and filing forty things at once is exactly where guessing wrong costs the most.
- **Filing many things under a goal already worked.** It was on the list to build and it turned out to be there — the picker offered it, and the filing landed. What was missing was only the words on the option.

## 2.18.0 — CAPABILITY

*2026-08-22*

- **A page for what you are working toward.** Your goals, areas and outcomes, each with what it is carrying and how often it comes back. Behind a control, never the screen you land on — you go and look when you want to, and it does not greet you with a list of your ambitions every morning.
- **The empty ones are on it, and that is the point.** A goal with nothing under it yet is still a goal. The app has always been able to work out which ones have nothing feeding them, but only ever mentioned it as something needing attention — which is a different thing from being able to see what you have and decide what goes under it.
- **It stays there when the work is done.** Finish everything under a goal and the goal remains on the list, saying it is holding nothing. That is the moment it would have vanished, and the moment you most need to see it.
- **Nothing on it is a score.** No bars, no percentages, no counts that could be read as a grade — what each one is carrying is said in words, and an empty one is not a failure. Projects are counted but not listed: a page with every project on it is the whole tree by another name.

## 2.17.0 — CAPABILITY

*2026-08-22*

- **A goal or an area can come back on its own rhythm.** Say how often you want to look at it and it arrives when the time comes, with something from inside it — you never have to remember to go and check. Work filed under a goal with no rhythm stays quiet, which is the point: nothing nags until you have asked it to.
- **Making a goal repeat used to quietly stop it being a goal.** The choice of kind arrived last release; the very next control in the same panel turned whatever you had made into a repeating chore, and the panel called it "Make it repeat" throughout. It no longer does. A goal that comes back is still a goal, and stopping it leaves it one too.
- **The words changed to match.** On a goal or an area the control now says *Come back to this* rather than *Make it repeat*, because that is what it does — it brings the thing back to be looked at, not to be ticked off.
- **And the way to stop was hidden.** Anything carrying a rhythm can now be told to stop carrying one. Before, that control appeared only on things the app called upkeeps, so a goal you had given a rhythm was in a state you could enter and not leave.
- **Still broken, and worth knowing.** Taking something off the Menu turns it back into a plain task but leaves any rhythm it had running underneath. It will still come back on that rhythm while calling itself a task. The way to stop it is now reachable, which it was not before, but the underlying muddle is not fixed. *Fixed in 2.18.2.*

## 2.16.0 — CAPABILITY

*2026-08-21*

- **You can make a goal, an area or an outcome — not only a project.** When you type a name for something to put a thing under, there is now a choice of what kind of thing it is. Project stays the default, so nothing you already do changes or costs an extra tap.
- **Which means a task can finally say what it is working toward.** The offer card has been able to say *serves ⟨something⟩* since 2.5.0 and has never once said it, because there was nothing above a project for it to find. Now there can be.
- **And a goal with nothing under it can be seen.** The app has always worked out which goals have nothing feeding them and which areas have gone quiet — it just had no goals or areas to work it out about.
- **What is deliberately not here.** No button that makes an empty goal for its own sake, no screen that asks you to build a structure before you can start, and nothing that scores or counts how much has moved under anything.

## 2.15.0 — CAPABILITY

*2026-08-21*

- **Bring your work in from another planner and the app now has something to offer you.** Before this it did not. An import of a few hundred things left *Next up* saying "nothing is asking today" — that morning, and the next one, and every one after — while the list underneath held every one of them. Everything about that was working as designed and the result was an app you could not start using.
- **What was wrong.** Things you write here go into an inbox, and the offer hands them back to you one at a time until you have said what they are. Things that arrive from somewhere else never joined that inbox, so nothing ever picked them up. They were held, they were safe, they were findable by searching — and they were never once handed to you.
- **Now an import arrives in the inbox, and the offer says where it came from.** One thing at a time, in the order it arrived, ranked below anything with a real date on it. The card says *this came in with your import* rather than *you put this down*, because you did not.
- **Nothing invents a date.** A date that had already gone by is still dropped rather than turned into something asking today — that was right and it has not changed. A date still ahead of you is still kept, and those things are not treated as unsorted, because you already said when.
- **Nothing else moved.** On a store you built here, the offer behaves exactly as it did.

## 2.14.3 — ITERATION

*2026-08-21*

- **The sample now has an upkeep that has actually come round.** It had one before, and it was deliberately not due yet — which meant the *Upkeep* strip stayed hidden, and if you loaded the sample to see what the app does, that was one thing it never showed you. There are two now: one comfortable, one ready, because the point of a rhythm is that it is not a deadline and you cannot see that from a single example.
- **What this actually fixed is invisible to you and worth saying anyway.** Because nothing could reach that strip, none of the accessibility checks had ever measured it — not its contrast, not what a screen reader calls its chips, in either theme, for the whole life of the app. It passes now, and a new check refuses to let any part of the screen go unmeasured like that again.
- **Nothing about the app itself changed.** The same strip, the same words, the same behaviour.

## 2.14.2 — ITERATION

*2026-08-21*

- **One line of wording in the footer.** Where it pointed you at the rest of the free apps, it referred to the person who makes them in the third person. It now just says how to get in touch. Nothing else in the app changed.
- **Why a whole release for one phrase.** The rest of the work behind it was a sweep through every note, record and comment in the repository, removing references to a real person that had no business being in a public place. None of that is visible to you and none of it is a change to the app — so it does not get a release of its own. This phrase was the only part you could actually see.

## 2.14.1 — ITERATION

*2026-08-20*

- **The way out of "Just one thing" no longer disappears when there is nothing to do.** It sat on the offer card, and the offer card is not there when nothing is asking — so if you turned the mode on and then finished or put off the last thing, the button that undoes it went with the card.
- **The last release is what made that serious.** Until it, everything else was still on the screen underneath, so you were stuck in a mode with a working app. With the surface cleared away, the same state left a screen with somewhere to put things down, the line saying nothing has gone quiet, and no way back.
- **It is its own line now, below where the offer sits, and it is there for as long as the mode is.** Nothing else moved.

## 2.14.0 — CAPABILITY

*2026-08-20*

- **"Just one thing" now clears the whole screen, not only the card.** Turning it on gave you one task with nothing around it — and then left everything else standing underneath: the sorting queue, *needs a new plan*, *with other people*, the Menu, the search box and your whole held list. Counted on a phone: five things on the card, and fourteen buttons and 65 words below it.
- **Which means it was doing the opposite of its job to the two hardest lines on the page.** *One date has gone by* and *one thing is with someone else* were printed underneath a card that had just had its explanation removed for being one thing too many to read.
- **Now there is the thing, the two buttons, and the way back.** Below the offer there is nothing at all. On a phone the whole screen is now shorter than one screenful, where it used to run to more than two.
- **Four things never go, whatever else does.** Putting something down still works from here — that never depends on anything. The line that tells you nothing has gone quiet is still there, because it is what makes the rest being out of sight safe. *More* and the ⓘ stay, because a screen you cannot leave is worse than a busy one. And if you are in the middle of working on something, that stays too.
- **Nothing was taken away.** Everything is still held, every card is still there, and one tap on *Show me everything again* brings the whole surface straight back.
- **The cost, stated: search is not on this screen.** While the mode is on, *where did I put that* is answered by leaving it. That is a real loss and it was the trade made on purpose — on this day, a box asking you to remember a word is one more thing asking.
- **The welcome-back greeting and the worry flow are held back too**, rather than dismissed. They are waiting when you come out.

## 2.13.0 — CAPABILITY

*2026-08-20*

- **When a place comes round, you can see what else is in it.** Quietkeep already brought you one thing to do when an area or a goal came back round, and told you which one it came from. It did not tell you what else was in there — so the place returned and everything else in it stayed out of sight.
- **That is the one thing this app is most for.** A thing you cannot see is a thing you have stopped counting on; putting something away is the same as losing it. Bringing back one item and leaving the rest filed is the exact shape of the problem, happening inside the fix for it.
- **Three names, and nothing else.** No dates, no buttons, nothing asking. They are there so you can see them, not so they become a list — and three is the cap, so a big area coming round can never empty itself onto the screen.
- **It does not repeat what the card already says.** If you are being shown something in *Get the kitchen tap fixed*, that project is not also listed as what else is in there.
- **Only when a place has come round**, which is when the app has nothing else to offer you. On an ordinary busy day you will never see this line.

## 2.12.2 — ITERATION

*2026-08-19*

- **The line saying how much of today is left has come off the offer card.** It read *“About 2h 30m left today”*, and it was on the card from the moment you opened the app until the day ran out. The last release said it was unsettled; this one settles it.
- **The card already refused to do exactly this, one line further down.** The line naming the fixed thing today gives you its name and never how long until it — because a number counting down towards something you are already avoiding makes it harder to start, not easier. The remainder of the day was the same kind of number, three lines above it.
- **The clock in the header still says it, and the clock is off until you ask for it.** It was built as something you switch on, because a day is not a countdown and one should not arrive on your screen uninvited. If you had switched it on, the app was telling you the same thing twice at once, in two different phrasings.
- **It was there to help you judge whether something fits in what is left — and the card never told you how long anything takes.** How long a thing has taken you before is on the thing itself, when you open it. A remainder with nothing to measure it against is just a clock running down.
- **If you want the running remainder, it is one switch:** *More → Settings → A clock in the header*. Nothing else on the card changed.
- **Still not measured: whether the rest of the card is now the right length.** It still names where the thing lives, why it is being offered, what a first small piece of it would be, the next fixed thing today, two other things and something you wanted. That was not weighed in this release.

## 2.12.1 — ITERATION

*2026-08-19*

- **“Hold what I copied” is gone, because pasting already did all of it.** Paste into the box and you get exactly what that button gave you — several lines arriving as one thing per line, the line telling you so, and *Hold it as one thing* if you would rather. Both went through the same code; the button only read the clipboard for you.
- **What it did buy was two taps**, on a tablet: press it instead of tapping the box, holding, and choosing Paste. That is a real saving and it is why it existed. It is also a permanent control on the one surface this app most wants quiet, doing something your device already does, for the less common way of putting something down — most things arrive typed.
- **The Menu is now the 39th thing on the page; it was the 40th** — one button was taken away above it and nothing about the Menu changed.

## 2.12.0 — CAPABILITY

*2026-08-19*

- **The front page has stopped being a list.** Measured at 390 pixels on the thirteen-item sample: it ran to **4,247 pixels — a little over five screens — and *What you are holding* was 2,387 of them.** Fifty-six per cent of the page you land on was one list. It is **2,228 pixels now**, and everything below the card fits in about two and a half screens.
- **Seven things were on that page twice.** The thing you were being offered, the two beside it, the one needing a new plan and the one with someone else were all also rows further down — and two of them offered *different acts* in the two places. *Put the recycling out for collection* said **Not this one** near the top and **Work on this · Done** two screens below.
- **Nothing has been removed, and nothing has moved.** The list is folded, not gone. Opening it is one press, it opens where it is rather than taking you somewhere, and it stays how you left it. Every group is named on the way in — *Not sorted yet, Needs a new plan, Ready now, Coming up, Later, On the Menu, Done* — so where everything is, is still said out loud before you open anything.
- **And it counts nothing.** The fold names the groups and states no number. The honest totals already live in the line under the capture box, and saying them twice — the second time as a heading over a folded list — is how a backlog gets rebuilt.
- **Still on the card and still unsettled: the line saying how much of today is left.** It carries a shrinking number, and it is already gone in *Just one thing*.

## 2.11.0 — CAPABILITY

*2026-08-19*

- **The walkthrough shows you the thing it is talking about.** Six steps described an app you were looking at and could not see yet — *“the box at the top”*, *“it offers you a small number of things”* — with no picture of any of it. Five of the six now carry one: the box with something typed in it, the sorting choices, the offer card, the same card with almost everything stripped away, and what the browser has promised about keeping your writing.
- **They are photographs of this version, not drawings of it.** Each one is rendered from the running app, in both light and dark, and the build fails if the app changes and they do not. A help screen illustrated with a version that no longer exists is worse than one with no pictures at all — writing that has gone stale reads as stale, and a screenshot reads as proof.
- **They work with no connection.** The pictures are kept with the app itself, so the walkthrough is whole on a first run with nothing to fetch.
- **And the walkthrough’s own buttons had been breaking in half.** From step 2 onward the row reads *Skip*, *Back*, *Next* on a phone, and the words were wrapping inside themselves — “Ski / p”, “Bac / k”, “Nex / t” — on the first screen anybody ever sees. They were the right size, the right contrast and correctly named throughout, which is why nothing had ever caught it.

## 2.10.3 — ITERATION

*2026-08-19*

- **Clearing out no longer invents a chore over an empty planner.** With nothing in it, the panel still said *“This clears 0 things — everything you are keeping here, people, weights and private entries included”*, warned that you had not saved a copy, made **Save a copy first** the loudest thing on the screen, and asked you to type the word **clear** out in full — to authorise doing nothing. The line directly above it had always said *“There is nothing here to clear.”* Now the rest of the panel has been told: it says it does nothing, asks for no word, and nothing on it leads.
- **Starting again over a HISTORY still warns you, and that is deliberate** — that one erases the record, so a planner holding nothing may still have something worth keeping. The warning only goes when there is genuinely nothing to lose.
- **“Not kept yet — press Set.” now sits under the Set button.** It was rendering below the whole note field — four controls away from the button it names, under a section whose only button says *Keep the note*. The markup had never closed the date group before the note began.
- **And a stuck update stops telling you to do something instead.** When a device will not let the new version take over, the card explains that closing the app completely and opening it again is what works — and it hid *Install it now*, which left **Save a copy** as the loudest button, directly under a sentence saying nothing you have written is affected. It was loud because something else was removed, not because anyone decided it should be. Nothing on that card leads now; the thing that works is in the words.

## 2.10.2 — ITERATION

*2026-08-19*

- **The card has stopped telling you about the thing you are looking at.** Under the head it printed *Fixed today: <the same thing>* — the one unmoveable thing today, which is very often the thing being offered, because a real date today is the first reason anything gets picked. So the card named it twice and the second time read as a second job.
- **That line is still there when it has something to say.** It exists so somebody deep in a task can catch what is coming without going looking, and when it names something you are **not** holding it does exactly that. It goes only when it would be repeating the head back at you.
- **And it now knows the difference by identity rather than by name**, so two things you have both called *Ring the plumber back* are not mistaken for each other.

## 2.10.1 — ITERATION

*2026-08-19*

- **Everything on the screen had the same weight, so nothing led.** Asked what a version designed whole would look like, I answered with pixel counts and never once rendered the app and looked at it. Looking at it: eleven outlined boxes stacked, drawn identically — the navigation, the capture field, the proof line, and the task itself.
- **The one thing now looks like the one thing.** Its title was a rounded box with a border, the same drawing as the capture field above it and the smaller-step field below — the item this app exists to hand you was rendered as a form to fill in. It is bigger, plainer, underlined type now.
- **The card no longer explains itself to you.** *Start smaller* was a text field standing open, a loud button beside it, and four lines of prose about what a first step is — a manual printed on the thing you are trying to begin. It is one quiet word now, and the field appears when you ask for it.
- **Six verbs, drawn as six boxes, are now two acts and four quiet words.** *Done* and *Not this* are what the card is for. *Start smaller*, *This one is heavy*, *That is enough for now* and *Just one thing* are things you might say about the day, and as equal boxes they turned a card that claims to have decided for you into a list of six decisions. Nothing is hidden and nothing moved — they are quieter.
- **The proof line and the ways to elsewhere are quieter too**, a hairline instead of a heavy border. They are ways to somewhere; the work is the point.
- **The Menu’s door is now the 40th control on the page; it was the 39th** — one button was added above it and nothing about the Menu changed.
- **Still on the card and still worth arguing about: the line saying how much of today is left.** It carries a shrinking number, on the same card as a line that is forbidden from carrying any number at all. It is already gone in *Just one thing*. Whether it belongs on the ordinary card is the next question and it is not settled here.

## 2.10.0 — CAPABILITY

*2026-08-19*

- **Just one thing now quiets the whole screen, not only the card.** Reported from a device, on a screen showing exactly one task: too busy to want to begin in. Counted at 390 pixels with the sample on: **thirty-one things were being asked of you before anything could happen** — nine controls, four lines to read, and eighteen things on the card that is supposed to be one thing. Turning this mode on changed **none** of the chrome. It is fifteen now.
- **The card called “one thing” was showing four**, plus seven verbs and seven lines of prose. In this mode it is the thing, *Done*, *Not this*, *That is enough for now*, and the way back to everything.
- **Three lines had been quietly slipping through for three releases:** how much of today is left, the next fixed thing, and when you wrote it. Each was added to the card after the strip’s list was written and none was ever added to it — so on the day this mode exists for, the app was still telling you the hours were going.
- **And the strip now reaches the top bar** — *More room*, *Hold what I copied*, *Contents* and the clock all stand down with it. Capture never does, the line saying nothing has gone quiet never does, and *More* never does: a screen with no way to anywhere is a trap.
- **Nothing can slip through again.** Every line on that card must now say whether it survives — a new one fails the build until it does — and the check reads the screen rather than the list, because one of these three was in the list and on screen at the same time.

## 2.9.4 — ITERATION

*2026-08-19*

- **The report no longer tells you to back up an empty planner.** On a store with nothing in it, the first thing under *what is wrong* was “No copy has ever left this device — everything here exists in one place, and clearing website data would take it.” There is no everything, and nothing to take. A chore invented out of nothing is exactly what this app is not supposed to do, and it was doing it on the one screen whose whole job is to say only what is true.
- **And the storage line now says what it is actually counting.** It read *Used by Quietkeep: 1.3 MB* next to a log of zero events, which looks like either a lie or a bug. It was neither: the browser counts the app’s own downloaded code and anything you have put in as one number and does not separate them. On an empty planner that figure is almost entirely the app. It says so now, and it is labelled *Used at this address*.
- **Still true and still worth acting on:** the browser has not agreed to keep your planner. That warning stays on an empty store, because it is the thing to sort out **before** you rely on it rather than after.

## 2.9.3 — ITERATION

*2026-08-19*

- **Buttons that were touching each other now have room between them.** Reported from a device: *Bring a copy back* and *What’s on this page* overlap. They were **0.0 pixels apart — at every screen size, at every text size, and always had been.** Two controls with nothing between them read as one, and a finger on the seam gets whichever is on top with no way to tell which you pressed.
- **Looking for that one found four more of exactly the same thing:** the two rows of buttons under what you are offered, the door and the way past it on a card that needs a new plan, *Have a look* and *Carry on* when a session closes, and the buttons in the undo line. All of them sat directly against each other.
- **Nothing was checking this, which is why you found it.** Every check in this app asked whether a control was big enough to press; none asked whether it was separate from the next one. There is one now, and it runs on every screen the checks already cover — it names the two controls and the box they are in, so the next one is a minute rather than an afternoon.
- **And the check itself was wrong twice before it was right.** Its first version asked whether the boxes *overlapped* and reported nothing wrong about the very buttons you reported, because they were touching rather than overlapping. Its second version only looked at what was on screen, so planting your exact defect back in made it go green — those two buttons are below the fold. It compares within each scrolling area now, so nothing is missed for being out of view.

## 2.9.2 — ITERATION

*2026-08-18*

- **The line saying nothing has gone quiet was being cut in half.** At a larger text size the strip at the top of the screen ran out of room and started scrolling inside itself, so the sentence was sliced through the middle. Reported from a device and reproduced: at 175% browser text it needed 474 pixels and had 422.
- **A box cut in half is this app suggesting something has been lost, and it may not do that.** So past half the screen the top strip stops being a fixed strip: everything goes back to being ordinary page content and the whole page scrolls, exactly as it did before. You lose the convenience, never the sentence.
- **Where that actually happens:** on a phone at ordinary text the strip takes about a third of the screen and stays. It stands down on a very small screen, or once your text is large enough that keeping it would cost more than it is worth.
- **And it does not flicker.** It stands down past half the screen and only comes back below 42%, so a size sitting right on the line cannot flip the page back and forth while you read it.

## 2.9.1 — ITERATION

*2026-08-18*

- **Making the text bigger now makes the boxes bigger too.** Reported from a device, and it was true: a button’s words grew by half again while its box grew by about a quarter, so the letters ended up crowding the edges. **The capture box and the title of the thing you are offered did not grow at all.**
- **Why:** every control’s padding, and the 44-pixel floor under every target, were measured against *the page’s* text size rather than *that control’s*. This app’s own size setting moves the page’s, so it worked there. Your browser’s own text setting does not move it — nor does a minimum font size, nor a text size set for every site — so under any of those the boxes stood still. They are measured against each control’s own text now, and the floor still holds for small print.
- **One thing that was quietly broken and is now fixed:** at the app’s *smaller* setting the capture box’s text dropped below 16 pixels, which is the size at which iOS zooms the whole page the moment you tap into a box. It cannot go under that any more.
- **And the diagnostic now says what your text is actually doing** — the size of the words, the size of the page they are measured against, and which of the three things moved them: this app’s setting, your browser’s, or a page zoom. That question could not be answered from a screenshot, and it cost a round trip.

## 2.9.0 — CAPABILITY

*2026-08-18*

- **The capture box no longer scrolls away.** It, the line saying nothing has gone quiet, and the way to everywhere are now a frame the page moves underneath — so from anywhere in your list you can put something down without going anywhere first. That is what the last release measured and said could not be got by moving blocks about.
- **The capture box is now the fourth control on the page; it was the seventh**, and **the Menu’s door is now the 39th; it was the 45th.** Nothing about either changed but the frame above them.
- **Measured on a phone.** The frame takes about a quarter of the screen and never gives it back — 201 pixels of 844 empty, 225 with things in it. At the top that is a gain, since the same chrome used to take 304; deep in a list it is a loss, since it used to be gone. In exchange *Next up* begins **0.08 screens into the scrolling part** instead of 0.43 down the page.
- **Nothing became unreachable, and that was checked rather than hoped:** every control was asked whether some scroll position brings its whole box into view — all of them, both sizes, empty and full. The last attempt at chrome that stays put was a floating button, and it failed exactly that test.
- **Two smaller things moved with it.** *More room* and *Hold what I copied* now sit just under the frame rather than inside it, so from far down they need a trip back up. And “a newer version is ready” now appears **below** the capture box, so it can never push the box down. **If the frame is more in the way than it is worth, say so** — it comes off, and the numbers stay true either way.

## 2.8.1 — ITERATION

*2026-08-18*

- **The first screen is capture, the proof line, and the one thing.** *Something on your mind that isn’t a task?*, *How you are, and anything weighing on you* and *Sort things out* have moved behind **Contents**, and all three do exactly what they did. The line saying nothing has gone quiet came up to meet you — it was the first thing inside your list, nearly three screens down, so the one line telling you nothing was lost was only ever read after you had scrolled to the list it was about.
- **And the load line says what is behind it** — its row in **Contents** carries what you said and how many things are on you, so it does not go quiet just because it is out of sight. Nothing at all when there is nothing to say. Never a nought.
- **Measured, not claimed:** on a phone *Next up* went from 0.48 screens down to 0.43, and the first screen from fifteen controls to fourteen. **What it did not buy is worth more:** the top bar and capture take 236 pixels before anything else exists, so the offer cannot beat about 0.36 screens while it sits under them. **Putting the one thing at the top cannot be done by moving blocks** — it needs capture to become part of the frame. Bigger change, not here, and there is now a number to decide it with.
- **The Menu’s door is now higher up the page; it was six controls further down.** Nothing about the Menu changed — three doors came off above it.
- **Naming a worry is one tap further than it was.** A real cost if you have to fight to start things, and the thing to tell me about after a few days.

## 2.8.0 — CAPABILITY

*2026-08-17*

- **You can set how big this app is, on its own.** In **Settings**, under *How big this app is* — smaller through to biggest. It only touches this app on this device: your phone keeps whatever text size you have set for everything else, and nothing you have written down changes.
- **It multiplies your own setting rather than replacing it.** If your phone’s text is already large and you pick *a little smaller*, you get your large text a little smaller — not thrown back to whatever this app thinks is normal.
- **And the buttons stop shrinking with the words, which they should never have done.** Every control in this app has a floor of 44 pixels, the size a fingertip actually needs. That floor was written in a unit that follows your text size — so it grew when you made text bigger, which is right, and SHRANK when you made it smaller, which is not: smaller text does not mean smaller fingers. Measured at an ordinary reduced setting, **24 controls were under the floor**, including everything in the top bar and the box you type into.
- **Four controls were under the floor even at the normal size**, and had been for a long time: the two dropdowns for how you are and how heavy something is, the box you type your own words into on a thing’s sheet, and the doors on the two collapsed lines under the capture box. The check that was supposed to catch them had a hand-written list of what counts as a control, and dropdowns, text boxes and those doors were not on it.

## 2.7.2 — ITERATION

*2026-08-17*

- **The line under the capture box now reads *How you are, and anything weighing on you*.** It said *Something weighing on you?* — which names only one of the two things behind it. Saying **it is a low stretch today** has always lived there too, and nothing said so, so finding it meant guessing that the question about weights was where it was kept.
- **Nothing moved and nothing was added.** It is the same line in the same place, still closed until you open it. An app that asks every morning how you are is a demand, and this one is not going to start.

## 2.7.1 — ITERATION

*2026-08-17*

- **When you are working on one thing, the screen now tells you what else is fixed for today.** One line, by name, on the **Working on** screen — no clock, no countdown. A countdown is a deadline and makes a thing harder to face; the alarm in your calendar is still the thing that actually guarantees you are told.
- **That line already existed, on the other screen.** It has been on the main screen since the day-boundary work, which is the screen you have already left when you are deep in something. The research this app is built on says absorption collapses time — an appointment does not get forgotten so much as stop existing — so the one place the line is worth having is the place it was not.

## 2.7.0 — CAPABILITY

*2026-08-17*

- **The app now reads the hot-or-cold you already gave it.** When several things are simply waiting — none of them dated, none of them pressing — the one you called **hot** is offered first, then the ones you never answered about, then the ones you called cold. The card says so: *"this one is waiting, and you said it was hot."*
- **You have been answering that question since the beginning and nothing has ever read it.** The two-tap Hot or Cold in sorting was written to the record, kept, carried through every backup — and the screen that decides what to hand you next had never once looked at it.
- **Cold is never hidden**, and not answering is not a penalty: unanswered sits between hot and cold, so answering can only move something in the direction you pointed.
- **Nothing else about the order changed.** A real date that is here still comes first, always. This only decides between things that were tied — and where they were tied, the app fell back to whichever you wrote down first, for ever. Forty things with no rhythm gave the same card today, next month and next year.
- **Why this and not "what is most important":** the research this app is built on is clear that for this audience importance does not start the engine — interest, novelty, challenge, urgency and passion do. Ranking by importance is the famous urgent/important grid, and its whole top row is a dead letter here. That was the other option and it was refused on the evidence, not on taste.

## 2.6.0 — CAPABILITY

*2026-08-17*

- **Roles.** A thing can now say who it is for — a part of your life that runs through more than one area. Set it on a thing’s own sheet under **Who is this for?**, as many as fit. It sits beside where a thing can be done, and it is a different question: that one is WHERE, this one is WHO.
- **And a readout: Where the attention is.** A line above your list, once you have named a role, showing what each one is carrying right now. It says the number of things and nothing else — no bar, no share of a whole, no target, nothing about whether any of it is even. A bar is a machine for implying you are behind. What it is for is the question that has been in the notes for weeks: whether you are putting enough into each. The app plots; you read it.
- **It also states what belongs to no role at all**, which on any real set is most of it. Leaving that out would make the named ones look like the whole of your life.
- **Nothing is required and nothing is guessed.** The app never infers a role from a title, a folder or your history. Most things belong to none, and that is the ordinary case rather than an unfinished one.
- **This was settled on 4 August and not built for thirteen days.** The shape was written down correctly that day — a role crosses areas, so it can never be a container, it has to be a link — and then the build was held back pending a judgement about whether you had made enough projects yet to justify it. That judgement was not anyone’s to make but yours.

## 2.5.0 — CAPABILITY

*2026-08-17*

- **Things now say what they are FOR, not just where they sit.** A step filed under a project under a goal says **serves ‹your goal›** on its row and on the card at the top. A description, never a door — nothing takes you up there, nothing is counted, nothing is scored.
- **Half of a founding rule had never been built.** The rule is *levels push down; you never climb*: you should never walk up through goals and areas to plan a day, and instead the higher things send what they know down to you. The never-climbing half was always true. The sending-down half did not exist — a card knew what box it was in, and nothing anywhere said what any of it was for.
- **This is the answer to a report that the app gave no feeling of showing the right things.** It sat thirteen days because it was thought to need a question answered first. It needed somebody to read the code. Every way the app picks what to offer is about TIME, and where two things tie it falls back to which you wrote first — so it had no notion of what anything is for, and could not show you the right things by any meaning of "right" but "most time-pressured".
- **Still owed, and it is your call rather than a build:** the ORDER things are offered in has not changed. Making "serves a goal" beat "serves nothing" would be the app deciding that filing something under a goal means it matters more — and a loose note is very often the most important thing you have written down.

## 2.4.0 — CAPABILITY

*2026-08-17*

- **Things now say what they are.** A project says **Project**, a goal says **Goal**, an area says **Area** — on its row in your list and at the top of its own sheet. Also **Waiting for**, **Upkeep**, **A worry**, **Something on you**, **A wish**, **Where you left off**, **A place**, **Person**, **A named period**, **Journal entry**.
- **Nothing in the app had ever said this.** Fourteen different kinds of thing, and not one word for any of them anywhere you could see. A project holding things said "7 under it" — a number, with no name on it — and a project holding nothing, a goal, an area and an outcome said nothing whatsoever. So a goal and a stray to-do were drawn exactly the same, which is why the screen read as one long to-do list: that is what it looked like.
- **Ordinary to-dos are not labelled, on purpose.** Writing "Action" on several hundred rows would add a word to every line and tell you nothing. The ones that get named are the ones you could not otherwise tell apart from a to-do.
- **Your sheets say it too.** The line under a thing’s title told you it was on the Menu, or done, or when it comes back — everything about it except what it actually is, which is the thing that decides how to read the rest.
- **Still owed: the tree and search results do not say it yet.** They have room for it and it should go there; this release covers your list and the sheets, which is where it was reported.

## 2.3.0 — CAPABILITY

*2026-08-17*

- **The capture line is now the seventh thing in the page; it was the sixth. The Menu line is now one row lower than it was.** A **Contents** button joined the top bar beside More — see below. Nothing else moved.
- **Contents lists every part of the page that is showing, and takes you to it.** In the order they come, each with what it already says about itself — "3 dates have gone by", "2 waiting on somebody". There is a second door at the very end of your list, **What’s on this page**, so you do not have to travel back up to use it.
- **This answers "it is one long page, does it not need pages or tabs?"** — the first thing ever asked of this app, which did not get built. It should have been.
- **It is not tabs, on purpose.** Tabs split your things into two piles, and then you have to remember to check the other pile — the exact thing this app exists to save you from. Nothing is hidden and nothing has moved.
- **Your list has a real heading now.** "What you are holding" was written at the top of it but was only a line of text, so the biggest thing on the screen was not somewhere the app could take you, and a screen reader could not treat it as a place.
- **Still owed: from the middle of the page you reach for one of the two ends.** A button floating in the corner was built first, then measured — over a sample set it sat on top of ten controls and took the tap from three, every one a **Done**. Pressing Done and getting a contents list is worse than scrolling, so it is not shipping.

## 2.2.0 — CAPABILITY

*2026-08-17*

- **Done is now the second control on the offer; it was the first. Not this is now the fourth; it was the third. The Menu line is now one row lower than it was.** The card's title moved ahead of them, because it is a button now — see below. Nothing else moved.
- **You can say where a thing can be done, and then say where you are.** At home, at work, out, on the phone — as many as fit, because a thing can be doable in more than one place. Set them on a thing's own sheet under **Where can this be done?**; then **Where you are** at the bottom of the main screen narrows what you are offered and what is listed to the things that actually fit.
- **Anything with no place at all fits everywhere.** Most of what you write down is not tied to a room, and it would be a poor system that hid it for that. Nothing is required and nothing is filed for you.
- **Nothing is hidden from you by this.** A thing you cannot do from where you are still has its date, still counts in the line above your list, and still comes back. It is a filter on what you are looking at, never a change to what the app is holding.
- **And the card at the top opens now.** The one thing the app hands you was the only thing on the screen you could not tap to change — you had to go and find it somewhere else first.

## 2.1.0 — CAPABILITY

*2026-08-12*

- **Every way of getting somewhere now looks like a button.** Five lines on the main screen were controls that rendered as plain grey sentences: the claim above your list, "How it hangs together", the Menu line, "Sort things out", and the jump to your list. Measured on the work surface: 50 controls, 45 with a border or a fill, and the 5 without were every route off the page. They now carry the same border as More, Done and Not this.
- **And there is a way back.** There was none — nothing anywhere in the app returned you to the top. A jump that sent you five screens down was a one-way trip. **Back to the top** now sits at the end of your list.

## 2.0.9 — ITERATION

*2026-08-12*

- **Nothing on screen has changed in this one.** It carries a single invisible attribute in the page, which exists so a new check can hold the app to a rule: anything that only a keyboard can reach has to say how a finger reaches the same place. The check now runs on every push.
- It gets a release of its own because of how the app updates: files are kept in a store named after the version, so a change that does not move the version never reaches a device that already has the app. Publishing it without this would have meant publishing it nowhere.

## 2.0.8 — ITERATION

*2026-08-12*

- **The Menu line is now one row lower than it was; it was directly under Upkeep.** A new row sits above it — see below. Nothing else moved.
- **There is a way straight down to your list now, and you can tap it.** On a full planner the list of what you are holding starts about three screens down on an iPad, and nearly five on a phone, behind everything the app wanted to tell you first. A line saying **Go to what you are holding** now sits just under what is next up and takes you there in one tap. It is only there when something is actually in the way — never on a quiet day, never on an empty one.
- **On a phone you still scroll past the offer to reach it** — about a screen and a half, because the card at the top is taller there. That is honest rather than ideal: it is a way past four more screens, not a way past all of them. On an iPad it is on the first screen.
- **This existed already and you could not reach it.** The app has carried a "skip to what you are holding" link since the first release, for keyboard and screen-reader users only. By finger it was unreachable. That is the gap this closes.
- **Still one scroll.** The sections above your list have not changed and nothing has been hidden. This gives you a way past them, not fewer of them.

## 2.0.7 — ITERATION

*2026-08-12*

- **The Menu opens as its own screen now**, like the two things above it did last release. It used to unfold in the middle of the page, above the list you were already looking at. It is the same list, the control is where it was, and it still says plainly that nothing on it is asking for anything.
- **Your main screen is still one scroll.** With a lot on, the sections above your list stack up in front of it. All three of the things you could open yourself have now been moved off it; the rest is a separate question and it is not answered yet.

## 2.0.6 — ITERATION

*2026-08-11*

- **The Close button was showing the panel’s own text through itself.** The ⓘ and the five screens behind it scroll their contents inside a fixed frame, and the frame was drawing about five pixels further down than it should — so a sliver of whatever you had scrolled to was painted underneath the way out. The button has no fill of its own, so you read it straight through.
- **The walkthrough now shows you which words are buttons.** It says things like “Not this moves past it” and “Just one thing strips it back” — sentences about two controls, set in the same plain text as the words around them. The ⓘ panel has always set a control’s name apart; the walkthrough was the one screen not doing it, on the screen where you know least about the app.
- **Both were reported from a device, and neither was something the app could catch on its own.** It already checked that the way out stays on screen and that nothing sits on top of it — and a see-through button passes both of those. It measures the shapes now, on all six screens.

## 2.0.5 — ITERATION

*2026-08-11*

- **The claim above your list, and “How it hangs together”, now open as their own screen.** Both used to unfold in the middle of the page, above the list you were already looking at — on a full planner, tens of screens of it, and getting back meant scrolling past the lot. Both controls are where they were and say what they said; only where their contents land has changed.
- **Still one scroll otherwise.** With a lot on, the sections above your list still stack up in front of it. This took out the two biggest pieces — the ones you opened yourself. The rest is a separate question and is not answered yet.

## 2.0.4 — ITERATION

*2026-08-10*

- **The invented sample is now data somebody could actually have.** It was built by pairing lists at random, so it produced things like “Photograph the meter” inside “Plan the trip north”, and lines reading “in Get the bike serviced · under Reading”. Every step now sits in a project it belongs to, and every project under an area that makes sense of it.
- **Most of what people write down is a fragment** — “order the part”, “ring them back”. Those read properly when the thing above them supplies the missing word, so a wrong parent is worse than none at all: the app confidently shows you a context that is not true. Anything in the sample with nothing above it now says what it is about on its own.
- **This only ever affected the invented sample.** Nothing you wrote yourself was touched, and nothing about how your own things are shown has changed.

## 2.0.3 — ITERATION

*2026-08-10*

- **The offer now says when you wrote it.** A lot of what people write down is a fragment — “take the old one to the tip”, “ring them back”, “order the part”. Under a project that reads fine, and the card names the project underneath. With nothing above it, the card was a bare instruction with no subject anywhere on the screen.
- The sorting card has said when something was written since 1.29.0. The card you actually meet work on never did. It does now, from the same words, and it still never tells you how long ago — an age is the same fact wearing an accusation.
- **It still cannot tell you what you meant.** If a fragment was written with no project and no note, when you wrote it is all there is, and that may not be enough. Adding a place or a note to it is what fixes that, and the app will not pretend otherwise.

## 2.0.2 — ITERATION

*2026-08-10*

- **The screen leads with what you could do.** The one thing chosen for you used to sit below the sorting, and below everything else — so opening the app showed you tidying first and the answer last. It is near the top now, where the question you opened the app to ask gets answered.
- Nothing was renamed, removed, or given a new home. Only the order changed.

## 2.0.1 — ITERATION

*2026-08-10*

- **Things you never asked for stopped saying they were waiting for you.** When something loses its date — you clear it, or you throw away the project it was filed under — the app quietly gives it a new one so it cannot go missing. That safety net was being read as *you* asking for it, so days later it would come back saying "this one is waiting". It was never true.
- **Everything you actually did ask for still comes back exactly as it did.** Something you promoted off the Menu, a thread you were pulled away from, a date you set, a thing that just became possible — all unchanged. The difference is only ever about who asked.

## 2.0.0 — VERSION

*2026-08-10*

- **Anything you put down is a task straight away.** It used to have to be sorted first — until you said what kind of thing it was, it came back only as something else to sort, never as something to do. Now it comes back as work the moment you write it, in the words you typed.
- **Sorting is no longer the toll.** A date, a place, or the thing it follows changes *when* and *where* something comes back. It never decided *whether*, and now it does not pretend to.
- **And it cannot bury you.** Things you have sorted are offered first; what you only put down waits behind them, in the order it arrived. One at a time, never more than five lined up.

## 1.42.2 — ITERATION

*2026-08-10*

- **The end of the walkthrough now lands on a finished screen.** It hands you to the part about keeping your data on this device — and the button for it was arriving a moment after the rest of the screen, so on a slow or busy device you could be looking at the question with nothing there to answer it. It is there when you arrive now.
- Nothing about what it asks, or what it does, has changed.

## 1.42.1 — ITERATION

*2026-08-10*

- **Opening the app no longer asks you to sort anything.** Arriving with things in the inbox used to put a card in front of you and ask what to do with it, before the app had said what you could be getting on with. Now it says there is sorting to do, and waits to be asked. The button is there the whole time.
- **Nothing you have put down is at risk while it sits there.** It is held from the moment you press the button — sorting decides *where* it comes back, not *whether*. The app now says that, where it used to show a running total instead.
- **And that total is gone.** A number that only goes up as you put things down makes a good day look like a debt. Nothing on the way in counts what you have given it.
- Sorting itself is unchanged — the same routes, the same quick hot-or-cold pass when there is a pile worth sweeping.

## 1.42.0 — CAPABILITY

*2026-08-10*

- **The promise now shows its working.** Tapping what you are holding used to open a list of everything and when each one comes back. That answers *what is in here*. The question it exists for is *can I stop holding this myself* — so it now leads with the promise in a sentence, and how it knows: the reasons things come back, with how many under each.
- **And it can tell you no.** If anything will not come back on its own, it is named there. A promise that can only ever say *fine* is asking you to take its word for it, which is the one thing this app is not for.
- The full list is still underneath, for when the reasons are not enough.

## 1.41.0 — CAPABILITY

*2026-08-10*

- **Hold what I copied.** Copy anything anywhere — a line from a message, a note from a meeting — open Quietkeep, and press it. What you copied lands in the box, where you can see it, and the ordinary button holds it. Many lines become many things, exactly as pasting already does.
- **Nothing is taken without you asking.** It reads the clipboard only when you press it, your device asks you to confirm, and nothing is written until you press Hold it. If the button is not there, this browser does not let an app read the clipboard at all.
- **Menu is now the last control in the top area; it was one before that.** The new button sits ahead of it. Nothing else moved and nothing was renamed.
- This exists because a link cannot open Quietkeep on an iPad — it opens Safari, into a separate copy you never see. Until that changes, opening the app yourself and pressing one button is the way in that always lands in the right place.

## 1.40.5 — ITERATION

*2026-08-10*

- **Another go at the capture link that would not open.** 1.40.2 repaired the answer the address gave back; this asks a different address instead — the app’s own front page, which is a real file and cannot answer with a diversion. The repair is still underneath it.
- **If a capture link is still failing for you, the app on your device has not taken this yet.** A new version waits for you to press it, on purpose — which is a poor arrangement when the broken part is what carries the fix. Open Quietkeep normally, take the update it offers, then try the link again.

## 1.40.4 — ITERATION

*2026-08-10*

- **The walkthrough’s last step now opens the panel with the storage question already showing.** It could arrive a moment after the panel did — on the one screen that step exists to show you.
- Two earlier attempts at this made the gap smaller without closing it. This one stops asking a question the panel has to wait for: coming out of the walkthrough means you have not set storage up yet, so it simply says so.

## 1.40.3 — ITERATION

*2026-08-10*

- **The walkthrough now hands you straight to the thing it promised.** Its last step opens the panel so you can ask the browser to keep your planner — and on a slow moment that block could arrive a beat after the panel did, so the one screen it exists to show you was the one screen it was late for.
- Quietkeep now asks the browser that question when it starts, instead of when you open the panel, so the answer is already there when you get to it.

## 1.40.2 — ITERATION

*2026-08-10*

- **Opening a capture link no longer fails with “Safari can’t open the page”.** Depending on how the address was answered, the link that carries a note into Quietkeep could stop dead before the app loaded. It was Quietkeep’s fault, not Safari’s, and it only ever affected links carrying text.
- **And a warning that had to be written: a capture link run from a Shortcut may open Safari instead of the app on your Home Screen.** It will say it held your note — and it will have held it in Safari, in a separate copy the installed app never shows you. *Getting things in from somewhere else* now says so. Until there is a way in that lands in the right place, the box at the top of the app is the one that always does.

## 1.40.1 — ITERATION

*2026-08-10*

- **The ⓘ no longer grows a paragraph after you have started reading it.** While the browser has not agreed to keep your planner, the panel carries a short explanation of why to ask it — and that block was being hidden every time the panel opened and put back a moment later. On a slow moment you saw the panel settle, then move.
- Nothing about what it says has changed, only when it appears: it is there as the panel opens, or it is not there at all.

## 1.40.0 — CAPABILITY

*2026-08-10*

- **Everything under *More* is now its own screen.** Things you can do, Settings, Your data, Help and How it works used to be five headings folded inside the ⓘ — picking one still left you in the same long document, one fold further down. Each opens on its own now, at its own first line.
- **Settings holds switches. Things you can do holds verbs.** Sending something to your calendar, printing today, telling somebody where things are, the address for getting things in from outside, and trying it out with sample work are all in one place. Bringing work in from another planner, and clearing things out, are under Your data — they are things you do to your data.
- **Nothing was renamed and nothing was removed.** Every button has the words it had yesterday; the ⓘ is where it was and still holds what the app is, what changed, and the report for when something is wrong.
- Settings was four phone screens long. It is under two. Nothing was cut to do that — the reading moved rather than shrank, and there is still more of it than there should be.

## 1.39.3 — ITERATION

*2026-08-09*

- **Sorting one thing is now one screen, not two.** It used to ask “hot or cold?” first, every time — a question that routes nothing and only tints the next one. For a single thought that meant two screens and twelve choices to put one thing away.
- **The hot/cold sweep still leads when there is a pile**, which is what it was for: a quick pass across a handful is easier than a run of full decisions. Below that it gets out of the way, and anything can still be marked hot or cold from its own sheet.
- **And once a sweep starts it finishes.** It will not drop you into a different question halfway through because the pile got shorter.

## 1.39.2 — ITERATION

*2026-08-09*

- **Putting something down no longer gets you asked a question about it.** Capture used to bring the sorting surface straight up — you typed one thing and were immediately asked whether it was hot or cold. Ten things in a row meant ten interruptions, on the one path that has to stay clear.
- **It offers a door instead: *Sort what you have put down*.** Press it when you have a moment. Nothing is hidden and nothing waits any longer than it did — and when you come back to the app, it still shows you what is waiting, as it always has.
- **The Menu button is now the last control in the top row; it was second to last.** That door sits ahead of it. Nothing else changed position.

## 1.39.1 — ITERATION

*2026-08-09*

- **An item now opens with four things on it, not twenty-four.** Its name, its date, a note and where it lives. Everything else — repeats, weight, what it waits for, who it is with, what was decided, what it holds up — is behind *More about this*, one press away.
- Sixty-eight controls sat on the sheet for every item whether or not any of it applied. Nothing has been removed and nothing has moved; the rare two thirds are just folded until you ask.
- **It folds back when you open a different item**, on purpose: a sheet that opens differently depending on what you did last is a sheet you cannot learn. The one exception is tapping somebody’s name, because their sheet *is* the folded half.

## 1.39.0 — CAPABILITY

*2026-08-09*

- **The capture box is now the second thing in the tab order; it was the first after the ⓘ.** A new *More* button sits in the top bar beside the ⓘ, so everything after it in the bar has shifted by one. Nothing moved on screen and nothing was renamed.
- **The app has somewhere to go now, instead of something to read.** *More* lists six destinations — things you can do, settings, your data, help, how it works, and about — and lands you on the one you pick with the rest folded away.
- Until now the ⓘ was the only door in the app: settings, your data, help, the reference and every verb behind one button, in a panel thirteen screens tall with everything open. Nothing was findable because nothing had an address.
- It is not called Menu. On Quietkeep the Menu is a place things live, and using that word twice for two different things would be the app disagreeing with itself.

## 1.38.7 — ITERATION

*2026-08-09*

- **There is now a limit on how much there is to read, and the build refuses to pass it.** The app had grown to 5,702 words without anything objecting, because every rule here says explain it and say why, and nothing was measuring the total. It is 3,104 now, and it cannot drift back without somebody deciding to raise the ceiling on purpose.
- It measures three different ways of being too long: how many words, how far the ⓘ panel scrolls on a phone, and how many controls there are. The last one has not improved — 199, the same as before — and the build says so rather than quietly leaving it out.

## 1.38.6 — ITERATION

*2026-08-09*

- **The sheet you open on every item is 850 words shorter — 458 of them were hints under the controls.** Each control now says what it does in a line or less, where it said why it exists in a paragraph. The label was already telling you; the paragraph was telling you again.
- **The panel said the same things three times** — what Quietkeep is, what each feature does, and how do I. The how-do-I answers won, because somebody arriving has a question rather than a curriculum. The other two are much shorter for it.
- **5,702 words to 3,104 across four releases.** Just under half. Nothing was removed except explaining: every control, every field and everything the app says at the moment you press something is untouched.

## 1.38.5 — ITERATION

*2026-08-09*

- **Extras is now settings rather than reading.** Fifteen sections explained themselves at up to two hundred words each. Each one now says what it is and what it does, in a line, next to the control that does it. Nothing was removed except the explaining.
- **The panel has gone from 5,702 words to 3,749** — a third of it, across this release and the last. It is still longer than it should be.
- Where a thing can destroy something, it still explains itself in full — at the moment you press it, which is where that belongs, rather than in a paragraph you read weeks earlier.

## 1.38.4 — ITERATION

*2026-08-09*

- **Send to my calendar is now at the top of the ⓘ panel, under *Things you can do*; it was most of the way down, under “Reminders that reach you”.** Finding it meant scrolling and reading. The panel pointed at it four times with the word “below”, which is what you end up doing when a button is in the wrong place.
- **And the panel is 848 words shorter.** Seven sections explaining features ran to over a thousand words of reasoning. They now say what the thing is and what it does, in a sentence or two. The reasoning has not been deleted — it lives in *Planning for Humans*, which is where reasoning belongs.
- This is a first pass, not the end of it: the panel is still far longer than it should be.

## 1.38.3 — ITERATION

*2026-08-09*

- **The calendar hand-off says what it does, without hedging.** It was worded cautiously because nobody here had watched an alarm arrive. You have used it; it works. The caution is gone.

## 1.38.2 — ITERATION

*2026-08-09*

- **A day you have picked but not kept now says so.** Choosing a date fills the field the moment you choose it, which looked exactly like a date that had been saved — and only *Set* actually saves it. So a date could be picked, believed, and simply not be there. It now reads “Not kept yet — press Set.” until the two agree, and then it goes.
- **The same for a start day and for when an answer is owed** — all three worked this way and none of them said so.
- **And when the browser refuses to keep your data, it tells you.** Pressing *Keep my data on this device* did nothing visible if the browser said no — no answer, no reason, a button that read as broken. It now says what happened: that nothing is lost either way, that your writing is on this device regardless, and that the browser has simply not promised to keep it if it runs short of room.

## 1.38.1 — ITERATION

*2026-08-09*

- **How things come round now follows the day you set, not the calendar’s.** If your day ends at 3am, a weekly thing used to come back at midnight — in the middle of an evening you had not finished — and start asking. It waits for your day to actually end.
- **The same for how long you have been waiting on somebody**, how long a place has been quiet, and how long you have been away. All four counted in calendar days and none of them knew whose day they meant.
- **Nothing moves for anybody who has not set a boundary.** An unset day still ends at midnight, so this changes nothing at all unless you asked for it — and it never changes how insistent something is, only when it starts.

## 1.38.0 — CAPABILITY

*2026-08-09*

- **The Menu button is now the last control in the top row; it was the second to last.** One new button, *More room*, sits in the capture form ahead of it. Nothing else changed position.
- **The capture box is exactly where it was, and its recorded name is now the question it asks — “What do you want to put down?”; it was “Hold it”.** That was the button’s words, kept against the box by mistake. Nothing you see or press has changed.
- **Room for a whole meeting, one thing per line.** *More room* turns the capture line into a page you can write a list into. Nothing is held until you press the same button you always press — you can leave it half-written, close the app, and it will still be there next week, still unheld.
- **And pasting a written list into the capture line now works.** It used to run every line together into one unreadable item, because a single-line box quietly deletes the line breaks in anything you paste. The lines are kept now: the paste opens with room, and says it will be held as one thing per line — with *Hold it as one thing* there if it was really one thing all along, like an address.
- Still true, and deliberately: nothing is sorted, split or filed on the way in, and nothing is counted on the way out.

## 1.37.0 — CAPABILITY

*2026-08-09*

- **The one thing today that will not move, named on the main screen.** Not a countdown and not an alarm — your calendar holds those. Just the name of it, where you can catch it without going looking, because the hours before something fixed stop feeling like usable time when you cannot remember what it was.
- **Nothing you capture from a link is sent anywhere now.** Opening a capture address put whatever it carried into the request to the server that hosts the app — fine for “buy milk”, wrong for the notes from a meeting, which is exactly what that entrance is for. It stays on your device. The first visit on a brand-new browser is still the old way round, and that is being fixed separately rather than quietly.
- **This release also delivers a feature that was written but never reached you.** The fixed-thing line was built and pushed on 9 August without a version bump, so every installed copy kept serving the older app and had no way to know. It is here now, and the build refuses to repeat it.

## 1.36.2 — ITERATION

*2026-08-09*

- **The walkthrough now teaches what actually happens each day.** It stopped at “it hands you the thing worth doing” and never said what that looks like or what to do with it — so the two halves people meet first, acting on an offer and having a bad day, were the two it left out.
- **Two new steps.** One thing at a time: why each offer says why it is there, that *Not this* costs nothing and records nothing, and that finishing makes the screen settle and wait. And: not every day is the same — how heavy a thing is, how the day is going, and *Just one thing* for when the screen itself is too much.
- Six steps now, still skippable, and still there whenever you want it under *How to use it*.

## 1.36.1 — ITERATION

*2026-08-09*

- **Quietkeep now explains the half of itself it had gone quiet about.** Seven new entries in the ⓘ panel: how the offer chooses and why each thing says what it is doing there, what happens when you finish something, saying how heavy a thing is, saying how the day is going, *Just one thing*, the when-and-where line, and how long things take.
- **The one most worth reading is the pause after finishing.** Nothing new arrives until you ask for it, and that gap is on purpose — but until now the only place that was said was on the screen at the time. If you wondered about it afterwards there was nowhere to go and check, which makes a deliberate thing look like a fault.
- Everything described was already there and nothing about the app changed. What changed is that it can now be looked up.

## 1.36.0 — CAPABILITY

*2026-08-08*

- **There is now a “Just one thing” button on the offer.** Press it and the screen shows one thing to do and almost nothing else — no reason line, no where-it-sits, no what-it-holds-up, no list of what is behind, no counts, no chips. Larger type, and nothing moves.
- **This is for the days when the problem is not how much there is.** Being offered easier work helps when the day is heavy. It helps not at all when the difficulty is reading the screen at all — when every true and useful line on it is one more thing to process. Those are different bad days and until now the app only had an answer for one of them.
- **Leaving it is one visible tap**, in the same place, always on screen. That is the whole design: this is also what a screen should look like when operating an app is itself one of the things that has become hard, so the way out cannot be somewhere you have to find.
- **Nothing turns it on for you and nothing suggests it.** Quietkeep does not work out what kind of day you are having — it has no way to know, and guessing would mean forming an opinion about you from what you have typed. You turn it on. It stays on until you turn it off, including after closing and reopening the app.
- **Nothing is hidden from Quietkeep itself.** Everything you have is still held, still on its surface, still exactly where it was — this changes what the screen shows, not what the app is keeping. The full list, the search and the ⓘ are all still there.
- Nothing counts how often you use it, and nothing is recorded about it beyond the fact that it is on.

## 1.35.0 — CAPABILITY

*2026-08-07*

- **Finishing something no longer hands you the next thing immediately.** Quietkeep now settles: it says what you finished, tells you nothing else is being asked, and waits. The next thing arrives when you press *What is next* — not before.
- **Why that matters more than it sounds.** Whatever is in front of you in the second after you finish something is what your head attaches to finishing things. What used to be there was the most pressing thing left, arriving instantly — so completing one thing quietly signed you up for the next, with no gap at all.
- **Nothing congratulates you and nothing counts.** No “well done”, no “one less thing”, no number. It says what happened and stops.
- **It is not on a timer.** It stays settled until you ask for the next thing. A pause that runs out is the app deciding when you have had enough of a rest.
- **And there is now a way to stop that is not finishing something.** *That is enough for now* reaches the same settled state without doing anything at all. Until now “Not this” only swapped one thing for another, so the only clean way out of that screen was to complete something — which means the screen had chosen for you.
- Nothing is recorded about stopping. Not that you did, not when, not how often.
- **Also fixed:** the line under the offer still said “Fewer things” on a heavy day. That stopped being true yesterday, when a low day started changing *which* things are offered instead of how many. It now says what actually happens — easier things first, just as many.
- **And the “Written this afternoon” line on a sorting card stopped flickering.** It was being blanked every time anything else on the screen updated, and only came back a moment later once it had been looked up again.

## 1.34.0 — CAPABILITY

*2026-08-07*

- **A low day no longer means Quietkeep offers you less.** It used to quietly drop from two things to one when you said you were on a low stretch, or when you had a lot on. It now offers the same number of things and changes *which* ones.
- **A shorter list was the wrong answer, and not a small wrong.** Being handed less on a bad day is the app saying you can manage less today — and for some people, on some kinds of bad day, being offered less is exactly the thing that makes the day worse rather than better. Offering the same amount, but easier, is right either way.
- **So you can now say how heavy something is.** Light, ordinary, or heavy — on any item, three words and no number. On a low stretch the lighter things come forward; on a better day a heavier one is allowed to lead.
- **Nothing is worked out behind your back.** Quietkeep will not guess how hard something is from how long it has been sitting there or how often you have passed it over. Only you can say, and if you have not said anything it is treated as ordinary — never as either extreme.
- **Nothing is hidden either.** A heavy thing on a low day moves later in the order, not out of it — it is still there behind “Not this”. And a real date that has arrived still leads whatever kind of day it is, because that is a promise to somebody else.
- Nothing counts these, and there is no score anywhere.

## 1.33.0 — CAPABILITY

*2026-08-07*

- **You can put a whole place down in one act.** Pick a range — everything under a project, everything matching a word — and *Put them down*. Thirty things stop coming back to you in one decision instead of thirty.
- **The place itself is not taken with them.** Putting down what is inside something is not a decision about the thing that holds it, and Quietkeep will not make that one for you.
- **Nothing is swept without you saying so.** Putting one thing down still never touches what is inside it. This is the opposite case: you named the batch, you said it out loud, and it does exactly that and nothing more.
- **It says what it will do before it does it**, and the sentence names both halves: they stop coming back, and they are not finished and not binned.
- **One Undo brings the whole batch back.** Nothing is shed on the way down, so the way back returns everything it took — which is not true of sending a batch to your wishes, and that receipt has always said so.
- Search still finds any of them by name afterwards, exactly as it does for one.
- **Also fixed: Undo after “Give them a new date” did nothing.** It shipped yesterday and it was broken — the button worked, said “0 things restored”, and put nothing back. Every date it had retired stayed retired. It now restores all of them, exactly as they were.

## 1.32.0 — CAPABILITY

*2026-08-07*

- **You can put something down now.** It is not done and it is not binned — it simply stops coming back to you. There is a new control on any item: *Put it down*.
- **This is the thing Quietkeep did not have.** Everything you hold comes back until you finish it or let it go, and for something that mattered once and does not now, both of those are wrong. Ticking it off is a lie. Binning it feels like destroying something you cared about, and it goes into a list you can then go and look at. So it gets carried instead — and the only way out left is deleting the whole app, which is a lot of people’s actual answer.
- **Nothing is asked of you.** No reason, no category, no note. There is nowhere to put one.
- **There is no list of them, and nothing counts them.** A place to look at everything you have put down is just another pile, and the regret it collects is exactly what made getting rid of things feel expensive.
- **It is not lost, and that is the point.** Search finds it again by name whenever you want it, and *Pick it back up* returns it with a date of its own. Knowing you can get it back is what makes putting it down cheap enough to actually do.
- **Putting a place down does not put its contents down.** Everything inside comes back to you on its own rather than vanishing with it. Deciding to stop carrying thirty things is thirty decisions, and the app is not going to make them for you.
- *Nothing about this is congratulated.* No “that’s one less thing”. The record says you put it down, and that is all it says.

## 1.31.0 — CAPABILITY

*2026-08-07*

- **There is now a way through a pile of dates that have gone by, instead of three at a time.** “Needs a new plan” shows three, on purpose — a wall of them is the pile in a different costume. But with sixty-nine of them, three at a time and one decision each is not a way through, and the only bulk route was the one offered after a fortnight away. If you never went away, there was no route at all.
- Sorting now offers **“Dates that have gone by”** as a batch, and it leads the list when it holds anything. It reads the same thing “Needs a new plan” reads, so the two can never disagree about what is asking.
- **And a new verb: give them all a new date.** Sending a batch to your wishes and letting a batch go were already there; this is the one most of a backlog actually needs — the thing is still worth doing and only the date was wrong. Every date that had gone by on each item is retired, which is what makes it a decision rather than a second date sitting on top of the first.
- **Undo puts the old dates back, exactly as they were**, including a date you had promised somebody else. It is only offered where a date has actually gone by; something still ahead of you is left alone.
- **You can pass over a card in “Needs a new plan” now.** It was the only surface left with no way past: the worst one sat at the top every time you opened the app, and the sole way to be rid of it was to make a decision about it.
- “Not this one” brings the next one forward and moves that one to the back. **Nothing is recorded** — no list of what you passed over, no count, and it is all back the next time you open the app. The number above stays the true total; a number that shrank as you passed things over would be the app keeping score of what you avoided.

## 1.30.3 — ITERATION

*2026-08-07*

- **Sending something to your wishes now says that its date is coming off — and Undo puts the date back.** Nothing on your list of wishes is allowed to be making a demand, so a date genuinely cannot go there with it. That was happening silently, and worse, *Undo* handed you the item back without the date. An undo that returns less than it took is not an undo.
- It now tells you before it happens, in the words of the thing that is actually going: “Its date comes off — nothing on your wishes makes a demand. Undo puts it back.” And it does put it back, with the date exactly as you set it.
- **The question “when should this place come back to you?” no longer disappears when you sort the next thing.** Filing something into a new place offers you that date on the receipt — and it is the only place in the app to answer it. Sorting one more card wiped the offer, and the receipt went on saying “no return date yet” for good, with nothing left to press.
- The way to take back the last thing you sorted still goes when you sort the next one, because it is about *that* action. A question about a place is not about that action, and it stays until you answer it.

## 1.30.2 — ITERATION

*2026-08-07*

- **Filing something into a place no longer throws away its dates.** Putting “renew the insurance” into a place deleted its due date and, worse, deleted the date you had promised somebody else — both silently, in the same moment you filed it. Nothing told you, and nothing anywhere would have shown you it had gone.
- **Filing says where a thing lives. It was never meant to say when.** The place answers *when* for everything that has no date of its own, which is nearly everything. Something that already has a real date says when by itself, and it keeps saying it.
- The one thing filing still clears is Quietkeep’s own bookkeeping — the same-day reminder it adds so nothing can go quiet while you are deciding. Keeping that as well as the place’s would leave a thing filed and still pestering you tomorrow.
- This applies whether you file into a place that already exists or one you name on the spot. They were the same act with two different answers, decided by whether the folder happened to exist yet.

## 1.30.1 — ITERATION

*2026-08-07*

- **Coming back after a while away: “put all of this down” now actually puts all of it down.** It was one act covering everything at once — and if a single item among them was the wrong shape, the whole thing was refused and *nothing* moved. Three ordinary items and one that had a date you owed somebody moved none of the four.
- You would have seen a button that did nothing, with no explanation, at the exact moment there is least patience left for that.
- **Two things were wrong with it.** An item whose date was a promise to someone else kept that date, so it came straight back the next moment. And an item still carrying any other date reached the list of wishes still owing it — which the app rightly refuses, because nothing on that list is allowed to be making a demand.
- Both are fixed, and it now reads from the same place the one-at-a-time surface does, so the two can no longer disagree about what is being asked of you.
- *Unchanged, and still the point:* it marks nothing done and deletes nothing. Everything lands on your list of wishes, where it makes no demand, and you can bring any of it back.

## 1.30.0 — CAPABILITY

*2026-08-07*

- **Something can now wait for another thing to be finished, instead of for a date.** On any item there is a new question — *“Does something have to happen first?”* — and a list to pick that thing from. Until it is done, this one stays completely out of your way. The moment it is done, this one comes straight back, and it tells you which thing it was waiting for.
- **This is what a date could never do.** Strip the sealant, let the frame dry, re-seal the frame: there are no real dates in that. Inventing three guesses so the app has somewhere to put them makes three small promises that were never true, and then tells you off when they pass. There was nowhere else for an order of doing things to live, so it lived in your head — which is the job Quietkeep is meant to take off you.
- **It is not a date and it sets no date.** Writing one will never put something in front of you and will never make something go quiet.
- **If you let go of the thing it was waiting for, this comes back to you — it does not disappear with it.** A whole sequence comes back, not just the step that pointed at the one you binned. Nothing gets stranded behind something that is never going to happen.
- **If you had parked it until a particular day, that still stands.** Finishing the earlier thing early does not drag a parked item forward. You said not yet, and that holds.
- It refuses anything that could not work: waiting for itself, waiting for something already done, waiting for a person or a wish — neither is ever “finished” — and any loop, however long, where two things would each be waiting for the other.
- You can stop waiting at any time, and then it is an ordinary item again, back with you.
- *Still true and worth knowing:* nothing here counts your chains, scores them, or works out when they will finish.

## 1.29.0 — CAPABILITY

*2026-08-07*

- **You can now say when or where you mean to do something — and Quietkeep hands it back to you at the moment it offers you the thing.** There is a new box on every item: *“When or where do you mean to do this?”* Write “after I put the kettle on”, or “next time I’m at the desk”, or “only if Sam has replied”. Whatever you write comes back word for word above the item when it comes up.
- A date is the hardest possible thing to notice — you have to be looking at a clock, and thinking about this, at the same moment. Something you already do every day is far easier to catch. That is the whole reason the box is there.
- It is optional and always was. Nothing asks you for one, nothing counts how many you have written, nothing marks an item as incomplete without one, and nothing ever asks whether it worked.
- **It is not corrected.** The app does not require the word “when”, does not rewrite what you typed into a tidier sentence, and does not refuse a fragment. What you wrote is what you meant, and it is what you get back.
- Writing one sets no date and makes no demand. It will not put an item in front of you, and it will not make one go quiet. It only rides along.
- To remove one, clear the box and press *Keep that*.
- *Still to come in this run of work:* an item that waits for another item to be finished, rather than for a date.

## 1.28.0 — CAPABILITY

*2026-08-07*

- **When an area or a goal comes round, Quietkeep now offers you something to actually do inside it.** Before today it put the area itself in your list, said what it was holding, and then answered “what now” with nothing — a thing was ready and the one surface that tells you what to pick stayed silent. It now offers the work underneath, and says which one asked: “Home came round.”
- It only does this when nothing else is asking. An area with two hundred things under it will never dump two hundred things in front of you; the moment anything is genuinely due, the area waits its turn.
- You are never handed the area itself. Areas and goals are places to look from, not things to tick off.
- **Something you said “not now” to comes back on its day again.** A declined request or a parked worry with a return date had been reaching that date and then just sitting in *Later*, reading “back now”, where nothing would draw your eye to it. It now moves up into what is back — quietly. It is still never put at the top of your work, because you already said no to it once.
- **The line above your list has stopped counting at you.** It used to open with how many things you were holding — a number that only ever goes up, and the first thing you saw. It now says the thing that is actually the promise: **nothing here has gone quiet.** How many, and when each one comes back, is one tap away in the list it opens — where you asked for it.
- If anything ever *does* go quiet, that line says so first and says how many. A promise with an exception you cannot see is not a promise.

## 1.27.1 — ITERATION

*2026-08-07*

- **Asking this browser to keep your writing is reachable again — and if you ever skipped the welcome, it was not.** Skipping it (or pressing Escape) quietly marked the storage question as already answered, without ever showing it to you. The only place left to ask was a button folded inside “Your data”, so the app could go on running with your writing marked disposable and nothing anywhere offering to fix it.
- The explanation and the button now appear together at the top of the ⓘ panel whenever this browser has not agreed to keep your writing, and they go away for good once it has. Nothing pops up on its own.
- **Why it works this way** — the page explaining the research behind Quietkeep — was unreadable. Every wrapped point had been broken in half, with the second half stranded underneath as its own paragraph, and some formatting marks were showing as text. It reads properly now.
- **Sending something to your calendar no longer promises more than it can.** It used to say the calendar “will remind you at 9am on the day”. Nobody has yet watched an alarm actually arrive with Quietkeep closed, so it now tells you what is in the file — a 9am alarm for that day — and leaves the ringing to your calendar, which is the thing that does it.
- *Still true, and still worth knowing:* Quietkeep never sends notifications, and your calendar is the only thing that can reach you when the app is shut.

## 1.27.0 — CAPABILITY

*2026-08-06*

- **When a place comes back to you, it now tells you what is in it.** “Holding the tap washers, the shed key and 4 more.” Until today it came back saying “7 under it”, which is a number — and a number is not a reminder of what you put there.
- The first few by name, then how many more. Never the whole list: a place arriving with everything you filed in it would just be the pile again, on a schedule.
- It says this only when the place has actually come round. Everywhere else it stays an ordinary row — your list is not a filing cabinet diagram.
- Things you have finished are not listed. A place coming round is about what is still in it.

## 1.26.0 — CAPABILITY

*2026-08-06*

- **A place you file things into can now be given a return date — and until today it could not, which meant it never came back.** When you file something into a place, the receipt has always told you honestly: “no return date yet”. That was true and there was nothing you could do about it, so the place sat holding your things and never asked for you again. Everything filed was safe and invisible, which is the exact problem filing was meant to solve.
- **The answer is now on the receipt itself.** “Bring it back on…” — pick a day, and the place comes back to you on it, carrying what you put in it. The sentence updates to say when.
- It is offered, never required. Filing without a date is still a complete act, and the receipt will go on telling you the truth about it.
- A place comes back to be looked in, not to be finished. It is never marked done and never turns into something late.
- *Still missing:* what a place shows you when it does come round is still just the place — a view of what is inside it comes next.

## 1.25.0 — CAPABILITY

*2026-08-06*

- **You can pass over a card now.** Sorting things out asked you to answer, and if you could not, that was the end of the road — and because the queue is oldest-first, the same card was waiting at the top the next time you opened the app, and the time after that. There is a **Not this one** on both passes: it moves on, and it records nothing at all.
- **Nothing is kept about it.** Not what you passed over, not how many times, not for how long. It is remembered only until you close the app, and the count still says what is in your inbox rather than what you skipped.
- When you have been past everything once, it comes back round to the top rather than showing you an empty inbox. Nothing is ever hidden from you — it was passed over, not put away.
- *Still missing, and unchanged:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.24.1 — ITERATION

*2026-08-05*

- **A paragraph of the app’s own source code was showing at the bottom of every screen.** A note meant for whoever writes this thing had escaped into the page, under the Accessibility link, and it had been there for several releases. It is gone, and the walk now checks every screen for anything like it before a release can go out.
- **“Give it a date” was a huge empty box on a phone.** The date field was being stretched to about an inch and a half tall by a layout rule that was correct on a wide screen and wrong on a narrow one. It is the size of a date field again.
- **Tapping the version number now opens the report, instead of just opening this panel.** It said it would open the diagnostic and then left you looking at a menu with the right button somewhere below the fold.
- **This panel now looks like it scrolls.** There is a lot below the fold here — the storage question, your copies, bringing one back, the whole record — and nothing showed that it kept going.
- **The report no longer contradicts itself.** It listed how many clocks were in use and then said hundreds of things had no clock. It meant things with no repeating rhythm, and now says so.
- *Still missing, and unchanged:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.24.0 — CAPABILITY

*2026-08-05*

- **When the one thing on screen is too big to begin, you can now break a bit off it without going anywhere.** Type a first physical action into the line under Next up — “open the file and write one line” — and the card holds it. It has its own Done, and finishing it brings the invitation back for the next bit.
- **That first step never takes a date of its own and never comes back at you on its own.** It rides along with the thing it belongs to. Naming a smaller start should not hand you one more thing that is now late.
- **And when a thing is not too big but too heavy, you can say so from the same place.** “This one is heavy” opens the weights box with that item already attached, so what you write down says what it is about — and the app asks less of you while you are carrying it, as it always has.
- It never guesses that something is heavy. Nothing here is inferred from how long you have had it or how often you have skipped it; weight exists because you said so.
- *Still missing, and unchanged:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.23.0 — CAPABILITY

*2026-08-05*

- **Sorting things out now tells you when you wrote each one.** “Written yesterday evening”, “Written Monday morning”, “Written on 14 Jul”. What a note meant when you scribbled it fades in hours, and by the time it reaches you here it can read like somebody else wrote it — this is the missing half of the message. It never says how old anything is and never counts the days.
- **Next up now says what a thing holds up.** If you have told Quietkeep that one thing feeds another — and roughly how long it takes — the card says so: “it feeds ‘Roster’ — start it within 4 days”. That arithmetic has always been there and you had to go looking for it, which is no use for the thing it is meant to help with. It is on the card now.
- Where the dates do not fit, it says that plainly instead: “to make that date it needed starting 2 days ago.” That is a fact about the dates, not about you, and it is fixable by moving either end.
- *Still missing, and unchanged:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.22.0 — CAPABILITY

*2026-08-05*

- **A clock you can switch on, at the top of every screen.** A real clock face, and beside it how much of today is left — “5h 12m left today”. The remainder is the point: a day you can watch going is a day you can work with, and a day that only announces itself when it has run out is not. Turn it on in this panel, under Extras.
- It also says how many things carry today’s date. A number, not a list — the header is not another place to be given work. It is off unless you ask for it, and nothing about it is counted or kept.
- **What it will not do:** count down to an appointment. Quietkeep records days, not times of day, so it does not know that anything happens at nine o’clock, and it will not make a number up. For something that rings while the app is shut, send today to your calendar — that file carries a real alarm and your device does the rest.
- *Still missing, and unchanged:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.21.0 — CAPABILITY

*2026-08-05*

- **Some things are supposed to happen without you — and nothing tells you when one of them quietly stops.** A delivery that reorders itself, a service on a schedule, a renewal: the work was done once, when you set it up. If it lapses, there is no reminder and no error. The first sign is running out. Anything that repeats can now be marked as running itself, and instead of asking whether you did it, it asks when you last confirmed it is still arranged.
- **Where it depends on somebody else, it says so.** Some of these you cannot check from here — an approval, an authorisation, a supplier who will not write to tell you they have stopped. Marking that changes the words, because "check this" is no use when checking means asking someone.
- It never invents a schedule. Something with no rhythm of its own stays quiet rather than being given one.
- *Still missing, and unchanged from the last release:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it.

## 1.20.2 — ITERATION

*2026-08-05*

- **When an update will not go on, the app now says so instead of looking broken.** Some devices will not let a new version take over while the app is still open. Pressing *Install it now* used to reload into the same version — nothing visibly changed, so the only thing left to try was pressing it again. It now tells you what is actually happening and that closing the app completely and opening it again will finish the job.
- The new version is downloaded before any of this, so closing the app costs nothing and needs no connection.
- *Still true, and worth knowing:* this improvement can only reach you after one more update, and on those devices that update still needs the app closed fully. After that the message is there when it is needed.

## 1.20.1 — ITERATION

*2026-08-05*

- **These notes are written for you, not about how the app gets made.** Two older entries had drifted into talking about who reported a fault and when, which tells you nothing about what you can now see or do. They say what changed instead.
- *Still missing, and named here because it was promised in the last release:* a place you make on the spot has no return date until you set one, and there is still no control on the receipt to set it. Until there is, that place will not come back on its own.

## 1.20.0 — CAPABILITY

*2026-08-04*

- **Everything offered now says where it sits.** The suggestion, the list behind it, and the upkeep chips carry a place line — “in Errands · under Home” — so what surfaces is never just a task out of nowhere.
- **Filing gives you a receipt.** “Filed under Errands — it comes round Thursday”, or, honestly, “no return date yet.” That second one matters: a place made on the spot has no return date until you give it one, and the receipt is where you find that out — the control to set it is the next release.

## 1.19.0 — CAPABILITY

*2026-08-04*

- **Triage can now answer “where”, and make the place if it is not there yet.** Every choice it offered was about *when* — today, tomorrow, someday, gone. So a backlog could be sorted by urgency and never actually filed, and the only thing it could tell you afterwards was a category. There is a **Put it somewhere** choice now: pick a place, or name one on the spot and it is made for you.
- What you file stops asking on its own. The place carries the clock, so the place comes back and brings its contents with it — and *Undo* takes it back out of the place, not just off the list.

## 1.18.4 — ITERATION

*2026-08-04*

- **If you drive this app by voice, several controls would not answer to what is written on them.** The ⓘ button announced itself as a sentence while showing a single letter; “Work on this” answered only to the thing’s title; the two ways out of the ⓘ panel were both called “Close”, as were three different “Set” buttons. Saying what you can see now works, and no two controls on a screen answer to one name.

## 1.18.3 — ITERATION

*2026-08-04*

- **The report now says what has actually come round again** — how many things are asking, and how long they have been waiting, in the same gentle words the app already uses. It used to count the clocks that exist, which is a different number and never the one that explains a day that ended early.

## 1.18.2 — ITERATION

*2026-08-04*

- **Opening Quietkeep for the first time no longer greets you with “a newer version is ready”.** It was announcing your first install as an update, thirty seconds after you arrived. It now says nothing until there is genuinely something newer than what you are already using.

## 1.18.1 — ITERATION

*2026-08-04*

- **An update no longer arrives without asking.** A new version used to take over the moment it downloaded, underneath whatever you had open. Now it waits and says so, what you are using stays whole, and it lands when you press Install it now. Declining costs nothing.
- **The report says more about this device:** which address it came from, whether a version is waiting, and whether more than one copy of the app is here — the sign of an update that did not finish tidying up. “Devices seen in the log” is now “Stores”, because it always counted one per site and per browser rather than one per machine.
- *Still true:* if you are on 1.18.0 now, this one update still lands on its own — the version that asks first is the one arriving. Every update after it asks.

## 1.18.0 — CAPABILITY

*2026-08-03*

- **If something goes wrong, Quietkeep can now tell you what it knows.** Under “If something is wrong” in the ⓘ panel, it writes out a report you can read, copy or save: what it is holding, what state this device is in, and anything it can see that looks wrong.
- **It contains nothing you wrote** — no titles, no names, no notes, no journal text, only counts. That is checked on every build, by generating the report over two planners that hold the same shapes under completely different names and requiring the two reports to come out identical.
- The build number at the bottom of the screen opens it. Nothing is ever sent anywhere on its own; you read it first, and you decide.
- **Also: what Quietkeep is NOT** now sits beside what it is — it is not a medical or therapeutic tool, it does not score you, and it cannot reach you on its own.

## 1.17.4 — ITERATION

*2026-08-03*

- **The rest of the seam audit’s findings, checked and fixed.** Last release fixed the fourteen findings that had been independently verified; this one takes the sixteen that had not, verifies each against the code while fixing it, and pins each fix with its own test. One claim did not fully hold and is recorded as refuted rather than quietly dropped.
- **Un-ticking something brings back what it knew.** Marking a declined thing done, then un-marking it, used to lose the record that you had declined it — permanently. The record survives now: done hides it everywhere, undone brings it back everywhere.
- **Numbers say what they count.** The clear-out confirmation now says its count includes people, weights and private entries — so it can sit beside the gauge’s narrower “Things held” without the two looking like a mistake. The Menu’s count is now the sum of its rows, an import summary counts joined notes the way they actually arrive, and “1 days” reads “1 day” wherever it could appear.
- **Dates from another year say which year.** The declined list, the named-period line and the journal all showed “5 Sep” for a September years away or years ago; they now follow the same rule as the todo list.
- **Duplicates: folding a declined thing into a wish works now** — the picker was refusing a fold the app itself would accept — and a few payloads the app records were declared wrongly in the schema and are now declared as what has always actually been written. Nothing about your data changed.

## 1.17.3 — ITERATION

*2026-08-03*

- **The seam audit’s findings, fixed.** Six independent passes over the places where two parts of the app must agree found thirty-one; the top fourteen were each put to adversarial verification and every one survived. All fourteen are fixed here, each pinned by its own test.
- **A worry is no longer offered as work.** It showed up on the work surface with a Done button before its own flow asked “whose is this?”, and a declined one sat under “Ready now” for ever. A worry stays in its flow now; a declined one rests under Later, as designed.
- **Your calendar gets no nags.** A declined thing exported as an all-day event with a morning alarm — the exact nag the Not Now ledger removes, rebuilt in the diary you trust. Declines and worries no longer export, and the stated count matches the file.
- **Private things stay private, and lists agree.** The status report itemised journal entries as “New — (untitled)”; the printed card offered lapsed items the screen shows only as decisions; the duplicate picker offered journal entries and named periods as things to fold work into, which hid the work from every list. All closed.
- **“Keep it after all” on a settled weight works** — it used to say “Kept.” and keep nothing — and one deeper repair underneath: a settle was the one write that could leak into live state even when its batch was refused. The import panel’s words now name both of its doors truthfully. Seventeen smaller findings are recorded and queued; none loses data.

## 1.17.2 — ITERATION

*2026-08-03*

- **The sheet no longer offers what the app will refuse.** Opening a person, a named period, a weight, a private entry, or a wish taken off the Menu no longer shows date, “not before”, or repeat controls — none of those things can carry a date, and until now the controls were shown and the tap was refused afterwards. “Put it in today” is likewise no longer offered on a named period or a journal entry.
- **This was the fourth of the same defect**, after private entries showing in the coverage list and people sitting in the todo list — a kind of thing appearing somewhere it does not belong. So the fix comes with the thing that was missing: a written table of which kinds belong on which of the sixteen list surfaces, with a reason for each, checked on every build over the set-of-everything. The next one of these fails a named check before it ships instead of waiting for someone to notice.
- No new features in this one, on purpose. The rough edges are the work: each one closed, and each one held closed by a check so it cannot come back quietly. More of the same kind is on the way.

## 1.17.1 — ITERATION

*2026-08-03*

- **Every screen redraws about four times faster.** Nothing looks different — it is the same screens, sooner. On a store of around 560 things, one redraw went from roughly a tenth of a second to about two hundredths.
- The cause was small and silly: working out what calendar day an instant falls on is expensive, and Quietkeep was working out the SAME day — today — thousands of times in a single redraw, from scratch each time. It remembers now.
- **This was a guess until last release.** The estimate had been sitting in the notes for months with nobody able to check it, because there was no store big enough to time. The set-of-everything added last release is what made the number real, and the number was worse than the guess.
- There is now a check on every build that catches this coming back — the writing side has had one for a long time; the reading side never did.
- The measurement that actually counts is still on the iPad, not on a build machine. This makes the shape right; the device gets the final word.

## 1.17.0 — CAPABILITY

*2026-08-03*

- **A report can now cover “since the last staff call” instead of a date.** Under “Telling someone where things are” you can name a period — whatever sets your rhythm — say when it came round, and have the report cover the time since then.
- Naming one asks nothing of you. It takes no date, it never comes back at you, it is on no list, and Quietkeep does not count how often you mark it or notice when you do not.
- **A correction, and it has been there from the beginning: everyone you had named was sitting in your list of things to do.** Not a bug that appeared — people have been rows among your work since people existed here, with nothing to do about them. They have had a page of their own since a while back, which is where they belong. They are off the list.
- That is the same fix as the one two releases ago that took private journal entries out of the same list, and it was one line this time because of it.
- The report’s idea of “since when” also got safer across two devices. If a second device hands over work dated before your last meeting that this one had never seen, it now counts as news rather than being quietly treated as already told.

## 1.16.0 — CAPABILITY

*2026-08-03*

- **There is a way to see how Quietkeep behaves with a whole life in it.** In the ⓘ panel, under “A whole invented life”, Quietkeep now makes a file of several hundred invented things — jobs with steps under them, dates that have gone by, people you are waiting on, duplicates folded together, things you let go, weights, a sealed journal. Something of every kind it can hold.
- **It does not touch what is on this device.** It makes a file and stops. The file only becomes real work if you bring it back in — and doing that replaces everything here, the way bringing any copy back does. So take a copy of your own first and bring that one back when you have finished looking.
- An empty planner is easy to judge kindly. A full one is where you find out whether a screen still reads properly with three hundred things behind it.
- **The reason this exists is a number.** The small sample set was written a long time ago and contains eight of the seventy kinds of thing Quietkeep records. Everything built since — folding duplicates, decisions, the things-you-said-no-to list, what you let go, weights, the journal — had never once been seen with anything in it.
- So from now on, a new kind of thing has to appear in that set, or the build says so and stops. And every screen is now run over the full set on every build, checking for the small wrong things a person should never have to notice: a blank where a name should be, a date that is not a date, a count that does not match its own list.
- Nothing on your screens changed in this one.

## 1.15.1 — ITERATION

*2026-08-02*

- **“Held” now means the same thing everywhere it is said.** Tap the line that reads “N held” and you get that claim itemised. The number and the list had drifted apart, and the list was the half that was wrong.
- **Your journal entries were being listed there, one row each, as “(untitled) — held”.** A journal entry has no title on purpose — that is what keeps it private — so every entry you had written showed up as a blank row in the middle of your work. Nothing readable was ever shown, and the entries themselves were never at risk. They simply had no business being on that list, and they are off it.
- Weights were in there too, listed among the things being covered. A weight is not work, which is the whole point of being able to say one.
- **The number will be smaller next time you open it**, by however many journal entries and weights you are carrying. Nothing has been let go and nothing is hidden — it is the same claim, told accurately.
- The last note said the count of what is covered would not move when you named a weight. Half of that was wrong: the list did not move, and the number did. It does not now.
- The check that is supposed to catch exactly this had been passing because the walk never had a journal entry or a weight in it at the moment it looked. It does now, both.

## 1.15.0 — CAPABILITY

*2026-08-02*

- **You can tell Quietkeep what is on you, and it will ask less of you.** Under the box, beside “Something on your mind”, there is now “Something weighing on you?” — say how things are in one of four words, and name anything sitting on you and how heavy it is.
- **None of it becomes a task.** A weight takes no date, appears on no list, and never comes back at you. It cannot: the app refuses to put a clock on one. Saying it is the whole act, and there is nothing to do about it afterwards.
- **While you are carrying enough, Next up offers fewer things** — never fewer than one, and never anything hidden. What you are holding, and the count of what is covered, do not move at all. Only what the app puts in front of you gets shorter, which is the point.
- **One small thing changes nothing.** A single pebble is meant to be sayable without consequence — if noting it made the app behave differently, you would stop noting them.
- When it does ask for less, it says so in one line, and that line never tells you why you are how you are. It states two things that are true at the same time. Quietkeep does not diagnose you and has nowhere to store an opinion about you.
- The thing you wanted from the Menu still rides along on a heavy day. That is deliberate: it owes you nothing, and it is often the most appropriate thing there.
- “Settled” takes a weight off. What you wrote is kept in the record like everything else you have ever told it, and the thing itself joins what you have let go, where you can still take it back.

## 1.14.2 — ITERATION

*2026-08-02*

- **Nothing changes on screen in this one.** It is a check on Quietkeep’s own record-keeping, and it is here because the same mistake happened twice in one day.
- Quietkeep keeps a fixed list of the kinds of thing it can record — every event it knows how to write down. Twice now, something on that list turned out to be written by nothing at all, so a feature the list insisted existed simply did not. Neither showed up as a fault, because a note nobody writes breaks nothing; it just quietly is not there.
- **Every entry on that list now has to account for itself.** Either the app really writes it, or the record says in plain words that it does not and why — reserved, waiting on a decision, or replaced by something else. Twenty-three entries were silent; all twenty-three now say which. The check runs on every build, and it catches a note that has gone out of date too.

## 1.14.1 — ITERATION

*2026-08-02*

- **Opening Quietkeep no longer rebuilds everything from the beginning.** Every launch, every reload, it replayed your whole history from the first thing you ever put in — and that got a little slower with every day you used it. It now keeps a photograph of where things stand and reads only what has happened since.
- The photograph is written after the app is already on screen, and only when enough has happened to be worth it. It can never be in the way of putting something down.
- **Nothing about your history changes.** The record is still every single thing you ever wrote. The app checks the photograph against that record on every start, and if the two ever disagreed it would throw the photograph away and read the record instead.
- How much faster this makes it on your iPad has not been measured. This removes a known reason for it to be slow; it does not come with a number.

## 1.14.0 — CAPABILITY

*2026-08-02*

- **The panel now tells you when a copy of your data last left this device.** It is a date, beside the line about whether the browser is keeping your data — and when something has happened since, it says so in one sentence. Quietkeep has always recorded every copy you took; nothing ever read that record back to you.
- **And an empty Quietkeep now offers you the way back.** A new device, or a browser whose website data has been cleared, opens to an empty screen — which is exactly the moment you need the copy in your Files, and exactly the moment nothing was pointing at it. One button takes you straight to the file picker.
- **The panel is straighter about what “keeping your data” covers.** It means the browser will not clear it on its own to make room. It has never meant your data survives you clearing the browser’s website data yourself — that takes Quietkeep with it, and the file you exported is what comes through.
- The walkthrough says the same thing on the way in, so it is something you know on day one rather than on the day it matters.
- None of this nags. There is no automatic backup, no reminder, no badge, and no count of how far behind you are — when the copy is current it says nothing at all.

## 1.13.0 — CAPABILITY

*2026-08-02*

- **The journal.** Somewhere to write that is not a list and asks nothing of you. It is in the ⓘ panel under Your data, and it starts by asking you to choose a passphrase.
- **Your entries are scrambled with that passphrase, and Quietkeep cannot read them.** Not while the journal is closed, not in a backup, not in anything it syncs through. That is not a promise about good behaviour — the words genuinely are not there to be read.
- **Which means a forgotten passphrase cannot be recovered, by you or by anyone.** It says so plainly before you set one, because that is the moment it matters rather than something to find out later. Everything else you keep here is untouched by it.
- **Nothing you write is ever counted, searched, or brought back at you.** A journal entry appears on no list, is offered as no next thing, and has no date. It is not work, and the app treats it as though it is not.
- Closing the journal, or simply reloading, shuts it again. There is no setting to leave it open.
- Two things this deliberately does NOT do yet: the passphrase cannot be changed — that would mean re-scrambling every entry — and there are no tags. Both are better absent than half-built.

## 1.12.0 — CAPABILITY

*2026-08-02*

- **A person now has a page of their own.** Tap somebody’s name anywhere it appears on an item and you land on them: what they owe you, how long it has been, and everywhere else they come up. Every line is a door back to the thing itself.
- **Names on an item were not tappable before.** They were plain text — so the one question a name raises, *what else is with them?*, could be asked nowhere. They are buttons now.
- **It keeps score on nobody.** A person’s page states durations and relationships and nothing else: no ranking, no comparison between people, and none of the words this app refuses. How long something has been with someone is a fact about a date.
- Quietkeep could already work all of this out — it simply had nowhere to say it. The answer existed and no screen asked for it.

## 1.11.0 — CAPABILITY

*2026-08-02*

- **Next up offers a few things you could pick up, rather than a queue.** It used to show one thing, then five more beneath it, then “8 things are asking”. That last line was a count of everything waiting, sitting on the first screen you see — which is the one thing this app is not supposed to put in front of you.
- **What is offered now is a small set chosen to be different from each other.** One thing with a real date and one thing that has been quiet for a month are easy to choose between, because you are picking what you feel like, not weighing two similar jobs. Two near-identical next actions are the hard case, and they can no longer appear together.
- **The one it leads with has not changed.** A real date arriving today still comes first, and the app still answers “if you only do one thing”. Nothing about what outranks what has moved.
- **And something you wanted comes along.** One thing off your Menu rides with the offer, saying plainly that it is something you wanted rather than something asking. It carries no date and no Done — picking it up is still a decision you make on its own page, never something that crept up on you.
- **No number.** The offer no longer says how much is waiting. What you are holding is still stated honestly, in the line just above it that has always carried it — once, in the place that exists to say it.

## 1.10.0 — CAPABILITY

*2026-08-02*

- **The timer is something you commit to now, not something you are held to.** It used to count down — “two minutes: 1:47 left” — and then ask whether you had finished. That is a deadline, and a deadline on a thing you are already avoiding makes it harder to start, which is the opposite of what it was for. The point of two minutes was always that it is a *cheap* decision.
- **So it shows only that it is running.** A quiet mark, and the time you chose said in words. No numbers counting down, and no circle or bar filling up either — a shape that is part-way full is a way of saying you stopped short, and that is a score about you. There is nothing to leave unfinished.
- **You choose how long.** Two, five, ten, twenty or thirty minutes, set in the ⓘ panel under Extras — calmly, not in the moment you are trying to start something. Two minutes stays the default, because it is the one nobody has to think about. The button then names the time it will actually start.
- **Stopping records nothing.** Quietkeep used to write down that a timer had been given up on. Nobody ever saw the word, but it was kept and it went into your exports — and a record of the times you did not finish your own work is exactly the thing this app is not supposed to keep. It now keeps only that a timer ran, the way it already does for focus sessions.
- **And when the time is up, the timer just goes.** It does not ask you anything. The thing is still there, still waiting for today, whenever you want it.

## 1.9.2 — ITERATION

*2026-08-01*

- **Fixed: folding a duplicate quietly took things with it.** When you folded one thing into another, what had been *decided* about the folded one — and the record that you had *declined* it — stopped appearing anywhere: not on the surviving thing’s sheet, not in the Not Now ledger, not in your status report. **Nothing was ever deleted.** Those records were kept the whole time and simply had nowhere to show. Both are visible again: the thing that stays now shows what was decided about either of them, and something you declined and later folded keeps its place in the ledger, saying where it lives now.
- **A fold also used to go quiet on you.** If you declined something and it was parked until later, folding it into work you *were* carrying handed that work the silence without the reason — it just stopped appearing, with nothing to explain why. It does not do that any more. An ordinary “come back to this on Thursday” still comes across, as it should.
- **And a fold now brings across what the folded thing fed.** “Start this by Tuesday, because the launch waits on it” used to disappear when you folded a duplicate — in both directions. It comes across now, along with the thing’s rhythm, who is running it, what is put by for it, who it is with, and its place in today if it had one. Where something cannot come across — because it would have meant two things each waiting for the other — it says so instead of dropping it.
- **Folding is only offered where it can land.** Something carrying a date is no longer offered a wish or a someday item as the thing that stays; that used to fail *after* you had chosen. Two wishes still fold together, which is the commonest pair there is.
- **And the way back is reachable however deep it goes.** If you folded A into B and later folded B into C, A’s “split it back out” had nowhere to be reached from. It is on the sheet now.
- **Fixed: “Clear what I am holding” would not run at all if you had folded a duplicate.** Not slowly, not partly — it refused, every time, for anyone who had folded two things together and left them folded. It has been like that since folding arrived, and nothing in this app’s own checks had ever tried the two together. It works now, and the thing you folded away is let go with the rest of it.
- Under the surface: the checks that guard all of this were rebuilt so this cannot happen again. Every piece of information a thing holds must now say, in writing, what a fold does with it — and the app will not build until it does. Two of this app’s own tests had quietly stopped covering what their names promised, and both were widened; one of them found the clearing bug above within minutes of being widened.

## 1.9.1 — ITERATION

*2026-08-01*

- Nothing changes on screen in this one. It makes three checks real that this app had only ever *claimed* — the kind of gap that is invisible until the day it matters, which is exactly when you would least want to find it.
- **The list of things that can be stored is now checked against the document that defines it.** Every event this app can write has to be named in its written vocabulary, and every name in that vocabulary has to exist in the code — including whether each one can leave something of yours without a way back. That was true of the running app and unverified against the document; now the build fails if they ever disagree.
- **Every write to your data is now accounted for.** The rule was always that writes go through the boundary that refuses to leave anything of yours unreachable. Five places legitimately write around it — snapshots, importing, clearing, and two bookkeeping notes — and each of those now has to say in writing why it is safe. A sixth appearing without that argument fails the build.
- Also corrected: several notes in this repo’s own records that had quietly gone out of date, including two that contradicted each other about whether a screen feature exists. They describe what is actually built now.

## 1.9.0 — CAPABILITY

*2026-08-01*

- **A project can say who cares how it goes.** You have been able to mark someone as “they care about it” for a long time, and nothing ever showed it back to you. Now they have their own place on the thing’s own sheet, and the list of what you are carrying names them — so “who do I tell when this moves” has an answer you can read instead of remember. Anyone you marked before is already there; nothing needs re-entering. They are people to tell, never people who owe you anything.
- **What was decided, kept where the work is.** A meeting’s real product is decisions, and they had nowhere to go. Any project or area now carries a decision log on its own sheet: write the decision, log it, and it stays — newest first, with the day. It cannot be edited or deleted, and that is the point: if a decision changes, you log the new one, which is what a decision log is for.
- **Your status report says what was decided.** The report you hand to somebody now carries a “Decided” section covering the period it reports on — only what is new since the last one, like every other part of it.
- **Fixed: the report had a section that could never appear.** “Started” was listed in the report’s own structure and nothing could ever fill it. It is gone rather than invented: this app has no half-done state on purpose, and a heading that exists to be filled would have made “started and not finished” something a reader could work out about you. A new check makes it impossible for a section like that to be added again.

## 1.8.0 — CAPABILITY

*2026-08-01*

- **“Not mine to carry” — and the decision is kept.** Anything someone asked of you can be declined from its own sheet. Declining is a decision, not a deletion: it lands in the Not Now ledger, behind the ⓘ under Your data, with the words it was declined under, who asked, and the day — the thing to point at when the same request comes back. “Carry it after all” is one tap behind it, any time.
- **Nothing chases you.** A declined thing is parked, not deleted and not nagging: it sits quietly, comes back only where parked things already do, and the ledger keeps a name and a date — never a count. There is no “declined three times”. There never will be.
- **A day for requests.** Under Extras, choose a weekday and requests can wait for it: anything someone asks of you can be parked to your day from its own sheet — so it is dealt with when you decide, not the moment it lands. Declining sends things to the same day. No day chosen, nothing changes.
- **Letting a worry go now keeps the decision too.** The bother flow’s “Not mine to carry” used to promise the thing would never come back — by quietly trashing it. It now lands in the ledger like any decline, parked and silent. The relief is the same; the record is finally honest.
- Also: importing from another planner now says how many things repeat on a rhythm — rhythms are not carried, and rebuilding the real ones as upkeep should start from the true number, not from a tag name.

## 1.7.2 — ITERATION

*2026-08-01*

- **The ⓘ panel folds.** Its four big areas — Help, Your data, Extras, About — sit behind their own headers now, closed until you open them, and the panel remembers which you keep open on this device. Everything is still there; you just no longer stand in front of all of it at once.
- **Quietkeep Sync now says so.** If you are in the Sync edition, the top of the panel and the walkthrough say “Quietkeep Sync”, and every sentence about where your writing lives states that edition’s truth — sealed on your device before anything leaves, a key only your devices hold — instead of the standalone edition’s “there is no server”, which was a lie there.
- **“Planning for Humans” actually opens now.** Tapping it used to land you back on the main screen: the offline machinery answered every slow page request with the app itself, and could even overwrite its stored copy of the app with the essay. Both fixed — and the page’s own styling now survives the app’s strict security rules, so it reads as intended.
- **Buttons that open a list now say when they will close it.** “Read the record” becomes “Close the record” while the record is open, and the same for “Things you let go”.

## 1.7.1 — ITERATION

*2026-08-01*

- **“What’s new” prints properly now.** Bold is bold and quotation marks are quotation marks — the raw codes that were showing on this very list are gone.
- **The stray lines in the ⓘ panel are gone.** A status line only draws its separator when it has something to say, so each section holds together instead of being cut apart by rules that meant nothing.
- **The small print reads as small print.** The caveat under each control is set in italics now — the same honest words, in a quieter posture, so the panel skims by heading and button and the detail is there when you want it.
- The walkthrough’s last step now names the button that is actually on it — “Get started” — and says plainly what it does: it opens the ⓘ panel so keeping your data safe is the first thing you do.
- In the ⓘ panel, the number on the app icon has its own heading now, and the calendar’s “it is a snapshot” caveat sits with the calendar again — it is about the copy you sent, and it read as if it were about the icon.

## 1.7.0 — CAPABILITY

*2026-08-01*

- **The same thing twice? Fold it into one.** When two entries are really one worry — seven years of inbox will do that — open either one and fold it into the other. Its dates, note, people, and anything under it go along; nothing is swallowed, and the one that stays keeps its own words wherever both spoke. The sheet of the one that stays lists what folded into it, and “Split it back out” undoes the fold any time — a promise that outlives the sitting, not just the undo bar.
- **“Sharing a name with something else”** joins the sorting batches: everything whose name exactly matches another thing you hold, oldest first, so twins meet each other on the conveyor. Only exact matches — the app never guesses that two things that merely sound alike are the same.
- **A lens for looking at one part of your life.** When you have places like Home or Work, a small “Looking at” chooser sits above your held list: pick one and the list shows only what lives under it. Everything else is still held, still clocked, and still comes back — the lens changes what you see, never what Quietkeep holds, and it says so right there every time it is on. Next up, the gauge, search, and dates that come back are never narrowed: those speak for the whole of what you hold, always.

## 1.6.0 — CAPABILITY

*2026-08-01*

- **“How it hangs together” — the whole shape, when you ask for it.** A tap opens the tree: every area, goal, and project with what sits under it, indented. It is a way of seeing, not a place to work — a row opens the thing itself, big branches say truthfully how much more they hold, and it never becomes the front page.
- **Every list is a door now.** The “also asking” rows under Next up, every row of “What you are holding”, and the things listed under a project on its sheet — all open the thing itself with a tap. Nothing on screen is words you can only look at.
- **Review finishes its four questions.** Alongside stalled projects and orphaned items, it now notices a goal nothing is feeding, and an area holding work where nothing has finished in a month — said calmly, three at a time, with the true count. Rest is legitimate; the question is only whether it is rest.
- **A quiet close to a working session.** Finishing or stopping now ends on what was true: what happened to the thing you were on, and that everything you hold is covered — in words. No timer totals, no score. And if a thread from earlier is still waiting, it asks the one question: have a look, or let it go.
- **Composing your day — optional, and off until you ask.** Turn it on under Extras and anything you hold can be chosen for today from its own sheet, up to five, sitting quietly above Next up. At midnight the choosing simply lapses — nothing counts what was chosen and not done, and the app never picks for you. Turn it off and it is gone.

## 1.5.0 — CAPABILITY

*2026-08-01*

- **Act on a whole batch at once.** Inside “Sort things out”, any batch now takes wholesale acts: file them all under a place, send them all to the Menu, park them all until a day, or let them all go. You see the exact sentence of what will happen — counted from the real changes, including anything that cannot take the act and why — before anything is written, and one tap takes the whole act back.
- **Nothing is ever swallowed on the way.** Sending dated things to the Menu sheds their dates visibly, letting things go saves a copy of everything first — before anything is touched, checked by machine — and the record explains every wholesale act in one line: what you did, to how many, in the very words you agreed to.
- **Fixed: “You can still keep it after all” is now always true.** Letting something go used to be final the moment its sheet closed — the button that promised a way back was unreachable. “Things you let go”, behind the ⓘ panel, now lists everything you let go, newest first; open one and keep it after all. It is recovery, not an archive: nothing there nags, decays, or counts.
- **Wishes get their own wholesale door.** Batches like “On the Menu — read” appear in the picker now, offering exactly what a wish can take: bring them all back as real work, or let them go. No dates, no filing — a wish holds no demands.
- Also: “Export a copy of these” on any batch — a reading copy of those things and their history, honestly named as not-a-backup (the whole-store export remains the real one).

## 1.4.0 — CAPABILITY

*2026-08-01*

- **Notes on things.** Anything you hold can now carry words — details, links, half-thoughts — edited on its own sheet and shown only there, so lists stay one calm line each. Clearing the box removes the note, and that is recorded honestly too.
- **Imports bring their notes along.** A file from another planner now arrives with every note attached to its item, and the summary says how many came — the loss this app once inflicted silently, then admitted, is now simply over.
- **“What happened to this” — every item can explain itself.** Open anything and unfold its history: when it arrived, where you sent it, what date it was given, and every time the app stepped in — each of the app’s own moves saying why (“so it would not go silent”). The permanent answer to “where did it go?”.
- **You can read the record itself.** Behind the ⓘ panel: the append-only record everything is worked out from, every line in plain words, newest day first, with its true size stated. Reading changes nothing, and no line ever shows a note’s or journal’s contents — it says one was written, not what it said.
- Also: an item’s sheet now quietly says how it was sorted (“sorted as reference”), and typing a year below 1000 anywhere no longer lands you in the wrong millennium.

## 1.3.1 — ITERATION

*2026-07-31*

- **Fixed: sending a dated thing to Someday no longer swallows the date.** A due date, a “not before”, or a parked return date on something you shelve to the Menu is now cleared as part of the same act — visibly, in the record — instead of riding along invisibly where no screen could ever show it again. The app now refuses outright to leave a Menu item carrying a date, however the attempt is made.
- **Fixed: sorting cannot act on a card that just changed.** If the thing on screen was completed, shelved, or let go while you had it open — the sheet is one tap away — tapping a route now says so and shows the fresh card, instead of quietly filing a decision you had just contradicted.
- **“Leave it” always moves on.** When everything left in a batch has been left once, the round starts over instead of showing the same card again while claiming it was left — and with one card remaining, it says exactly that.
- **Two dates on one day tell the truth.** Something due the same day it opens now reads as the obligation it is, not as “not before” — a deadline is the louder fact.
- Also: a place created mid-filing can no longer collide with an existing project’s name whatever screen it is on; estimates and date fields stay hidden on Menu items where they could never mean anything; keyboard focus lands somewhere real after every sorting action; a typed year below 1000 stays the year you typed; and the machinery that checks every write got a set of stricter refusals with the tests to hold them there.

## 1.3.0 — CAPABILITY

*2026-07-31*

- **“Sort things out” — a triage that can finally reach everything.** Pick a batch in your own words — the loose things a big import brought in, everything under one project, whatever matches a word — and work through it one card at a time with the same six choices triage has always had. Nothing gets rendered as a wall, there is no countdown and no score, and leaving is always one tap that records nothing. The batch is simply smaller when you come back.
- **Tap any triage card to open it.** Renaming, a real date, filing it somewhere, naming who it is with — all reachable mid-sort now, on both triage surfaces, without losing your place.
- **“Not before” — the date that opens instead of asking.** Give something a day and it stays out of the way until then, comes back ready on its own, and nothing happens if the day passes — a door opening, not a deadline. Defer dates imported from another planner finally show up here too, editable at last.
- **Filing got fast.** The “what is this part of” list narrows as you type, each place says where it sits, and typing a place that does not exist yet offers to create the project and file under it in one go.
- Also: an optional “about how long?” minutes note on anything (kept for a future version that learns how long things really take — nothing checks up on it), and the machinery underneath got two orders of magnitude faster at taking in large batches, which the coming wholesale actions will stand on.

## 1.2.3 — ITERATION

*2026-07-31*

- **Fixed: naming who is running a tracked project now actually shows their name.** Saying “they are running it” on a project recorded the person but the carrying report went on saying “nobody named yet” forever. The names you already entered come back on their own — nothing to redo.
- **The import summary now tells you about notes.** Notes are not carried across yet, and the summary used to imply a file had none when it was full of them. It now says how many notes were in the file and that they do not come across — plainly, before anything is written. Carrying them in is on the roadmap.
- And the app does less invisible work: a long list it builds behind a closed panel is now built only when you open it, which keeps big planners quick.

## 1.2.2 — ITERATION

*2026-07-31*

- **Things you are holding now say where they sit.** An item that belongs to a project shows “in ⟨project⟩” right on its row, and a project shows how many things are under it. Before, an imported action that already had a home looked exactly like a loose one — so a big import (say, from OmniFocus) arrived as one flat pile with no way to tell what was already filed from what still needs sorting. Now the loose ones are the ones with nothing beside them, which is what makes a backlog possible to work through.

## 1.2.1 — ITERATION

*2026-07-31*

- **Sending something to “Do now” no longer feels like a trap.** The offer that follows now says which thing it is asking about by name, and adds “Leave it for now” — so you can agree it is for today without being made to either mark it done or start a timer. It stays on your list under Next up either way.
- **The “also asking” list under Next up reads as a list again.** Each thing is on its own line with its name in full, above a quiet note of why — instead of name and note run together on one line, which read like a paragraph rather than a set of separate things.

## 1.2.0 — CAPABILITY

*2026-07-31*

- **Undo, for when a card moves and you want it back.** Triage is meant to be quick — one tap and the card is gone — but quick can feel like lost. Now, right after you sort a card, it says where it went and offers to take it back. One tap returns it to your inbox, exactly as it was, whichever way you had sent it.
- **Search: find anything you are holding.** Type a word and everything that matches is there, each one saying where it is now, and tapping it opens it. It only searches what you are actively holding, it never changes anything, and it keeps no record of what you looked for.

## 1.1.0 — CAPABILITY

*2026-07-31*

- **A short walkthrough the first time you open Quietkeep.** Four calm steps on what it is and how it works — put something down, it sorts and times itself, it is all on your device. You can Skip at any point, and it never interrupts again.
- Want it back? “Show the walkthrough again” is under the ⓘ, beside how to use the app.
- **A Help section under the ⓘ** — short, tap-to-open answers to the things people ask: getting a thought out of your head, what happens after, how it picks what is next, dates that have gone by, reminders, privacy, backups, and two devices.
- And, for the curious, “Why does it work this way?” opens the full reasoning behind Quietkeep — a readable page right here in the app on how memory, attention and motivation actually work, with every source named and tagged by how well established it is.

## 1.0.1 — ITERATION

*2026-07-31*

- **The ⓘ panel now opens with what Quietkeep is, how to use it, and how to add it to your home screen** — not with the storage details. The first thing you see is the app explaining itself, and the install steps are there for iPhone, iPad, Android and computer.
- Everything else in the panel is grouped into named areas — your data, extras, and about — instead of one long run of tools, and it points back to the rest of the free apps at noahjefferson.pages.dev.

## 1.0.0 — VERSION

*2026-07-31*

- **This is version one.** Every capability the planner was built to have is in place and in daily use — friction-free capture, triage, a single Next-up, dates and repeats, the Review that surfaces only what has stalled, the person lens, the carrying report, and calendar reminders. Nothing here is a preview any more.
- It stays exactly what it always was: yours, on your device, with no account, no telemetry, and no server holding your data. Keeping two devices in step is a separate edition you opt into; the planner itself still cannot reach anything at all.

## 0.27.3 — ITERATION

*2026-07-31*

- **Two devices now catch up on their own — no need to press Sync.** While a device is open it quietly keeps in step with the other, and it checks the moment you switch to it. Before, a full catch-up could take a few taps of “Sync now” because each tap did only one leg of the back-and-forth; now opening both is enough.
- A single “Sync now” also finishes the whole exchange in one go, rather than one step of it, and tells you the total it moved.

## 0.27.2 — ITERATION

*2026-07-31*

- **Fixed: work synced from your other device now appears straight away.** When a device received a planner from its pair, the items landed but the screen could stay blank until you closed the app and reopened it — which looked exactly like sync doing nothing. Now the moment anything arrives, what you are looking at updates to show it, with no restart.

## 0.27.1 — ITERATION

*2026-07-30*

- **Dropping a device now actually clears its access.** “Replace the key” used to stop only new work from reaching a device you let go; the last few weeks already waiting at the handover point could still be collected. Now, if this device is online, it empties that too — and says plainly when it could not, so you are never told a device is cut off when it is not.
- **A page you can open to see the handover point’s health.** If your other device is not catching up, you can now check in plain words whether the handover point is up, and what a hold-up most likely means — it is almost always a daily limit that resets on its own, with nothing lost.
- **Taking a key in now carries a warning, where before only giving one out did.** A key someone hands you lets them read this planner, so the app now says so at the moment you paste or open one, and tells you to check the pairing name against your other device’s screen.
- Several places where the app described its own safety more confidently than it should have are now corrected to say exactly what is and is not protected — what leaves the device, what a handover point can tell, and what replacing a key can and cannot undo.
- Fixed: a device whose key was replaced could stay quiet until you next wrote something, instead of bringing a fresh device fully up to date straight away.

## 0.27.0 — CAPABILITY

*2026-07-30*

- **Two devices can keep each other up to date — in a separate app called Quietkeep Sync.** Pair them once, and from then on each brings the other up to date when you open it. No account, nothing to sign in to.
- Pairing shows a code and a key. Scan the code with your other device, or paste the key into it — nothing is written to a file unless you ask for one, so there is no copy of it left in a downloads folder afterwards.
- You can see which devices have written here, and when each one last did. If you want to drop one, replacing the key stops it receiving anything from this device from that moment on — though whatever it already holds, it keeps.
- Your writing is sealed on your device before any of it leaves, with a key only your devices hold. The handover point in between stores something it cannot read and is never given the key.
- Both devices show the same short pairing name. If one shows something different they are not a pair — worth being able to see, rather than working it out from the fact that nothing ever arrives.
- **Quietkeep itself still cannot reach anything at all, and that does not change.** It is the more private of the two and stays the one you get by default; the browser refuses to let it contact anything, whatever it is asked to do. Moving your work across is an export and an import, once.
- Taking in another device’s work only ever adds. It never replaces and never removes, so neither side can lose anything to the other.

## 0.26.0 — CAPABILITY

*2026-07-30*

- **When a newer version is ready, it says so and offers you a copy first.** A line above the app, not something over it, with “Save a copy”, “Reload now” and “Not now”. Ignore it and nothing changes.
- It does not pretend anything is at risk, because nothing is — this app only ever adds to its record and an update cannot rewrite it. A copy is a point to come back to, and that is all it claims to be.
- It appears once. Declining is an answer, not a question to ask again.

## 0.25.1 — ITERATION

*2026-07-30*

- **“Ready now” means somebody set a date.** A thousand things you had never dated were being counted as ready today, and the number on the icon said so. What the app puts on something to make sure it comes back is not a date you chose, and it no longer pretends to be.
- **When nothing is asking, it says what is actually going on** — how many things are here without a date, waiting on you to decide — instead of the section quietly vanishing.
- A card you were interrupted in the middle of now carries its own return, so it is offered back whatever else changes.

## 0.25.0 — CAPABILITY

*2026-07-30*

- **A date that already went by in your old planner does not arrive as something asking today.** Importing a long-running planner used to turn years of passed dates into that many things needing a new plan on the morning of the import. They come in without a date instead, and the app tells you how many and why before you press anything.
- **No heading shows more than 25 things at once.** It says exactly how many it is holding back, and one tap shows them. A list of a thousand rows is the pile in a new coat.
- Anything already finished in the other planner arrives finished.

## 0.24.1 — ITERATION

*2026-07-30*

- **Buttons stay with the thing they belong to.** On a long title, “Done” used to wrap onto a line of its own and sit directly above the *next* item — so it looked like it belonged to that one instead. The box is now drawn around the whole row, including its buttons, at every width and text size.
- A gate now measures this, so it cannot come back quietly.

## 0.24.0 — CAPABILITY

*2026-07-30*

- **The number on the app icon is optional.** One button in here turns it off, and it goes off straight away rather than at the next reload. Nothing is lost — the app still holds everything and still tells you inside.
- **You can bring work in from another planner.** An OmniFocus export — TaskPaper or CSV — or anything else TaskPaper-shaped. Projects keep their contents, and dates you set over there arrive as dates you set here, so they are the sort a calendar can carry.
- It reads the file and tells you what it found *before* anything is written, including what will not come with it: flags, contexts, estimates and repeats stay behind, because this app has no priority field on purpose.
- It goes in beside whatever is already there. Saving a copy and starting again from empty first is one section down, if you want a clean run.

## 0.23.2 — ITERATION

*2026-07-30*

- **Your calendar only gets days you chose.** It was also being offered every date Quietkeep sets for itself — the “back with you tomorrow” it puts on anything you route — so routing nine things in one afternoon offered nine all-day events on a single day, with alarms, none of which you had dated. Those stay here now, where they belong.
- If nothing has a date you set, it says so and says why, instead of looking broken.
- **The number on the app icon is findable.** It is how many things are ready now, it is stated beside what you are holding in the same words, and the panel explains it. Before, it was a number that appeared nowhere inside the app.

## 0.23.1 — ITERATION

*2026-07-30*

- **The build number is on the main screen now,** at the bottom, small. It was only inside this panel’s title, so a screenshot of the app could not say which build it was — which is exactly how you end up looking for something your device does not have yet.

## 0.23.0 — CAPABILITY

*2026-07-30*

- **You can clear things out, two different ways.** *Clear what I’m holding* empties your surfaces and keeps every record of what happened, so a copy you export afterwards still has all of it. *Start again from empty* replaces the lot, history included, and cannot be undone from inside the app. The panel says which is which before you choose.
- **Neither can be done by accident.** Each asks you to type a short word first — a different word for each, so a word typed for one can never authorise the other — and switching between them clears what you typed.
- **It recommends saving a copy, with the button right there,** and the sentence above the go-ahead says plainly whether you have saved one.
- It tells you the real count of what is about to go, never a rounded one.

## 0.22.0 — CAPABILITY

*2026-07-30*

- **You can put some sample work in.** An empty planner is hard to judge, so there is now a button that adds a small set of ordinary work dated around today — a job with two steps, something whose date has already gone by, something you are waiting on someone else for, a couple of things nobody is asking of you, and two notes not yet sorted. It goes in beside anything you already have and behaves exactly like your own work.
- There is no button that takes only the sample work back out again, and the panel says so before you press it.
- **Files you export now carry your own date, not the world’s.** In the evening an exported calendar was named with tomorrow’s date while saying inside that it was made today. Same day in both places now.

## 0.21.1 — ITERATION

*2026-07-29*

- **The X on the (i) panel stays where you can reach it.** It was pinned to the top of the panel, and on the iPad it scrolled away with everything else — so both ways out ended up at the very top and the very bottom of a panel thousands of pixels long. It no longer moves at all, because it is no longer inside the part that scrolls.
- **And the panel is not thousands of pixels long any more.** It was showing every release note ever written, all at once. Now it shows what changed this time, with everything older one tap away.
- Escape closes it too, on a keyboard.
- This one had come back after being fixed once. It is held by a check now.

## 0.21.0 — CAPABILITY

*2026-07-29*

- Today, on one page. The thing to do next, what else is ready, what is with other people, and what is coming up — for a meeting where a screen is rude, or a day the battery is going to lose.
- It says on the page that it is a snapshot, and that ticking something off on paper does not reach Quietkeep. Paper cannot update, and you should not have to remember that at four in the afternoon.
- It is one page on purpose. What it leaves off, it counts — "and 34 more" — so you always know what is not in your hand.
- **And "Print it" now prints the right thing.** It used to hand your printer the whole app: the panel you pressed it in, everything behind that panel, and the page layout doing its best. The button worked and what came out was unusable. Fixed for the status report as well.

## 0.20.0 — CAPABILITY

*2026-07-29*

- You can now put down something that is on your mind but **is not a task** — "the thing with the roof" — without first inventing a next step for it. Being made to write a worry as a task is how you end up with steps you will never do, on a list you are supposed to trust.
- **The first question is whose it is, not what you are going to do about it.** Asking for a next action first is what makes people make one up.
- Three answers: mine to do something about, mine to keep an eye on, or **not mine to carry**.
- "Not mine to carry" is a real answer and it is honoured completely. It is let go, it is not parked, and **it does not come back "just to check"**. An app that quietly re-raises what you released is one that did not believe you.
- "Mine to do something about" sends it to your inbox, and only then are you asked what the actual next step is.
- "Mine to keep an eye on" parks it and brings it back in a week. Nothing to do in the meantime, and nothing carried in your head either.
- One at a time. It says how many are there and shows you exactly one — a list of worries is a worse thing to look at than any single worry on it.
- Nothing here calls it a problem, or you a worrier, and letting something go gets the plainest sentence in the app rather than a congratulation.

## 0.19.0 — CAPABILITY

*2026-07-29*

- The Menu is a place now, not just a heading. Things you have put there are grouped by what they are for — Read, Try, Go, Make, Look into, Save for — instead of sitting in one undifferentiated pile.
- **It is behind a button and it is closed when you arrive.** A list of things you want that greets you every morning is a list of things you owe. The button says how many, and says plainly that none of them are asking.
- A category you have nothing in is not shown. An empty "Go" is not a gap to fill; it is a thing you have not wished for.
- Something you are saving for can now hold two numbers: what it costs and what you have put by. "£120 put by of £300. £180 to go."
- **There is no bar, no percentage, and no date worked out from how fast you are saving.** A bar is a machine for implying you are behind, and this is the one part of Quietkeep that structurally cannot ask you for anything.
- Both numbers are yours to set and either can be left empty. Clearing one unsays it rather than recording that something costs nothing.
- Nothing on the Menu carries a clock, and putting a number on a wish does not turn it into a deadline.

## 0.18.0 — CAPABILITY

*2026-07-29*

- Come back after a week or more away and Quietkeep says so plainly — how long you were gone, and that everything you put down is still here. That is the whole greeting. It does not present you with a bill.
- **It cannot show you the pile.** Not after a fortnight, not after a year, not with a thousand things waiting. What you get is one thing to do next, at most three to sort, and the count — and there is no setting, no length of absence and no amount of work that changes that.
- It says how many are waiting and then says "a few at a time". A number is a fact; a list is a demand.
- If dates went by while you were away, you can move them all to the Menu in one go. **Nothing is deleted and nothing is marked done** — everything is still there and you can bring any of it back whenever you want.
- What that actually removes is not the work. It is the twenty separate decisions standing between you and being able to start, which is the real cost of coming back.
- You can decline and take them one at a time instead. Saying no is not recorded as anything.
- Nothing here says you are behind, and nothing apologises on your behalf. Being away is not something that happened to your list — it is something you did, and it was allowed.

## 0.17.1 — ITERATION

*2026-07-29*

- "Worth a look" was staying quiet about a stalled piece of work when the only thing left under it was the leftovers of a finished focus session. That is exactly the failure it exists to catch, and it was hidden by residue.
- A status report could be made to say "Nothing to report." when there was plenty to report — anything you had written down on more than one line could break the shape of the document. It is a page you hand to another person, so it now says only what is true.
- Work brought in from your other device is now included in the next report. It was being left out for being older than your last one, even though you had never seen it and had certainly never told anyone about it.
- Somebody you have let go is no longer named as running something. It was still showing their name, confidently, which is worse than showing none.

## 0.17.0 — CAPABILITY

*2026-07-29*

- Messages arrive all day and attention does not divide. If you want it, Quietkeep now offers a single pass through them **at the moment you come out of working on something** — when looking costs least.
- **Never while you are in the middle of anything.** A prompt that can turn up at any moment is a notification wearing different clothes, and it would be the exact interruption this is meant to replace.
- It is off unless you ask for it, in the (i) panel. A planner that arrives having decided you should check your messages twice a day has made a decision about your working life it was not asked to make.
- Saying "not now" writes nothing at all. Not a record, not a mark, nothing — it comes round again exactly as if it had never asked.
- It counts nothing. Quietkeep cannot see your messages and never will, and there is no number here for anyone to feel bad about.
- Turning it on does not immediately interrupt you for having turned it on. The rhythm starts from that moment.

## 0.16.0 — CAPABILITY

*2026-07-29*

- Some work you do; some work you **carry**. Open anything you have made bigger than one step and say "someone else is doing this", and it moves to a new "Carrying" — who is running it, when you owe an answer, and what is outstanding.
- **Quietkeep stops offering you their work.** Nothing under something you are only carrying will be handed to you as your next step. It stays on your list, because it is still real — it just stops being your job.
- Nothing is graded. No "at risk", no amber, no colour that means anything about how someone else is getting on. It states who and when and lets you decide, because it does not have the evidence to do anything else.
- You can now say when you owe somebody an answer, and that date behaves like any other — when it goes by it asks you what to do about it rather than sitting there.
- And there is now a report. What has changed since the last time you told anyone — finished, come back, now with someone else — plus what is still outstanding and what is coming up.
- Copy it, save it as Markdown, save it as a spreadsheet, or print it. Nothing is sent anywhere; it is written for you to hand over yourself.
- It is worked out from your own history, so **nothing has to be kept up to date for it to be right**. There is no second list to maintain and no chance of the two disagreeing.
- The next report starts where the last one ended. It will not tell you the same thing twice.
- If your browser will not let Quietkeep use the clipboard, it shows you the text instead of losing it with an apology.

## 0.15.0 — CAPABILITY

*2026-07-29*

- Quietkeep can now answer "what am I waiting on Sam for". A new "With other people" shows everything that is with someone else, longest-waiting first — the one worth mentioning when you next see them.
- **Things nobody has named show up too.** Sending something to "Waiting for" is one tap and never asks who, so most of what you are owed has no name on it. A list that quietly left those out would be worse than wrong, because you would trust it.
- You can put a name to something whenever you like, in its own sheet, and say how they are involved — they owe you it, they asked for it, they are running it, they care about it, or they just came up.
- Nobody has to be named. Ever. A thing you are owed works exactly the same without one.
- It says how long, in plain words — "with Sam for three weeks". That is a fact about a date and nothing more. Nothing here says anyone is late, and nothing counts how many times you have asked.
- When it arrives, say so. It comes off what you are owed and stays on your list, because a thing arriving is not a thing finished — it is usually the moment the actual work becomes possible.
- Typing "sam" when you already have a "Sam" links to the Sam you have. One person, one place, however you type it.

## 0.14.0 — CAPABILITY

*2026-07-29*

- You can now work on one thing. Tap "Work on this" and Quietkeep holds that one item in front of you, says how long you have been at it, and gets out of the way.
- When something else comes up, put it down without stopping. It goes into your inbox like anything else and you carry on — no dialog, no decision, no losing your place.
- **Your way back is saved the moment you write the interruption down**, not when you stop tidily. Close the app, get called away, let the battery die — come back and it still knows where you were. Being pulled away without getting to press a button is the whole reason this exists.
- When you do stop, you can leave yourself five words: "I was about to…". It is optional, saying nothing is completely ordinary, and nothing asks twice.
- What comes back is your own sentence, not the app’s. If you left five words, that is what it says.
- Switching to something else leaves a way back to what you put down. Swapping tasks is the most ordinary thing anyone does and it should not quietly cost you a thread.
- Finishing leaves no way back, because there is nothing to come back to. Nothing offers you a route into work you have already done.
- A thread you let go is let go. The work itself stays exactly where it was — nothing is deleted and nothing is marked done on your behalf.
- Being interrupted is not a failure here. It counts what you wrote down, which is a thing you did, and there is nothing that says you were distracted, late, or off track.

## 0.13.0 — CAPABILITY

*2026-07-29*

- Bigger things can now hold smaller ones. Open anything and say "this is bigger than one step", and it becomes something other work can sit under — the report, and the three things that actually make it happen.
- Nothing is filed away out of reach. Whatever you put under something else is still on your list and still comes back to you on its own. This app does not have a place where things go quiet.
- A new "Worth a look" appears when something is structurally broken — and only then. Most of the time it is not on the page at all, because most of the time nothing is wrong.
- The thing it catches is the expensive one: a bigger piece of work with no actual next step under it. That looks perfectly ordinary everywhere else in the app, and nothing happens for weeks.
- It also catches anything that lost what it belonged to, which can happen when you bring in a copy from another device.
- It shows at most three at a time and says how many there really are. Coming back after a fortnight should not be a wall.
- It is a count, never a score. Nothing here says you are late, and nothing here congratulates you for an empty list — an empty one simply is not there.
- You cannot put a thing inside itself, or inside something already under it. That is refused as you try, and the picker never offers it in the first place.

## 0.12.0 — CAPABILITY

*2026-07-29*

- You can now say that one thing holds up another, and how long it takes — and Quietkeep works out the last day it can start. Six days until the thing you promised, two days of work, so start it within four.
- A date that has gone by now tells you what it cost. Instead of only "that date was two days ago", it says which commitment it fed and that it needed starting two days ago — the part that is genuinely hard to work out in your head.
- Nothing is ever guessed. Without both a date on the other thing and a length on this one, it stays quiet rather than inventing a number.
- When the dates do not fit, it says so about the dates. Not about you — there is no "behind", no "late", and there never will be.
- You cannot make two things each wait for the other. That is refused as you try, because it has no meaning and no fix.
- Finishing or letting go of the thing downstream stops it pulling on anything. A commitment you are no longer under cannot make something else urgent.

## 0.11.0 — CAPABILITY

*2026-07-29*

- Two devices can now carry the same work. Export from one, and on the other choose "Take in what I don’t have" — anything the copy has and this device doesn’t is added, and nothing here is removed.
- It is opt-in and it is manual: nothing runs on its own and nothing is sent anywhere. There is still no account, no server and no telemetry, and the app is complete without ever using it.
- Taking in the same copy twice costs nothing and says so, because being unsure whether you already did is the ordinary case.
- Letting something go on one device lets it go on both once you have exchanged — this carries decisions across, not just new items.
- Replacing everything is still there, unchanged, for setting a device up again. The two are now separate buttons that say which is which, and the one that cannot lose anything is the one your keyboard lands on.
- If you edit the same thing on both devices before exchanging, the most recent edit wins and the other is quietly dropped. That is a real limit and it is said here rather than hidden.

## 0.10.1 — ITERATION

*2026-07-29*

- A "Do now" thing can now simply be marked done. Before, the only thing on offer was a two-minute timer, so a job you finished in forty seconds stayed on your list until you went looking for it.
- The two-minute timer is now something you choose, not something that starts on you. "Do now" is a category — the timer is a tool, and it is there if you want it.
- When the two minutes are up, Quietkeep asks whether you finished. It used to record that you had, without asking. Time running out is not the same as being done, and saying "not yet" is not a failure.
- The Do now panel no longer disappears when your inbox goes empty. Sorting your last item into it made the whole thing vanish, timer and all.
- The panel has a close button at the top that stays with you as you scroll. Closing it used to mean scrolling past every release note to reach the bottom.
- Sending to your calendar now confirms it where you can see it. The confirmation was appearing above the button, off the top of the screen — so it looked like nothing had happened.
- A damaged or joined-together copy is now refused before anything is replaced, and says what is wrong with it in a sentence.

## 0.10.0 — CAPABILITY

*2026-07-29*

- You can bring a copy back. Quietkeep could hand you everything it held and had no way to read it back, so moving to a new device meant starting again and the exported file was one nothing could open. Choose an export in the panel and it comes back.
- It tells you what is in the file before anything changes — how many things, and when the copy was made — so you can check it against what you remember rather than trusting a filename.
- Bringing a copy back replaces what is on this device. It is never merged, and the app says so plainly before you decide. Saving a copy of what is here now is offered first, and listed first.
- A file that is not a Quietkeep export, or one that has been damaged or cut short, is refused with a reason — and refused before anything of yours is touched.
- The panel and the main screen now count the same way. "Things held" in the panel was counting things you had let go, so it could read one higher than the number on the screen behind it.

## 0.9.0 — CAPABILITY

*2026-07-29*

- A date that has gone by now asks you what to do about it, instead of sitting in the list looking like something you could still get on with today. There is no list of things you did not do in this app, and there never will be.
- Five ways out, all of them forward-facing: do less of it, hand it to someone else, move the date, pick a new one, or decide it is not happening now. Choosing "not now" puts it on the Menu, where nothing is owed — and that is as easy to reach as any of the others.
- Whatever you choose, every date that had gone by goes with it, so the same thing does not come straight back asking again.
- At most three at a time, and it tells you how many there are altogether. Coming back after a fortnight away should not be a wall.
- Something waiting on a new plan is no longer offered as "next up" as well, asking to be done today — that was the one question its date had already ruled out. It still appears in the list of what you are holding, under its own heading, so nothing is hidden.

## 0.8.1 — ITERATION

*2026-07-29*

- The calendar file is now accepted by strict calendar apps. Text pasted from a PDF or a terminal could carry invisible characters that quietly made the file invalid.
- Something parked until a date now goes to your calendar too. The list said "parked until Friday" while the calendar quietly left it out.
- A reminder is never dated in the past, so it can actually go off — previously anything already waiting was sent with a moment that had been and gone.
- The panel no longer shows you a stale answer. Reopening it used to repeat whatever it said last time, however much had changed since.
- After sending to your calendar, the keyboard stays on the button and the result is announced, instead of silently jumping to the top of the page.

## 0.8.0 — CAPABILITY

*2026-07-29*

- Quietkeep can now tell you about something when it is closed. Send what you are holding to your calendar, and the calendar reminds you at 9am on the day — it already runs when this app does not, so you no longer have to remember to open anything.
- Repeating things go across as real repeats, so the calendar keeps asking on its own rather than needing a fresh copy every time.
- It is a snapshot of the moment you send it, and the app says so plainly. Change a date here afterwards and the calendar will not follow — send a fresh copy when it matters.
- Nothing you have finished, and nothing sitting on the Menu, is ever sent as a reminder.
- On devices that support it, the app icon now shows how many things are ready — and only those, so it is a number that can actually reach zero.

## 0.7.2 — ITERATION

*2026-07-29*

- Ticking something off twice by tapping quickly can no longer record it twice.
- After you tick something off, the keyboard stays with your list instead of jumping to the top of the page, and the app now says out loud what you just finished.
- Typing a new name for something is no longer thrown away if you change a date in the same panel before saving it.
- Things on the Menu no longer show a Done button. The Menu is the one place that asks nothing of you, and a row of completion buttons made it look like a list of things owed.

## 0.7.1 — ITERATION

*2026-07-29*

- A card could show one date while being filed under another — it now tells you about whichever date will actually bring it back to you.
- Something far in the future now says which year, so next September and September in ten years no longer look the same.
- Something set aside until a date now says when it comes back, instead of just “held”.
- Renaming refuses a title made only of invisible characters, which used to leave a blank card you could no longer identify, and very long titles are trimmed so one thing cannot bury the rest.

## 0.7.0 — CAPABILITY

*2026-07-29*

- What you are holding is now sorted into plain groups — not sorted yet, ready now, coming up, later, on the Menu, and done — instead of one long list. Nothing is counted or scored; they are just headings, so you can see the shape of it at a glance.
- You can tick something off straight from the list, without opening it first.
- You can fix what you wrote. Open anything and correct the words — useful when a thought went down fast and came out sideways.
- Something you have finished now says so, rather than claiming it is coming back to you today.
- Fixed: after adding something from a link, the items in your list quietly stopped opening when tapped until the next change.

## 0.6.0 — CAPABILITY

*2026-07-29*

- Tap anything you are holding and you can now change it. Until now the app could only take a thought in and sort it once; now it can hold a plan.
- Give something a real date, or take the date off again — if you take it off, it comes back to you today rather than going quiet.
- Make something repeat: how often, and how long it can go before it asks again. A plant and a phone call do not need the same patience, so each thing keeps its own.
- Take back a “done” if you ticked the wrong thing, keep something you had let go, or put it on the Menu where it waits without asking anything of you.

## 0.5.1 — ITERATION

*2026-07-29*

- Fixed a fault that could stop Quietkeep opening at all. If a single date in your data was malformed, the app failed to start and — worse — anything you typed while it was in that state was lost silently. Your writing was always safe on the device; it just could not be reached. It now starts regardless, and refuses to record a broken date in the first place.
- Something you finished can no longer come back as though you had not done it, and an item can no longer get into a state where neither finishing nor dismissing it did anything.
- Work can no longer disappear from the day’s list because it had two dates on it.
- The same thing is never shown to you twice on one screen.
- Tapping to see everything you are holding now lists exactly as many things as the count claims.
- If saving fails, you are told so where you can see it, rather than only being told by a screen reader.
- Finishing the last thing on the list leaves the keyboard somewhere sensible instead of nowhere.
- Areas and goals are no longer offered as though they were a task you could tick off.

## 0.5.0 — CAPABILITY

*2026-07-29*

- Quietkeep now opens with one thing to do, chosen for you, and says why it picked it. Behind it is a short list — never the whole pile.
- “Not this” moves on and keeps no record of it. Skipping something is not held against you, because nothing about it is written down at all.
- Things you do regularly come back on their own rhythm, and each one has its own idea of what “a while” means — the plant and the phone call are not held to the same patience.
- Nothing is ever marked late. When something comes round again it simply says so, and it keeps saying so gently rather than louder.
- Tapping what you are holding now opens the full list, with the day each thing comes back — so the count is something you can check rather than take on trust.
- “Today” now means today where you are. Anything you put down in the evening comes back that same evening, not the following afternoon.

## 0.4.0 — CAPABILITY

*2026-07-28*

- Quietkeep now helps you sort what you have put down. It brings up one thing at a time and asks a single question, so you never face the whole list at once.
- A quick first pass, if you want it: hot or cold — just a feel for what matters, two taps.
- Then a clear choice of where each thing goes: do it now, make it the next step, wait on someone else, keep it for someday, file it as reference, or let it go. Whatever you pick, the thing is looked after — it can never fall silent.
- Choosing “do it now” starts a calm two-minute timer for the small thing in front of you. You can stop it whenever; it is there to help, never to hurry you.

## 0.3.0 — CAPABILITY

*2026-07-28*

- You can now capture into Quietkeep from outside it: share a page or a note to it from any app, add a Capture shortcut to the app icon, or open a link that drops text straight in.
- Anything captured from a link shows a plain confirmation with an Undo, and never runs or trusts what the link contained.
- The app now ships a strict security policy that stops any code it did not author from running.

## 0.2.4 — ITERATION

*2026-07-28*

- The one-time welcome no longer flickers back if you reopen the app right after closing it.

## 0.2.3 — ITERATION

*2026-07-28*

- A held thought is never reported as lost. If anything goes wrong after it is saved, you are told the truth about it, and the thing you typed is never taken from you.
- Holding the same thought twice by tapping quickly can no longer make a duplicate.
- Exporting tells you plainly whether the file was made, and never records a copy that did not leave.
- Opening the app when the network is broken always shows the copy on your device, never an error page.
- Your writing reads correctly whatever your text size, and every control is reachable by keyboard with a clear focus outline.

## 0.2.2 — ITERATION

*2026-07-28*

- The storage details now read correctly to screen readers.

## 0.2.1 — ITERATION

*2026-07-28*

- Opening the app on a slow or stalling connection no longer waits on the network. After two seconds the copy already on your device appears, and any update quietly arrives for next time.
- Holding two thoughts in quick succession can no longer tangle the order they are recorded in.

## 0.2.0 — CAPABILITY

*2026-07-28*

- There is an ⓘ in the corner now. It holds these notes, the storage answer, and what Quietkeep is — and it introduces itself once, the first time you open the app.
- You can export a copy of everything to a file, whenever you like. It is plain text you can read without us, and it is yours.
- Every export is recorded in your own log, so your history also remembers when a copy left.

## 0.1.0 — CAPABILITY

*2026-07-28*

- Quietkeep can hold things now. Type a thought, and it comes back to you — you do not have to remember to look.
- What you type is kept as you type it. If you are interrupted mid-sentence and come back later, it is still there.
- Nothing is saved to a server, because there is no server. Your writing stays on this device.
- You can ask the browser to keep your data rather than treat it as disposable. The Storage panel says plainly whether it agreed.
