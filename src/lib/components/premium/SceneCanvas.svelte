<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './scene/Scene.svelte';

	let {
		onContextLost,
		onReady,
		onVisibility
	}: {
		onContextLost?: () => void;
		onReady?: () => void;
		onVisibility?: (onscreen: boolean) => void;
	} = $props();
</script>

<!-- Isolates @threlte/core's <Canvas> — the sole CSS-bearing node in the premium scene. Reached via
     a SECOND dynamic import (from HeroScene), so the Canvas's scoped wrapper CSS lands at find_deps
     dynamic_import_depth 2, beyond the eager-hoist window, and never links on the accessible home.
     No scoped style block here; the wrapper `.hero-scene` positioning is owned by app.css. -->
<Canvas renderMode="on-demand" dpr={[1, 2]}>
	<Scene {onContextLost} {onReady} {onVisibility} />
</Canvas>
