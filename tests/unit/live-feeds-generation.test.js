const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const { fetchUrl, generateLiveFeeds, parseMeetupEventsPage, fetchGithubTrending } = require('../../scripts/generate-live-feeds');

function outputFile(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'live-feeds-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'live-feeds-data.js');
  fs.writeFileSync(file, 'previous healthy feed');
  return file;
}

async function serverUrl(t, handler) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    server.closeAllConnections();
    return new Promise(resolve => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

function meetupPage(state) {
  return `<script id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: { __APOLLO_STATE__: state } } })}</script>`;
}

test('all exhausted upstream requests preserve the previous output', async t => {
  const file = outputFile(t);
  await assert.rejects(generateLiveFeeds({ outputFile: file, request: async () => { throw new Error('upstream unavailable'); } }), /All live feed sources failed/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'previous healthy feed');
});

test('HTTP 200 error pages are failed sources, not successful empty feeds', async t => {
  const file = outputFile(t);
  await assert.rejects(generateLiveFeeds({ outputFile: file, request: async () => '<html>challenge</html>' }), /All live feed sources failed/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'previous healthy feed');
});

test('a valid response with no upcoming events succeeds while other sources report errors', async t => {
  const file = outputFile(t);
  const feeds = await generateLiveFeeds({ outputFile: file, request: async url => {
    if (url.includes('meetup.com')) return meetupPage({
      'Event:1': { __typename: 'Event', status: 'ACTIVE', id: '1', title: 'Past event', dateTime: '2000-01-01T00:00:00Z' }
    });
    throw new Error('upstream unavailable');
  } });
  assert.deepEqual(feeds.upcomingEvents, []);
  assert.deepEqual(feeds.sources.upcomingEvents, { status: 'ok', lastSuccessAt: feeds.lastUpdated });
  for (const name of ['hackerNews', 'productHunt', 'phillyNews', 'githubTrending', 'aiPapers']) {
    assert.deepEqual(feeds.sources[name], { status: 'error', lastSuccessAt: null });
    assert.deepEqual(feeds[name], []);
  }
  assert.match(fs.readFileSync(file, 'utf8'), /window.LIVE_FEEDS = /);
});

test('missing Meetup structure or invalid event dates are parser failures', () => {
  assert.throws(() => parseMeetupEventsPage('<html></html>'), /Missing __NEXT_DATA__/);
  assert.throws(() => parseMeetupEventsPage('<script id="__NEXT_DATA__">{}</script>'), /Missing __APOLLO_STATE__/);
  assert.throws(() => parseMeetupEventsPage(meetupPage({
    'Event:1': { __typename: 'Event', status: 'ACTIVE', id: '1', title: 'Missing date' }
  })), /Invalid time/);
  assert.deepEqual(parseMeetupEventsPage(meetupPage({})), []);
});

test('exhausted HN item failures and malformed XML entries are reported separately from valid empty feeds', async t => {
  const file = outputFile(t);
  const feeds = await generateLiveFeeds({ outputFile: file, request: async url => {
    if (url.includes('meetup.com')) return meetupPage({});
    if (url.includes('topstories.json')) return '[1]';
    if (url.includes('/item/')) return 'null';
    if (url.includes('producthunt.com')) return '<feed><entry><title>Broken</title></feed>';
    if (url.includes('arxiv.org')) return '<feed><entry><title>Missing ID</title></entry></feed>';
    if (url.includes('news.google.com')) return '<rss><channel></channel></rss>';
    throw new Error('fallback unavailable');
  } });
  assert.equal(feeds.sources.hackerNews.status, 'error');
  assert.equal(feeds.sources.productHunt.status, 'error');
  assert.equal(feeds.sources.aiPapers.status, 'error');
  assert.equal(feeds.sources.phillyNews.status, 'ok');
  assert.deepEqual(feeds.phillyNews, []);
});

test('GitHub Search fallback does not invent stars earned today', async () => {
  const repos = await fetchGithubTrending(5, async url => {
    if (url.includes('github.com/trending')) throw new Error('trending unavailable');
    return JSON.stringify({ items: [{ full_name: 'example/repo', html_url: 'https://github.com/example/repo', stargazers_count: 1200 }] });
  });
  assert.equal(repos[0].stars, 1200);
  assert.equal(Object.hasOwn(repos[0], 'todayStars'), false);
});

test('GitHub HTML omits missing daily stars and keeps explicitly reported zero', async () => {
  const html = '<article><h2><a href="/example/repo">repo</a></h2></article>';
  const [missing] = await fetchGithubTrending(5, async () => html);
  const [zero] = await fetchGithubTrending(5, async () => html.replace('</article>', '<span>0 stars today</span></article>'));
  assert.equal(Object.hasOwn(missing, 'todayStars'), false);
  assert.equal(zero.todayStars, 0);
});

test('relative redirects resolve against the current URL', async t => {
  const base = await serverUrl(t, (req, res) => {
    if (req.url === '/path/start') res.writeHead(302, { location: '../done' }).end();
    else if (req.url === '/done') res.end('complete');
    else res.writeHead(404).end();
  });
  assert.equal(await fetchUrl(`${base}/path/start`), 'complete');
});

test('redirect loops stop after five hops without resetting the retry budget', async t => {
  let calls = 0;
  const base = await serverUrl(t, (req, res) => { calls++; res.writeHead(302, { location: '/loop' }).end(); });
  await assert.rejects(fetchUrl(`${base}/loop`), /Too many redirects/);
  assert.equal(calls, 6);
});

for (const status of [429, 503]) {
  test(`HTTP ${status} retries once and recovers`, async t => {
    let calls = 0;
    const base = await serverUrl(t, (req, res) => {
      if (++calls === 1) res.writeHead(status, { 'retry-after': '0' }).end();
      else res.end('recovered');
    });
    assert.equal(await fetchUrl(base), 'recovered');
    assert.equal(calls, 2);
  });
}

test('permanent HTTP failures are not retried', async t => {
  let calls = 0;
  const base = await serverUrl(t, (req, res) => { calls++; res.writeHead(404).end(); });
  await assert.rejects(fetchUrl(base), /HTTP 404/);
  assert.equal(calls, 1);
});

test('Retry-After beyond the deadline fails without retrying too early', async t => {
  let calls = 0;
  const base = await serverUrl(t, (req, res) => { calls++; res.writeHead(429, { 'retry-after': '60' }).end(); });
  await assert.rejects(fetchUrl(base, 2, 500), /HTTP 429/);
  assert.equal(calls, 1);
});

test('a continuously streaming response still reaches the overall deadline', async t => {
  const base = await serverUrl(t, (req, res) => {
    res.writeHead(200);
    const timer = setInterval(() => res.write('chunk'), 10);
    res.on('close', () => clearInterval(timer));
  });
  const started = Date.now();
  await assert.rejects(fetchUrl(base, 2, 100), /deadline exceeded/);
  assert.ok(Date.now() - started < 1000);
});

test('redirects and retries share the original deadline', async t => {
  let calls = 0;
  const base = await serverUrl(t, (req, res) => {
    calls++;
    if (calls === 1) res.writeHead(503).end();
    else if (req.url === '/start') res.writeHead(302, { location: '/slow' }).end();
    else res.write('never complete');
  });
  const started = Date.now();
  await assert.rejects(fetchUrl(`${base}/start`, 2, 400), /deadline exceeded/);
  assert.equal(calls, 3);
  assert.ok(Date.now() - started < 1000);
});

test('truncated responses fail after the bounded retry', async t => {
  let calls = 0;
  const base = await serverUrl(t, (req, res) => {
    calls++;
    res.writeHead(200, { 'content-length': '100' });
    res.write('partial');
    setImmediate(() => res.destroy());
  });
  await assert.rejects(fetchUrl(base), /aborted|socket hang up/);
  assert.equal(calls, 2);
});
