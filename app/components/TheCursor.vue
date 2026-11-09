<template>
	<div class="cursor" :class="{ 'is-visible': visible }" aria-hidden="true">
		<svg
			ref="frameEl"
			class="cursor__frame"
			viewBox="0 0 40 32"
		>
			<path d="M2 11V2h9M29 2h9v9M38 21v9h-9M11 30H2v-9" />
		</svg>
		<div ref="dotEl" class="cursor__dot" />
	</div>
</template>

<script setup lang="ts">
/** 外框追上滑鼠的速度，越小越慢 */
const LERP = 0.1

const frameEl = useTemplateRef<SVGSVGElement>('frameEl')
const dotEl = useTemplateRef<HTMLElement>('dotEl')
const visible = ref(false)

let mouseX = 0
let mouseY = 0
let frameX = 0
let frameY = 0
let raf = 0

function onPointerMove(e: PointerEvent) {
	mouseX = e.clientX
	mouseY = e.clientY

	// 第一次移動時外框直接就位，不從 (0,0) 飛過來
	if (!visible.value) {
		frameX = mouseX
		frameY = mouseY
		visible.value = true
	}

	if (dotEl.value) {
		dotEl.value.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
	}
}

function onPointerLeave() {
	visible.value = false
}

function tick() {
	frameX += (mouseX - frameX) * LERP
	frameY += (mouseY - frameY) * LERP
	if (frameEl.value) {
		frameEl.value.style.transform = `translate(${frameX}px, ${frameY}px) translate(-50%, -50%)`
	}
	raf = requestAnimationFrame(tick)
}

onMounted(() => {
	const canHover = window.matchMedia(
		'(hover: hover) and (pointer: fine)',
	).matches
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	if (!canHover || reduced) return

	document.documentElement.classList.add('has-custom-cursor')
	window.addEventListener('pointermove', onPointerMove, { passive: true })
	document.addEventListener('pointerleave', onPointerLeave)
	raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
	document.documentElement.classList.remove('has-custom-cursor')
	window.removeEventListener('pointermove', onPointerMove)
	document.removeEventListener('pointerleave', onPointerLeave)
	cancelAnimationFrame(raf)
})
</script>

<style scoped>
.cursor {
	--cursor-frame-color: #ffcdac;
	--cursor-frame-width: 36px;
	--cursor-dot-color: #ffcdac;
	--cursor-dot-size: 10px;

	position: fixed;
	top: 0;
	left: 0;
	z-index: 2147483647;
	pointer-events: none;
	mix-blend-mode: difference;
	opacity: 0;
	transition: opacity 0.2s linear;
}

.cursor.is-visible {
	opacity: 1;
}

.cursor__frame,
.cursor__dot {
	position: absolute;
	top: 0;
	left: 0;
	will-change: transform;
}

.cursor__frame {
	width: var(--cursor-frame-width);
	aspect-ratio: 5 / 4;
}

.cursor__frame path {
	fill: none;
	stroke: var(--cursor-frame-color);
	stroke-width: 1px;
	vector-effect: non-scaling-stroke;
}

.cursor__dot {
	width: var(--cursor-dot-size);
	height: var(--cursor-dot-size);
	border-radius: 50%;
	background: var(--cursor-dot-color);
}
</style>

<style>
.has-custom-cursor,
.has-custom-cursor a,
.has-custom-cursor button {
	cursor: none;
}

.has-custom-cursor input,
.has-custom-cursor textarea,
.has-custom-cursor select {
	cursor: auto;
}
</style>
