// Complements axe, which cannot resolve the photograph/gradient behind Hero text.
// Run against the already-built preview: node tests/e2e/hero-contrast.mjs [output-directory]
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.resolve('astro/package.json'));
const sharp = require('sharp');
const output = process.argv[2] || 'output/qa/T08/hero-contrast-recheck';
await mkdir(output, { recursive: true });
const linear = (value) => {
  value /= 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};
const luminance = (rgb) =>
  0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    await page.goto('http://127.0.0.1:4323');
    await page.evaluate(() => document.fonts.ready);
    const texts = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.querySelector('.hero'),
        NodeFilter.SHOW_TEXT,
      );
      const items = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()]
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }));
        if (!rects.length) continue;
        const css = getComputedStyle(node.parentElement);
        items.push({
          text: node.textContent.trim(),
          color: css.color,
          fontSize: parseFloat(css.fontSize),
          weight: parseFloat(css.fontWeight) || 400,
          rects,
        });
      }
      return items;
    });
    await page.screenshot({ path: path.join(output, `hero-${width}.png`), animations: 'disabled' });
    await page.addStyleTag({
      content:
        '.hero, .hero * { -webkit-text-fill-color: transparent !important; text-shadow: none !important; }',
    });
    const background = path.join(output, `background-${width}.png`);
    await page.screenshot({ path: background, animations: 'disabled' });
    const { data, info } = await sharp(background).raw().toBuffer({ resolveWithObject: true });
    for (const item of texts) {
      let rgb = item.color.match(/[\d.]+/g).map(Number);
      if (item.color.startsWith('color(srgb')) rgb = rgb.map((value) => value * 255);
      const foreground = luminance(rgb);
      let minimum = Infinity;
      let worstBackground;
      for (const box of item.rects) {
        for (
          let y = Math.max(0, Math.ceil(box.y));
          y < Math.min(info.height, Math.floor(box.y + box.height));
          y++
        ) {
          for (
            let x = Math.max(0, Math.ceil(box.x));
            x < Math.min(info.width, Math.floor(box.x + box.width));
            x++
          ) {
            const index = (y * info.width + x) * info.channels;
            const backgroundRgb = [data[index], data[index + 1], data[index + 2]];
            const light = luminance(backgroundRgb);
            const ratio =
              (Math.max(foreground, light) + 0.05) / (Math.min(foreground, light) + 0.05);
            if (ratio < minimum) {
              minimum = ratio;
              worstBackground = backgroundRgb;
            }
          }
        }
      }
      const required =
        item.fontSize >= 24 || (item.fontSize >= 18.6667 && item.weight >= 700) ? 3 : 4.5;
      results.push({
        width,
        ...item,
        minimumContrast: minimum,
        required,
        worstBackground,
        pass: minimum >= required,
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
const result = {
  method:
    'Transparent text fill; minimum contrast over every background pixel within each text-node rectangle. Conservative bounds from current screenshots at deviceScaleFactor=1. Repeat for replacement imagery.',
  results,
};
await writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
const failures = results.filter((item) => !item.pass);
console.log(JSON.stringify({ samples: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
