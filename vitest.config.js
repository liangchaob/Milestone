import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['v3/tests/unit/**/*.spec.{js,ts}', 'v3/tests/integration/**/*.spec.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text','html'],
      thresholds: { lines: 0.8, statements: 0.8, branches: 0.7, functions: 0.8 }
    },
    setupFiles: ['v3/tests/setup.js']
  }
})
