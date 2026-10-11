const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('header exposes Donate in desktop and mobile navigation', () => {
  const header = read('layouts/partials/header.html');
  const donateLinks = header.match(/href="https:\/\/givebutter\.com\/c_o_d_e" class="nav-link donate"/g) || [];

  assert.equal(donateLinks.length, 2);
  assert.match(header, /<nav class="nav-desktop">[\s\S]*givebutter\.com\/c_o_d_e/);
  assert.match(header, /<div class="mobile-nav-content">[\s\S]*givebutter\.com\/c_o_d_e/);
});

test('search page uses the generated Hugo index instead of stale static JSON', () => {
  const searchPage = read('content/pages/search/index.md');
  const searchTemplate = read('layouts/pages/search.html');

  assert.match(searchPage, /url:\s*"\/search\/"/);
  assert.match(searchTemplate, /index\.json/);
  assert.doesNotMatch(searchTemplate, /search\.json/);
  assert.equal(fs.existsSync(path.join(repoRoot, 'static', 'search.json')), false);
});

test('root-relative content image paths are normalized through relURL', () => {
  const listTemplate = read('layouts/_default/list.html');

  assert.match(listTemplate, /replaceRE "\^\/" "" \.Params\.image \| relURL/);
  assert.doesNotMatch(listTemplate, /src="{{ \.Params\.image }}"/);
});

test('homepage exposes the next hackathon countdown contract', () => {
  const homeTemplate = read('layouts/index.html');
  const baseTemplate = read('layouts/_default/baseof.html');
  const hackathonData = read('data/next_hackathon.yaml');

  assert.match(hackathonData, /title:\s*"GSD Hackathon"/);
  assert.match(hackathonData, /starts_at:\s*"2027-01-23T10:00:00-05:00"/);
  assert.match(hackathonData, /register_url:\s*"https:\/\/tbd-hackathon\.devpost\.com\/register/);
  assert.match(homeTemplate, /id="next-hackathon"/);
  assert.match(homeTemplate, /data-countdown-start="{{ \.starts_at }}"/);
  assert.match(homeTemplate, /data-countdown-end="{{ \.ends_at }}"/);
  assert.match(baseTemplate, /js\/countdown\.js/);
});

test('configured team photos either exist or intentionally use placeholders', () => {
  const teamData = read('data/team.yaml');
  const photoMatches = [...teamData.matchAll(/photo:\s*"([^"]*)"/g)];

  assert.ok(photoMatches.length > 0);
  for (const [, photo] of photoMatches) {
    if (!photo) continue;
    assert.ok(
      fs.existsSync(path.join(repoRoot, 'static', photo.replace(/^\//, ''))),
      `Missing team photo ${photo}`
    );
  }
});
