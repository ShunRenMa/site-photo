<script setup lang="ts">
import guting1 from '~/assets/video/guting1.mp4'
import guting2 from '~/assets/video/guting2.mp4'
import guting1Poster from '~/assets/images/hero/guting1.webp'
import guting2Poster from '~/assets/images/hero/guting2.webp'

defineProps<{ isIntroDone: boolean }>()

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
        preload="auto"
        @ended="playNext"
      />
    </div>
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
    <span class="hero_arrow" aria-hidden="true">
      <svg viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2v26M2 18l10 10 10-10" />
      </svg>
    </span>
  </section>
</template>

<style scoped>
.hero {
  --char-duration: 0.7s;
  --char-stagger: 0.03s;
  --accent: #26b9eeed;
  --arrow-size: clamp(40px, 5vw, 72px);
  --arrow-color: #767676;
  --arrow-wipe-color: #053056;
  --arrow-wipe-duration: 0.8s;
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

.hero_title {
  position: absolute;
  top: 60svh;
  left: 4%;
  margin: 0;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 400;
  line-height: 1.1;
  transform: translateY(-50%);
  color: var(--accent);
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

.hero_arrow {
  position: absolute;
  top: calc(100svh - 40px);
  translate: 0 -100%;
  right: 4%;
  width: var(--arrow-size);
  color: var(--arrow-color);
}

.hero_arrow svg {
  display: block;
  width: 100%;
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

  .hero_arrow::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--arrow-wipe-color);
    clip-path: inset(0 100% 0 0);
  }

  .hero_arrow svg {
    visibility: hidden;
  }

  .hero.is-playing .hero_arrow::after {
    animation: hero-arrow-wipe var(--arrow-wipe-duration) var(--arrow-delay, 0s)
      cubic-bezier(0.76, 0, 0.24, 1) both;
  }

  .hero.is-playing .hero_arrow svg {
    animation:
      hero-arrow-show var(--arrow-wipe-duration) var(--arrow-delay, 0s) both,
      hero-arrow-bounce 1.6s
        calc(var(--arrow-delay, 0s) + var(--arrow-wipe-duration)) ease-in-out
        infinite;
  }
}

@keyframes hero-char-in {
  to {
    transform: none;
  }
}

@keyframes hero-arrow-wipe {
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

@keyframes hero-arrow-show {
  0%,
  49.9% {
    visibility: hidden;
  }

  50%,
  100% {
    visibility: visible;
  }
}

@keyframes hero-arrow-bounce {
  50% {
    transform: translateY(12px);
  }
}
</style>
