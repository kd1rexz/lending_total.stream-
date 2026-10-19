import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`hero cue exits and reverses smoothly relative to viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    const cue = page.locator('.hero__explore');
    await expect(cue).toHaveAttribute('data-cue-ready', '');
    const start = (await cue.boundingBox())!;
    const motion = await page.evaluate(async () => {
      const cue = document.querySelector<HTMLElement>('.hero__explore')!;
      document.documentElement.style.scrollBehavior = 'auto';
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const sample = () => ({ y: cue.getBoundingClientRect().top, opacity: Number(getComputedStyle(cue).opacity) });
      scrollTo(0, 24);
      await wait(60);
      const early = sample();
      await wait(240);
      const exiting = sample();
      scrollTo(0, 200);
      await wait(150);
      const continued = sample();
      scrollTo(0, 0);
      await wait(40);
      const reversal = sample();
      return { early, exiting, continued, reversal, parent: cue.parentElement!.tagName };
    });
    expect(motion.parent).toBe('BODY');
    expect(motion.early.y).toBeGreaterThanOrEqual(start.y - 1);
    expect(motion.early.y - start.y).toBeLessThan(12);
    expect(motion.exiting.y).toBeGreaterThan(motion.early.y);
    expect(motion.continued.y).toBeGreaterThan(motion.exiting.y);
    expect(motion.reversal.opacity).toBeGreaterThan(0);
    expect(Math.abs(motion.reversal.y - motion.continued.y)).toBeLessThan(12);
    await expect(cue).toHaveCSS('opacity', '1');
    await expect.poll(async () => (await cue.boundingBox())!.y).toBeCloseTo(start.y, 0);
    await page.evaluate(() => scrollTo(0, 24));
    await expect(cue).toHaveCSS('opacity', '0');
    const end = await cue.evaluate(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; });
    expect(end).toBeCloseTo(950, 0);
    await page.evaluate(async () => {
      scrollTo(0, 200);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.evaluate(() => scrollTo(0, 80));
    await expect(cue).not.toHaveAttribute('data-dismissed', '');
    await expect(cue).toHaveCSS('opacity', '1');
    await page.evaluate(() => scrollTo(0, 0));
    await expect(cue).toHaveCSS('opacity', '1');
  });
}
