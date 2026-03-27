import path from 'path';
import net from 'node:net';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if a local port is open (Node.js side)
const isPortOpen = (port) => new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1', () => {
        socket.end();
        resolve(true);
    });
    socket.setTimeout(150);
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
});

export default defineConfig(async ({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Auto-detect Foundry port if not explicitly set in ENV
    let foundryTarget = env.VITE_FOUNDRY_TARGET || 'http://127.0.0.1:61153';
    if (!env.VITE_FOUNDRY_TARGET) {
        const portsToTry = [61153, 61154, 61155, 61150, 11434, 1234];
        for (const port of portsToTry) {
            if (await isPortOpen(port)) {
                foundryTarget = `http://127.0.0.1:${port}`;
                console.log(`🟢 [Discovery] Found active LLM service on port: ${port}`);
                break;
            }
        }
    }

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
                    target: foundryTarget,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/foundry/, ''),
                    configure: (proxy) => {
                        proxy.on('error', (err, req, res) => {
                            console.log('🔴 Foundry proxy error:', err.message);
                            if (res && !res.headersSent && typeof res.writeHead === 'function') {
                                res.writeHead(502, { 'Content-Type': 'text/plain' });
                                res.end(`Foundry Proxy Error: ${err.message}`);
                            }
                        });
                        proxy.on('proxyReq', (proxyReq, req) => {
                            console.log('🟢 Proxying Foundry request:', req.method, req.url, '→', proxyReq.path);
                        });
                        proxy.on('proxyRes', (proxyRes) => {
                            console.log('🟡 Foundry response:', proxyRes.statusCode);
                        });
                    }
                }
            }
        }
    };
});