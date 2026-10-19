import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('CTA follows the cursor subtly while preserving light and arrow motion', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('[data-project-cta]');
  const rect = await root.boundingBox();
  if (!rect) throw new Error('Missing CTA');
  await page.mouse.move(rect.x + rect.width * 0.25, rect.y + rect.height / 2);
  await expect
    .poll(() => page.locator('.project-cta__arrow').evaluate((e) => getComputedStyle(e).rotate))
    .toBe('45deg');
  await expect.poll(() => root.evaluate(e => parseFloat(e.style.getPropertyValue('--magnet-x')))).toBeLessThan(-2);
  expect(await root.evaluate(e => Math.abs(parseFloat(e.style.getPropertyValue('--magnet-x'))))).toBeLessThan(6.5);
  const firstLight = await root.evaluate((e) => parseFloat(e.style.getPropertyValue('--light-x')));
  await page.mouse.move(rect.x + rect.width * 0.75, rect.y + rect.height / 2);
  await expect.poll(() => root.evaluate(e => parseFloat(e.style.getPropertyValue('--magnet-x')))).toBeGreaterThan(2);
  expect(await root.evaluate(e => Math.abs(parseFloat(e.style.getPropertyValue('--magnet-x'))))).toBeLessThan(6.5);
  expect(
    await root.evaluate((e) => parseFloat(e.style.getPropertyValue('--light-x'))),
  ).toBeGreaterThan(firstLight + 40);
  await expect
    .poll(() =>
      page.locator('.project-cta__link').evaluate((e) => getComputedStyle(e, '::before').opacity),
    )
    .toBe('1');
  await page.mouse.move(rect.x + rect.width + 50, rect.y - 50);
  await expect.poll(() => root.evaluate(e => e.style.getPropertyValue('--magnet-x'))).toBe('0.000px');
  await expect
    .poll(() => page.locator('.project-cta__arrow').evaluate((e) => getComputedStyle(e).rotate))
    .toBe('0deg');
});

test('CTA compresses on press, links to contacts and passes a scoped accessibility audit', async ({
  page,
}) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Обсудить проект', exact: true });
  await expect(link).toHaveCount(1);
  const audit = await new AxeBuilder({ page })
    .include('.project-cta')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await link.hover();
  await page.mouse.down();
  await expect.poll(() => link.evaluate(e => e.getAnimations().some(a => a.playState === 'finished' && a.effect?.getTiming().fill === 'forwards'))).toBe(true);
  await expect(link).toHaveCSS('scale', '0.97');
  await page.mouse.up();
  await expect(page).toHaveURL(/#contacts$/);
});

test('reduced motion leaves the CTA stationary without transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const link = page.locator('.project-cta__link');
  await link.hover({ position: { x: 30, y: 20 } });
  await expect(link).toHaveCSS('transform', 'none');
  await expect(link).toHaveCSS('transition-duration', '0s');
});

test.describe('CTA without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('keyboard activation still reaches contacts', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Обсудить проект', exact: true });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#contacts$/);
  });
});
