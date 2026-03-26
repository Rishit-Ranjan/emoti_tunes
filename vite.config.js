import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [react()], // Add React plugin if you're using React
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            // Add Foundry endpoint for client-side use
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        server: {
            proxy: {
                // Proxy all Foundry API requests to avoid CORS
                '/api/foundry': {
                    target: env.VITE_FOUNDRY_TARGET || 'http://127.0.0.1:61153',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/foundry/, ''),
                    configure: (proxy, options) => {
                        proxy.on('error', (err, req, res) => {
                            console.log('🔴 Foundry proxy error:', err.message);
                        });
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            console.log('🟢 Proxying Foundry request:', req.method, req.url, '→', proxyReq.path);
                        });
                        proxy.on('proxyRes', (proxyRes, req, res) => {
                            console.log('🟡 Foundry response:', proxyRes.statusCode);
                        });
                    }
                }
            }
        }
    };
});