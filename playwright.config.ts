import { defineConfig } from '@playwright/test';

// Normalize to a trailing slash so relative goto() paths resolve UNDER the base URL.
// Default is the custom-domain root; a sub-path BASE_URL (e.g. a Pages preview) still
// works because tests use relative paths.
const RAW_BASE_URL =
	process.env.BASE_URL ?? 'https://www.diversityincludesdisability.org';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

export default defineConfig({
	testDir: 'tests',
	timeout: 30_000,
	use: { baseURL: BASE_URL },
	reporter: 'list'
});
