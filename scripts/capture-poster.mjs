// Dev-only poster capture: screenshot the LIVE constellation (Premium) and optimize to
// AVIF/WebP/JPG under static/hero/. Not wired into CI or `npm test` — a one-off dev tool.
//
// Prereq: a running preview on http://localhost:4173/ (npm run build && npm run preview --
//   --port 4173 --strictPort). Then: node scripts/capture-poster.mjs
//
// app code never imports sharp/playwright — they cannot leak into the client bundle.

import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const URL = process.env.POSTER_URL ?? 'http://localhost:4173/';
const OUT_DIR = 'static/hero';
const SETTLE_MS = Number(process.env.POSTER_SETTLE_MS ?? 2600); // let drift reach a pleasing frame

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1600, height: 900 },
		deviceScaleFactor: 2 // 2x capture (D-16)
	});
	const page = await context.newPage();
	await page.addInitScript(() => localStorage.setItem('did:theme', 'premium'));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto(URL, { waitUntil: 'networkidle' });

	// Wait for the live scene to mount, then let the drift settle to a pleasing composition.
	await page.locator('canvas').waitFor({ state: 'visible', timeout: 15_000 });
	await page.waitForTimeout(SETTLE_MS);

	const png = await page.locator('.hero').screenshot();
	await browser.close();

	const base = sharp(png);
	const meta = await base.metadata();
	console.log(`captured .hero: ${meta.width}x${meta.height}px, ${png.length} bytes (PNG)`);

	const avif = await sharp(png).avif({ quality: 55 }).toBuffer();
	const webp = await sharp(png).webp({ quality: 80 }).toBuffer();
	const jpg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

	await writeFile(`${OUT_DIR}/constellation-poster.avif`, avif);
	await writeFile(`${OUT_DIR}/constellation-poster.webp`, webp);
	await writeFile(`${OUT_DIR}/constellation-poster.jpg`, jpg);

	const kb = (b) => `${(b.length / 1024).toFixed(1)} KB`;
	console.log(`avif ${kb(avif)}  webp ${kb(webp)}  jpg ${kb(jpg)}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
