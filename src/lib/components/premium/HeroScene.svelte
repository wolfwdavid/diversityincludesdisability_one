<script lang="ts">
	let {
		onContextLost,
		onReady,
		sceneReady
	}: { onContextLost?: () => void; onReady?: () => void; sceneReady?: boolean } = $props();

	// Bubbled up from Scene's IntersectionObserver → toggles .is-onscreen → the D-07 opacity fade.
	let onscreen = $state(true);
</script>

<!-- `.hero-scene` positioning + the 800ms crossfade (is-ready, D-17) + the scroll fade (is-onscreen,
     D-07) all live in app.css (always-loaded), so this component carries NO scoped style block → no
     HeroScene CSS chunk to hoist. The only CSS-bearing node is @threlte/core's <Canvas>, isolated in
     SceneCanvas behind a SECOND dynamic import so its CSS lands past find_deps depth<=1 and never
     links on the accessible home. -->
<div class="hero-scene" class:is-ready={sceneReady} class:is-onscreen={onscreen} aria-hidden="true">
	{#await import('./SceneCanvas.svelte') then { default: SceneCanvas }}
		<SceneCanvas {onContextLost} {onReady} onVisibility={(v) => (onscreen = v)} />
	{/await}
</div>
