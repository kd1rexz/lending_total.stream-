import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768]) {
  test(`touch menu is anchored to the button without shifting the logo at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const logo = page.locator('.site-header__home');
    const label = page.locator('[data-menu-label]');
    const beforeLogo = (await logo.boundingBox())!;
    const beforeLabel = (await label.boundingBox())!;
    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(label).toHaveText('Меню');
    const nav = page.locator('[data-navigation]');
    await expect(nav).toBeVisible();
    await expect.poll(() => nav.evaluate(e => e.getAnimations().length)).toBe(0);
    const afterLogo = (await logo.boundingBox())!;
    const afterLabel = (await label.boundingBox())!;
    expect(afterLogo.x).toBeCloseTo(beforeLogo.x, 1);
    expect(afterLogo.y).toBeCloseTo(beforeLogo.y, 1);
    expect(afterLabel.x).toBeCloseTo(beforeLabel.x, 1);
    expect(afterLabel.y).toBeCloseTo(beforeLabel.y, 1);
    const panel = (await nav.boundingBox())!;
    const button = (await toggle.boundingBox())!;
    expect(panel.y).toBeGreaterThan(button.y + button.height);
    expect(panel.x + panel.width).toBeCloseTo(button.x + button.width, 0);
    await expect(nav.locator('a')).toHaveText(['Услуги', 'Кейсы', 'Команда', 'Контакты']);
    for (const link of await nav.locator('a').all()) {
      expect(await link.evaluate(e => getComputedStyle(e, '::after').display)).toBe('none');
      await expect(link).toHaveCSS('transform', 'none');
    }
    await nav.getByRole('link', { name: 'Команда', exact: true }).tap();
    await expect(page).toHaveURL(/#team$/);
    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await context.close();
  });
}

test('touch CTA has no light, rotation or magnet and still reaches contacts', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const link = page.locator('.project-cta__link');
  await link.focus();
  await link.dispatchEvent('pointermove', { pointerType: 'touch', clientX: 60, clientY: 200 });
  expect(await link.evaluate(e => getComputedStyle(e, '::before').display)).toBe('none');
  await expect(page.locator('.project-cta__arrow')).toHaveCSS('rotate', '0deg');
  await expect(page.locator('[data-project-cta]')).not.toHaveAttribute('data-hover', '');
  expect(await link.evaluate(e => getComputedStyle(e).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  const border = await link.evaluate(e => getComputedStyle(e).borderTopColor);
  const background = await link.evaluate(e => getComputedStyle(e).backgroundColor);
  await link.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true, button: 0 });
  await expect(link).toHaveAttribute('data-pressed', '');
  await expect(link).toHaveCSS('border-top-color', border);
  await expect(link).toHaveCSS('background-color', background);
  await link.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true, button: 0 });
  await link.tap();
  await expect(page).toHaveURL(/#contacts$/);
  await context.close();
});

test('touch services stay brighter with no purple response and case buttons retain tap feedback', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const card = page.locator('.service-card').first();
  await card.scrollIntoViewIfNeeded();
  const border = await card.evaluate(e => getComputedStyle(e).borderTopColor);
  await expect(card.locator('.service-card__shade')).toHaveCSS('background-color', 'rgba(14, 15, 17, 0.67)');
  await card.tap();
  await expect(card).toHaveCSS('border-top-color', border);
  await expect(card.locator('img')).toHaveCSS('transform', 'none');
  const next = page.locator('[data-case-next]');
  await next.tap();
  await expect(page.locator('[data-case-count]')).toHaveText('2 / 3');
  await expect(next).toHaveAttribute('data-pressed', '');
  await expect(next).toHaveCSS('background-color', 'rgb(75, 13, 248)');
  await context.close();
});

test('mobile menu only compresses on press without underline or green fill', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('[data-menu-toggle]').tap();
  const link = page.locator('[data-navigation] a').first();
  const color = await link.evaluate(e => getComputedStyle(e).color);
  const background = await link.evaluate(e => getComputedStyle(e).backgroundColor);
  await link.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true, button: 0 });
  expect(await link.evaluate(e => getComputedStyle(e, '::after').display)).toBe('none');
  await expect(link).toHaveCSS('color', color);
  await expect(link).toHaveCSS('background-color', background);
  await expect.poll(() => link.evaluate(e => getComputedStyle(e).scale)).toBe('0.97');
  await link.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true, button: 0 });
  await link.tap();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('[data-navigation]')).toBeHidden();
  await context.close();
});

for (const touch of [false, true]) {
  test(`mobile contacts only turn lime during press, touch=${touch}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: touch, hasTouch: touch });
    const page = await context.newPage();
    await page.goto('/');
    for (const link of await page.locator('#contacts a.channel__value').all()) {
      await link.hover();
      await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
      await link.dispatchEvent('pointerdown', { pointerType: touch ? 'touch' : 'mouse', isPrimary: true, button: 0 });
      await expect(link).toHaveCSS('color', 'rgb(179, 250, 146)');
      await link.dispatchEvent('pointerup', { pointerType: touch ? 'touch' : 'mouse', isPrimary: true, button: 0 });
      await expect(link).not.toHaveAttribute('data-pressed', '');
      await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
    await context.close();
  });
}
