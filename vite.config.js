import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filter — loads ANTHROPIC_API_KEY etc.)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // NOTE: ANTHROPIC_API_KEY is intentionally NOT exposed to the browser bundle.
    // It is used only in the Vite dev-server proxy above (server-side).
    define: {
      'process.env.CLAUDE_MODEL': JSON.stringify(env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001'),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL || ''),
    },

    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Inject API key server-side — never exposed to browser
              proxyReq.setHeader('x-api-key', env.ANTHROPIC_API_KEY || '');
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },

    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'framer-motion'],
            services: [
              './src/services/aiService',
              './src/services/orchestratorEngine',
              './src/services/databaseService',
            ],
            data: [
              './src/data/agents',
              './src/data/agent-routing',
              './src/data/intelligence',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
