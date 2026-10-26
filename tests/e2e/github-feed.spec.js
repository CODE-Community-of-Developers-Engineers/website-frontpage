const { test, expect } = require('@playwright/test');

test('GitHub cards keep feed text literal and restrict link protocols', async ({ page }) => {
  const name = 'example/<img src=x onerror="window.githubFeedInjected=true">';
  const description = '<svg onload="window.githubFeedInjected=true">Description</svg>';
  const language = 'JS"><img src=x onerror="window.githubFeedInjected=true">';
  const quotedUrl = 'https://github.com/example/repo?q=" onmouseover="window.githubFeedInjected=true';
  const normalUrl = 'https://github.com/example/normal';
  const now = new Date().toISOString();
  const feeds = {
    lastUpdated: now,
    sources: { githubTrending: { status: 'ok', lastSuccessAt: now } },
    githubTrending: [
      { name, description, language, stars: 1500, todayStars: 0, url: quotedUrl },
      { name: 'Unsafe link', description: 'No daily metric', language: 'JavaScript', stars: 12, url: 'javascript:window.githubFeedInjected=true' },
      { name: 'example/normal', description: 'Normal link', language: 'Python', stars: 50, url: normalUrl }
    ]
  };
  await page.route('**/js/live-feeds-data.js*', route => route.fulfill({
    contentType: 'text/javascript', body: `window.LIVE_FEEDS = ${JSON.stringify(feeds)};`
  }));
  await page.goto('./');

  const feed = page.locator('#feed-github-trending');
  const cards = feed.locator('a.feed-item');
  await expect(cards).toHaveCount(3);
  await expect(cards.first().locator('.feed-item-title')).toHaveText(name);
  await expect(cards.first().locator('.feed-item-desc')).toHaveText(description);
  await expect(cards.first().locator('.feed-item-lang')).toHaveText(language);
  await expect(cards.first().locator('.lang-dot')).toHaveAttribute('class', /^lang-dot lang-[a-z0-9_-]+$/);
  await expect(cards.first()).toHaveAttribute('href', quotedUrl);
  await expect(cards.first()).toHaveAttribute('target', '_blank');
  await expect(cards.first()).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(cards.first().locator('.feed-item-meta')).toContainText('1.5k');
  await expect(cards.first().locator('.fa-star')).toHaveCount(1);
  await expect(cards.first().locator('.feed-item-today')).toHaveText('+0 today');
  await expect(cards.nth(1)).toHaveAttribute('href', '#');
  await expect(cards.nth(1).locator('.feed-item-today')).toHaveCount(0);
  await expect(cards.nth(2)).toHaveAttribute('href', normalUrl);
  await expect(cards.nth(2).locator('.feed-item-today')).toHaveCount(0);
  await expect(feed.locator('img, svg, script, [onclick], [onmouseover], [onerror], [onload]')).toHaveCount(0);
  await cards.first().hover();
  expect(await page.evaluate(() => window.githubFeedInjected)).toBeUndefined();
});
