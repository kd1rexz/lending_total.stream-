import { test, expect, type Locator } from '@playwright/test';

async function expectPress(element: Locator, gentle = false) {
  await expect.poll(() => element.evaluate(e => e.getAnimations().some(a => a.playState === 'finished' && a.effect?.getTiming().fill === 'forwards'))).toBe(true);
  const metrics = await element.evaluate(e => {
    const scale = Number(getComputedStyle(e).scale);
    return { scale, loss: Math.max((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * (1 - scale) };
  });
  if (gentle) {
    expect(metrics.scale).toBeGreaterThanOrEqual(0.985);
    expect(metrics.loss).toBeGreaterThan(0.3);
    expect(metrics.loss).toBeLessThanOrEqual(4.1);
  } else {
    expect(metrics.scale).toBe(0.97);
  }
}

test('contacts highlight only the text and copy the exact address', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text; },
    }});
  });
  await page.goto('/');
  const row = page.locator('.channel--email');
  await row.scrollIntoViewIfNeeded();
  const link = row.locator('a');
  await row.locator('.channel__icon').hover();
  await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
  await link.hover();
  await expect(link).toHaveCSS('color', 'rgb(179, 250, 146)');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(link).toHaveAttribute('href', 'mailto:hello@example.com');
  await row.getByRole('button', { name: 'Скопировать: Почта', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe('hello@example.com');
  await expect(row.locator('[data-contact-copy]')).toHaveAttribute('data-copied', '');
  await expect(row.locator('[data-contact-copy]')).not.toHaveAttribute('data-copied', '', { timeout: 3000 });
});

test('case arrows and explore cue retain the original visible press', async ({ page }) => {
  await page.goto('/');
  const cue = page.locator('.hero__explore');
  await cue.hover();
  await page.mouse.down();
  await expectPress(cue);
  await page.mouse.move(0, 0);
  await page.mouse.up();
  const next = page.locator('[data-case-next]');
  await next.hover();
  await expect(next).toHaveCSS('background-color', 'rgb(75, 13, 248)');
  await page.mouse.down();
  await expectPress(next);
  await page.mouse.up();
  await expect(page.locator('[data-case-count]')).toHaveText('2 / 3');
});

test('all FAQ alternatives open, close and recover from rapid reversal', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('.faq__item');
  await expect(items).toHaveCount(5);
  for (const item of await items.all()) {
    const summary = item.locator('summary');
    await summary.click();
    await expect(item).toHaveAttribute('open', '');
    await expect(item.locator('.faq__answer')).toBeVisible();
    await summary.click();
    await summary.click();
    await summary.click();
    await expect(item).not.toHaveAttribute('open', '');
    await expect(item).not.toHaveAttribute('style', /height/);
  }
});

test('all navigation items use the selected underline treatment', async ({ page }) => {
  await page.goto('/');
  for (const link of await page.locator('.site-header__links a').all()) {
    await link.hover();
    await expect.poll(() => link.evaluate(e => getComputedStyle(e, '::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect(link).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
    await page.mouse.down();
    await expectPress(link);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expect.poll(() => link.evaluate(e => getComputedStyle(e, '::after').transform)).toBe('matrix(0, 0, 0, 1, 0, 0)');
    await expect(link).toHaveCSS('transform', 'none');
  }
});

test('quick press remains visible after release before returning smoothly', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.project-cta__link');
  await button.hover();
  await page.mouse.down();
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect.poll(() => button.evaluate(e => Number(getComputedStyle(e).scale))).toBeLessThan(0.98);
  await expect(button).toHaveCSS('scale', '1');
});

test('reduced motion removes alternative answer animations and press scaling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const item of await page.locator('.faq__item').all()) {
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
    await expect(item.locator('.faq__answer')).toHaveCSS('animation-name', 'none');
  }
});

test('contacts, questions and home logo share the same gentle press', async ({ page }) => {
  await page.goto('/');
  for (const link of await page.locator('#contacts a.channel__value').all()) {
    const restingScale = await link.evaluate(e => getComputedStyle(e).scale);
    await link.hover();
    await page.mouse.down();
    await expectPress(link, true);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expect(link).toHaveCSS('scale', restingScale);
  }
  const question = page.locator('.faq summary').first();
  const restingQuestionScale = await question.evaluate(e => getComputedStyle(e).scale);
  await question.hover();
  const closedHeight = await question.locator('..').evaluate(e => e.getBoundingClientRect().height);
  await page.mouse.down();
  await expectPress(question, true);
  await page.mouse.up();
  await expect(question.locator('..')).toHaveAttribute('open', '');
  await expect(question).toHaveCSS('scale', restingQuestionScale);
  await question.click();
  await expect(question.locator('..')).not.toHaveAttribute('open', '');
  expect(await question.locator('..').evaluate(e => e.getBoundingClientRect().height)).toBeCloseTo(closedHeight, 0);
  const logo = page.locator('.site-header__home');
  await logo.focus();
  await logo.hover();
  await page.mouse.down();
  await expectPress(logo);
  await page.mouse.up();
  await expect(page).toHaveURL(/#top$/);
});
