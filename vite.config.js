import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base relative : fonctionne sous https://<org>.github.io/<repo>/
export default defineConfig({ base: './', plugins: [svelte()] });
