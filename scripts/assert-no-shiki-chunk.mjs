// Scan the built client bundle for any runtime-highlighter leakage. Exit 1 if found.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'build/_app';
const NEEDLES = ['codeToHtml', 'createHighlighter', 'getHighlighter', '"shiki"', "'shiki'"];

function walk(dir) {
	let files = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) files = files.concat(walk(p));
		else if (p.endsWith('.js')) files.push(p);
	}
	return files;
}

const hits = [];
for (const file of walk(ROOT)) {
	const src = readFileSync(file, 'utf8');
	for (const needle of NEEDLES) if (src.includes(needle)) hits.push(`${file} :: ${needle}`);
}

if (hits.length) {
	console.error('BLOG-03 FAILED — runtime highlighter shipped to client:\n' + hits.join('\n'));
	process.exit(1);
}
console.log('BLOG-03 OK — no shiki/highlighter code in build/_app.');
