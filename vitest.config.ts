import { defineConfig } from 'vitest/config';

// Deliberately separate from vite.config.ts. The app config loads the
// ESM-only @tailwindcss/vite plugin, which Vitest's bundled (older) Vite
// cannot require — and the unit tests cover pure functions in src/lib,
// so they need no plugins, JSX transform, or CSS pipeline at all.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
