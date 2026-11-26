const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`article Discord invitations work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('./blog/example-tech-tutorial/');
    const blocks = page.locator('article > .article-join');
    await expect(blocks).toHaveCount(2);
    await expect(blocks.first()).toBeInViewport();
    const links = blocks.getByRole('link', { name: 'Join the C.O.D.E. Discord' });
    for (let index = 0; index < 2; index++) {
      await expect(links.nth(index)).toHaveAttribute('href', 'https://discord.gg/ts75yERD5q');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    // Keep the browser on the article while exercising the real click listener and tag queue.
    await page.evaluate(() => window.addEventListener('click', event => event.preventDefault(), true));
    for (let index = 0; index < 2; index++) {
      await links.nth(index).click();
      await expect.poll(() => page.evaluate(() => window.dataLayer.filter(entry =>
        entry[0] === 'event' && entry[1] === 'conversion' &&
        entry[2].send_to === 'AW-18553752846/mTX5CLzJz7EdEI6aj49F'
      ).length)).toBe(index + 1);
    }
  });
}

test('Luma RSVP uses the existing conversion while the privacy link does not', async ({ page }) => {
  await page.goto('./');
  const link = page.getByRole('link', { name: 'RSVP on Luma', exact: true });
  await expect(link).toHaveAttribute('href', 'https://luma.com/code-philly');
  await page.evaluate(() => window.addEventListener('click', event => event.preventDefault(), true));
  await link.click();
  await expect.poll(() => page.evaluate(() => window.dataLayer.filter(entry =>
    entry[0] === 'event' && entry[1] === 'conversion' &&
    entry[2].send_to === 'AW-18553752846/mTX5CLzJz7EdEI6aj49F'
  ).length)).toBe(1);

  await page.goto('./privacy/');
  await page.evaluate(() => window.addEventListener('click', event => event.preventDefault(), true));
  await page.getByRole('link', { name: 'Luma', exact: true }).click();
  expect(await page.evaluate(() => window.dataLayer.filter(entry =>
    entry[0] === 'event' && entry[1] === 'conversion'
  ).length)).toBe(0);
});
