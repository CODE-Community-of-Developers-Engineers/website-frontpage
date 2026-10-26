const { test, expect } = require('@playwright/test');

const searchItem = {
  title: 'Community guide', url: '/about/', type: 'page', author: 'C.O.D.E',
  readingTime: 2, description: 'Meet the community', topic: 'community', tags: []
};

test('search reports a fetch failure and retries the latest query', async ({ page }) => {
  let attempts = 0;
  await page.route('**/index.json', route => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 503, body: 'Unavailable' })
      : route.fulfill({ json: [searchItem] });
  });
  await page.goto('./search/');
  await expect(page.locator('#search-results')).toContainText('Search is temporarily unavailable');
  await page.locator('#search-input').fill('Community');
  await expect(page.getByRole('heading', { name: 'No results found' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry search' }).click();
  await expect(page.locator('.search-result-title')).toHaveText('Community guide');
  await page.locator('#search-input').fill('does-not-exist');
  await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();
});

test('delayed search uses the current query and restores the content summary', async ({ page }) => {
  let releaseIndex;
  const indexReady = new Promise(resolve => { releaseIndex = resolve; });
  await page.route('**/index.json', async route => {
    await indexReady;
    await route.fulfill({ json: [searchItem] });
  });
  await page.goto('./search/');
  await page.locator('#search-input').fill('old query');
  await page.locator('#search-input').fill('Community');
  await expect(page.locator('#search-results')).toHaveText('Loading search…');
  releaseIndex();
  await expect(page.locator('.search-result-title')).toHaveText('Community guide');
  await page.locator('#search-input').fill('');
  await expect(page.locator('#content-summary > div').nth(1)).toContainText(/1\s*Pages/);
});

test('community quick filter includes tagged press posts while typing', async ({ page }) => {
  const pressItem = { ...searchItem, title: 'Builders in the news', topic: 'press', tags: ['community'] };
  await page.route('**/index.json', route => route.fulfill({ json: [pressItem, {
    ...searchItem, title: 'Unrelated builders', topic: 'tutorial', tags: []
  }] }));
  await page.goto('./search/');
  await page.getByRole('button', { name: 'Community', exact: true }).click();
  await expect(page.locator('.search-result-title')).toHaveText('Builders in the news');
  await page.locator('#search-input').fill('Builders');
  await expect(page.locator('.search-result-title')).toHaveText('Builders in the news');
});

test('search stops waiting when its index request hangs', async ({ page }) => {
  await page.clock.install();
  await page.route('**/index.json', () => {});
  await page.goto('./search/');
  await expect(page.locator('#search-results')).toHaveText('Loading search…');
  await page.clock.fastForward(10001);
  await expect(page.getByRole('button', { name: 'Retry search' })).toBeVisible();
});

test('search reports invalid index data as unavailable', async ({ page }) => {
  await page.route('**/index.json', route => route.fulfill({ json: { error: 'invalid index' } }));
  await page.goto('./search/');
  await expect(page.locator('#search-results')).toContainText('Search is temporarily unavailable');
  await expect(page.getByRole('heading', { name: 'No results found' })).toHaveCount(0);
});

test('search treats result metadata as text and uses normal links', async ({ page }) => {
  const title = 'Community <img src=x onerror="window.searchInjected=true">';
  await page.route('**/index.json', route => route.fulfill({ json: [{
    ...searchItem, title, url: "/about/?q='literal'", tags: ['<script>bad()</script>']
  }] }));
  await page.goto('./search/');
  await page.locator('#search-input').fill('Community');
  await expect(page.locator('.search-result-title')).toHaveText(title);
  await expect(page.locator('.search-result-title')).toHaveAttribute('href', /\/about\/\?q='literal'$/);
  await expect(page.locator('.search-result-title')).not.toHaveAttribute('onclick');
  await expect(page.locator('.search-result img, .search-result script')).toHaveCount(0);
  await expect(page.locator('.search-result-tag')).toHaveText('<script>bad()</script>');
  await expect(page.locator('.search-result-badge-featured')).toHaveCount(0);
  expect(await page.evaluate(() => window.searchInjected)).toBeUndefined();
});

test('missing feed data stops showing loading placeholders', async ({ page }) => {
  await page.route('**/js/live-feeds-data.js*', route => route.abort());
  await page.goto('./');
  await expect(page.locator('#feed-hacker-news')).toBeVisible();
  await expect(page.locator('#feed-hacker-news')).toContainText('temporarily unavailable');
  await expect(page.locator('#feed-upcoming-events')).toContainText('temporarily unavailable');
  await expect(page.locator('#feeds-last-updated')).toHaveText('Feeds are temporarily unavailable.');
  await expect(page.locator('.feed-column-body').filter({ hasText: 'Loading...' })).toHaveCount(0);
});

test('feeds distinguish failed and stale sources, expire events, and omit invented daily stars', async ({ page }) => {
  const now = Date.now();
  const keys = ['upcomingEvents', 'hackerNews', 'productHunt', 'phillyNews', 'githubTrending', 'aiPapers'];
  const feeds = {
    lastUpdated: new Date(now).toISOString(),
    sources: Object.fromEntries(keys.map(key => [key, { status: 'ok', lastSuccessAt: new Date(now).toISOString() }])),
    upcomingEvents: [-1, 1].map(offset => ({
      name: offset < 0 ? 'Expired session' : 'Future session',
      date: new Date(now + offset * 86400000).toISOString(),
      url: 'https://www.meetup.com/code-coffee-philly/', location: 'Philadelphia'
    })),
    hackerNews: [], productHunt: [], phillyNews: [], aiPapers: [],
    githubTrending: [
      { name: 'example/total-only', stars: 150, description: 'Total stars', language: 'JavaScript', url: 'https://github.com/example/total-only' },
      { name: 'example/daily', stars: 50, todayStars: 0, description: 'Daily metric present', language: 'JavaScript', url: 'https://github.com/example/daily' }
    ]
  };
  feeds.sources.hackerNews = { status: 'error', lastSuccessAt: null };
  feeds.sources.aiPapers.lastSuccessAt = new Date(now - 37 * 3600000).toISOString();
  await page.route('**/js/live-feeds-data.js*', route => route.fulfill({
    contentType: 'text/javascript', body: `window.LIVE_FEEDS = ${JSON.stringify(feeds)};`
  }));
  await page.goto('./');
  await expect(page.locator('#feed-hacker-news')).toBeVisible();
  await expect(page.locator('#feed-hacker-news')).toContainText('temporarily unavailable');
  await expect(page.locator('#feed-ai-papers')).toContainText('may be out of date');
  await expect(page.locator('#feed-philly-news')).toHaveText('No items are currently listed.');
  await expect(page.locator('#feed-upcoming-events')).toContainText('Future session');
  await expect(page.locator('#feed-upcoming-events')).not.toContainText('Expired session');
  await expect(page.locator('.feed-item').filter({ hasText: 'example/total-only' })).not.toContainText('today');
  await expect(page.locator('.feed-item').filter({ hasText: 'example/daily' })).toContainText('+0 today');
  await expect(page.locator('#feeds-last-updated')).toContainText('Last checked');
});


test('an event snapshot containing only past events offers the current Meetup schedule', async ({ page }) => {
  const feeds = {
    lastUpdated: new Date().toISOString(),
    sources: { upcomingEvents: { status: 'ok', lastSuccessAt: new Date().toISOString() } },
    upcomingEvents: [{ name: 'Past event', date: '2000-01-01T12:00:00Z' }]
  };
  await page.route('**/js/live-feeds-data.js*', route => route.fulfill({
    contentType: 'text/javascript', body: `window.LIVE_FEEDS = ${JSON.stringify(feeds)};`
  }));
  await page.goto('./');
  await expect(page.locator('#feed-upcoming-events')).toHaveText('No upcoming events listed. Check Meetup for the latest schedule.');
  await expect(page.getByRole('link', { name: 'View all on Meetup' })).toBeVisible();
});
