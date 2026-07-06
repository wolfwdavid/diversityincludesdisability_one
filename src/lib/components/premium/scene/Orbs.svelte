<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T } from '@threlte/core';
	import { InstancedMesh, Object3D, SphereGeometry, MeshStandardMaterial, Color } from 'three';
	import { orbPositionAt, type OrbSeed } from './positions';

	let { seeds, elapsed = 0 }: { seeds: OrbSeed[]; elapsed?: number } = $props();

	// Periwinkle bodies with a white-hot read (high emissive). Small sphere; instanced per seed.
	const geo = new SphereGeometry(0.05, 12, 12);
	const mat = new MeshStandardMaterial({
		color: new Color('#7aa2ff'),
		emissive: new Color('#a9c2ff'),
		emissiveIntensity: 1.1
	});
	const mesh = new InstancedMesh(geo, mat, seeds.length);
	const dummy = new Object3D();

	// Drift comes from positions.ts (shared with Connections). Breathe scale is local.
	$effect(() => {
		for (let i = 0; i < seeds.length; i++) {
			const seed = seeds[i];
			orbPositionAt(seed, elapsed, dummy.position);
			const s = 1 + 0.06 * Math.sin(elapsed * seed.omega + seed.driftPhase);
			dummy.scale.setScalar(seed.size * s);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	});

	onDestroy(() => {
		geo.dispose();
		mat.dispose();
	});
</script>

<T is={mesh} />
