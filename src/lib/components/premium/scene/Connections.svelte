<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T } from '@threlte/core';
	import {
		BufferGeometry,
		BufferAttribute,
		LineSegments,
		LineBasicMaterial,
		AdditiveBlending,
		Vector3,
		Color
	} from 'three';
	import { orbPositionAt, type OrbSeed } from './positions';

	let { seeds, elapsed = 0 }: { seeds: OrbSeed[]; elapsed?: number } = $props();

	const THRESHOLD = 1.4; // world-unit distance under which two orbs are linked (D-03, tunable)
	const BASE = new Color('#7aa2ff');

	// Pre-size for the max possible pairs: N*(N-1)/2 pairs → 2 vertices each. Negligible for N≤40.
	const maxPairs = (seeds.length * (seeds.length - 1)) / 2;
	const maxVerts = maxPairs * 2;
	const positions = new Float32Array(maxVerts * 3);
	const colors = new Float32Array(maxVerts * 3);

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(positions, 3));
	geometry.setAttribute('color', new BufferAttribute(colors, 3));

	const material = new LineBasicMaterial({
		transparent: true,
		vertexColors: true,
		blending: AdditiveBlending,
		depthWrite: false,
		opacity: 0.6
	});
	const lines = new LineSegments(geometry, material);

	// Scratch vectors — one per orb, reused each frame (no per-frame allocation).
	const pts = seeds.map(() => new Vector3());

	$effect(() => {
		for (let i = 0; i < seeds.length; i++) orbPositionAt(seeds[i], elapsed, pts[i]);

		let v = 0; // vertex counter
		for (let i = 0; i < seeds.length; i++) {
			for (let j = i + 1; j < seeds.length; j++) {
				const d = pts[i].distanceTo(pts[j]);
				if (d >= THRESHOLD) continue;
				// Intensity falls off with distance; AdditiveBlending makes dark = invisible, so a
				// scaled color IS the alpha falloff.
				const t = 1 - d / THRESHOLD;
				const r = BASE.r * t;
				const g = BASE.g * t;
				const b = BASE.b * t;
				for (const p of [pts[i], pts[j]]) {
					positions[v * 3] = p.x;
					positions[v * 3 + 1] = p.y;
					positions[v * 3 + 2] = p.z;
					colors[v * 3] = r;
					colors[v * 3 + 1] = g;
					colors[v * 3 + 2] = b;
					v++;
				}
			}
		}
		geometry.setDrawRange(0, v);
		(geometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
		(geometry.getAttribute('color') as BufferAttribute).needsUpdate = true;
	});

	onDestroy(() => {
		geometry.dispose();
		material.dispose();
	});
</script>

<T is={lines} />
