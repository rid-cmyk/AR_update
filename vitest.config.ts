import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  oxc: false,
  esbuild: {
    // Komponen memakai JSX automatic runtime (React 19 / Next.js style, tanpa `import React`);
    // 'transform' (klasik) membuat komponen tanpa import React crash dengan
    // "ReferenceError: React is not defined" saat renderToStaticMarkup.
    jsx: 'automatic',
  } as Record<string, unknown>,
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'tests/**/*.spec.ts', 'tests/**/*.spec.tsx', 'lib/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'scripts', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
