import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 60298,
        proxy: {
            // Proxy API calls to Django during development
            '/api': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:9000',
                changeOrigin: true,
                secure: false,
                // Strip the /api prefix if your Django urls do not include it
                // rewrite: (path) => path.replace(/^\/api/, ''),
            }
        }
    },
    build: {
        // Performance optimizations
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for third-party libraries
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // UI components chunk
                    ui: ['lucide-react'],
                    // API and utilities chunk
                    utils: ['axios']
                }
            }
        },
        // Enable source maps for better debugging
        sourcemap: true,
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Enable minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true
            }
        }
    },
    // Performance optimizations
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react']
    }
})