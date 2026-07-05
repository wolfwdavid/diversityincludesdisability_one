// src/lib/posts.ts — build-time post index from globbed markdown frontmatter (BLOG-02).
export interface PostMeta {
	title: string;
	date: string; // ISO 'YYYY-MM-DD'
	summary: string;
	slug: string;
	draft?: boolean;
}

const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true });

export const posts: PostMeta[] = Object.entries(modules)
	.map(([path, mod]) => {
		const meta = (mod as { metadata: Omit<PostMeta, 'slug'> }).metadata;
		return { ...meta, slug: path.split('/').at(-1)!.replace('.md', '') };
	})
	.filter((p) => !p.draft)
	.sort((a, b) => +new Date(b.date) - +new Date(a.date));
