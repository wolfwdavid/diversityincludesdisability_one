<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Group } from 'three';
	import Lights from './Lights.svelte';
	import Orbs from './Orbs.svelte';
	import Connections from './Connections.svelte';
	import { makeOrbSeeds } from './positions';

	let {
		onContextLost,
		onReady,
		onVisibility
	}: {
		onContextLost?: () => void;
		onReady?: () => void;
		onVisibility?: (onscreen: boolean) => void;
	} = $props();

	const { renderer, invalidate } = useThrelte();
	const canvas = renderer.domElement;

	// Orb count: fewer on mobile (D-04/D-13). Seeds computed ONCE and shared with both children.
	const COUNT = matchMedia('(max-width: 640px)').matches ? 20 : 40;
	const seeds = makeOrbSeeds(COUNT);

	// running gate: only advance/render when the tab is visible AND the hero is onscreen (D-07 RAF pause).
	let visible = $state(typeof document === 'undefined' ? true : !document.hidden);
	let onscreen = $state(true);
	const running = () => visible && onscreen;

	const onVis = () => (visible = !document.hidden);
	document.addEventListener('visibilitychange', onVis);

	// IntersectionObserver drives BOTH the RAF pause (running gate) AND the CSS opacity fade: every
	// change bubbles up via onVisibility so HeroScene toggles .is-onscreen (D-07 gentle fade — the
	// RAF pause alone is only half of D-07).
	const io = new IntersectionObserver(
		([e]) => {
			onscreen = e.isIntersecting;
			onVisibility?.(onscreen);
			invalidate();
		},
		{ threshold: 0 }
	);
	io.observe(canvas);

	const onLost = (e: Event) => {
		e.preventDefault(); // keep the context recoverable; we retreat to the poster instead
		onContextLost?.();
	};
	canvas.addEventListener('webglcontextlost', onLost, false);

	// Parallax tilt (D-06) — pointer devices only; skipped on touch (D-13 mobile = no parallax).
	const coarse = matchMedia('(pointer: coarse)').matches;
	let group: Group | undefined = $state();
	let targetRotX = 0;
	let targetRotY = 0;
	const MAX_TILT = 0.05; // radians
	const onPointer = (e: PointerEvent) => {
		const nx = e.clientX / window.innerWidth - 0.5;
		const ny = e.clientY / window.innerHeight - 0.5;
		targetRotY = nx * MAX_TILT * 2;
		targetRotX = ny * MAX_TILT * 2;
		invalidate();
	};
	if (!coarse) window.addEventListener('pointermove', onPointer, { passive: true });

	// Shared drift clock; children read elapsed. First tick fires onReady once (D-17 crossfade trigger).
	let elapsed = $state(0);
	let firstFrame = true;
	useTask(
		(delta) => {
			elapsed += delta;
			if (group) {
				group.rotation.x += (targetRotX - group.rotation.x) * 0.05;
				group.rotation.y += (targetRotY - group.rotation.y) * 0.05;
			}
			invalidate();
			if (firstFrame) {
				firstFrame = false;
				onReady?.();
			}
		},
		{ running }
	);

	onDestroy(() => {
		document.removeEventListener('visibilitychange', onVis);
		canvas.removeEventListener('webglcontextlost', onLost);
		if (!coarse) window.removeEventListener('pointermove', onPointer);
		io.disconnect();
		try {
			renderer.dispose(); // free renderer-held GL resources + programs
			renderer.forceContextLoss(); // release the GL context immediately (vs the ~8-16 cap)
		} catch {
			/* already gone */
		}
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
<Lights />
<T.Group bind:ref={group}>
	<Orbs {seeds} {elapsed} />
	<Connections {seeds} {elapsed} />
</T.Group>
