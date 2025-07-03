import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: '/GraphGrid/tree/master/ReactGrid/',
    server: {
        port: 61020,
    }
})