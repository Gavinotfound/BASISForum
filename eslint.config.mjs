import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    settings: {
      next: {
        rootDir: ['apps/web/', 'apps/admin/'],
      },
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  prettier,
  globalIgnores([
    '**/.next/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/dist/**',
    '**/out/**',
    '**/build/**',
    '**/next-env.d.ts',
  ]),
]);
