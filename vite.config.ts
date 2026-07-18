import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inlineAssets = process.env.npm_lifecycle_event === 'bundle'
  || process.env.npm_lifecycle_event === 'share';

export default defineConfig({
  base: './',
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (!inlineAssets && hostType === 'js') {
        return {
          runtime: `new URL(${JSON.stringify(`./${filename}`)}, document.baseURI).href`,
        };
      }
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
  },
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: inlineAssets,
    }),
  ],
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: inlineAssets ? 100000000 : 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
