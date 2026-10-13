export function resolveBuildContext(env = process.env) {
  const context = env.BUILD_CONTEXT || 'preview';
  if (!['preview', 'production'].includes(context)) {
    throw new Error('BUILD_CONTEXT must be preview or production.');
  }
  let siteUrl;
  if (env.SITE_URL) {
    const parsed = new URL(env.SITE_URL);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== '/'
    ) {
      throw new Error('SITE_URL must be an HTTPS origin without a path or credentials.');
    }
    siteUrl = parsed.origin;
  }
  if (context === 'production' && !siteUrl) throw new Error('Production requires SITE_URL.');
  return { context, isPreview: context === 'preview', siteUrl };
}
