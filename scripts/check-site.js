const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { parseArgs } = require('node:util');

const SITE_URL = 'https://code-philly-community.pages.dev/';
const VERIFICATION_FILE = 'googlecd79e637249597f6.html';
const MAX_FEED_AGE_MS = 36 * 60 * 60 * 1000;
const FEEDS = ['upcomingEvents', 'hackerNews', 'productHunt', 'phillyNews', 'githubTrending', 'aiPapers'];

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match && (match[1] ?? match[2] ?? match[3]);
}

async function checkSite({ directory, url, commit, now = Date.now() }) {
  assert.ok(Boolean(directory) !== Boolean(url), 'Supply exactly one of --dir or --url');
  const target = url ? new URL(url) : null;
  const warnings = [];

  async function read(relative, type, status = 200) {
    if (directory) {
      const filename = relative.endsWith('/') ? `${relative}index.html` : relative;
      return fs.readFile(path.join(directory, filename));
    }
    const response = await fetch(new URL(relative, target), { signal: AbortSignal.timeout(10_000) });
    assert.equal(new URL(response.url).origin, target.origin, `${relative} redirected to another host`);
    assert.equal(response.status, status, `${relative} HTTP status`);
    assert.match(response.headers.get('content-type') || '', type, `${relative} content type`);
    return Buffer.from(await response.arrayBuffer());
  }

  for (const relative of ['', 'about/', 'blog/', 'search/']) {
    const html = (await read(relative || 'index.html', /text\/html/)).toString();
    assert.match(html, /<html[\s>]/i, `${relative || '/'} HTML document`);
    const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) || [];
    const canonical = tags.find(tag => attribute(tag, 'rel') === 'canonical');
    const ogUrl = tags.find(tag => attribute(tag, 'property') === 'og:url');
    const ogImage = tags.find(tag => attribute(tag, 'property') === 'og:image');
    const ogTitle = tags.find(tag => attribute(tag, 'property') === 'og:title');
    assert.equal(canonical && attribute(canonical, 'href'), new URL(relative, SITE_URL).href, 'Canonical URL');
    assert.equal(ogUrl && attribute(ogUrl, 'content'), new URL(relative, SITE_URL).href, 'Preview URL');
    assert.equal(ogImage && attribute(ogImage, 'content'), new URL('media/logo.png', SITE_URL).href, 'Preview image');
    assert.match(ogTitle ? attribute(ogTitle, 'content') || '' : '', /C\.O\.D\.E/, 'Preview title identifies C.O.D.E');
  }

  const notFound = (await read(directory ? '404.html' : 'sre-probe-missing-page/', /text\/html/, 404)).toString();
  assert.match(notFound, /Page not found/i, 'Custom 404 page');
  if (url) await read('sre-probe-missing-asset.js', /text\/html/, 404);

  const verification = (await read(VERIFICATION_FILE, /text\/html|text\/plain/)).toString();
  assert.equal(verification, `google-site-verification: ${VERIFICATION_FILE}`, 'Google verification file');
  const sitemap = (await read('sitemap.xml', /xml/)).toString();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.ok(locations.length > 0, 'Sitemap has URLs');
  for (const location of locations) assert.equal(new URL(location).origin, new URL(SITE_URL).origin, 'Sitemap hostname');
  const robots = (await read('robots.txt', /text\/plain/)).toString();
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}sitemap.xml`), 'Robots sitemap URL');
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/mi, 'Robots must allow indexing');
  const search = JSON.parse((await read('index.json', /json/)).toString());
  assert.ok(Array.isArray(search) && search.some(item => item.type === 'blog'), 'Search index includes blog content');
  for (const item of search) {
    assert.equal(typeof item.url, 'string', 'Search result URL');
    assert.equal(new URL(item.url, SITE_URL).origin, new URL(SITE_URL).origin, 'Search result hostname');
  }

  const script = (await read('js/live-feeds-data.js', /javascript/)).toString();
  const assignment = script.match(/window\.LIVE_FEEDS\s*=\s*([\s\S]*);\s*$/);
  assert.ok(assignment, 'Feed data assignment');
  const data = JSON.parse(assignment[1]);
  const generatedAt = Date.parse(data.lastUpdated);
  assert.ok(Number.isFinite(generatedAt) && now - generatedAt <= MAX_FEED_AGE_MS && generatedAt <= now + 300_000, 'Feed snapshot is fresh (36 hours)');
  for (const name of FEEDS) {
    assert.ok(Array.isArray(data[name]), `${name} data array`);
    const source = data.sources?.[name];
    assert.ok(source && ['ok', 'error'].includes(source.status), `${name} source status`);
    if (source.status === 'ok') {
      const fetchedAt = Date.parse(source.lastSuccessAt);
      assert.ok(Number.isFinite(fetchedAt) && now - fetchedAt <= MAX_FEED_AGE_MS && fetchedAt <= now + 300_000, `${name} last successful fetch is fresh`);
    } else {
      assert.equal(source.lastSuccessAt, null, `${name} failed fetch must not claim success`);
      warnings.push(`${name} is unavailable`);
    }
  }
  assert.equal(data.sources.upcomingEvents.status, 'ok', 'Meetup must be fetched successfully; an empty calendar is valid');

  for (const [relative, type] of [['js/live-feeds.js', /javascript/], ['js/menu.js', /javascript/], ['css/modern.css', /text\/css/], ['media/logo.png', /image\/png/]]) {
    assert.ok((await read(relative, type)).length > 0, `${relative} is not empty`);
  }
  if (commit) {
    const deployment = JSON.parse((await read('deployment.json', /json/)).toString());
    assert.equal(deployment.commit, commit, 'Deployed commit');
    assert.equal(deployment.siteUrl, SITE_URL, 'Deployment target');
  }
  return warnings;
}

if (require.main === module) {
  const { values } = parseArgs({ options: { dir: { type: 'string' }, url: { type: 'string' }, commit: { type: 'string' } } });
  checkSite({ directory: values.dir, url: values.url, commit: values.commit }).then(warnings => {
    for (const warning of warnings) console.warn(`Warning: ${warning}`);
    console.log(`Site checks passed: ${values.dir || values.url}`);
  }).catch(error => {
    console.error(`Site check failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { checkSite, SITE_URL };
