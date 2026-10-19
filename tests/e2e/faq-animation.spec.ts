import { test, expect } from '@playwright/test';
test('FAQ rotates plus, animates both directions and survives fast reversals', async ({ page }) => {
  await page.goto('/');
  const item = page.locator('.faq__item').first();
  const summary = item.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  const closed = await item.evaluate((e) => e.getBoundingClientRect().height);
  await summary.click();
  await expect(item).toHaveAttribute('open', '');
  await expect
    .poll(() => item.locator('.faq__icon').evaluate((e) => getComputedStyle(e).transform))
    .toBe('matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)');
  const opened = await item.evaluate((e) => e.getBoundingClientRect().height);
  expect(opened).toBeGreaterThan(closed + 20);
  await summary.click();
  await page.waitForTimeout(100);
  expect(await item.evaluate((e) => e.getBoundingClientRect().height)).toBeGreaterThan(closed);
  await summary.click();
  await summary.click();
  await expect(item).not.toHaveAttribute('open', '');
  await expect
    .poll(() => item.evaluate((e) => e.getBoundingClientRect().height))
    .toBeCloseTo(closed, 0);
  await expect(item).not.toHaveAttribute('style', /height/);
});
test('FAQ keyboard and reduced motion still toggle natively', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const item = page.locator('.faq__item').first();
  await item.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(item).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(item).not.toHaveAttribute('open', '');
});
