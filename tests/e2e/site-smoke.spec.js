const { test, expect } = require('@playwright/test');

test('homepage exposes critical calls to action and assets', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: /Philadelphia's community/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Join us on Meetup/i }).first()).toHaveAttribute(
    'href',
    'https://www.meetup.com/code-coffee-philly/'
  );
  await expect(page.getByRole('link', { name: /Donate/i }).first()).toHaveAttribute(
    'href',
    'https://givebutter.com/c_o_d_e'
  );
  await expect(page.locator('#next-hackathon')).toContainText(/TIME TO NEXT HACKATHON/i);
  const eventImage = page.locator('img[src*="/images/events/"]').first();
  await expect(eventImage).toBeVisible();
  await expect.poll(() => eventImage.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
});

test('mobile navigation opens, exposes links, and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const mobileNav = page.locator('#mobile-nav');
  await expect(mobileNav).not.toHaveClass(/active/);

  await page.getByRole('button', { name: /toggle menu/i }).click();
  await expect(mobileNav).toHaveClass(/active/);
  await expect(mobileNav.getByRole('link', { name: 'Donate' })).toHaveAttribute(
    'href',
    'https://givebutter.com/c_o_d_e'
  );

  await mobileNav.getByRole('link', { name: 'Events' }).click();
  await expect(mobileNav).not.toHaveClass(/active/);
  await expect(page.locator('#events')).toBeVisible();
});

test('search page loads generated search index', async ({ page }) => {
  const indexResponsePromise = page.waitForResponse(response =>
    response.url().endsWith('/index.json')
  );

  await page.goto('./search/');

  await expect(page.getByRole('heading', { name: 'Search', exact: true })).toBeVisible();
  const response = await indexResponsePromise;
  expect(response.ok()).toBe(true);

  const searchIndex = await response.json();
  expect(searchIndex.some(item => item.type === 'blog')).toBe(true);
  expect(searchIndex.every(item => item.url.startsWith('/website-frontpage/'))).toBe(true);

  const blogItem = searchIndex.find(item => item.type === 'blog');
  expect(blogItem).toBeTruthy();

  await page.locator('#search-input').fill(blogItem.title);
  await expect(
    page.locator('.search-result').filter({ hasText: blogItem.title }).first()
  ).toBeVisible();
});

test('blog page uses project-relative image paths', async ({ page }) => {
  await page.goto('./blog/');

  await expect(page.getByRole('heading', { name: /Media/i })).toBeVisible();
  const coverImages = page.locator('img[src*="/website-frontpage/images/"], img[src*="/website-frontpage/blog/"]');
  await expect(coverImages.first()).toBeVisible();
  await expect.poll(() => coverImages.first().evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  const rootRelativeImageCount = await page.locator('img[src^="/images/"]').count();
  expect(rootRelativeImageCount).toBe(0);
});
