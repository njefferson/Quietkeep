#!/usr/bin/env node
// THE APP SPELLS ONE WAY, AND UNTIL NOW NOTHING HELD IT TO THAT.
//
// 3.23.5 converted about forty words by hand across four surfaces and left
// nothing behind it. Four survived, and the first one is the worst possible
// place for a survivor: the release note ANNOUNCING the change reads back to
// front, because the sweep converted its own before-and-after example. A change
// that has to be remembered is a change that has already started rotting; this
// repo knows that about generated files, about the branch rule and about the
// patch notes, and 3.23.5 is the same shape with no gate under it.
//
// A LIST, NOT A PATTERN, and the reason is measured rather than aesthetic.
// The obvious rule is `-ise$ -> -ize`, and it is wrong: advertise, surprise,
// exercise, promise, premise, compromise, franchise, supervise, revise, devise,
// expertise, merchandise, improvise, disguise, despise, enterprise and paradise
// are all spelled with an s in American English. A pattern that fires on honest
// spelling is a gate people route around — `privacy-check.mjs` and
// `quote-check.mjs` both carry that lesson, and `copy-count.mjs` in a sibling
// found the same thing by measurement (hub LESSONS §204).
//
// READER-FACING TEXT ONLY, and this is most of the work. A scan of the whole
// tree for these words returns 63 hits on `aria-labelledby` — which is the
// attribute name in the HTML spec and cannot be respelled — plus
// `normaliseTheme`, `serialiseState`, `sanitisation`, `--artefact` and
// `totally`. None of those is a word anybody reads. So:
//
//   HTML   text nodes, and the values of the attributes a person actually
//          reads (aria-label, placeholder, title, alt, and a button's value).
//          Never an attribute NAME.
//   TS     string literals only. Identifiers and comments are not read by
//          anybody using the app, and both are where the code's own vocabulary
//          lives.
//   MD     prose, minus fenced blocks and inline code spans.
//
// `<span data-was>` is exempt by construction, not by declaration: the help is
// allowed to say what a control USED to be called, and if the old name was
// spelled the other way then the bridge needs the other spelling. The count of
// mentions exempted that way is printed, because an exemption nobody sees is
// how the privacy gate's material collected.
//
// Everything else is declared in `.spelling-allow`, checked BOTH directions —
// a declaration that no longer matches anything FAILS, so a scrub cannot leave
// the file quietly covering things that are gone.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';

const repo = resolve(process.argv.includes('--repo')
  ? process.argv[process.argv.indexOf('--repo') + 1] : '.');
const listMode = process.argv.includes('--list');

/**
 * BRITISH -> AMERICAN, one entry per word, inflections spelled out.
 *
 * Deliberately absent, each for a reason: `grey` (standard in American English
 * too, and the palette files use it), `learnt`/`spelt`/`dreamt`/`burnt`
 * (accepted American variants), `towards` (likewise), `artefact` (a flag name
 * in the hub's `branch-guard`, and never reader-facing here), and every -ise
 * word whose American spelling also ends in s.
 */
const WORDS = new Map(Object.entries({
  // -our
  colour: 'color', colours: 'colors', coloured: 'colored', colourful: 'colorful',
  colouring: 'coloring', colourless: 'colorless',
  behaviour: 'behavior', behaviours: 'behaviors', behavioural: 'behavioral',
  honour: 'honor', honours: 'honors', honoured: 'honored', honouring: 'honoring',
  neighbour: 'neighbor', neighbours: 'neighbors', neighbouring: 'neighboring',
  neighbourhood: 'neighborhood',
  labour: 'labor', laboured: 'labored', labouring: 'laboring',
  favour: 'favor', favours: 'favors', favoured: 'favored', favouring: 'favoring',
  favourite: 'favorite', favourites: 'favorites',
  flavour: 'flavor', flavours: 'flavors', flavoured: 'flavored',
  humour: 'humor', rumour: 'rumor', rumours: 'rumors',
  endeavour: 'endeavor', endeavours: 'endeavors',
  savour: 'savor', vapour: 'vapor', odour: 'odor', valour: 'valor',
  vigour: 'vigor', rigour: 'rigor', rigours: 'rigors', armour: 'armor',
  candour: 'candor', clamour: 'clamor', splendour: 'splendor',
  tumour: 'tumor', parlour: 'parlor', arbour: 'arbor',
  // -ise / -isation, only where American ends in z
  organise: 'organize', organises: 'organizes', organised: 'organized',
  organising: 'organizing', organisation: 'organization',
  organisations: 'organizations', organisational: 'organizational',
  recognise: 'recognize', recognises: 'recognizes', recognised: 'recognized',
  recognising: 'recognizing',
  prioritise: 'prioritize', prioritises: 'prioritizes',
  prioritised: 'prioritized', prioritising: 'prioritizing',
  prioritisation: 'prioritization',
  realise: 'realize', realises: 'realizes', realised: 'realized',
  realising: 'realizing',
  apologise: 'apologize', apologised: 'apologized', apologising: 'apologizing',
  categorise: 'categorize', categorised: 'categorized',
  categorising: 'categorizing', categorisation: 'categorization',
  customise: 'customize', customised: 'customized', customising: 'customizing',
  emphasise: 'emphasize', emphasised: 'emphasized', emphasising: 'emphasizing',
  minimise: 'minimize', minimised: 'minimized', minimising: 'minimizing',
  maximise: 'maximize', maximised: 'maximized', maximising: 'maximizing',
  summarise: 'summarize', summarised: 'summarized', summarising: 'summarizing',
  memorise: 'memorize', memorised: 'memorized',
  normalise: 'normalize', normalised: 'normalized', normalising: 'normalizing',
  initialise: 'initialize', initialised: 'initialized',
  finalise: 'finalize', finalised: 'finalized',
  visualise: 'visualize', visualised: 'visualized',
  analyse: 'analyze', analyses: 'analyzes', analysed: 'analyzed',
  analysing: 'analyzing',
  paralyse: 'paralyze', paralysed: 'paralyzed',
  criticise: 'criticize', criticised: 'criticized', criticising: 'criticizing',
  specialise: 'specialize', specialised: 'specialized',
  standardise: 'standardize', standardised: 'standardized',
  utilise: 'utilize', utilised: 'utilized', utilising: 'utilizing',
  authorise: 'authorize', authorises: 'authorizes', authorised: 'authorized',
  authorising: 'authorizing', authorisation: 'authorization',
  itemise: 'itemize', itemised: 'itemized', itemising: 'itemizing',
  penalise: 'penalize', penalised: 'penalized',
  stabilise: 'stabilize', stabilised: 'stabilized',
  synchronise: 'synchronize', synchronised: 'synchronized',
  optimise: 'optimize', optimised: 'optimized', optimising: 'optimizing',
  sanitise: 'sanitize', sanitised: 'sanitized', sanitising: 'sanitizing',
  sanitisation: 'sanitization',
  digitise: 'digitize', digitised: 'digitized',
  familiarise: 'familiarize', familiarised: 'familiarized',
  generalise: 'generalize', generalised: 'generalized',
  localise: 'localize', localised: 'localized',
  modernise: 'modernize', modernised: 'modernized',
  personalise: 'personalize', personalised: 'personalized',
  randomise: 'randomize', randomised: 'randomized',
  serialise: 'serialize', serialised: 'serialized', serialising: 'serializing',
  socialise: 'socialize', symbolise: 'symbolize', symbolised: 'symbolized',
  reprioritise: 'reprioritize', reprioritised: 'reprioritized',
  reprioritisation: 'reprioritization',
  // -re
  centre: 'center', centres: 'centers', centred: 'centered', centring: 'centering',
  theatre: 'theater', theatres: 'theaters', fibre: 'fiber', fibres: 'fibers',
  litre: 'liter', litres: 'liters', metre: 'meter', metres: 'meters',
  sombre: 'somber', spectre: 'specter', lustre: 'luster', calibre: 'caliber',
  // -ce / -se
  defence: 'defense', defences: 'defenses', offence: 'offense',
  offences: 'offenses', licence: 'license', licences: 'licenses',
  pretence: 'pretense', practise: 'practice', practises: 'practices',
  practised: 'practiced', practising: 'practicing',
  // doubled l
  travelled: 'traveled', travelling: 'traveling', traveller: 'traveler',
  travellers: 'travelers', cancelled: 'canceled', cancelling: 'canceling',
  labelled: 'labeled', labelling: 'labeling', modelled: 'modeled',
  modelling: 'modeling', fuelled: 'fueled', fuelling: 'fueling',
  marvellous: 'marvelous', counsellor: 'counselor', counsellors: 'counselors',
  signalled: 'signaled', signalling: 'signaling', dialled: 'dialed',
  dialling: 'dialing', totalled: 'totaled', totalling: 'totaling',
  jeweller: 'jeweler', jewellery: 'jewelry', levelled: 'leveled',
  levelling: 'leveling',
  // the rest
  aluminium: 'aluminum', aeroplane: 'airplane', cheque: 'check',
  cheques: 'checks', kerb: 'curb', tyre: 'tire', tyres: 'tires',
  plough: 'plow', mould: 'mold', moulds: 'molds', moulded: 'molded',
  moustache: 'mustache', programme: 'program', programmes: 'programs',
  storey: 'story', storeys: 'stories', whilst: 'while', amongst: 'among',
  draught: 'draft', pyjamas: 'pajamas', sceptical: 'skeptical',
  scepticism: 'skepticism', speciality: 'specialty', specialities: 'specialties',
  manoeuvre: 'maneuver', manoeuvres: 'maneuvers', catalogue: 'catalog',
  dialogue: 'dialog', enrolment: 'enrollment', fulfilment: 'fulfillment',
  instalment: 'installment', skilful: 'skillful', wilful: 'willful',
  judgement: 'judgment', ageing: 'aging', axe: 'ax', grey: 'gray',
}));

const tracked = execFileSync('git', ['-C', repo, 'ls-files'], { encoding: 'utf8' })
  .split('\n').filter(Boolean);

/** The population, by how its reader-facing text is found. */
const POPULATION = [
  { kind: 'html', match: (f) => /^public\/[^/]+\.html$/.test(f) || f === 'docs/paths.html' },
  { kind: 'ts', match: (f) => /^src\/.+\.ts$/.test(f) },
  { kind: 'md', match: (f) => f === 'CHANGELOG.md' || f === 'docs/manual.md' },
];

/** `<span data-was>…</span>` — the help's sanctioned way to say an old name. */
const stripWas = (s) => {
  let out = s, n = 0;
  out = out.replace(/<span data-was>[\s\S]*?<\/span>/g, () => { n += 1; return ' '; });
  return [out, n];
};

const READ_ATTRS = ['aria-label', 'placeholder', 'title', 'alt', 'aria-description'];

/** What a person actually reads out of an HTML file. */
function readableHtml(src) {
  const [body, wasCount] = stripWas(src);
  let s = body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const spoken = [];
  for (const a of READ_ATTRS) {
    const re = new RegExp(`\\b${a}\\s*=\\s*"([^"]*)"`, 'gi');
    for (const m of s.matchAll(re)) spoken.push(m[1]);
  }
  for (const m of s.matchAll(/<(?:button|input|option)\b[^>]*\bvalue\s*=\s*"([^"]*)"/gi)) {
    spoken.push(m[1]);
  }
  // Tags go last, so an attribute value is read before it is deleted.
  s = s.replace(/<[^>]+>/g, ' ');
  return [`${s}\n${spoken.join('\n')}`, wasCount];
}

/** String literals only — never an identifier, never a comment. */
function readableTs(src) {
  const s = src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  const out = [];
  for (const m of s.matchAll(/'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|`((?:\\.|[^`\\])*)`/g)) {
    out.push(m[1] ?? m[2] ?? m[3] ?? '');
  }
  return [out.join('\n'), 0];
}

/** Prose, minus code. */
function readableMd(src) {
  const [body, wasCount] = stripWas(src);
  return [body
    .replace(/^```[\s\S]*?^```/gm, ' ')
    .replace(/`[^`\n]*`/g, ' '), wasCount];
}

const READERS = { html: readableHtml, ts: readableTs, md: readableMd };

// --- the declared exceptions -------------------------------------------------

const allowPath = join(repo, '.spelling-allow');
/** Each line: `path :: word :: why`. */
const declared = [];
if (existsSync(allowPath)) {
  for (const [i, raw] of readFileSync(allowPath, 'utf8').split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('::').map(p => p.trim());
    if (parts.length !== 3) {
      console.error(`.spelling-allow:${i + 1} is not \`path :: word :: why\``);
      process.exit(1);
    }
    declared.push({ file: parts[0], word: parts[1].toLowerCase(), why: parts[2], hit: false });
  }
}

// --- the walk ----------------------------------------------------------------

const failures = [];
let scanned = 0, wasExempt = 0, hits = 0;

for (const f of tracked) {
  const pop = POPULATION.find(p => p.match(f));
  if (!pop) continue;
  scanned += 1;
  const [text, wasCount] = READERS[pop.kind](readFileSync(join(repo, f), 'utf8'));
  wasExempt += wasCount;
  const seen = new Map();
  for (const m of text.matchAll(/[A-Za-z]+/g)) {
    const w = m[0].toLowerCase();
    const american = WORDS.get(w);
    if (!american) continue;
    seen.set(w, (seen.get(w) ?? 0) + 1);
  }
  for (const [w, count] of seen) {
    hits += count;
    const d = declared.find(x => x.file === f && x.word === w);
    if (d) { d.hit = true; continue; }
    failures.push(`${f}: "${m0(w)}" ${count === 1 ? 'once' : `${count} times`} — American is "${WORDS.get(w)}"`);
  }
}

function m0(w) { return w; }

if (listMode) {
  for (const line of failures) {
    const [file, rest] = [line.split(':')[0], line];
    const word = /"([a-z]+)"/.exec(rest)?.[1] ?? '';
    console.log(`${file} :: ${word} :: WHY`);
  }
  process.exit(0);
}

// --- the report --------------------------------------------------------------

console.log('\n=== the app spells one way ===\n');
console.log(`  ${scanned} reader-facing files read; ${hits} listed spelling(s) found.`);
console.log(`  ${wasExempt} <span data-was> mention(s) exempt by construction.\n`);

if (declared.length === 0) {
  console.log('  no declared exceptions.\n');
} else {
  console.log('  declared exceptions, every one printed:');
  for (const d of declared) {
    console.log(`    ${d.hit ? 'ok  ' : 'GONE'}  ${d.file} :: ${d.word} — ${d.why}`);
  }
  console.log('');
}

const stale = declared.filter(d => !d.hit);
for (const d of stale) {
  failures.push(`.spelling-allow declares ${d.file} :: ${d.word}, which is not there any more — remove the line`);
}

if (failures.length === 0) {
  console.log('  ok    no British spelling in anything a reader reads.\n');
  process.exit(0);
}

console.error('  Reader-facing text spells the other way:\n');
for (const f of failures) console.error(`  FAIL  ${f}`);
console.error(`\n  ${failures.length} to fix. A word that must stay — a quotation, a`);
console.error('  proper name, an old control name outside a <span data-was> — is');
console.error('  declared in .spelling-allow as `path :: word :: why`.');
console.error('  `--list` prints a seed.\n');
process.exit(1);
