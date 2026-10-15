import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test('service examples open in place, dismiss and return keyboard focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const triggers = page.getByRole('button', { name: /^Смотреть примеры:/ });
  await expect(triggers).toHaveCount(4);
  const url = page.url();
  for (const trigger of await triggers.all()) {
    const title = (await trigger.getAttribute('aria-label'))!.replace('Смотреть примеры: ', '');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Примеры скоро появятся');
    await expect(dialog.getByRole('button', { name: 'Закрыть примеры' })).toBeFocused();
    const scroll = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    const tab = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
    await page.keyboard.press(tab);
    expect(
      await page.evaluate(() => {
        const active = document.activeElement;
        return active === document.body || !!active?.closest('dialog[open]');
      }),
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page).toHaveURL(url);
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  }

  await triggers.first().click();
  await page.getByRole('button', { name: 'Закрыть примеры' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(triggers.first()).toBeFocused();
  await triggers.first().click();
  await page.mouse.click(2, 2);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(triggers.first()).toBeFocused();
});

for (const width of [360, 1440]) {
  test(`service dialog fits viewport and passes automated accessibility at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page
      .getByRole('button', { name: /^Смотреть примеры:/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    const dimensions = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        scroll: element.scrollWidth,
        client: element.clientWidth,
      };
    });
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(width);
    expect(dimensions.top).toBeGreaterThanOrEqual(0);
    expect(dimensions.bottom).toBeLessThanOrEqual(800);
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    await mkdir('output/qa/T16', { recursive: true });
    await page.screenshot({ path: `output/qa/T16/${testInfo.project.name}-dialog-${width}.png` });
  });
}

test.describe('service examples without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  test('examples remain accessible inline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Смотреть примеры:/ })).toHaveCount(0);
    const details = page.locator('[data-examples-fallback]').first();
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
    await expect(details.getByText('Примеры скоро появятся', { exact: true })).toBeVisible();
    await details.locator('summary').click();
    await expect(details).not.toHaveAttribute('open', '');
  });
});
