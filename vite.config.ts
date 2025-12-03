import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.FRONTEND_URL': JSON.stringify(env.FRONTEND_URL),
      'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL)
    },
    plugins: [react()],
      server : {
          proxy: {
              '/api': {
                  target: 'http://localhost:8001',
                  changeOrigin: true,
                  rewrite: (path: string) => path.replace(/^\/api/, ''),

                  configure: (proxy, _options) => {
                      proxy.on('error', (err, _req, _res) => {
                          console.log('proxy error', err);
                      });
                      proxy.on('proxyReq', (proxyReq, req, _res) => {
                          console.log('Sending Request to the Target:', req.method, req.url);
                      });
                      proxy.on('proxyRes', (proxyRes, req, _res) => {
                          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                      });
                  },
              },
          }
      }
  }
})
