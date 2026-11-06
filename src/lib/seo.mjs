import { resolveBuildContext } from './build-context.mjs';

const xmlEscape = (value) => value.replace(/[<>&"']/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[character]);

export function createSitemap(context = resolveBuildContext()) {
  const { isPreview, siteUrl } = context;
  if (!isPreview && !siteUrl) throw new Error('A public sitemap requires SITE_URL.');
  // Preview has no public URLs. Never invent a domain or submit anchor sections as pages.
  const urls = !isPreview && siteUrl ? `<url><loc>${xmlEscape(`${siteUrl}/`)}</loc></url>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}

/**
 * @param {{ isPreview: boolean, siteUrl?: string }} context
 * @param {{ name: string, description: string, logo: string,
 *   contacts?: Array<{ kind: string, href: string }>,
 *   requisites?: { name: string, inn: string } }} details
 */
export function createSiteSchema(context, { name, description, logo, contacts = [], requisites }) {
  const { isPreview, siteUrl } = context;
  if (isPreview || !siteUrl) return undefined;
  const url = `${siteUrl}/`;
  const telephone = contacts.find((contact) => contact.kind === 'phone')?.href.slice(4);
  const email = contacts.find((contact) => contact.kind === 'email')?.href.slice(7);
  const profiles = contacts.filter((contact) => contact.kind === 'messenger').map((contact) => contact.href);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${url}#organization`, name, url,
        description, logo: new URL(logo, siteUrl).href,
        ...(telephone && { telephone }),
        ...(email && { email }),
        ...(profiles.length > 0 && { sameAs: profiles }),
        ...(requisites && { legalName: requisites.name, taxID: requisites.inn }),
      },
      { '@type': 'WebSite', '@id': `${url}#website`, name, url, inLanguage: 'ru-RU',
        publisher: { '@id': `${url}#organization` } },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name,
        description, inLanguage: 'ru-RU',
        isPartOf: { '@id': `${url}#website` },
        about: { '@id': `${url}#organization` } },
    ],
  };
}

export const serializeSchema = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
