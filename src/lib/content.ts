import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import type { CaseStudy, PageContent } from '../types/content';
import { loadValidatedContent, visibleEntries } from './content-source.mjs';

// Lazy imports keep unused reference images out of case media in production.
const caseImages = import.meta.glob<{ default: ImageMetadata }>([
  '../assets/images/*.{avif,jpg,jpeg,png,webp}',
  '!../assets/images/brand-reference-*',
]);

export async function getPageContent(): Promise<PageContent> {
  const { source, build } = await loadValidatedContent();
  const [serviceEntries, caseEntries] = await Promise.all([
    getCollection('services'),
    source.cases.length ? getCollection('cases') : Promise.resolve([]),
  ]);
  const services = visibleEntries(
    serviceEntries.map((entry) => entry.data),
    build.isPreview,
  );
  const cases: CaseStudy[] = await Promise.all(
    visibleEntries(
      caseEntries.map((entry) => entry.data),
      build.isPreview,
    ).map(async (entry) => {
      const loadImage = caseImages[entry.cover];
      if (!loadImage)
        throw new Error(`Case ${entry.id}: local cover image not found (${entry.cover}).`);
      return { ...entry, cover: (await loadImage()).default };
    }),
  );

  return {
    site: source.site,
    navigation: source.navigation,
    services: services.map((service) => ({
      ...service,
      examples: cases.filter((entry) => entry.serviceIds.includes(service.id)),
    })),
    cases,
    ...source.editorial,
  };
}
