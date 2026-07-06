<script lang="ts">
	import { theme } from '$lib/theme/theme.svelte';
	import { prefersReducedMotion, webglSupported, notLowPower } from '$lib/a11y/prefers.svelte';

	// Runtime context-loss flag, raised by SceneCanvas's webglcontextlost listener via HeroScene.
	let contextLost = $state(false);
	// First-frame flag → toggles .is-ready on the wrapper → the 800ms crossfade (D-17).
	let sceneReady = $state(false);

	// Mount the 3D scene ONLY when: Premium AND motion allowed AND WebGL present AND not low-power
	// AND context alive. Any false → render nothing here; the poster underneath is the fallback.
	const show3D = $derived(
		theme.current === 'premium' &&
			!prefersReducedMotion.current &&
			webglSupported() &&
			notLowPower() &&
			!contextLost
	);
</script>

{#if show3D}
	{#await import('./HeroScene.svelte')}
		<!-- pending: render nothing; poster shows through -->
	{:then { default: HeroScene }}
		<HeroScene
			{sceneReady}
			onContextLost={() => (contextLost = true)}
			onReady={() => (sceneReady = true)}
		/>
	{:catch}
		<!-- import/runtime failure: render nothing; poster shows through (no content loss) -->
	{/await}
{/if}
