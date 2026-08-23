// The walkthrough — the first thing a brand-new person sees, and the family's
// first tutorial (the siblings introduce themselves with always-present copy;
// ND Toolbox's own roadmap names the unbuilt item "calm skippable first-run").
//
// It is built to that house style, not to a spotlight-tour convention that would
// cut against it: CALM (a few short steps, no dimming or chasing the cursor),
// SKIPPABLE (Skip is present on every step), and REPLAYABLE (the ⓘ panel has a
// control that shows it again). It is a modal like the ⓘ panel is — Quietkeep's
// own surface pattern — and it is fully keyboard-operable, moves focus to each
// step's heading, announces the step in a live region, and animates nothing, so
// reduced-motion is honoured by having no motion to reduce.
//
// It ends by handing off to the real first action: opening the ⓘ panel so the
// person can keep their data (the V-00 storage nudge the auto-open used to do),
// with the capture box one tap away.

import type { Session } from './session.ts';
import { editionName, isSyncEdition } from './edition.ts';
import { namedControls } from './marks.ts';

/** Written when the walkthrough is finished OR skipped: seeing it once is the
 *  contract, and skipping IS seeing it. Its own key, separate from the ⓘ intro. */
const TOUR_SEEN = 'tour.seen';
/** Set alongside it so the ⓘ panel's own first-run intro never also fires — the
 *  walkthrough has taken that job. */
const ABOUT_SEEN = 'about.seen';

interface Step {
  heading: string;
  /** One paragraph per string — rendered with textContent, never innerHTML. */
  body: string[];
  /**
   * The part of the app this step is describing, pictured (2.10.4).
   *
   * `step` numbers the file in `public/tour/`; `tools/tour-shots.mjs` renders
   * both themes from the running app and `npm run tour:check` refuses to pass
   * once the markup or stylesheet has moved underneath them. A help screen
   * illustrated with a UI that no longer exists is worse than one with no
   * pictures at all: prose that is out of date reads as out of date, and a
   * screenshot reads as proof.
   *
   * `alt` IS WRITTEN BY HAND and cannot be generated. It says what the picture
   * MEANS to somebody who cannot see it, which is not the same as listing what
   * is in the rectangle — and this is a first-run screen, where a reader knows
   * least about the app and can least afford a description that assumes it.
   */
  picture?: { step: number; alt: string };
}

/** Computed per show, not at import: the last step's privacy sentence must
 *  state THIS edition's truth, and the edition is only known once `main()`
 *  has run (the default's words were caught inside Quietkeep Sync, 1.7.2). */
const stepsNow = (): readonly Step[] => [
  {
    heading: `Welcome to ${editionName()}`,
    body: [
      'Quietkeep is somewhere to put things down so you can stop carrying them in your head.',
      'It brings each one back to you when it is worth thinking about again, so you never have to remember to look.',
      'Six short screens and you are done. You can leave at any point with *Skip*.',
    ],
  },
  {
    heading: 'Start with the box',
    body: [
      'This is the whole app to begin with: a box at the top, and everything you have put down underneath it.',
      'Type whatever is on your mind and press *Hold it*.',
      'There is nothing else to fill in — no folder, no date, no category. Getting it out of your head is the point. Anything else can come later, or never.',
    ],
    picture: { step: 2, alt: 'The box at the top of the screen, with the words "ring the plumber back about the tap" typed into it, and a Hold it button beside it.' },
  },
  {
    heading: 'It sorts and times itself',
    body: [
      'Once a few things are in there, Quietkeep takes them one at a time and asks what each one is. Every answer is a plain word, and none of them is wrong.',
      'Then it works out when to bring each one back, and hands you the one thing worth doing now. You never set a reminder yourself.',
    ],
    picture: { step: 3, alt: 'One captured thing shown on its own, above eight plain choices: Do now, Next action, Waiting for, Someday, Reference, Trash, Put it somewhere, and Not this one. Each choice carries a short line saying what it means.' },
  },
  {
    heading: 'One thing at a time',
    body: [
      'Instead of a list to get through, Quietkeep offers you one thing and says why it picked that one — a date arrived, or something it was waiting on is finished.',
      '*Done* finishes it. *Not this* moves on, as often as you like, and records nothing at all.',
      'When you finish something the screen goes quiet and waits. Nothing new arrives until you ask for it.',
    ],
    picture: { step: 4, alt: 'A card headed Next up, holding one task, with the reason it was chosen underneath it. Two buttons, Done and Not this, and then four quieter words: Start smaller, This one is heavy, That is enough for now, and Just one thing.' },
  },
  {
    heading: 'On a harder day',
    body: [
      'Some days you can do less than others. You can tell Quietkeep how heavy a thing feels, and how the day is going, and it changes which things it puts in front of you first.',
      'It never takes anything away, and it never decides you have had enough. Everything you put down is still there.',
      'If the screen itself is too much, *Just one thing* clears it down to a single item. You turn that on yourself, and off again the same way.',
    ],
    picture: { step: 5, alt: 'The same card with almost everything stripped away — the task, Done, Not this, That is enough for now, and a way back to the rest of the app.' },
  },
  {
    heading: 'It is yours, and it is all here',
    body: [
      isSyncEdition()
        ? 'Everything stays on your devices — no account, no sign-in. What they trade to stay in step is sealed with a key only they hold.'
        : 'Everything stays on your device — no account, no sign-in, no server holding your writing.',
      'The round button marked i, at the top of the screen beside the name, is where everything else lives: how to add Quietkeep to your Home Screen, how to keep your writing safe, and this walkthrough again whenever you want it.',
      '*Get started* opens it now, because keeping your writing safe is the one thing worth doing before anything else.',
      // Added in 1.14.0. NOT written for the returning reader specifically —
      // the empty screen behind this dialog now offers them the way back, and a
      // sentence here about data they may never have had would land oddly on
      // somebody genuinely new. What it does say is true for both: the exported
      // file is the copy that outlives the browser, and that is worth knowing on
      // day one rather than on the day it matters.
      'It also writes you a copy of everything, as a file you keep. That file is the one copy that survives a new device or a cleared browser, and bringing it back is one button in the same place.',
    ],
    picture: { step: 6, alt: 'A short list of plain facts about where your writing is kept on this device, a sentence saying the browser has not yet promised to keep it, and two buttons: Ask the browser to keep it, and Export a copy.' },
  },
];

/**
 * Show the walkthrough. Used both on first run (via `mountTour`) and on demand
 * from the ⓘ panel's replay control — so it does not consult the seen-flag
 * itself; the caller decides whether it is warranted.
 *
 * `onFinish` runs when the last step's button is pressed (not on Skip): first
 * run passes a callback that opens the ⓘ panel for the storage step.
 */
export function showTour(session: Session, onFinish?: () => void): void {
  const dialog = document.querySelector<HTMLDialogElement>('#tour');
  const progress = document.querySelector<HTMLElement>('#tour-progress');
  const heading = document.querySelector<HTMLElement>('#tour-heading');
  const bodyEl = document.querySelector<HTMLElement>('#tour-body');
  const dots = document.querySelector<HTMLElement>('#tour-dots');
  const back = document.querySelector<HTMLButtonElement>('#tour-back');
  const next = document.querySelector<HTMLButtonElement>('#tour-next');
  const skip = document.querySelector<HTMLButtonElement>('#tour-skip');
  if (!dialog || !progress || !heading || !bodyEl || !dots || !back || !next || !skip) return;

  const STEPS = stepsNow();
  let i = 0;

  const render = (): void => {
    const step = STEPS[i]!;
    progress.textContent = `Step ${i + 1} of ${STEPS.length}`;
    heading.textContent = step.heading;
    // Rebuilt with text nodes only — innerHTML is banned here, and a
    // walkthrough of "it is only our own strings" is exactly where that erodes.
    //
    // A CONTROL'S NAME CARRIES `.ui-name` — see `marks.ts`, which records why
    // it is an outline rather than italics, and why that is the same defect
    // reported twice.
    bodyEl.replaceChildren(...step.body.map(text => {
      const p = document.createElement('p');
      p.className = 'tour-p';
      p.append(...namedControls(text));
      return p;
    }));
    // THE PICTURE, IF THIS STEP HAS ONE. `<picture>` with a `prefers-color-scheme`
    // source rather than a swap in script: this app takes its light or dark from
    // the operating system and has no toggle of its own, so the browser can
    // choose correctly with no JavaScript and no flash of the wrong one.
    //
    // `loading="eager"` deliberately — this is a modal the reader is already
    // looking at, and a lazily-loaded illustration that arrives after the words
    // is a layout shift on the first screen anybody ever sees.
    if (step.picture) {
      const pic = document.createElement('picture');
      const dark = document.createElement('source');
      dark.media = '(prefers-color-scheme: dark)';
      dark.srcset = `./tour/step-${step.picture.step}-dark.png`;
      const img = document.createElement('img');
      img.src = `./tour/step-${step.picture.step}-light.png`;
      img.alt = step.picture.alt;
      img.className = 'tour-shot';
      img.loading = 'eager';
      img.decoding = 'async';
      pic.append(dark, img);
      bodyEl.append(pic);
    }
    // Dots are decorative; the live "Step N of M" is the real announcement.
    dots.replaceChildren(...STEPS.map((_, n) => {
      const dot = document.createElement('span');
      dot.className = n === i ? 'tour-dot on' : 'tour-dot';
      return dot;
    }));
    back.hidden = i === 0;
    next.textContent = i === STEPS.length - 1 ? 'Get started' : 'Next';
    // Focus the heading each step — the house a11y rule for a navigated view, so
    // a screen-reader user lands on what changed rather than nowhere.
    heading.focus();
  };

  const finish = (viaSkip: boolean): void => {
    void session.store.setKv(TOUR_SEEN, true);

    // BOTH FLAGS, ON EITHER EXIT — and this is deliberate rather than left
    // alone. Skipping the walkthrough used to lose the storage question for
    // good: only the completed path calls `onFinish`, which opens the panel, so
    // Skip (and Escape, treated as Skip) marked the ⓘ intro seen without it ever
    // being shown, and `requestPersistence()` had exactly one caller — a button
    // that at the time sat inside a group shipping collapsed. Skip once and the
    // app ran evictable for the life of the install, silently.
    //
    // The obvious fix is to leave `about.seen` unset here so the panel's own
    // auto-open takes over. It was tried and it is wrong: `mountAbout` resolves
    // AFTER the walkthrough, so `!about.seen && tour.seen` is immediately true
    // and the panel opens the instant Skip is pressed. The smoke walk found it
    // as a modal intercepting every later click, which is the honest version of
    // what a person would have felt — an app arguing with a dismissal.
    //
    // So the flag stays, and the reachability is fixed where it belongs: the
    // intro is no longer gated on first run at all. It appears whenever the
    // browser has not agreed to keep the store, on any open of the panel, above
    // every fold, carrying its own ask (`#intro-ask`). Nothing appears without
    // an action, and the question is one tap away for ever rather than gone.
    void session.store.setKv(ABOUT_SEEN, true).then(() => {
      document.body.dataset.introDismissed = 'true';
    });

    if (dialog.open) dialog.close();
    if (!viaSkip) onFinish?.();
  };

  next.onclick = () => {
    if (i < STEPS.length - 1) { i += 1; render(); }
    else finish(false);
  };
  back.onclick = () => { if (i > 0) { i -= 1; render(); } };
  skip.onclick = () => finish(true);
  // Escape closes the dialog; treat that as Skip so the seen-flag is still set
  // and it does not reappear on the next open.
  dialog.addEventListener('cancel', () => finish(true), { once: true });

  render();
  dialog.showModal();
}

/**
 * First-run entry. Shows the walkthrough once, before the ⓘ panel would have
 * auto-opened. On finish it opens the ⓘ so the storage step still happens; the
 * ⓘ's own auto-open is gated on `tour.seen` so the two never stack.
 */
export async function mountTour(session: Session): Promise<void> {
  const replay = document.querySelector<HTMLButtonElement>('#tour-replay');
  if (replay) replay.addEventListener('click', () => showTour(session, openAbout));

  const seen = await session.store.getKv<boolean>(TOUR_SEEN);
  if (seen) return;
  showTour(session, openAbout);
}

/** Open the ⓘ panel by its real control, so the storage step and its wiring run
 *  exactly as they do for any other open. The handoff's whole promise is
 *  "keeping your data safe is the first thing you do", and the panel's own
 *  first-run block carries that ask above everything else on it. */
function openAbout(): void {
  // The panel's own first-run block carries the storage ask above everything, so
  // opening the panel IS the handoff. It used to also unfold a "Your data" group;
  // that is its own sheet since 1.40.0, and opening it here would stack a modal
  // over the very ask this hands somebody to.
  //
  // ASKED FOR AS A FIRST RUN (1.40.4). Clicking `#open-about` opens the panel in
  // its ordinary state, where the storage block's visibility waits on an async
  // read — so the one screen this handoff exists to show could arrive after it.
  // The event says which kind of open this is; `about.ts` answers it with
  // `show(true)`, which is synchronous.
  document.dispatchEvent(new CustomEvent('quietkeep:about-first-run'));
  // And a way through if the panel never mounted — the event has no listener
  // then, and a handoff that opens nothing is worse than one that opens late.
  if (!document.querySelector<HTMLDialogElement>('#about')?.open) {
    document.querySelector<HTMLButtonElement>('#open-about')?.click();
  }
}
