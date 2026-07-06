// scripts/assert-no-secret.mjs
// FORM-04 + secret-hygiene gate (org is 501c3-pending — no committed credentials).
//  1. No real-looking Web3Forms access key (UUID shape) in src/ or build/.
//  2. config.ts keeps the committed PUBLIC placeholder + a TODO marker.
//  3. The donate link keeps rel="noopener noreferrer".
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const errors = [];

function walk(dir, exts) {
	let files = [];
	if (!existsSync(dir)) return files;
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) files = files.concat(walk(p, exts));
		else if (exts.some((e) => p.endsWith(e))) files.push(p);
	}
	return files;
}

// 1. No UUID-shaped access key anywhere in source or build output.
for (const dir of ['src', 'build']) {
	for (const file of walk(dir, ['.ts', '.js', '.svelte', '.html'])) {
		if (UUID_RE.test(readFileSync(file, 'utf8'))) {
			errors.push(`Possible real access key (UUID shape) committed in ${file}`);
		}
	}
}

// 2. config.ts keeps the committed placeholder + a TODO marker.
const cfg = existsSync('src/lib/config.ts') ? readFileSync('src/lib/config.ts', 'utf8') : '';
if (!cfg.includes('WEB3FORMS_ACCESS_KEY')) errors.push('config.ts missing WEB3FORMS_ACCESS_KEY export');
if (!cfg.includes('YOUR_WEB3FORMS_ACCESS_KEY')) errors.push('config.ts missing the placeholder key value');
if (!/TODO/.test(cfg)) errors.push('config.ts missing a TODO marker');

// 3. Donate link keeps rel="noopener noreferrer".
const gi = existsSync('src/routes/get-involved/+page.svelte')
	? readFileSync('src/routes/get-involved/+page.svelte', 'utf8')
	: '';
if (!/rel="noopener noreferrer"/.test(gi)) {
	errors.push('get-involved donate link missing rel="noopener noreferrer"');
}

if (errors.length) {
	console.error('FORM-04 / secret-hygiene FAILED:\n' + errors.join('\n'));
	process.exit(1);
}
console.log('FORM-04 / secret-hygiene OK — no committed key, placeholder present, rel=noopener present.');
