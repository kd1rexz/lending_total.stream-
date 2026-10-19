import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [390, 1440]) {
  test(`selected contact design stacks three channels at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await expect(page.locator('#contacts .contact-variant')).toHaveCount(1);
    await expect(
      page.locator(
        '#contacts .variant-label, #contacts .channel__action, #contacts .choice-channel__text',
      ),
    ).toHaveCount(0);
    await expect(page.locator('#contacts .lead')).toHaveText(
      Array(1).fill(/Расскажите о событии\.\s*Обсудим формат и техническую сторону\./),
    );
    await expect(page.locator('#contacts .channel')).toHaveCount(3);
    await expect(page.locator('#contacts .channel__icon svg')).toHaveCount(3);
    await expect(page.locator('#contacts [data-icon-family="reference"]')).toHaveCount(3);
    const boxes = await page.locator('#contacts .channel').evaluateAll(elements =>
      elements.map(e => { const r = e.getBoundingClientRect(); return {x:r.x, top:r.top, bottom:r.bottom}; })
    );
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
    expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom);
    expect(boxes[0].x).toBe(boxes[1].x);
    expect(boxes[1].x).toBe(boxes[2].x);
    const palette = await page.locator('#contacts').evaluate((element) =>
      ['--color-violet', '--color-lime', '--color-surface'].map((t) =>
        getComputedStyle(element).getPropertyValue(t).trim(),
      ),
    );
    expect(palette).toEqual(['#4511ef', '#b3fa92', '#202124']);
    const landingPalette = await page.evaluate(() =>
      ['--color-bg', '--color-surface', '--color-lime', '--color-violet'].map((t) =>
        getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
      ),
    );
    expect(landingPalette).toEqual(['#141517', '#202124', '#a4ff82', '#4b0df8']);
    const heroShade = await page.locator('.hero__shade').evaluate((e) => getComputedStyle(e).backgroundImage);
    expect(heroShade).toContain('20, 21, 23');
    await expect(page.locator('#contacts a')).toHaveCount(3);
    for (const href of ['tel:+78888888888', 'mailto:hello@example.com', 'https://t.me/telegram']) {
      await expect(page.locator(`#contacts a[href="${href}"]`)).toHaveCount(1);
    }
    const dims = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dims.scroll).toBeLessThanOrEqual(dims.width);
    const result = await new AxeBuilder({ page })
      .include('#contacts')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
