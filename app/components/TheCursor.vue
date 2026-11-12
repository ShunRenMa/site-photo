<template>
	<div
		class="cursor"
		:class="[`cursor--${CENTER}`, { 'is-visible': visible, 'is-pressed': pressed }]"
		aria-hidden="true"
	>
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
/** 中心樣式 */
const CENTER: 'dot' | 'plus' = 'plus'

const frameEl = useTemplateRef<SVGSVGElement>('frameEl')
const dotEl = useTemplateRef<HTMLElement>('dotEl')
const visible = ref(false)
const pressed = ref(false)

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
		dotEl.value.style.translate = `${mouseX}px ${mouseY}px`
	}
}

function onPointerDown() {
	pressed.value = true
}

function onPointerUp() {
	pressed.value = false
}

function onPointerLeave() {
	visible.value = false
}

function tick() {
	frameX += (mouseX - frameX) * LERP
	frameY += (mouseY - frameY) * LERP
	if (frameEl.value) {
		frameEl.value.style.translate = `${frameX}px ${frameY}px`
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
	window.addEventListener('pointerdown', onPointerDown)
	window.addEventListener('pointerup', onPointerUp)
	document.addEventListener('pointerleave', onPointerLeave)
	raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
	document.documentElement.classList.remove('has-custom-cursor')
	window.removeEventListener('pointermove', onPointerMove)
	window.removeEventListener('pointerdown', onPointerDown)
	window.removeEventListener('pointerup', onPointerUp)
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
	--cursor-plus-size: 10px;
	--cursor-plus-width: 1px;
	--cursor-press-shrink: 0.3; /* 點擊縮小比例 */

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
	transform: translate(-50%, -50%);
	transform-origin: 0 0;
	will-change: translate, scale;
	transition: scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cursor.is-pressed .cursor__frame,
.cursor.is-pressed .cursor__dot {
	scale: calc(1 - var(--cursor-press-shrink));
	transition-duration: 0.1s;
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

.cursor--plus .cursor__dot {
	width: var(--cursor-plus-size);
	height: var(--cursor-plus-size);
	border-radius: 0;
	background:
		linear-gradient(var(--cursor-dot-color), var(--cursor-dot-color)) center / 100% var(--cursor-plus-width) no-repeat,
		linear-gradient(var(--cursor-dot-color), var(--cursor-dot-color)) center / var(--cursor-plus-width) 100% no-repeat;
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
