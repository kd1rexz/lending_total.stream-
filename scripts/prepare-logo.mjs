import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Keep the supplied file intact. Only transparent margins are removed for display.
const source = 'src/assets/brand/logo-source.png';
const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let left = info.width;
let top = info.height;
let right = -1;
let bottom = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 0) {
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
}
if (right < left || bottom < top) throw new Error('The supplied logo is fully transparent.');
const width = right - left + 1;
const height = bottom - top + 1;
const side = Math.max(width, height);
const logo = await sharp(source)
  .extract({ left, top, width, height })
  .extend({
    left: Math.floor((side - width) / 2),
    right: Math.ceil((side - width) / 2),
    top: Math.floor((side - height) / 2),
    bottom: Math.ceil((side - height) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
await writeFile('src/assets/brand/logo-variant-3.png', logo);
const favicon = await sharp(logo).resize(64, 64).png().toBuffer();
await writeFile(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${favicon.toString('base64')}"/></svg>\n`,
);
console.log(`Prepared supplied logo: ${width} × ${height}, transparent canvas ${side} × ${side}.`);
