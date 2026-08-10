// The smallest static server that can serve `public/` correctly.
//
// Exists because the app must be checked as it is actually served — from a real
// origin, with real MIME types — not opened as a file:// URL where modules,
// service workers and IndexedDB all behave differently or not at all.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
};

/** Parse the `/*`-scoped block of a Cloudflare Pages `_headers` file into a flat
 *  header map. The browser gates run under the SAME headers production serves,
 *  so a CSP violation surfaces here as a console error rather than only in the
 *  wild — which is the whole point of shipping a policy you have run the app
 *  under (Doctrine §16.6, and V-10's "a gate nobody watched is a file"). */
function parseHeaders(root) {
  let text;
  try { text = readFileSync(join(root, '_headers'), 'utf8'); } catch { return {}; }
  const out = {};
  let inGlobal = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line || line.trimStart().startsWith('#')) continue;
    if (!line.startsWith(' ')) { inGlobal = line.trim() === '/*'; continue; }
    if (!inGlobal) continue;
    const i = line.indexOf(':');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  // `upgrade-insecure-requests` IS DROPPED HERE, AND ONLY HERE (1.40.2).
  //
  // This server is http:// by necessity — a local TLS cert is not a thing worth
  // owning for a walk — and production is https:// throughout, so the directive
  // is a no-op in the only place it ships. Locally it is not a no-op: it
  // rewrites every http URL the page is sent to into https, so a REDIRECT the
  // server issues is chased to `https://127.0.0.1:<port>` and dies with
  // ERR_SSL_PROTOCOL_ERROR.
  //
  // That cost an hour, presenting as "the fix does not work": the redirect walk
  // added for the Safari defect could not follow its own redirect, so the
  // assertion failed with the fix correctly in place — the instrument being
  // wrong while looking exactly like the product being wrong (LESSONS §24).
  //
  // Nothing is lost by dropping it. Over http there is no mixed content for it
  // to upgrade; every other directive in the file still binds, which is what
  // "the walks run under the shipped policy" was ever able to mean here.
  if (out['Content-Security-Policy']) {
    out['Content-Security-Policy'] = out['Content-Security-Policy']
      .split(';').map((d) => d.trim())
      .filter((d) => d !== 'upgrade-insecure-requests')
      .join('; ');
  }
  return out;
}

/**
 * Serve `root`, with a mutable `overrides` map the caller can change MID-RUN.
 *
 * Why a live override rather than writing a temp tree: Doctrine §7h says to test
 * a stale app "with a REAL second worker, not a mocked registration — serve a
 * genuinely different `sw.js` and let the browser's own update machinery run; a
 * mock proves the mock works." The browser only starts that machinery when the
 * bytes at the SAME URL change, so something has to answer `/sw.js` differently
 * on the second request. Overriding here does it without touching `public/`,
 * which keeps the walk unable to leave a modified worker behind on a failure.
 *
 * `overrides` is a `Map` of request path -> string body. It is read per request,
 * so `overrides.set('/sw.js', …)` takes effect on the next fetch.
 *
 * `redirects` is a `Map` of request path -> location, answered as a 302. It
 * exists because a redirect is a thing the EDGE can do that this server never
 * did, and the difference was invisible until Safari refused a navigation the
 * worker had answered with a redirected response. A production behaviour no
 * local server reproduces is a production behaviour no gate can see.
 */
export function serve(root, port = 0, overrides = new Map(), redirects = new Map()) {
  const extraHeaders = parseHeaders(root);
  // Every raw request line this server was asked for, in order.
  //
  // It exists so a walk can assert what did NOT reach the wire. `/capture?text=`
  // is the documented entrance and the service worker strips the query before
  // fetching, so the only way to know that holds is to look from the server's
  // side — reading the worker's source would only prove the source says so.
  const seen = [];
  const server = createServer(async (req, res) => {
    seen.push(req.url ?? '');
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let path = decodeURIComponent(url.pathname);
      const to = redirects.get(path);
      if (to !== undefined) { res.writeHead(302, { location: to }).end(); return; }
      if (path.endsWith('/')) path += 'index.html';
      const override = overrides.get(path);
      if (override !== undefined) {
        res.writeHead(200, {
          'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
          ...extraHeaders,
        });
        res.end(override);
        return;
      }
      // normalize + prefix check: a static server must not serve its parent.
      const file = normalize(join(root, path));
      if (!file.startsWith(normalize(root))) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', ...extraHeaders });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server, overrides, redirects, seen,
        port: server.address().port,
        url: `http://127.0.0.1:${server.address().port}/`,
      });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { url } = await serve(new URL('../public', import.meta.url).pathname, Number(process.env.PORT) || 8787);
  console.log(`serving public/ at ${url}`);
}
