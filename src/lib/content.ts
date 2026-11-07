import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import type { CaseStudy, PageContent, TrustItem } from '../types/content';
import { loadValidatedContent, visibleEntries } from './content-source.mjs';
import teamPortrait from '../assets/images/yuri-mineev.jpg';

const clientLogos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/clients/*.{svg,png,webp}',
);

const caseImages = import.meta.glob<{ default: ImageMetadata }>([
  '../assets/images/*.{avif,jpg,jpeg,png,webp}',
  '!../assets/images/brand-reference-*',
  '!../assets/images/case-preview-*',
  '!../assets/images/preparation.jpg',
  '!../assets/images/yuri-mineev.*',
]);

// A compile-time condition keeps draft cover imports out of production bundles.
const previewCaseImages = import.meta.env.TOTAL_STREAM_PREVIEW
  ? import.meta.glob<{ default: ImageMetadata }>('../assets/images/case-preview-*.jpg')
  : {};

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
      const loadImage = caseImages[entry.cover] ?? previewCaseImages[entry.cover];
      if (!loadImage)
        throw new Error(`Case ${entry.id}: local cover image not found (${entry.cover}).`);
      return { ...entry, cover: (await loadImage()).default };
    }),
  );

  const clients: TrustItem[] = await Promise.all(
    source.editorial.clients
      .filter((item) => build.isPreview || !item.previewOnly)
      .map(async (item) => {
        const loadLogo = clientLogos[`../assets/clients/${item.logo}`];
        if (!loadLogo) throw new Error(`Client ${item.name}: logo not found (${item.logo}).`);
        return { ...item, logo: (await loadLogo()).default };
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
    clients,
    team: { ...source.editorial.team, portrait: teamPortrait },
  };
}
