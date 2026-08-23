#!/usr/bin/env node
// THE ONE MARKDOWN-TO-PAGE CONVERTER, shared by every hosted doc (2.29.0).
//
// It was inside `tools/thesis.mjs`, which generates `why.html` from
// `docs/planning-for-humans.md`. A second hosted page needed the same converter,
// and the alternative to extracting it was a second copy — which is the defect
// this repo has paid for more than any other. `privacy-mirror-check.mjs` exists
// because a narrowing fix reached one of three copies of a pattern; hub LESSONS
// 125 is three gates with the identical comments-as-markup bug. Two converters
// would drift, and the drift would be invisible: both pages would render, and
// only one would be right.
//
// EXTRACTED WITHOUT CHANGING A CHARACTER of `convert`, `CSS` or `page`. The
// proof is `npm run thesis:check`, which regenerates `why.html` and diffs it
// against the committed file — if the move altered the output by one byte, that
// gate fails. It was run immediately after the extraction and before anything
// new was added, which is the only order in which it proves anything.
//
// The converter handles exactly the markdown these docs use: h1-h4, paragraphs,
// bullet lists (one level of nesting), numbered lists, blockquotes, `---` rules,
// and inline **bold** / *italic* / `code` / [links](url). No dependency: a doc
// page does not earn one, and the docs' shapes are known and few.
//
// The styles live in a FILE, never a `<style>` block: the site's CSP is
// style-src 'self', which refuses inline styles. The first deployed thesis
// rendered unstyled and nobody saw it until the smoke walk navigated there
// (1.7.2).

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline markdown on already-escaped text. Order matters: code and links first
 *  so their contents are not re-processed, then bold before italic so `**` is
 *  consumed before a lone `*`. Doubled markers (`****x**`) are collapsed first —
 *  the doc uses them to mean plain bold. */
function inline(text) {
  let s = esc(text).replace(/\*{3,}/g, '**');
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) => `<a href="${url}">${t}</a>`);
  s = s.replace(/\*\*(.+?)\*\*/g, (_, b) => `<strong>${b}</strong>`);
  s = s.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, (_, pre, it) => `${pre}<em>${it}</em>`);
  // Any stray unbalanced ** left over reads as text, not a broken tag.
  return s.replace(/\*\*/g, '');
}

/** Leading-space count → list nesting depth (the doc nests at two spaces). */
const indentOf = (line) => (line.match(/^ */)?.[0].length ?? 0);

export function convert(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  const flushList = (marker) => {
    // Collect a run of list items at this indent; a deeper-indented run becomes a
    // nested list inside the last item.
    const baseIndent = indentOf(lines[i]);
    const tag = marker === 'ol' ? 'ol' : 'ul';
    const items = [];
    const re = marker === 'ol' ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
    while (i < lines.length) {
      const m = lines[i].match(re);
      if (!m || indentOf(lines[i]) < baseIndent) break;
      if (indentOf(lines[i]) > baseIndent) {
        // Nested list — recurse into the deeper block, appended to the last item.
        const nestMarker = /^\s*\d+\.\s/.test(lines[i]) ? 'ol' : 'ul';
        const nested = flushList(nestMarker);
        if (items.length) items[items.length - 1] += nested;
        continue;
      }
      // LAZY CONTINUATION LINES BELONG TO THE ITEM ABOVE THEM.
      //
      // This loop used to end the item at the newline and fall through to the
      // paragraph branch, which produced 33 single-item <ul>s each followed by
      // an orphaned <p> holding the rest of its own sentence — every wrapped
      // bullet in the document, live on the public page. Section 11's five
      // differentiator claims rendered as five separate lists all numbered "1".
      //
      // And the second symptom had the same cause: `inline()` was applied per
      // LINE, so emphasis opened on one line and closed on the next never
      // paired. `*(community-construct —` printed its asterisk as text. The raw
      // text is therefore joined FIRST and marked up once, which is the only
      // order in which a span can cross the wrap.
      //
      // A continuation is indented past the marker and does not itself start a
      // list item — that second clause is what keeps two-space NESTING working,
      // since the doc nests at the same indent it wraps at.
      let raw = m[2];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ''
        && indentOf(lines[i]) > baseIndent
        && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
        raw += ` ${lines[i].trim()}`;
        i += 1;
      }
      items.push(inline(raw));
    }
    return `<${tag}>${items.map((it) => `<li>${it}</li>`).join('')}</${tag}>`;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i += 1; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i += 1; continue; }

    if (/^-{3,}\s*$/.test(line.trim())) { out.push('<hr>'); i += 1; continue; }

    if (/^\s*[-*]\s+/.test(line)) { out.push(flushList('ul')); continue; }
    if (/^\s*\d+\.\s+/.test(line)) { out.push(flushList('ol')); continue; }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      // Blank-separated paragraphs inside the quote.
      const paras = quote.join('\n').split(/\n{2,}/).map((p) => `<p>${inline(p.replace(/\n/g, ' '))}</p>`);
      out.push(`<blockquote>${paras.join('')}</blockquote>`);
      continue;
    }

    // Paragraph: gather until a blank line or a block-starting line.
    const para = [];
    while (i < lines.length && lines[i].trim() !== ''
      && !/^(#{1,4}\s|>\s?|-{3,}\s*$|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

export const CSS = `  :root{
    color-scheme: light dark;
    --bg:#F4F1E9; --surface:#FFFFFF; --ink:#1B2333; --ink-soft:#4C5670;
    --line:#8E8A7F; --accent:#33425F; --warm:#7A4E00;
  }
  @media (prefers-color-scheme: dark){
    :root{ --bg:#141A26; --surface:#1E2637; --ink:#F2F0EA; --ink-soft:#B3BCCE;
      --line:#6A7896; --accent:#AFC0DC; --warm:#F5C978; }
  }
  *{ box-sizing:border-box; }
  html,body{ margin:0; }
  body{
    background:var(--bg); color:var(--ink);
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased; line-height:1.6;
    padding:2.5rem 1.25rem 4rem;
  }
  main{ max-width:42rem; margin:0 auto; }
  a{ color:var(--accent); }
  a:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; border-radius:2px; }
  .back{ display:inline-block; margin-bottom:1.75rem; font-weight:600; }
  h1{ font-size:1.9rem; line-height:1.2; margin:0 0 1rem; }
  h2{ font-size:1.4rem; margin:2.4rem 0 0.6rem; }
  h3{ font-size:1.12rem; margin:1.8rem 0 0.4rem; }
  h4{ font-size:1rem; margin:1.4rem 0 0.3rem; }
  p{ margin:0 0 1rem; color:var(--ink-soft); }
  li{ margin:0 0 0.4rem; color:var(--ink-soft); }
  ul,ol{ margin:0 0 1rem; padding-left:1.3rem; }
  strong{ color:var(--ink); }
  code{
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:0.9em;
    background:color-mix(in srgb,var(--line) 22%,transparent);
    padding:0.05em 0.35em; border-radius:0.3rem;
  }
  hr{ border:0; border-top:1px solid var(--line); margin:2.4rem 0; }
  blockquote{
    margin:1.4rem 0; padding:0.2rem 0 0.2rem 1rem;
    border-left:3px solid var(--line); color:var(--ink-soft);
  }
  blockquote p:last-child{ margin-bottom:0; }
  footer{ margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--line); color:var(--ink-soft); font-size:0.9375rem; }
`;

export function page(bodyHtml, meta) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title} — Quietkeep</title>
<meta name="description" content="${meta.description}">
<meta name="theme-color" content="#141A26" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F4F1E9" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/brand/icon.svg">
<link rel="stylesheet" href="${meta.css}">
</head>
<body>
<main>
  <a class="back" href="/">&larr; Back to Quietkeep</a>
${bodyHtml.split('\n').map((l) => '  ' + l).join('\n')}
  <footer>
    ${meta.footer}
  </footer>
</main>
</body>
</html>
`;
}
