// svelte.config.js — adapter-static (Phase 1) + mdsvex/Shiki build-time content pipeline (Phase 3).
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';

// One highlighter for the whole build (lazy singleton — never per code block).
let highlighter;
const codeTheme = 'github-dark';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			highlighter ??= await createHighlighter({
				themes: [codeTheme],
				langs: ['javascript', 'typescript', 'svelte', 'html', 'css', 'json', 'bash', 'python']
			});
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: codeTheme }));
			return `{@html \`${html}\`}`;
		}
	},
	rehypePlugins: [rehypeSlug]
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter({
			fallback: '404.html', // GitHub Pages serves this for any unmatched path (DEPLOY-03)
			precompress: false,
			strict: true // build FAILS if any route isn't prerendered
		}),
		paths: {
			base: process.env.BASE_PATH ?? '',
			relative: false
		}
	}
};
export default config;
