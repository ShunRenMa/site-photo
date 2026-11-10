<script setup lang="ts">
import guting1 from '~/assets/video/guting1.mp4'
import guting2 from '~/assets/video/guting2.mp4'
import guting1Poster from '~/assets/images/hero/guting1.webp'
import guting2Poster from '~/assets/images/hero/guting2.webp'

useHead({
  title: 'Photography Portfolio',
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Paka',
        alternateName: 'Shun Ren Ma',
        url: 'https://photography.alupaka.tw/',
      }),
    },
  ],
})

const videos = [
  { id: 1, src: guting1, poster: guting1Poster },
  { id: 2, src: guting2, poster: guting2Poster },
]

const isIntroDone = ref(false)
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
  <div class="stage">
    <section ref="heroEl" class="hero" :class="{ 'is-done': isIntroDone }">
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
      <h1 class="hero_tagline">Photography Portfolio</h1>
      <footer class="footer">
      </footer>
    </section>
    <TheLoading v-if="!isIntroDone" @done="isIntroDone = true" />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  height: 100svh;
  overflow: hidden;
  color: #fff;
}

.hero {
  position: absolute;
  inset: 0;
}

.hero_img {
  position: relative;
  width: 100%;
  height: 100%;
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

.hero_bar,
.hero_tagline {
  
  position: absolute;
  opacity: 0;
  transition:
    opacity 0.6s ease-out,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
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
  transform: translateY(-100%);
}

.hero_tagline {
  top: 50%;
  margin: 0;
  padding: 0 24px;
  inset-inline: 0;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 400;
  text-align: center;
  transform: translateY(calc(-50% + 24px));
  transition-delay: 0.3s;
}

.hero.is-done .hero_bar {
  opacity: 1;
  transform: none;
}

.hero.is-done .hero_tagline {
  opacity: 1;
  transform: translateY(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .hero_bar,
  .hero_tagline {
    opacity: 1;
    transition: none;
  }

  .hero_bar {
    transform: none;
  }

  .hero_tagline {
    transform: translateY(-50%);
  }
}
</style>
