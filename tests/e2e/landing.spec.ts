import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const evidence = path.resolve('output/qa/T08');
const widths = [360, 390, 768, 1024, 1440, 1920];

async function ready(page: Page) {
  await page.goto('/');
  // Firefox with page JS disabled does not settle a promise returned from evaluate.
  await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

function nextFocusKey(browserName: string) {
  // macOS WebKit follows the system policy: Option+Tab includes links.
  return browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
}

async function checkReflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  const overflowingText = await page.evaluate(() => {
    const result: string[] = [];
    document.querySelectorAll('h1, h2, summary, a[href], button').forEach((element) => {
      if (!(element instanceof HTMLElement) || !element.offsetWidth || !element.offsetHeight)
        return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects()) {
          if (rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1)) {
            result.push(`${element.tagName}: ${element.textContent?.trim().slice(0, 100)}`);
          }
        }
      }
    });
    return [...new Set(result)];
  });
  expect(overflowingText, 'Visible heading/control text must fit the viewport').toEqual([]);
}

test('preview semantics, metadata, anchors and resource loading', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) =>
    errors.push(`${request.url()}: ${request.failure()?.errorText}`),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await ready(page);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page).toHaveTitle(/Total Stream/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{20}/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /width=device-width/,
  );
  await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute(
    'content',
    /user-scalable=no|maximum-scale=1/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Total Stream/,
  );
  await expect(page.locator('link[rel="canonical"], meta[property="og:url"]')).toHaveCount(0);
  await expect(page.getByText('Рабочий макет', { exact: true })).toBeVisible();
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href') || '')
        .filter(
          (href) => href.length < 2 || !document.getElementById(decodeURIComponent(href.slice(1))),
        ),
    );
  expect(brokenAnchors).toEqual([]);
  expect(errors).toEqual([]);
});

test('only honest preview content and contact links', async ({ page }) => {
  await ready(page);
  await expect(page.locator('form, input, textarea, iframe')).toHaveCount(0);
  await expect(
    page.locator('a[href="#"], a[href=""], a[href^="javascript:"], a[href^="/cases/"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="t.me/"], a[href*="wa.me/"]'),
  ).toHaveCount(0);
  await expect(page.locator('#contacts')).toContainText('Контакты будут добавлены');
  await expect(page.locator('#cases')).toContainText(/Кейсы|кейсы/);
  const html = await page.content();
  expect(html).not.toMatch(
    /demo@example\.com|test@example|fixture-case|fixture-review|__TEST_CONTACT__|ООО «Тест»/i,
  );
  const external = await page
    .locator('a[href^="http"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(external).toEqual([]);
});

for (const width of widths) {
  test(`reflow and screenshot at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    await checkReflow(page);
    await mkdir(evidence, { recursive: true });
    await page.screenshot({
      path: path.join(evidence, `${testInfo.project.name}-${width}-full.png`),
      fullPage: true,
      animations: 'disabled',
    });
    if (width === 360 || width === 1440) {
      await page.screenshot({
        path: path.join(evidence, `${testInfo.project.name}-${width}-hero.png`),
        animations: 'disabled',
      });
    }
  });
}

test('mobile navigation opens with keyboard, Escape restores focus, anchor closes menu', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const toggle = page.getByRole('button', { name: 'Меню', exact: true });
  const navigation = page.getByRole('navigation', { name: 'Основная навигация' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(navigation).toBeVisible();
  await expect(page.getByRole('button', { name: 'Закрыть', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.keyboard.press(nextFocusKey(browserName));
  await expect(navigation.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Меню', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const contacts = navigation.getByRole('link', { name: 'Контакты', exact: true });
  await contacts.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contacts$/);
  await expect(navigation).toBeHidden();
  await expect(page.locator('#contacts')).toBeFocused();
  await expect(page.locator('#contacts')).toBeInViewport();
});

test('navigation responds to breakpoint changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.getByRole('button', { name: 'Меню', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeVisible();
  await expect(page.locator('[data-menu-toggle]')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Меню', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeHidden();
});

test('keyboard skip link and FAQ remain operable', async ({ page, browserName }) => {
  await ready(page);
  await page.keyboard.press(nextFocusKey(browserName));
  const skip = page.getByRole('link', { name: 'Перейти к содержанию' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  expect(await skip.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  // Native fragments move the sequential focus starting point even when the
  // non-focusable main does not become document.activeElement itself.
  await page.keyboard.press(nextFocusKey(browserName));
  await expect(
    page.locator('main :focus'),
    'Next Tab must skip the header and enter main',
  ).toHaveCount(1);
  const firstQuestion = page.locator('.faq summary').first();
  await firstQuestion.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq details').first()).toHaveAttribute('open', '');
  await expect(page.locator('.faq details').first().locator('p')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('.faq details').first()).not.toHaveAttribute('open', '');
});

test('reduced motion avoids reveal animation and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.locator('#contacts').scrollIntoViewIfNeeded();
  const state = await page.evaluate(() => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    running: document.getAnimations().filter((animation) => animation.playState === 'running')
      .length,
    invisible: [...document.querySelectorAll('[data-reveal]')].filter(
      (element) => getComputedStyle(element).opacity === '0',
    ).length,
  }));
  expect(state).toEqual({ reduced: true, scroll: 'auto', running: 0, invisible: 0 });
});

for (const width of [390, 1440]) {
  test(`WCAG A/AA automated audit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    if (width === 390) await page.getByRole('button', { name: 'Меню', exact: true }).click();
    await page.locator('.faq summary').first().click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    await mkdir(evidence, { recursive: true });
    await writeFile(
      path.join(evidence, `${testInfo.project.name}-axe-${width}.json`),
      JSON.stringify(result, null, 2),
    );
    expect(
      result.violations,
      JSON.stringify(
        result.violations.map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => node.target),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}

test('200 percent text resize reflows without horizontal clipping', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  // Text resizing complements viewport checks; it is not a claim of real browser UI zoom.
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await checkReflow(page);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: path.join(evidence, `${testInfo.project.name}-text-200-full.png`),
    fullPage: true,
    animations: 'disabled',
  });
});

test('unknown route is a real HTTP 404 with a usable return link', async ({ page }) => {
  const response = await page.goto('/not-a-real-page-qa');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/Страница не найдена/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /На главную/ })).toBeVisible();
  await page.getByRole('link', { name: /На главную/ }).click();
  await expect(page).toHaveURL('/');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  test('navigation, content, native FAQ and contacts remain available', async ({
    page,
  }, testInfo) => {
    await ready(page);
    const navigation = page.getByRole('navigation', { name: 'Основная навигация' });
    await expect(navigation).toBeVisible();
    await expect(page.locator('[data-menu-toggle]')).toBeHidden();
    await expect(navigation.getByRole('link', { name: 'Контакты', exact: true })).toBeVisible();
    await navigation.getByRole('link', { name: 'Контакты', exact: true }).click();
    await expect(page).toHaveURL(/#contacts$/);
    await expect(page.locator('#contacts')).toContainText('Контакты будут добавлены');
    const question = page.locator('.faq summary').first();
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.faq details').first()).toHaveAttribute('open', '');
    await expect(page.locator('.faq details').first().locator('p')).toBeVisible();
    await checkReflow(page);
    await mkdir(evidence, { recursive: true });
    await page.screenshot({
      path: path.join(evidence, `${testInfo.project.name}-nojs-390-full.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
});
