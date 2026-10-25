const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { checkSite, SITE_URL } = require('../../scripts/check-site');

const now = Date.parse('2026-10-25T12:00:00Z');
const timestamp = new Date(now).toISOString();

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'site-check-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const files = {
    '404.html': '<h1>Page not found</h1>',
    'googlecd79e637249597f6.html': 'google-site-verification: googlecd79e637249597f6.html',
    'sitemap.xml': `<urlset><url><loc>${SITE_URL}</loc></url></urlset>`,
    'robots.txt': `User-agent: *\nSitemap: ${SITE_URL}sitemap.xml`,
    'index.json': JSON.stringify([{ type: 'blog', title: 'Hello', url: '/blog/hello/' }]),
    'js/live-feeds.js': '/* renderer */',
    'js/menu.js': '/* navigation */',
    'css/modern.css': 'body { margin: 0; }',
    'media/logo.png': 'fixture image',
    'deployment.json': JSON.stringify({ commit: 'abc123', siteUrl: SITE_URL })
  };
  const data = { lastUpdated: timestamp, sources: {} };
  for (const name of ['upcomingEvents', 'hackerNews', 'productHunt', 'phillyNews', 'githubTrending', 'aiPapers']) {
    data[name] = [];
    data.sources[name] = { status: 'ok', lastSuccessAt: timestamp };
  }
  files['js/live-feeds-data.js'] = `window.LIVE_FEEDS = ${JSON.stringify(data)};`;
  for (const relative of ['', 'about/', 'blog/', 'search/']) {
    files[`${relative}index.html`] = `<html><head><link rel=canonical href=${SITE_URL}${relative}><meta property=og:url content=${SITE_URL}${relative}><meta property="og:image" content="${SITE_URL}media/logo.png"><meta property="og:title" content="C.O.D.E community"></head><body>Site</body></html>`;
  }
  for (const [filename, content] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(directory, filename)), { recursive: true });
    await fs.writeFile(path.join(directory, filename), content);
  }
  return { directory, files, data };
}

test('accepts a healthy artifact with a genuinely empty calendar and checks release identity', async t => {
  const { directory } = await fixture(t);
  assert.deepEqual(await checkSite({ directory, now, commit: 'abc123' }), []);
  await assert.rejects(checkSite({ directory, now, commit: 'different' }), /Deployed commit/);
});

test('rejects missing 404, wrong hostname, blocked robots and expired feed data', async t => {
  const { directory, files } = await fixture(t);
  for (const [filename, badContent, expectedError] of [
    ['404.html', 'Not the expected page', /Custom 404/],
    ['index.html', files['index.html'].replaceAll(SITE_URL, 'https://retired.example/'), /Canonical URL/],
    ['sitemap.xml', '<urlset><loc>https://retired.example/</loc></urlset>', /Sitemap hostname/],
    ['robots.txt', `${files['robots.txt']}\nDisallow: /`, /Robots must allow/],
    ['js/live-feeds-data.js', files['js/live-feeds-data.js'].replaceAll(timestamp, '2020-01-01T00:00:00Z'), /snapshot is fresh/]
  ]) {
    await fs.writeFile(path.join(directory, filename), badContent);
    await assert.rejects(checkSite({ directory, now }), expectedError);
    await fs.writeFile(path.join(directory, filename), files[filename]);
  }
  await fs.unlink(path.join(directory, '404.html'));
  await assert.rejects(checkSite({ directory, now }), /ENOENT/);
});

test('reports optional feed failure but blocks failed Meetup or a false success timestamp', async t => {
  const { directory, data } = await fixture(t);
  const writeFeeds = () => fs.writeFile(path.join(directory, 'js/live-feeds-data.js'), `window.LIVE_FEEDS = ${JSON.stringify(data)};`);
  data.sources.hackerNews = { status: 'error', lastSuccessAt: null };
  await writeFeeds();
  assert.deepEqual(await checkSite({ directory, now }), ['hackerNews is unavailable']);
  data.sources.upcomingEvents = { status: 'error', lastSuccessAt: null };
  await writeFeeds();
  await assert.rejects(checkSite({ directory, now }), /Meetup must be fetched/);
  data.sources.upcomingEvents = { status: 'error', lastSuccessAt: timestamp };
  await writeFeeds();
  await assert.rejects(checkSite({ directory, now }), /failed fetch must not claim success/);
});

test('deployed checks detect a soft 404 and wrong asset MIME types', async t => {
  const { files } = await fixture(t);
  let soft404 = false;
  let badMime = false;
  const server = http.createServer((req, res) => {
    const filename = req.url.endsWith('/') ? `${req.url.slice(1)}index.html` : req.url.slice(1);
    const content = files[filename];
    if (content === undefined) {
      res.writeHead(soft404 ? 200 : 404, { 'content-type': 'text/html' });
      res.end(soft404 ? files['index.html'] : files['404.html']);
      return;
    }
    const types = { '.html': 'text/html', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' };
    res.writeHead(200, { 'content-type': badMime && filename === 'js/menu.js' ? 'text/html' : types[path.extname(filename)] });
    res.end(content);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}/`;
  assert.deepEqual(await checkSite({ url, now }), []);
  soft404 = true;
  await assert.rejects(checkSite({ url, now }), /HTTP status/);
  soft404 = false;
  badMime = true;
  await assert.rejects(checkSite({ url, now }), /content type/);
});
