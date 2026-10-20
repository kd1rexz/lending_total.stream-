import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveBuildContext } from '../src/lib/build-context.mjs';
import { createSitemap } from '../src/lib/seo.mjs';

const { isPreview, siteUrl } = resolveBuildContext();
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
if (sitemap !== createSitemap({ isPreview, siteUrl }))
  throw new Error('Sitemap must contain only the public homepage, or no URLs in preview.');
const robots = await readFile('dist/robots.txt', 'utf8');
if (isPreview && (!robots.includes('Disallow: /') || /Sitemap:/i.test(robots)))
  throw new Error('Preview robots must block crawling and must not advertise a sitemap.');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name))),
    )
  ).flat();
}
const files = await walk('dist');
for (const file of files) {
  if (/component-preview|fixtures|\.map$/.test(file))
    throw new Error(`Private test asset in dist: ${file}`);
  if (!isPreview && /brand-reference-/.test(file))
    throw new Error(`Preview reference asset in production: ${file}`);
  if (
    /\.(html|js|json)$/.test(file) &&
    (await readFile(file, 'utf8')).includes('COMPONENT_FIXTURE_ONLY')
  ) {
    throw new Error(`Fixture leaked to dist: ${file}`);
  }
}
const home = await readFile('dist/index.html', 'utf8');
if (isPreview && !/name="robots" content="noindex,nofollow"/.test(home))
  throw new Error('Preview must be noindex.');
if (!isPreview && /noindex|COMPONENT_FIXTURE_ONLY/.test(home))
  throw new Error('Preview metadata in production homepage.');
console.log(`Verified ${files.length} public files; isolated fixtures are absent.`);
