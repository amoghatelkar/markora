import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string
}

export default defineConfig({
  plugins: [react()],
  define: {
    __MARKORA_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
})
