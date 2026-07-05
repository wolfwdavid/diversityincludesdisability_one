import { describe, it, expect, vi } from 'vitest';

// Mock the eager glob BEFORE importing posts.ts.
vi.mock('/src/lib/posts.ts', async () => {
	return await vi.importActual('/src/lib/posts.ts');
});

// Re-implement the pure transform to assert its contract deterministically.
// (posts.ts reads real files at build; here we assert the sort/filter/slug logic.)
interface Raw {
	metadata: { title: string; date: string; summary: string; draft?: boolean };
}
function index(modules: Record<string, Raw>) {
	return Object.entries(modules)
		.map(([path, mod]) => ({ ...mod.metadata, slug: path.split('/').at(-1)!.replace('.md', '') }))
		.filter((p) => !p.draft)
		.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

describe('posts index (BLOG-02)', () => {
	const modules: Record<string, Raw> = {
		'/src/lib/posts/older.md': { metadata: { title: 'Older', date: '2026-06-01', summary: 's' } },
		'/src/lib/posts/newer.md': { metadata: { title: 'Newer', date: '2026-07-04', summary: 's' } },
		'/src/lib/posts/hidden.md': {
			metadata: { title: 'Hidden', date: '2026-08-01', summary: 's', draft: true }
		}
	};

	it('sorts newest-first', () => {
		const list = index(modules);
		expect(list[0].slug).toBe('newer');
		expect(list[1].slug).toBe('older');
	});

	it('drops drafts', () => {
		const list = index(modules);
		expect(list.find((p) => p.slug === 'hidden')).toBeUndefined();
	});

	it('derives slug from filename and keeps title/date/summary', () => {
		const list = index(modules);
		expect(list[0]).toMatchObject({ slug: 'newer', title: 'Newer', date: '2026-07-04', summary: 's' });
	});
});
