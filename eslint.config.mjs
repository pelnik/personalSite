// ESLint for the whole repo. CI fails on errors only, so rules that are too
// noisy for the older demo code are warnings there (see demoCode below).
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The demo apps and their APIs, kept from earlier projects.
const demoCode = [
  'src/api/fitness-tracker/**',
  'src/api/juicebox/**',
  'src/api/scents/**',
  'src/fullReactProjects/**',
];

export default defineConfig([
  // public/ is copied to build/ as-is (legacy standalone scripts), never bundled.
  globalIgnores(['build/', 'public/', 'oldpublic/', 'Keys/', 'test-results/', 'playwright-report/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Express only treats a handler as error middleware if it takes all four
      // arguments, so an unused `next` there is required.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$' }],
    },
  },
  // The server, API, Jest and scripts are CommonJS on Node.
  {
    files: ['**/*.{js,cjs}'],
    ignores: ['src/components/**', 'src/fullReactProjects/**'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      // `const crypto = require('crypto')` shadows Node's global on purpose.
      'no-redeclare': ['error', { builtinGlobals: false }],
    },
  },
  {
    files: ['src/api/**/tests/**/*.js', 'tests/support/**/*.js'],
    languageOptions: { globals: globals.jest },
  },
  {
    files: ['**/*.{mjs,mts}', 'tests/e2e/**', 'playwright.config.ts'],
    languageOptions: { globals: globals.node },
  },
  // Its page.evaluate() callbacks run in the browser.
  {
    files: ['scripts/prerender.mjs'],
    languageOptions: { globals: globals.browser },
  },
  // Playwright fixtures must destructure their first argument, even as `{}`.
  {
    files: ['tests/e2e/**'],
    rules: { 'no-empty-pattern': 'off' },
  },
  {
    files: ['src/index.tsx', 'src/components/**', 'src/fullReactProjects/**'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      // React Compiler rules: they flag patterns that work today, and fixing
      // them means reworking components.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: demoCode,
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'warn',
    },
  },
]);
