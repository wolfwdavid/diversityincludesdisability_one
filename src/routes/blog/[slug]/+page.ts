// src/routes/blog/[slug]/+page.ts — universal load (returns a non-serializable component; must be +page.ts).
import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
export const prerender = true;

const modules = import.meta.glob('/src/lib/posts/*.md'); // lazy: loader map keyed by path

export async function load({ params }) {
	const loader = modules[`/src/lib/posts/${params.slug}.md`];
	if (!loader) throw error(404, 'Post not found');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const post = (await loader()) as { default: Component; metadata: any };
	return { Content: post.default, meta: post.metadata };
}

export function entries() {
	return Object.keys(modules).map((path) => ({
		slug: path.split('/').at(-1)!.replace('.md', '')
	}));
}
