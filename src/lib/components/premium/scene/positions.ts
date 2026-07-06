import { Vector3 } from 'three';

// The SINGLE source of orb geometry. Both Orbs.svelte and Connections.svelte import from here so
// that connection-line endpoints land exactly on the visible orb centers (D-03) — neither component
// recomputes drift independently.

export interface OrbSeed {
	basePos: Vector3;
	driftPhase: number;
	size: number;
	/** per-orb drift radius (world units) */
	driftRadius: number;
	/** per-orb angular speed (rad/s) — small, for a 20–30s contemplative cycle (D-05/D-08) */
	omega: number;
}

// Deterministic-enough seeding without Math.random restrictions in scripts: plain Math.random is
// fine at runtime (this runs in the browser, not in a workflow script).
function rand(): number {
	return Math.random();
}

/**
 * Called ONCE (in Scene). Edge-banded random seeds implementing the central exclusion zone (D-11):
 * x is pushed to the left/right bands so |x| stays clear of the central text column; y and z spread
 * modestly. This keeps the constellation framing the headline rather than sitting behind it.
 */
export function makeOrbSeeds(count: number): OrbSeed[] {
	return Array.from({ length: count }, () => {
		const side = rand() < 0.5 ? -1 : 1;
		const x = side * (1.6 + rand() * 1.8); // |x| ∈ [1.6, 3.4] — central column stays clear
		const y = (rand() - 0.5) * 3.6; // modest vertical spread
		const z = (rand() - 0.5) * 2.4; // shallow depth
		return {
			basePos: new Vector3(x, y, z),
			driftPhase: rand() * Math.PI * 2,
			size: 0.8 + rand() * 0.8, // instance scale multiplier
			driftRadius: 0.12 + rand() * 0.12, // gentle orbit radius
			omega: 0.3 + rand() * 0.2 // 0.3–0.5 rad/s → slow, non-vestibular
		};
	});
}

/**
 * PURE drift: the world position of `seed` at `elapsed` seconds. A slow sinusoidal orbit around
 * basePos. Writes into `out` and returns it (callers reuse a scratch Vector3 to avoid allocation).
 */
export function orbPositionAt(seed: OrbSeed, elapsed: number, out: Vector3): Vector3 {
	const a = elapsed * seed.omega + seed.driftPhase;
	out.set(
		seed.basePos.x + Math.sin(a) * seed.driftRadius,
		seed.basePos.y + Math.cos(a * 0.85) * seed.driftRadius,
		seed.basePos.z + Math.sin(a * 0.6) * seed.driftRadius * 0.5
	);
	return out;
}
