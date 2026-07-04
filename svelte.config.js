// svelte.config.js — Source: https://svelte.dev/docs/kit/adapter-static (verified 2026-07-04)
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html', // GitHub Pages serves this for any unmatched path (DEPLOY-03)
			precompress: false,
			strict: true // DEFAULT — build FAILS if any route isn't prerendered
		}),
		paths: {
			// '' locally so dev/preview work from root; CI sets BASE_PATH=/diversityincludesdisability_one
			base: process.env.BASE_PATH ?? ''
		}
	}
};
export default config;
