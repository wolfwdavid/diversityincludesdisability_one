import { defineConfig } from '@playwright/test';

const BASE_URL =
	process.env.BASE_URL ?? 'https://wolfwdavid.github.io/diversityincludesdisability_one';

export default defineConfig({
	testDir: 'tests',
	timeout: 30_000,
	use: { baseURL: BASE_URL },
	reporter: 'list'
});
