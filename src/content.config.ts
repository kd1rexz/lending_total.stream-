import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { caseSchema, serviceSchema } from './lib/content-schema.mjs';

export const collections = {
  services: defineCollection({
    loader: file('src/content/services.json'),
    schema: serviceSchema,
  }),
  cases: defineCollection({
    loader: file('src/content/cases.json'),
    schema: caseSchema,
  }),
};
