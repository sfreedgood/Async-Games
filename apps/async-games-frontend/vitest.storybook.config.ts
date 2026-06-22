/// <reference types="@vitest/browser/providers/playwright" />
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Non-standard filename (not vitest.config.ts) so the @nx/vitest plugin does
// not infer a second `test` target that would collide with the Jest-based
// `test` target this project already uses for plain unit tests.
const projectRoot = dirname(fileURLToPath(import.meta.url));

// Pre-bundle the Storybook/React runtime deps up front. Without this, Vite
// discovers them mid-run and re-optimizes, which invalidates the hash of
// already-fetched chunks and makes a cold cache fail with "Failed to fetch
// dynamically imported module" (CI always starts cold).
const optimizeDeps = {
  include: [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-dev-runtime',
    'react/jsx-runtime',
    '@storybook/react-vite',
    '@storybook/react-dom-shim',
  ],
};

export default defineConfig({
  test: {
    projects: [
      // Component tests: every *.stories.tsx is rendered as a test in a real
      // (headless Chromium) browser via the Storybook Vitest addon.
      {
        plugins: [storybookTest({ configDir: join(projectRoot, '.storybook') })],
        optimizeDeps,
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: [join(projectRoot, '.storybook/vitest.setup.ts')],
        },
      },
      // Snapshot tests: composed stories rendered in jsdom and asserted with
      // toMatchSnapshot, catching unintended markup changes.
      {
        plugins: [react()],
        test: {
          name: 'snapshot',
          environment: 'jsdom',
          include: ['src/**/*.snap.test.{ts,tsx}'],
        },
      },
    ],
  },
});
