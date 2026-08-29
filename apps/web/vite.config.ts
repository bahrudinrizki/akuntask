import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'akuntask';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' && process.env.GITHUB_PAGES ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number(process.env.WEB_PORT ?? 5173),
  },
}));
