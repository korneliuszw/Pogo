import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        mkcert()
    ],
    server: {
        https: true,
    }
});
