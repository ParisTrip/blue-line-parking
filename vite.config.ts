import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/blue-line-parking/',
  plugins: [react()],
  server: {
    host: true,
  },
});
