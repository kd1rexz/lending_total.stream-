import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  srcDir: fileURLToPath(new URL('./src/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public/', import.meta.url)),
  outDir: fileURLToPath(new URL('../../output/component-preview/', import.meta.url)),
  cacheDir: fileURLToPath(new URL('../../node_modules/.astro-component-preview/', import.meta.url)),
  devToolbar: { enabled: false },
  vite: { server: { fs: { allow: [fileURLToPath(new URL('../../', import.meta.url))] } } },
});
