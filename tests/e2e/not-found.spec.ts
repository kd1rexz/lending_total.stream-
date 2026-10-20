import { test, expect } from '@playwright/test';

for (const width of [360, 1366]) {
  test(`branded 404 returns home without JavaScript at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    const response = await page.goto('/missing-page-t101');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('вне эфира');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'На главную', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await context.close();
  });
}

