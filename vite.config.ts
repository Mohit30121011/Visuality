import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Use '.' instead of process.cwd() to avoid TS error about missing cwd property on Process type
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist', // Standard Vite output directory
    },
    // Polyfill process.env for the browser so your service files work without changes
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.REACT_APP_GOOGLE_CLIENT_ID': JSON.stringify(env.REACT_APP_GOOGLE_CLIENT_ID),
    },
  };
});