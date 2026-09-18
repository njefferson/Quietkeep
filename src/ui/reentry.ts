// The re-entry greeting (product law 8: rest is legitimate).
//
// Rendering and wiring only; everything structural is in `src/reentry.ts`.
//
// The absence is measured ONCE, at mount, from the state as it was loaded —
// before this session has written anything. It has to be: the greeting itself is
// an event, and every projection here reads `lastActivityAt`, so measuring later
// would report an absence of zero to the person who has just come back after a
// fortnight. Held in memory for the sitting, like the focus-exit ramp.

import type { Session } from './session.ts';
import { reentryView, reentryWords, waitingWords, amnestyWords, REENTRY_TRIAGE_CAP } from '../reentry.ts';
import { greetEvents, offerAmnestyEvents, acceptAmnestyEvents } from './reentry-intents.ts';
import { sayLasting } from './announce.ts';

export interface ReentryUI { refresh(): void }

export function mountReentry(
  session: Session, now: () => number, onChange: () => void, justArrived = false,
): ReentryUI {
  const q = <T extends HTMLElement>(sel: string): T | null => document.querySelector<T>(sel);
  const region = q('#reentry');
  const words = q('#reentry-words');
  const waiting = q('#reentry-waiting');
  const amnesty = q('#reentry-amnesty');
  const amnestyWordsEl = q('#reentry-amnesty-words');
  const plain = q('#reentry-plain-actions');
  const live = q('#reentry-live');
  const heading = q('#reentry-heading');
  if (!region || !words || !live) return { refresh() {} };
  const REGION = region, WORDS = words, LIVE = live;

  // Measured once, before this session writes anything.
  const arrivedAt = new Date(now()).toISOString();
  // `justArrived` comes from the caller, which has already read and cleared the
  // flag the importer set. Read there rather than here because this mount is
  // synchronous and the kv is not — and passing it in keeps the flag's whole
  // life in one place instead of split across two modules.
  const atArrival = reentryView(session.state(), arrivedAt, session.zone, justArrived);
  let dismissed = !atArrival.show;
  let busy = false;

  /**
   * IT SAYS WHETHER THE WRITE LANDED, and it has to, because a caller acting on
   * a promise that resolves either way is a FALSE RECEIPT (3.24.4).
   *
   * WHAT THIS WAS. `run` caught the commit error, wrote the failure sentence
   * into `#reentry-live`, and never rethrew — so the promise RESOLVED on
   * failure. The amnesty handler's `.then()` set `dismissed`, repainted and
   * moved focus to the capture box, and therefore did all of that when the
   * write had failed. The section closed identically either way. The one thing
   * that differed was a sentence in a `visually-hidden` paragraph, so a sighted
   * reader was shown the exact gesture that means "done" for an amnesty that
   * had not happened.
   *
   * This repo already refuses the shape from the other direction: the capture
   * handler carries a comment about a post-commit throw telling somebody "Not
   * saved" about a thought that WAS saved, and about the duplicate that
   * follows. Same defect, sign flipped — and the flipped one is worse, because
   * "it failed and said nothing" leaves work undone that the reader believes is
   * finished.
   *
   * RETURNS A BOOLEAN RATHER THAN RETHROWING. The error is already handled
   * here, in the one place that knows how to say so; rethrowing would make
   * every call site handle it again and the arrival write at the bottom of this
   * file deliberately has nothing to say. A caller that ignores the answer is
   * unchanged, which is what keeps that write's contract.
   */
  const run = async (make: Parameters<Session['commit']>[0], announce: string): Promise<boolean> => {
    if (busy) return false;
    busy = true;
    let landed = false;
    try {
      await session.commit(make);
      // THE SUCCESS SENTENCE OUTLIVES THIS SECTION AND THE FAILURE ONE MUST NOT
      // (ADR-0126). Taking the amnesty dismisses the whole greeting, so a
      // sentence written into `#reentry-live` was written and hidden inside one
      // turn and reached nobody at all — this file had no `#status` route of any
      // kind, which made it the worse of the two instances the rule was written
      // for. `sayLasting` puts it beside the capture box, which is exactly where
      // the handler below sends focus.
      //
      // THE FAILURE PATH KEEPS `#reentry-live`, and that is 3.24.4's whole fix
      // rather than an oversight: on a failure the section STAYS, with the
      // control that lets somebody try again, so the explanation belongs on the
      // surface holding that control. Two different homes because the two paths
      // leave the surface in two different states — which is the rule, not an
      // exception to it.
      if (announce) sayLasting(announce);
      landed = true;
    } catch (err) {
      LIVE.textContent = `Couldn’t do that — ${(err as Error).message}`;
    } finally { busy = false; }
    try { onChange(); } catch { /* a render bug must not contradict a landed write */ }
    refresh();
    return landed;
  };

  function refresh(): void {
    REGION.hidden = dismissed;
    if (dismissed) return;
    WORDS.textContent = reentryWords(atArrival);
    // The counts are read from CURRENT state, not from arrival: triaging three
    // things should make the line say so rather than keep reciting the number
    // you walked in to.
    const nowView = reentryView(
      session.state(), new Date(now()).toISOString(), session.zone, justArrived);
    if (waiting) {
      const w = waitingWords(nowView);
      waiting.textContent = w ?? '';
      waiting.hidden = !w;
    }
    const canForgive = nowView.passedDates > 0;
    if (amnesty && amnestyWordsEl) {
      amnesty.hidden = !canForgive;
      amnestyWordsEl.textContent = canForgive ? amnestyWords(nowView.passedDates) : '';
    }
    // Exactly one way out is offered: the amnesty block carries its own, so the
    // bare "Thanks" would otherwise be a second dismiss sitting under the first.
    if (plain) plain.hidden = canForgive;
  }

  const dismiss = (): void => {
    dismissed = true;
    refresh();
    // Focus must not fall to <body> when the section it was in disappears
    // (WCAG 2.4.3). Capture is where arrival focus belongs anyway.
    q<HTMLElement>('#capture')?.focus();
  };
  q<HTMLButtonElement>('#reentry-dismiss')?.addEventListener('click', dismiss);
  q<HTMLButtonElement>('#reentry-dismiss-plain')?.addEventListener('click', dismiss);

  q<HTMLButtonElement>('#reentry-amnesty-go')?.addEventListener('click', () => {
    void run(
      ctx => acceptAmnestyEvents(ctx, session.state(), new Date(now()).toISOString(), session.zone),
      'Moved to the Menu. Nothing was deleted and nothing was marked done.',
    ).then((landed) => {
      // ONLY IF IT LANDED. Closing the section and moving focus to capture is
      // the gesture that means the offer is finished with; doing it on a failed
      // write tells the reader their things moved when they did not, and takes
      // away the control that would let them try again. On a failure the
      // section STAYS, with the sentence `run` has already put in it — which is
      // the same reason `refresh()` is called in there rather than here.
      if (!landed) return;
      dismissed = true;
      refresh();
      q<HTMLElement>('#capture')?.focus();
    });
  });

  // Record the arrival — and the OFFER, which is the interesting half: it is
  // evidence the app noticed a lapse and responded, whether or not it was taken
  // up. Written once, on arrival, and never blocking the render.
  if (atArrival.lapsed) {
    void run(ctx => [
      ...greetEvents(ctx, atArrival.absenceDays ?? 0, Math.min(atArrival.waitingToTriage, REENTRY_TRIAGE_CAP)),
      ...(atArrival.amnestyAvailable ? offerAmnestyEvents(ctx, 'passed-dates') : []),
    ], '');
    queueMicrotask(() => { if (!REGION.hidden) heading?.focus(); });
  }

  refresh();
  return { refresh };
}
