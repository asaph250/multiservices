import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
  base: "/multiservices/", // 👈 GitHub Pages fix
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  server: {
    host: "::",
    port: 8080,
  },
}));
