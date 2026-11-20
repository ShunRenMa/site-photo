<script setup lang="ts">
import guting1 from '~/assets/video/guting1.mp4'
import guting2 from '~/assets/video/guting2.mp4'
import guting1Poster from '~/assets/images/hero/guting1.webp'
import guting2Poster from '~/assets/images/hero/guting2.webp'

const props = defineProps<{ isIntroDone: boolean }>()
const emit = defineEmits<{ ready: [] }>()

watch(() => props.isIntroDone, (done) => {
  if (done && matchMedia('(prefers-reduced-motion: reduce)').matches) emit('ready')
})

const videos = [
  { id: 1, src: guting1, poster: guting1Poster },
  { id: 2, src: guting2, poster: guting2Poster },
]
const title = ['Making', 'Ordinary Days', 'Special.']
const titleLines = (() => {
  let i = 0
  return title.map((text) => [...text].map((char) => ({ char, i: i++ })))
})()

const heroEl = ref<HTMLElement>()
const activeIndex = ref(0)
const videoEls: HTMLVideoElement[] = []
let isHeroVisible = false
let stopObserving: (() => void) | undefined

function setVideoEl(el: unknown, index: number) {
  if (el instanceof HTMLVideoElement) videoEls[index] = el
}

function playActive() {
  videoEls[activeIndex.value]?.play().catch(() => {})
}

function preloadNext(index: number) {
  const next = videoEls[(index + 1) % videos.length]
  if (!next || next.preload === 'auto') return
  next.preload = 'auto'
  next.load()
}

function playNext() {
  activeIndex.value = (activeIndex.value + 1) % videos.length
  const video = videoEls[activeIndex.value]
  if (video) video.currentTime = 0
  if (isHeroVisible) playActive()
}

onMounted(() => {
  stopObserving = observeVisibility(heroEl.value!, (visible) => {
    isHeroVisible = visible
    if (visible) playActive()
    else videoEls[activeIndex.value]?.pause()
  })
})

onBeforeUnmount(() => stopObserving?.())
</script>

<template>
  <section ref="heroEl" class="hero" :class="{ 'is-playing': isIntroDone }">
    <div class="hero_img">
      <video
        v-for="(video, index) in videos"
        :key="video.id"
        :ref="(el) => setVideoEl(el, index)"
        class="hero_video"
        :class="{ 'is-active': index === activeIndex }"
        :src="video.src"
        :poster="video.poster"
        muted
        playsinline
        :preload="index === 0 ? 'auto' : 'none'"
        @canplaythrough="preloadNext(index)"
        @ended="playNext"
      />
    </div>
    <div class="hero_overlay" aria-hidden="true" />
    <h1 class="hero_title" :aria-label="title.join(' ')">
      <span
        v-for="(line, lineIndex) in titleLines"
        :key="lineIndex"
        class="hero_line"
        aria-hidden="true"
      >
        <span
          v-for="c in line"
          :key="c.i"
          class="hero_char"
          :style="{ '--i': c.i }"
        >{{ c.char }}</span>
      </span>
    </h1>
    <div class="hero_brand">
      <div class="hero_brand_inner">
        <p class="hero_brand_name">PAKA's Studio</p>
        <p class="hero_brand_role">Art Creator / Photographer</p>
      </div>
    </div>
    <span class="hero_scroll" aria-hidden="true">
      <span class="hero_scroll_inner" @animationend.self="emit('ready')">
        <span class="hero_scroll_text">Scroll</span>
        <span class="hero_scroll_line" />
      </span>
    </span>
  </section>
</template>

<style scoped>
.hero {
  --char-duration: 0.7s;
  --char-stagger: 0.03s;
  --scroll-color: #fff;
  --wipe-color: #fff;
  --scroll-wipe-duration: 0.8s;
  position: relative;
  height: 130svh;
  overflow: hidden;
  color: #fff;
}

.hero_img {
  position: absolute;
  inset: 0;
}

.hero_video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}

.hero_video.is-active {
  opacity: 1;
}

.hero_overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.4);
}

.hero_title {
  position: absolute;
  top: 64svh;
  left: 4%;
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 3.5rem);
  font-weight: 300;
  line-height: 1.1;
  transform: translateY(-50%);
}

.hero_line {
  position: relative;
  display: block;
  overflow: hidden;
}

.hero_line:nth-child(2) {
  right: -10%;
  text-align: end;
}

.hero_line:nth-child(3) {
  right: -5%;
}

.hero_char {
  display: inline-block;
  white-space: pre;
}

.hero_brand {
  position: absolute;
  top: calc(64px + 3vw);
  right: 4%;
  font-size: clamp(2rem, 6.5vw, 4rem);
  line-height: 1.1;
}

.hero_brand p {
  margin: 0;
}

.hero_brand_role {
  font-size: clamp(0.6rem, 1.8vw, 1.2rem);
}

.hero_scroll {
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  color: var(--scroll-color);
}

.hero_scroll_inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hero_scroll_text {
  font-size: 1rem;
  letter-spacing: 2px;
  margin-right: -2px;
  margin-bottom: 8px;
}

.hero_scroll_line {
  width: 1px;
  height: calc(30svh + 4.8vw);
  background: currentColor;
}

@media (max-width: 767px) {
  .hero_title {
    top: 62svh;
    left: 8%;
  }

  .hero_line:nth-child(n) {
    right: auto;
    text-align: start;
  }

  .hero_brand {
    right: auto;
    left: 8%;
    font-size: 2.8rem;
  }

  .hero_brand_role {
    font-size: 0.84rem;
  }

  .hero_scroll {
    bottom: 4vh;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero_char {
    transform: translateY(110%);
  }

  .hero_line:nth-child(2) .hero_char {
    transform: translateY(-110%);
  }

  .hero.is-playing .hero_char {
    animation: hero-char-in var(--char-duration)
      calc(var(--title-delay, 0s) + var(--i) * var(--char-stagger))
      cubic-bezier(0.33, 1, 0.68, 1) both;
  }

  .hero_brand::after,
  .hero_scroll::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--wipe-color);
    clip-path: inset(0 100% 0 0);
  }

  .hero_brand_inner,
  .hero_scroll_inner {
    visibility: hidden;
  }

  .hero.is-playing .hero_brand::after {
    animation: hero-scroll-wipe var(--scroll-wipe-duration) var(--brand-delay, 0s)
      cubic-bezier(0.76, 0, 0.24, 1) both;
  }

  .hero.is-playing .hero_brand_inner {
    animation: hero-scroll-show var(--scroll-wipe-duration) var(--brand-delay, 0s) both;
  }

  .hero_scroll_line {
    animation: hero-scroll-line 2.4s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
  }

  .hero.is-playing .hero_scroll::after {
    animation: hero-scroll-wipe var(--scroll-wipe-duration) var(--scroll-delay, 0s)
      cubic-bezier(0.76, 0, 0.24, 1) both;
  }

  .hero.is-playing .hero_scroll_inner {
    animation: hero-scroll-show var(--scroll-wipe-duration) var(--scroll-delay, 0s) both;
  }
}

@keyframes hero-char-in {
  to {
    transform: none;
  }
}

@keyframes hero-scroll-wipe {
  0% {
    clip-path: inset(0 100% 0 0);
  }

  50% {
    clip-path: inset(0);
  }

  100% {
    clip-path: inset(0 0 0 100%);
  }
}

@keyframes hero-scroll-line {
  0% {
    transform: scaleY(0);
    transform-origin: top;
  }

  50% {
    transform: scaleY(1);
    transform-origin: top;
  }

  50.1% {
    transform: scaleY(1);
    transform-origin: bottom;
  }

  100% {
    transform: scaleY(0);
    transform-origin: bottom;
  }
}

@keyframes hero-scroll-show {
  0%,
  49.9% {
    visibility: hidden;
  }

  50%,
  100% {
    visibility: visible;
  }
}
</style>
