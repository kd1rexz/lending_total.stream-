import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name),
      ),
    )
  ).flat();
}
const files = await walk('dist');
const result = { javascriptGzip: 0, cssGzip: 0, fonts: 0, heroImageMax: 0, images: [] };
const inlineScripts = new Set();
const inlineStyles = new Set();
for (const file of files) {
  const data = await readFile(file);
  if (file.endsWith('.js')) result.javascriptGzip += gzipSync(data).length;
  if (file.endsWith('.css')) result.cssGzip += gzipSync(data).length;
  if (file.endsWith('.woff2')) result.fonts += data.length;
  if (file.endsWith('.html')) {
    const html = data.toString('utf8');
    for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=|application\/ld\+json/i.test(attributes) && body.trim())
        inlineScripts.add(body);
    }
    for (const [, body] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      if (body.trim()) inlineStyles.add(body);
    }
  }
  if (/\.(avif|webp|jpe?g)$/.test(file)) result.images.push({ file, bytes: data.length });
}
for (const body of inlineScripts) result.javascriptGzip += gzipSync(body).length;
for (const body of inlineStyles) result.cssGzip += gzipSync(body).length;
result.heroImageMax = Math.max(
  0,
  ...result.images.filter(({ file }) => /hero[.\-_]/i.test(file)).map(({ bytes }) => bytes),
);
const limits = {
  javascriptGzip: 50 * 1024,
  cssGzip: 40 * 1024,
  fonts: 250 * 1024,
  heroImageMax: 300 * 1024,
};
await mkdir('output/qa', { recursive: true });
await writeFile('output/qa/budgets.json', JSON.stringify({ result, limits }, null, 2));
let failed = false;
for (const [name, max] of Object.entries(limits)) {
  console.log(`${name}: ${result[name]} / ${max} bytes`);
  if (result[name] > max) failed = true;
}
if (failed) process.exitCode = 1;
