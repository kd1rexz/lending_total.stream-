import { test, expect } from '@playwright/test';

for (const width of [390, 1366]) {
  test(`header hides down and returns up away from the hero at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
    const header = page.locator('[data-site-header]');
    await expect(header).toHaveAttribute('data-scroll-header', '');
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.evaluate(() => scrollTo(0, 1500));
    await expect(header).toHaveAttribute('data-header-hidden', '');
    await expect(header).toHaveCSS('visibility', 'hidden');
    await expect(header).toHaveCSS('opacity', '1');
    await page.evaluate(() => scrollTo(0, 1450));
    await expect(header).not.toHaveAttribute('data-header-hidden', '');
    await expect(header).toHaveCSS('opacity', '1');
    await expect(header).toHaveCSS('transform', 'none');
    expect((await header.boundingBox())!.y).toBeCloseTo(0, 0);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect(header).toHaveCSS('background-color', 'rgba(20, 21, 23, 0.94)');
    await expect(header).toHaveCSS('transition-duration', '0.3s, 0.3s');
    await page.evaluate(() => scrollTo(0, 120));
    await expect(header).not.toHaveAttribute('data-over-content', '');
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    if (width < 1024) {
      await page.getByRole('button', { name: 'Меню', exact: true }).click();
      await expect(page.locator('[data-navigation]')).toHaveCSS('background-color', 'rgba(20, 21, 23, 0.16)');
      await page.evaluate(() => scrollTo(0, 1700));
      await expect(header).not.toHaveAttribute('data-header-hidden', '');
      await expect(page.locator('[data-navigation]')).toBeVisible();
      await expect(page.locator('[data-navigation]')).toHaveCSS('background-color', 'rgba(20, 21, 23, 0.94)');
      await page.evaluate(() => scrollTo(0, 0));
      await expect(page.locator('[data-navigation]')).toHaveCSS('background-color', 'rgba(20, 21, 23, 0.16)');
    }
  });
}
