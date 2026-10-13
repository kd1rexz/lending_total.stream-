import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveBuildContext } from '../src/lib/build-context.mjs';

const { isPreview, siteUrl } = resolveBuildContext();
if (!isPreview) {
  await writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n`,
  );
}

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
