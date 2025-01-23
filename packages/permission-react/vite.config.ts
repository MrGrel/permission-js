import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'PermissionReact',
      formats: ['umd', 'es'],
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@permission/core'],
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
})
