import { z } from 'zod';

const text = z.string().trim().min(1);
const id = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const order = z.number().int().nonnegative();

function isSafeHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !/\s/.test(value);
  } catch {
    return false;
  }
}

export const httpsUrlSchema = text.refine(isSafeHttps, 'Use an HTTPS URL without credentials.');

export const contactSchema = z
  .object({ kind: z.enum(['phone', 'email', 'messenger']), label: text, href: text })
  .strict()
  .superRefine((contact, context) => {
    let valid = false;
    if (contact.kind === 'phone') valid = /^tel:\+[1-9]\d{7,14}$/.test(contact.href);
    if (contact.kind === 'email') {
      valid =
        /^mailto:[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(
          contact.href,
        ) && !/[?#]|%0[ad]/i.test(contact.href);
    }
    if (contact.kind === 'messenger') valid = isSafeHttps(contact.href);
    if (!valid)
      context.addIssue({
        code: 'custom',
        path: ['href'],
        message: `Invalid ${contact.kind} contact URL.`,
      });
  });

export const siteSchema = z
  .object({
    name: text,
    description: text,
    contacts: z.array(contactSchema),
    contentApproved: z.boolean(),
    brandApproved: z.boolean(),
  })
  .strict();

export const serviceSchema = z
  .object({ id, title: text, description: text, tag: text, order, published: z.boolean() })
  .strict();

export const caseSchema = z
  .object({
    id,
    serviceIds: z
      .array(id)
      .refine((ids) => new Set(ids).size === ids.length, 'Service ids must be unique.')
      .default([]),
    title: text,
    eventType: text,
    cover: text.regex(
      /^\.\.\/assets\/images\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:avif|jpe?g|png|webp)$/,
      'Use a local image in src/assets/images.',
    ),
    coverAlt: text,
    task: text,
    solution: text,
    result: text,
    order,
    published: z.boolean(),
    client: text.optional(),
    location: text.optional(),
    date: text.optional(),
    videoUrl: httpsUrlSchema.optional(),
  })
  .strict();

const stepSchema = z.object({ title: text, description: text }).strict();
export const editorialSchema = z
  .object({
    team: z.object({ name: text, role: text, description: text }).strict(),
    reliability: z.array(stepSchema),
    faq: z.array(z.object({ question: text, answer: text }).strict()),
    reviews: z.array(z.object({ quote: text, author: text, company: text }).strict()),
    clients: z.array(z.object({ name: text }).strict()),
  })
  .strict();

export const navigationSchema = z.array(
  z.object({ label: text, href: z.enum(['#services', '#cases', '#team', '#contacts']) }).strict(),
);

export const assetsSchema = z
  .object({
    productionReady: z.boolean(),
    items: z.array(
      z
        .object({
          path: text
            .regex(/^(?:src\/assets\/|public\/)[a-zA-Z0-9][a-zA-Z0-9/._-]*$/)
            .refine(
              (value) => !value.split('/').includes('..'),
              'Asset paths cannot escape the repository.',
            ),
          source: text,
          rights: z.enum(['unconfirmed', 'cleared']),
          status: z.enum(['reference', 'approved']),
          scope: z.enum(['preview', 'production']),
          note: text,
        })
        .strict(),
    ),
  })
  .strict();

const uniqueEntries = (schema) =>
  z.array(schema).superRefine((entries, context) => {
    const seen = new Set();
    entries.forEach((entry, index) => {
      if (seen.has(entry.id))
        context.addIssue({ code: 'custom', path: [index, 'id'], message: 'Duplicate content id.' });
      seen.add(entry.id);
    });
  });

export const sourceSchema = z
  .object({
    site: siteSchema,
    navigation: navigationSchema,
    editorial: editorialSchema,
    services: uniqueEntries(serviceSchema),
    cases: uniqueEntries(caseSchema),
    assets: assetsSchema,
  })
  .strict();
