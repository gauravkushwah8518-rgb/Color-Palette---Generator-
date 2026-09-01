import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          explorer: path.resolve(__dirname, 'explorer.html'),
          saved: path.resolve(__dirname, 'saved.html'),
          gradient: path.resolve(__dirname, 'gradient.html'),
          contrast: path.resolve(__dirname, 'contrast.html'),
          guide: path.resolve(__dirname, 'guide.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
