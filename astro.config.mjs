import { defineConfig } from 'astro/config';
import { resolveBuildContext } from './src/lib/build-context.mjs';

const { siteUrl } = resolveBuildContext();
export default defineConfig({
  output: 'static',
  site: siteUrl,
  devToolbar: { enabled: false },
  build: { format: 'file' },
  vite: { build: { sourcemap: false } },
});
