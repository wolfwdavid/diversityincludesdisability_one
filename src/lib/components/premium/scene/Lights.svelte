<script lang="ts">
	import { T } from '@threlte/core';
	// Monochrome periwinkle (D-02) — NO orange PointLight. The white-hot orb cores read against the
	// navy #0f1020 background; lights only lift the emissive bodies a touch.
	const ACCENT = '#7aa2ff';
</script>

<T.AmbientLight intensity={0.35} />
<T.PointLight color={ACCENT} intensity={18} position={[3, 2.5, 3]} distance={20} />
<T.PointLight color={ACCENT} intensity={10} position={[-3, -2, 2]} distance={20} />
