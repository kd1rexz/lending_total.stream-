import assert from 'node:assert/strict';
import test from 'node:test';
import { createSitemap, createSiteSchema, serializeSchema } from '../../src/lib/seo.mjs';
import { resolveBuildContext } from '../../src/lib/build-context.mjs';

test('preview sitemap never leaks local, staging or invented URLs', () => {
  for (const env of [{}, { BUILD_CONTEXT: 'preview', SITE_URL: 'https://staging.test' }]) {
    const context = resolveBuildContext(env);
    assert.doesNotMatch(createSitemap(context), /<loc>|localhost|127\.0\.0\.1|staging\.test/);
    assert.equal(createSiteSchema(context, {}), undefined);
  }
});

test('public sitemap contains only the canonical homepage and requires a domain', () => {
  const context = resolveBuildContext({ BUILD_CONTEXT: 'production', SITE_URL: 'https://totalstream.test' });
  const xml = createSitemap(context);
  assert.equal((xml.match(/<loc>/g) || []).length, 1);
  assert.match(xml, /<loc>https:\/\/totalstream\.test\/<\/loc>/);
  assert.doesNotMatch(xml, /404|#|lastmod|priority|changefreq/);
  assert.throws(() => createSitemap({ isPreview: false }), /requires SITE_URL/);
});

test('organization markup uses supplied brand data without invented business facts', () => {
  const graph = createSiteSchema({ isPreview: false, siteUrl: 'https://totalstream.test' }, {
    name: 'Total Stream', description: 'Видеотрансляции под ключ', logo: '/_astro/logo.png',
  });
  const organization = graph['@graph'][0];
  assert.equal(organization.logo, 'https://totalstream.test/_astro/logo.png');
  assert.equal(organization.name, 'Total Stream');
  for (const key of ['address', 'telephone', 'email', 'taxID', 'aggregateRating', 'sameAs'])
    assert.equal(organization[key], undefined);
  assert.equal(graph['@graph'][1].publisher['@id'], organization['@id']);
  assert.doesNotMatch(serializeSchema({ name: '</script><script>alert(1)</script>' }), /</);
});
