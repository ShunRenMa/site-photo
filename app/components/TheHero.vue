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
const title = ['Making', 'ordinary days', 'special.']
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
    <header class="hero_bar hero_bar--top">Paka</header>
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
    <footer class="footer">
    </footer>
  </section>
</template>

<style scoped>
.hero {
  --brand-duration: 0.6s;
  --char-duration: 0.7s;
  --char-stagger: 0.03s;
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

.hero_bar {
  position: absolute;
}

.hero_bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  inset-inline: 0;
}

.hero_bar--top {
  top: 0;
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
  color: #0ea7a3;
}

.hero_line {
  display: block;
  overflow: hidden;
}

.hero_line:nth-child(2) {
  position: relative;
  right: -10%;
  text-align: end;
}

.hero_line:nth-child(3) {
  position: relative;
  right: -5%;
  text-align: start;
}

.hero_char {
  display: inline-block;
  white-space: pre;
}

@media (prefers-reduced-motion: no-preference) {
  .hero_bar {
    opacity: 0;
  }

  .hero_char {
    transform: translateY(110%);
  }

  .hero_line:nth-child(2) .hero_char {
    transform: translateY(-110%);
  }

  .hero.is-playing .hero_bar {
    animation: hero-brand-in var(--brand-duration) var(--brand-delay, 0s)
      cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .hero.is-playing .hero_char {
    animation: hero-char-in var(--char-duration)
      calc(var(--title-delay, 0s) + var(--i) * var(--char-stagger))
      cubic-bezier(0.33, 1, 0.68, 1) both;
  }
}

@keyframes hero-brand-in {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-char-in {
  to {
    transform: none;
  }
}
</style>
