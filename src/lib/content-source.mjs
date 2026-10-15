import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { resolveBuildContext } from './build-context.mjs';
import { sourceSchema } from './content-schema.mjs';

const projectRoot = process.cwd();
const sourceFiles = {
  site: 'src/data/site.json',
  navigation: 'src/data/navigation.json',
  editorial: 'src/data/editorial.json',
  services: 'src/content/services.json',
  cases: 'src/content/cases.json',
  assets: 'src/data/assets.json',
};

/** Read the same source files for the static page and the release command. */
export async function readContentSource(rootDir = projectRoot) {
  const entries = await Promise.all(
    Object.entries(sourceFiles).map(async ([key, path]) => {
      try {
        return [key, JSON.parse(await readFile(resolve(rootDir, path), 'utf8'))];
      } catch (error) {
        throw new Error(`Cannot read ${path}: ${error.message}`);
      }
    }),
  );
  return Object.fromEntries(entries);
}

/** @template {{ published: boolean, order: number, id: string }} T
 * @param {T[]} items
 * @param {boolean} isPreview
 * @returns {T[]}
 */
export function visibleEntries(items, isPreview) {
  return items
    .filter((item) => isPreview || item.published)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function isReservedHost(hostname) {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.test') ||
    host.endsWith('.invalid') ||
    host.endsWith('.example') ||
    ['example.com', 'example.org', 'example.net'].some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    ) ||
    /^\d+(?:\.\d+){3}$/.test(host) ||
    host.includes(':') ||
    !host.includes('.')
  );
}

function contactHost(contact) {
  if (contact.kind === 'email') return contact.href.slice(contact.href.lastIndexOf('@') + 1);
  if (contact.kind === 'messenger') return new URL(contact.href).hostname;
  return undefined;
}

/** Schema and publication policy shared by CLI and the page data layer. */
export function validateContentSource(rawSource, env = process.env) {
  const build = resolveBuildContext(env);
  const parsed = sourceSchema.safeParse(rawSource);
  if (!parsed.success) {
    throw new Error(
      `Invalid content:\n${parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')}`,
    );
  }
  const source = parsed.data;
  const issues = [];
  const contacts = source.site.contacts;
  if (new Set(contacts.map((contact) => contact.href)).size !== contacts.length) {
    issues.push('Contact URLs must be unique.');
  }
  const paths = source.assets.items.map((asset) => asset.path);
  if (new Set(paths).size !== paths.length) issues.push('Asset paths must be unique.');
  const serviceIds = new Set(source.services.map((service) => service.id));
  for (const entry of source.cases) {
    for (const serviceId of entry.serviceIds) {
      if (!serviceIds.has(serviceId))
        issues.push(`Case ${entry.id}: unknown service ${serviceId}.`);
    }
  }

  if (!build.isPreview) {
    if (isReservedHost(new URL(build.siteUrl).hostname))
      issues.push('SITE_URL must use the real public domain, not a local or example hostname.');
    if (contacts.length === 0)
      issues.push('Production requires at least one verified contact in src/data/site.json.');
    for (const contact of contacts) {
      const host = contactHost(contact);
      if (host && isReservedHost(host))
        issues.push(`Contact ${contact.kind} uses an example or local hostname.`);
    }
    if (!source.site.contentApproved)
      issues.push('contentApproved must be true after editorial approval.');
    if (!source.site.brandApproved)
      issues.push('brandApproved must be true after final brand review.');
    if (!source.assets.productionReady)
      issues.push('assets.productionReady must be true after image, logo, font and rights review.');

    const cases = visibleEntries(source.cases, false);
    if (cases.length < 3 || cases.length > 6)
      issues.push('Production requires 3–6 approved, published cases.');
    const services = visibleEntries(source.services, false);
    if (services.length < 3 || services.length > 4)
      issues.push('Production requires 3–4 approved, published services.');
    for (const service of services) {
      if (!cases.some((entry) => entry.serviceIds.includes(service.id)))
        issues.push(`Service ${service.id}: production requires at least one published example.`);
    }
    for (const key of ['team', 'reliability', 'faq']) {
      if (!source.editorial[key].length)
        issues.push(`Production requires approved ${key} content.`);
    }
    for (const asset of source.assets.items.filter((item) => item.scope === 'production')) {
      if (asset.status !== 'approved' || asset.rights !== 'cleared') {
        issues.push(`Production asset ${asset.path} requires approved status and cleared rights.`);
      }
    }
    for (const entry of cases) {
      const path = `src/assets/images/${entry.cover.split('/').at(-1)}`;
      const asset = source.assets.items.find((item) => item.path === path);
      if (
        !asset ||
        asset.scope !== 'production' ||
        asset.status !== 'approved' ||
        asset.rights !== 'cleared'
      ) {
        issues.push(
          `Case ${entry.id}: cover must be registered as an approved production asset with cleared rights.`,
        );
      }
    }
  }

  if (issues.length)
    throw new Error(
      `Content is not ready for ${build.context}:\n${issues.map((issue) => `- ${issue}`).join('\n')}`,
    );
  return { source, build };
}

/** Fail for missing files and symlinks outside the checkout; do not fetch remote media. */
export async function validateContentAssets(source, rootDir = projectRoot) {
  const root = await realpath(rootDir);
  const casePaths = source.cases.map((entry) =>
    relative(rootDir, resolve(rootDir, 'src/content', entry.cover)),
  );
  const paths = new Set([...source.assets.items.map((asset) => asset.path), ...casePaths]);
  for (const path of paths) {
    let actual;
    try {
      actual = await realpath(resolve(rootDir, path));
    } catch {
      throw new Error(`Content asset is missing: ${path}`);
    }
    const relativePath = relative(root, actual);
    if (relativePath.startsWith('..') || isAbsolute(relativePath))
      throw new Error(`Content asset escapes the project: ${path}`);
    if (!(await stat(actual)).isFile()) throw new Error(`Content asset is not a file: ${path}`);
  }
}

export async function loadValidatedContent({ rootDir = projectRoot, env = process.env } = {}) {
  const result = validateContentSource(await readContentSource(rootDir), env);
  await validateContentAssets(result.source, rootDir);
  return result;
}
