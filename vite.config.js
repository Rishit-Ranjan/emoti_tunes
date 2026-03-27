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

    // Auto-detect LLM ports
    let foundryTarget = env.VITE_FOUNDRY_TARGET || 'http://127.0.0.1:61153';
    let ollamaTarget = env.VITE_OLLAMA_TARGET || 'http://127.0.0.1:11434';
    
    // Scan for active services if not explicitly set
    const foundPorts = [];
    const portsToTry = [61153, 61154, 61155, 61150, 11434, 1234, 11435];
    
    for (const port of portsToTry) {
        if (await isPortOpen(port)) {
            foundPorts.push(port);
            console.log(`🟢 [Discovery] Found active service on port: ${port}`);
        }
    }
    
    // Assign targets based on discovered ports if ENV is missing
    if (!env.VITE_FOUNDRY_TARGET && foundPorts.length > 0) {
        // Foundry usually defaults to 61153
        const fPort = foundPorts.find(p => p >= 61150 && p <= 61159) || foundPorts[0];
        foundryTarget = `http://127.0.0.1:${fPort}`;
    }
    
    if (!env.VITE_OLLAMA_TARGET && foundPorts.length > 0) {
        // Ollama usually defaults to 11434
        const oPort = foundPorts.find(p => p === 11434 || p === 11435) || (foundPorts.length > 1 ? foundPorts[foundPorts.length - 1] : foundPorts[0]);
        ollamaTarget = `http://127.0.0.1:${oPort}`;
    }

    console.log(`📡 [Proxy Configuration] Foundry: ${foundryTarget} | Ollama: ${ollamaTarget}`);

    return {
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        server: {
            proxy: {
                // Primary Foundry Proxy (Text-heavy tasks)
                '/api/foundry': {
                    target: foundryTarget,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/foundry/, ''),
                    configure: (proxy) => {
                        proxy.on('error', (err) => {
                            console.log('🔴 Foundry proxy error:', err.message);
                        });
                    }
                },
                // Secondary Ollama Proxy (Vision/Multimodal)
                '/api/ollama': {
                    target: ollamaTarget,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
                    configure: (proxy) => {
                        proxy.on('error', (err) => {
                            console.log('🔴 Ollama proxy error:', err.message);
                        });
                    }
                }
            }
        }
    };
});