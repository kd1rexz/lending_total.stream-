import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { validateRelease } from '../../scripts/validate-release.mjs';
import { validateContentSource, visibleEntries } from '../../src/lib/content-source.mjs';
import { approvedSource, fixtureImage } from './fixtures/content.mjs';

const production = { BUILD_CONTEXT: 'production', SITE_URL: 'https://total-stream-validation.ru' };
const sourceFiles = {
  site: 'src/data/site.json',
  navigation: 'src/data/navigation.json',
  editorial: 'src/data/editorial.json',
  services: 'src/content/services.json',
  cases: 'src/content/cases.json',
  assets: 'src/data/assets.json',
};

async function withSource(source, callback, includeImage = true) {
  const rootDir = await mkdtemp(join(tmpdir(), 'total-stream-content-'));
  try {
    for (const [key, path] of Object.entries(sourceFiles)) {
      const target = join(rootDir, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, JSON.stringify(source[key]));
    }
    if (includeImage) {
      const target = join(rootDir, 'src/assets/images/fixture.png');
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, fixtureImage);
    }
    await callback(rootDir);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
}

function previewSource() {
  const source = approvedSource();
  source.site.contacts = [];
  source.site.contentApproved = false;
  source.site.brandApproved = false;
  source.assets = { productionReady: false, items: [] };
  source.cases = [];
  source.services.forEach((service) => {
    service.published = false;
  });
  return source;
}

test('preview defaults safely and accepts missing final contacts, domain, cases and approvals', async () => {
  await withSource(previewSource(), async (rootDir) => {
    const result = await validateRelease({ rootDir, env: {} });
    assert.equal(result.build.context, 'preview');
    assert.equal(result.build.siteUrl, undefined);
    assert.deepEqual(result.source.site.contacts, []);
    assert.deepEqual(result.source.cases, []);
  });
});

test('production accepts complete isolated fixtures without changing application data', async () => {
  await withSource(approvedSource(), async (rootDir) => {
    const result = await validateRelease({ rootDir, env: production });
    assert.equal(result.build.isPreview, false);
    assert.equal(result.source.cases.length, 3);
  });
});

test('unknown build context fails closed', () => {
  assert.throws(
    () => validateContentSource(approvedSource(), { BUILD_CONTEXT: 'prod' }),
    /BUILD_CONTEXT/,
  );
});

test('production needs a domain; malformed, insecure, credential and path URLs are rejected', () => {
  assert.throws(
    () => validateContentSource(approvedSource(), { BUILD_CONTEXT: 'production' }),
    /SITE_URL/,
  );
  for (const url of [
    'not-a-url',
    'http://total-stream-validation.ru',
    'https://user:pass@total-stream-validation.ru',
    'https://total-stream-validation.ru/path',
    'https://total-stream-validation.ru/?q=1',
    'https://total-stream-validation.ru/#x',
  ]) {
    assert.throws(() => validateContentSource(approvedSource(), { ...production, SITE_URL: url }));
  }
});

test('production rejects reserved domain and placeholder email or messenger host', () => {
  for (const host of ['localhost', 'example.com', 'preview.test', '127.0.0.1']) {
    assert.throws(
      () => validateContentSource(approvedSource(), { ...production, SITE_URL: `https://${host}` }),
      /real public domain/,
    );
  }
  for (const contact of [
    { kind: 'email', label: 'Email', href: 'mailto:test@example.com' },
    { kind: 'messenger', label: 'Messenger', href: 'https://localhost/user' },
  ]) {
    const source = approvedSource();
    source.site.contacts = [contact];
    assert.throws(() => validateContentSource(source, production), /example or local hostname/);
  }
});

test('empty production reports all missing content and media approvals', () => {
  assert.throws(
    () => validateContentSource(previewSource(), production),
    (error) => {
      for (const fragment of [
        'contact',
        'contentApproved',
        'brandApproved',
        'productionReady',
        '3–6',
        '3–4',
      ])
        assert.match(error.message, new RegExp(fragment));
      return true;
    },
  );
});

test('contact links reject wrong protocols, scripts, malformed phones and mail injection in every context', () => {
  for (const contact of [
    { kind: 'phone', label: 'Phone', href: 'tel:89991234567' },
    { kind: 'phone', label: 'Phone', href: 'tel:+7 999 1234567' },
    { kind: 'email', label: 'Email', href: 'mailto:bad-address' },
    { kind: 'email', label: 'Email', href: 'mailto:test@valid.ru?bcc=else@valid.ru' },
    { kind: 'email', label: 'Email', href: 'mailto:test%0d%0a@valid.ru' },
    { kind: 'email', label: 'Email', href: 'mailto:test?bcc@valid.ru' },
    { kind: 'email', label: 'Email', href: 'mailto:test@valid.ru%0d%0aBcc:else@valid.ru' },
    { kind: 'messenger', label: 'Messenger', href: 'javascript:alert(1)' },
    { kind: 'messenger', label: 'Messenger', href: 'http://t.me/test' },
    { kind: 'messenger', label: 'Messenger', href: 'https://user:secret@t.me/test' },
  ]) {
    const source = previewSource();
    source.site.contacts = [contact];
    assert.throws(() => validateContentSource(source, {}), /Invalid .* contact URL/);
  }
});

test('duplicate ids and contact links are rejected instead of silently replacing content', () => {
  const source = approvedSource();
  source.cases[1].id = source.cases[0].id;
  assert.throws(() => validateContentSource(source, production), /Duplicate content id/);
  const second = approvedSource();
  second.site.contacts.push(second.site.contacts[0]);
  assert.throws(() => validateContentSource(second, production), /must be unique/);
});

test('production counts only published cases and rejects too many', () => {
  const source = approvedSource();
  source.cases[0].published = false;
  assert.throws(() => validateContentSource(source, production), /3–6/);
  for (let index = 4; index <= 7; index++)
    source.cases.push({ ...source.cases[1], id: `case-${index}` });
  source.cases[0].published = true;
  assert.throws(() => validateContentSource(source, production), /3–6/);
});

test('reference media cannot become public just by checking overall approvals', () => {
  for (const patch of [{ scope: 'preview' }, { status: 'reference' }, { rights: 'unconfirmed' }]) {
    const source = approvedSource();
    Object.assign(source.assets.items[0], patch);
    assert.throws(() => validateContentSource(source, production), /cover must be registered/);
  }
  const source = approvedSource();
  source.assets.items = [];
  assert.throws(() => validateContentSource(source, production), /cover must be registered/);
});

test('missing image fails validation before Astro attempts to build', async () => {
  await withSource(
    approvedSource(),
    async (rootDir) => {
      await assert.rejects(
        validateRelease({ rootDir, env: production }),
        /Content asset is missing/,
      );
    },
    false,
  );
});

test('external images, traversal and unsafe video links are rejected', () => {
  for (const cover of [
    'https://host.ru/image.jpg',
    '../../../private/image.jpg',
    '../assets/images/../../secret.jpg',
  ]) {
    const source = approvedSource();
    source.cases[0].cover = cover;
    assert.throws(() => validateContentSource(source, production), /Use a local image/);
  }
  const source = approvedSource();
  source.cases[0].videoUrl = 'javascript:alert(1)';
  assert.throws(() => validateContentSource(source, production), /HTTPS/);
});

test('draft selection and deterministic sorting are shared with the page', () => {
  const items = [
    { id: 'b', order: 2, published: true },
    { id: 'draft', order: 0, published: false },
    { id: 'a', order: 2, published: true },
  ];
  assert.deepEqual(
    visibleEntries(items, false).map((item) => item.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    visibleEntries(items, true).map((item) => item.id),
    ['draft', 'a', 'b'],
  );
  assert.deepEqual(
    items.map((item) => item.id),
    ['b', 'draft', 'a'],
  );
});

test('service examples reject broken references and unpublished-only production examples', () => {
  const unknown = approvedSource();
  unknown.cases[0].serviceIds = ['missing-service'];
  assert.throws(() => validateContentSource(unknown, {}), /unknown service missing-service/);

  const duplicate = approvedSource();
  duplicate.cases[0].serviceIds.push(duplicate.cases[0].serviceIds[0]);
  assert.throws(() => validateContentSource(duplicate, {}), /Service ids must be unique/);

  const draft = approvedSource();
  draft.cases.push({ ...draft.cases[0], id: 'unrelated-published-case', serviceIds: [] });
  draft.cases[0].published = false;
  assert.throws(
    () => validateContentSource(draft, production),
    /service-1: production requires at least one published example/,
  );
  assert.doesNotThrow(() => validateContentSource(draft, {}));
});
