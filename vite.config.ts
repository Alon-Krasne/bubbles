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
    {
      name: 'local-saves-mock',
      configureServer(server) {
        const localSaves = new Map<string, { revision: number; value: string }>();
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/saves' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(Object.fromEntries(localSaves)));
            return;
          }
          if (req.url?.startsWith('/api/saves/') && req.method === 'PUT') {
            const key = decodeURIComponent(req.url.slice('/api/saves/'.length));
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(Buffer.from(chunk)));
            req.on('end', () => {
              try {
                const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                const current = localSaves.get(key) || { revision: 0, value: null };
                if (current.revision !== data.revision) {
                  res.statusCode = 409;
                  res.end(JSON.stringify({ error: 'conflict' }));
                  return;
                }
                const updated = { revision: current.revision + 1, value: data.value };
                localSaves.set(key, updated);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(updated));
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'bad request' }));
              }
            });
            return;
          }
          next();
        });
      },
    },
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
