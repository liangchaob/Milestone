import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: './v3',
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist'
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{spec,test}.{js,ts,jsx,tsx}', 'tests/unit/**/*.spec.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text','html'],
      thresholds: { lines: 0.8, statements: 0.8, branches: 0.7, functions: 0.8 }
    },
    setupFiles: ['tests/setup.js']
  }
})
