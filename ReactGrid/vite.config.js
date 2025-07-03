import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: '/GraphGrid/tree/master/ReacrGrid/',
    server: {
        port: 61020,
    }
})