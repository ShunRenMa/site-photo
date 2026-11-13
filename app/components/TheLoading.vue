<script setup lang="ts">
import p1 from '~/assets/images/loading/p1.webp'
import p2 from '~/assets/images/loading/p2.webp'
import p3 from '~/assets/images/loading/p3.webp'
import p4 from '~/assets/images/loading/p4.webp'
import p5 from '~/assets/images/loading/p5.webp'

const emit = defineEmits<{ done: [] }>()

const PRELOAD_TIMEOUT_MS = 3000
const PHOTO_HOLD_MS = 200

const word = "PAKA's Photography Portfolio"
const photos = [
  { id: 1, url: p1 },
  { id: 2, url: p2 },
  { id: 3, url: p3 },
  { id: 4, url: p4 },
  { id: 5, url: p5 },
]

const lockScroll = useScrollLock()

const wordEl = ref<HTMLElement>()
const frameEl = ref<HTMLElement>()
const coverEl = ref<HTMLElement>()
const coverState = ref<'solid' | 'hole' | 'open'>('solid')
const isFrameShown = ref(false)
const pulledCount = ref(0)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function preload() {
  return Promise.allSettled(
    photos.map(({ url }) => {
      const img = new Image()
      img.src = url
      return img.decode()
    }),
  )
}

async function pullPhotos() {
  for (let i = 0; i < photos.length; i++) {
    await wait(PHOTO_HOLD_MS)
    pulledCount.value = i + 1
    await nextTick()
    await animationsDone(frameEl.value!, { subtree: true })
  }
}

onMounted(async () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('done')
    return
  }

  lockScroll(true)

  const loaded = Promise.race([
    preload().then(() => true),
    wait(PRELOAD_TIMEOUT_MS).then(() => false),
  ])

  await animationsDone(wordEl.value!)

  if (await loaded) {
    isFrameShown.value = true
    await nextTick()
    await animationsDone(frameEl.value!, { subtree: true })
    coverState.value = 'hole'
    await pullPhotos()
    isFrameShown.value = false
  }

  coverState.value = 'open'
  await nextTick()
  await animationsDone(coverEl.value!)
  emit('done')
})
</script>

<template>
  <div class="loading">
    <div ref="coverEl" class="loading__cover" :class="`is-${coverState}`" />
    <p ref="wordEl" class="loading__word">{{ word }}</p>
    <div v-show="isFrameShown" ref="frameEl" class="loading__frame">
      <img
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="loading__photo"
        :class="{ 'is-out': index < pulledCount }"
        :style="{ zIndex: photos.length - index }"
        :src="photo.url"
        alt=""
      >
    </div>
  </div>
</template>

<style scoped>
.loading {
  --intro-square: 30vmin;
  --word-duration: 2.5s;
  --photo-enter-duration: 0.5s;
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.loading__cover {
  --hole-start: 50%;
  --hole-end: 50%;
  position: absolute;
  inset: 0;
  background: #000;
  clip-path: polygon(
    evenodd,
    0 0, 100% 0, 100% 100%, 0 100%, 0 0,
    var(--hole-start) var(--hole-start),
    var(--hole-end) var(--hole-start),
    var(--hole-end) var(--hole-end),
    var(--hole-start) var(--hole-end),
    var(--hole-start) var(--hole-start)
  );
}

.loading__cover.is-hole {
  --hole-start: calc(50% - var(--intro-square));
  --hole-end: calc(50% + var(--intro-square));
}

.loading__cover.is-open {
  --hole-start: 0%;
  --hole-end: 100%;
  transition: clip-path 1s cubic-bezier(0.76, 0, 0.24, 1);
}

.loading__word {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0 24px;
  color: #fff;
  font-size: clamp(1rem, 4vw, 4rem);
  letter-spacing: 0.08em;
  text-align: center;
  animation: word-blur var(--word-duration) ease-in-out both;
}

.loading__frame {
  position: absolute;
  inset: calc(50% - var(--intro-square));
  overflow: hidden;
}

.loading__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.15s cubic-bezier(0.76, 0, 0.24, 1);
  animation: photo-enter var(--photo-enter-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.loading__photo.is-out {
  transform: translateX(-101%);
}

@keyframes photo-enter {
  from {
    transform: translateY(100%);
  }
}

@keyframes word-blur {
  0%,
  100% {
    opacity: 0;
    filter: blur(20px);
  }

  42%,
  67% {
    opacity: 1;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading {
    display: none;
  }
}
</style>
