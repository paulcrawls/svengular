import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const demoRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(demoRoot, '../..');

export default {
  root: demoRoot,
  resolve: {
    alias: {
      svengular: resolve(repoRoot, 'src')
    }
  },
  build: {
    outDir: '../../dist/demo',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
};
