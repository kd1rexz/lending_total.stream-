import { test, expect } from '@playwright/test';
for (const width of [390, 1366]) {
  test(`cases show photo, title and description and can be browsed at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const root = page.locator('#cases');
    await root.scrollIntoViewIfNeeded();
    await expect(root.locator('.case-slide')).toHaveCount(3);
    await expect(root.locator('dl,.case__meta,.case__type,.case__video')).toHaveCount(0);
    await expect(root.locator('.case-slide img')).toHaveCount(3);
    await expect(root.locator('[data-case-prev]')).toBeDisabled();
    await root.locator('[data-case-next]').click();
    await expect(root.locator('[data-case-count]')).toHaveText('2 / 3');
    await root.locator('[data-case-track]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(root.locator('[data-case-count]')).toHaveText('3 / 3');
    await expect(root.locator('[data-case-next]')).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(root.locator('[data-case-count]')).toHaveText('2 / 3');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await root.locator('[data-case-prev]').click();
    await expect(root.locator('[data-case-count]')).toHaveText('1 / 3');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
test('case strip remains horizontally scrollable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/');
  const track = page.locator('#cases [data-case-track]');
  await expect(track).toHaveCSS('overflow-x', 'auto');
  await expect(track.locator('.case-slide__story').first()).toBeVisible();
  await expect(track.locator('[data-case-more]').first()).toBeHidden();
  expect(await track.evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true);
  await expect(page.locator('#cases [data-case-controls]')).toBeHidden();
  await context.close();
});

test('phone readers can expand each case and desktop always shows the complete story', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#cases');
  const track = page.locator('[data-case-track]');
  const active = track.locator('[data-case-slide][aria-hidden="false"]');
  const story = active.locator('.case-slide__story');
  const toggle = active.locator('[data-case-more]');
  for (let i = 0; i < 3; i++) {
    await expect(story).toBeHidden();
    await expect(active.locator('.case-slide__excerpt')).toBeVisible();
    const compactHeight = await track.evaluate(el => el.clientHeight);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAccessibleName('Свернуть');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(story.locator('p').last()).toBeVisible();
    expect(await track.evaluate(el => el.clientHeight)).toBeGreaterThan(compactHeight + 80);
    if (i === 0) {
      await toggle.click();
      await expect(toggle).toHaveAccessibleName('Ещё');
      expect(await track.evaluate(el => el.clientHeight)).toBe(compactHeight);
      await toggle.click();
    }
    if (i < 2) await page.locator('[data-case-next]').click();
  }
  await page.locator('[data-case-prev]').click();
  await expect(story).toBeHidden();
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(story).toBeVisible();
  await expect(toggle).toBeHidden();
  await expect(active.locator('.case-slide__excerpt')).toBeHidden();
});

for (const width of [390, 1366]) {
  test(`selected case panel contains its controls and preserves photo corners at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const root = page.locator('#cases');
    await expect(page.locator('[data-case-carousel]')).toHaveCount(1);
    await expect(root).not.toContainText('Материалы в подготовке');
    const slide = root.locator('.case-slide').first();
    await expect(root.locator('.case-slide__frame-caption')).toHaveCount(0);
    const image = slide.locator('img');
    await expect(image).toHaveAttribute('draggable', 'false');
    await expect(image).toHaveCSS('pointer-events', 'none');
    const corner = await slide.locator('.case-slide__image').evaluate(e => ({
      color: getComputedStyle(e, '::before').borderTopColor,
      width: getComputedStyle(e, '::before').borderTopWidth,
    }));
    expect(corner).toEqual({ color: 'rgb(164, 255, 130)', width: '2px' });
    const box = (await slide.boundingBox())!;
    const photo = (await slide.locator('.case-slide__image').boundingBox())!;
    const description = slide.locator('.case-slide__description');
    await expect(description.locator('p')).toHaveCount(2);
    const text = (await description.boundingBox())!;
    const controls = (await root.locator('[data-case-controls]').boundingBox())!;
    expect(controls.x).toBeGreaterThan(box.x);
    expect(controls.x + controls.width).toBeLessThan(box.x + box.width);
    expect(controls.y + controls.height).toBeLessThan(box.y + box.height);
    expect(text.y + text.height).toBeLessThan(controls.y);
    if (width >= 768) {
      expect(photo.width / box.width).toBeGreaterThan(0.39);
      expect(photo.width / box.width).toBeLessThan(0.46);
      expect(photo.height).toBeGreaterThan(330);
      const caption = (await slide.locator('.case-slide__caption').boundingBox())!;
      expect(Math.abs(photo.y + photo.height - controls.y - controls.height)).toBeLessThan(2);
      const firstArrow = (await root.locator('[data-case-prev]').boundingBox())!;
      expect(Math.abs(firstArrow.x - caption.x)).toBeLessThan(2);
      expect(controls.y - text.y - text.height).toBeGreaterThanOrEqual(20);
      expect(controls.y - text.y - text.height).toBeLessThan(110);
    } else {
      expect(photo.height).toBeLessThanOrEqual(240);
      expect(text.y).toBeGreaterThanOrEqual(photo.y + photo.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('case content crossfades in place and rapid navigation settles cleanly', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('#cases');
  const track = root.locator('[data-case-track]');
  await root.scrollIntoViewIfNeeded();
  const before = (await track.boundingBox())!;
  await root.locator('[data-case-next]').click();
  await expect(root.locator('[data-case-count]')).toHaveText('2 / 3');
  expect(await track.evaluate(e => e.scrollLeft)).toBe(0);
  await expect(root.locator('[data-case-slide][data-active]')).toHaveCount(1);
  await expect(root.locator('[data-case-slide][data-active] h3')).toHaveText('Dobrofest 2026');
  await root.locator('[data-case-next]').click();
  await root.locator('[data-case-prev]').click();
  await expect(root.locator('[data-case-count]')).toHaveText('2 / 3');
  await expect(root.locator('[data-case-slide][data-active]')).toHaveCount(1);
  const after = (await track.boundingBox())!;
  expect(after.height).toBeCloseTo(before.height, 0);
  expect(after.x).toBe(before.x);
  await expect(root.locator('[data-case-slide][aria-hidden="true"]')).toHaveCount(2);
});

test('photo preview moves once in view and respects the reader’s motion preference', async ({ page }) => {
  const videoRequests: string[] = [];
  page.on('request', request => {
    if (/\.mp4(?:$|\?)/i.test(request.url())) videoRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/variants/film');
  await expect(page).toHaveURL(/\/(#cases)?$/);
  await expect(page.locator('#top video, #cases video')).toHaveCount(0);
  const track = page.locator('[data-case-track]');
  const active = track.locator('[aria-hidden="false"] img');
  await expect(active).toHaveCSS('animation-play-state', 'paused');
  await track.scrollIntoViewIfNeeded();
  await expect(active).toHaveCSS('animation-play-state', 'running');
  await expect.poll(() => active.evaluate(el => el.getAnimations()[0]?.playState), { timeout: 8000 }).toBe('finished');
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-case-count]')).toHaveText('2 / 3');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(active).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-case-count]')).toHaveText('3 / 3');
  expect(videoRequests).toEqual([]);
});
