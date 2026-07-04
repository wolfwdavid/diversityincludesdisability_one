import { defineConfig } from '@playwright/test';

// Normalize to a trailing slash so relative goto() paths resolve UNDER the repo
// sub-path. Without it, a leading-slash goto('/about/') resets to the origin root
// (https://wolfwdavid.github.io/about/) and hits GitHub's raw 404 instead of our site.
const RAW_BASE_URL =
	process.env.BASE_URL ?? 'https://wolfwdavid.github.io/diversityincludesdisability_one';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

export default defineConfig({
	testDir: 'tests',
	timeout: 30_000,
	use: { baseURL: BASE_URL },
	reporter: 'list'
});
