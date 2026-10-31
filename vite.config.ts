import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      minify: 'esbuild',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom')) {
                return 'vendor-react-dom';
              }
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('recharts') && (id.includes('cartesian') || id.includes('chart') || id.includes('polar'))) {
                return 'vendor-recharts-cartesian';
              }
              if (id.includes('recharts')) {
                return 'vendor-recharts-core';
              }
              if (id.includes('d3-')) {
                return 'vendor-d3';
              }
              if (id.includes('victory')) {
                return 'vendor-victory';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              return 'vendor-core';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio to prevent WebSocket connection errors in the proxied container.
      hmr: false,
      watch: null,
    },
  };
});
