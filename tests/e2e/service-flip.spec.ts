import { test, expect } from '@playwright/test';
test('four distinct service images keep original text and keep it fully readable during image zoom', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/');
  const root = page.locator('#services');
  const cards = root.locator('.service-card');
  await expect(cards).toHaveCount(4);
  await expect(root.locator('button,a,dialog,.service-card__caption')).toHaveCount(0);
  expect(
    new Set(await root.locator('img').evaluateAll((es) => es.map((e) => e.getAttribute('src'))))
      .size,
  ).toBe(4);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const copy = card.locator('.service-card__intro');
    const description = card.locator('.service-card__description');
    const text = await copy.innerText();
    const box = await card.boundingBox();
    const textBox = await description.boundingBox();
    expect(textBox!.y + textBox!.height / 2).toBeGreaterThan(box!.y + box!.height / 2);
    await description.hover();
    expect(await description.evaluate((e) => getComputedStyle(e).cursor)).toBe('default');
    await expect.poll(() => copy.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    await expect
      .poll(() => card.locator('img').evaluate((e) => getComputedStyle(e).transform))
      .toBe('matrix(1.035, 0, 0, 1.035, 0, 0)');
    expect(await copy.innerText()).toBe(text);
    await expect(description).toBeVisible();
    await page.mouse.move(0, 0);
    await expect.poll(() => copy.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  }
});
test('static cards skip the tab order and reduced motion keeps descriptions visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.locator('.service-card').first();
  await expect(page.locator('.service-card[tabindex]')).toHaveCount(0);
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => card.locator('img').evaluate((e) => getComputedStyle(e).transform))
    .toBe('none');
  await expect(card.locator('.service-card__description')).toBeVisible();
  expect(
    Number(await card.locator('.service-card__intro').evaluate((e) => getComputedStyle(e).opacity)),
  ).toBeGreaterThan(0.8);
  await expect(page.locator('.preparation-timeline > li')).toHaveCount(3);
  await expect(page.locator('#contacts .contacts__placeholder')).toHaveCount(0);
});
