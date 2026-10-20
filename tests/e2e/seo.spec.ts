import { test, expect } from '@playwright/test';

test('domainless preview stays closed and contains no fictional canonical URLs', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('link[rel="canonical"], meta[property="og:url"], script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', await page.title());
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('<urlset');
  expect(xml).not.toMatch(/<loc>|localhost|127\.0\.0\.1|404/);
  expect(await page.locator('h1').count()).toBe(1);
  await expect(page.locator('.site-footer__requisites')).toContainText('Исполнитель: XXXXX');
  await expect(page.locator('.site-footer__requisites a')).toHaveCount(0);
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
