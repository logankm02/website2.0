import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    assetsInclude: ['**/*.glb'],
    define: {
      'process.env.REACT_APP_WEATHER_API_KEY': JSON.stringify(env.REACT_APP_WEATHER_API_KEY),
      'process.env.REACT_APP_SPOTIFY_CLIENT_ID': JSON.stringify(env.REACT_APP_SPOTIFY_CLIENT_ID),
      'process.env.REACT_APP_SPOTIFY_CLIENT_SECRET': JSON.stringify(env.REACT_APP_SPOTIFY_CLIENT_SECRET),
    },
  }
})