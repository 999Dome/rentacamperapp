import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@shared': resolve(__dirname, '../shared')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'aboutus/index.html'),
        account: resolve(__dirname, 'account/index.html'),
        rent: resolve(__dirname, 'rent/index.html'),
        rentout: resolve(__dirname, 'rentout/index.html')
      },
    },
  },
})