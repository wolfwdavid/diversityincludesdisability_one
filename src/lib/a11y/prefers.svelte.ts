import { browser } from '$app/environment';

/**
 * Reactive `prefers-reduced-motion` rune. Browser-guarded so it is prerender-safe
 * (SSR keeps `current = false`, matching the no-motion-known default). Listens for
 * live OS toggles so a mid-session change is respected without a reload.
 *
 * This module imports ONLY `$app/environment` — it must never import the 3D/WebGL stack,
 * because it is reached by the WebGL-free boundary in the Accessible graph (HERO-02).
 */
class PrefersReducedMotion {
	current = $state(false);
	constructor() {
		if (!browser) return;
		const mq = matchMedia('(prefers-reduced-motion: reduce)');
		this.current = mq.matches;
		mq.addEventListener('change', (e) => (this.current = e.matches)); // mid-session OS toggle respected
	}
}
export const prefersReducedMotion = new PrefersReducedMotion();

// Cheap synchronous WebGL feature-detect BEFORE importing the 3D stack (avoid loading ~150KB to fail).
// Memoized: the context probe runs at most once per session.
let _webgl: boolean | null = null;
export function webglSupported(): boolean {
	if (!browser) return false;
	if (_webgl !== null) return _webgl;
	try {
		const c = document.createElement('canvas');
		_webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
	} catch {
		_webgl = false;
	}
	return _webgl;
}

// Synchronous, fail-open low-power gate (HERO-04 / A11Y-05). Runs BEFORE importing the 3D stack so a
// low-end device never pays the ~150KB download just to be turned away. Memoized per session.
//
// TUNABLE BLOCK — MEDIUM-confidence thresholds, field-tunable (STATE.md Phase-5 research flag).
// The signals below (memory, cores, saveData) are the single place to retune the low-power heuristic.
let _lowPowerOk: boolean | null = null;
export function notLowPower(): boolean {
	if (!browser) return false; // SSR: no scene
	if (_lowPowerOk !== null) return _lowPowerOk;
	const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
	const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4; // <4GB (Chromium-only)
	const fewCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2;
	const saveData = nav.connection?.saveData === true; // Data Saver on
	_lowPowerOk = !(lowMemory || fewCores || saveData); // fail-open: absent APIs → capable
	return _lowPowerOk;
}
