import { createSitemap } from '../lib/seo.mjs';

export function GET() {
  return new Response(createSitemap(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
