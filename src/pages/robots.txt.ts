import { resolveBuildContext } from '../lib/build-context.mjs';
export function GET() {
  const { isPreview, siteUrl } = resolveBuildContext();
  const content = isPreview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
