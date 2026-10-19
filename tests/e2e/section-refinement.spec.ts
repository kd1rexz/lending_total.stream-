import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1366, 1440]) {
  test(`refined sections preserve content and reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const cards = page.locator('.service-card');
    for (const card of await cards.all()) {
      const box = (await card.boundingBox())!;
      const text = (await card.locator('p').boundingBox())!;
      expect(text.y + text.height).toBeLessThanOrEqual(box.y + box.height - 16);
      if (width < 768) expect(box.height).toBeLessThan(320);
    }
    const lead = page.locator('.editorial__lead');
    expect(await lead.evaluate(e => getComputedStyle(e).fontFamily)).toContain('Arial');
    await expect(lead).toHaveText('Total Stream — команда профессионалов, которая поможет с организацией и техническим сопровождением вашего мероприятия.');
    if (width < 768) {
      const name = (await page.locator('.editorial__signature').boundingBox())!;
      const photo = (await page.locator('.editorial__photo').boundingBox())!;
      const description = (await lead.boundingBox())!;
      expect(photo.y).toBeGreaterThan(name.y + name.height);
      expect(description.y).toBeGreaterThan(photo.y + photo.height);
      expect(photo.height).toBeLessThanOrEqual(320);
    }
    const otherContact = page.locator('.direct-channel:not(.direct-channel--primary) .channel__value').first();
    expect(await otherContact.evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(20);
    const steps = await page.locator('.preparation-step').all();
    expect(steps.length).toBe(3);
    const first = (await steps[0].boundingBox())!;
    const second = (await steps[1].boundingBox())!;
    if (width < 768) expect(second.y).toBeGreaterThan(first.y + first.height);
    else expect(second.y).toBeCloseTo(first.y, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('touch services have complete static content without hover or tap disclosure', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const card = page.locator('.service-card').first();
  await card.scrollIntoViewIfNeeded();
  const copy = await card.locator('.service-card__intro').innerText();
  const image = card.locator('img');
  await expect(image).toHaveCSS('transform', 'none');
  await card.tap();
  await expect(image).toHaveCSS('transform', 'none');
  await expect(card.locator('.service-card__intro')).toHaveCSS('opacity', '1');
  expect(await card.locator('.service-card__intro').innerText()).toBe(copy);
  await context.close();
});
