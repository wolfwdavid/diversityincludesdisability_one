// src/lib/data/nav.ts — single source of truth for primary nav. Hrefs are base-prefixed at render.
export const navItems = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/programs', label: 'Programs & Services' },
	{ href: '/get-involved', label: 'Get Involved' },
	{ href: '/events', label: 'Events' },
	{ href: '/blog', label: 'News' },
	{ href: '/contact', label: 'Contact' }
] as const;
