<script setup lang="ts">
const photoFiles = import.meta.glob<string>('~/assets/images/photobook/*.webp', { eager: true, import: 'default' })
const photoMap = Object.fromEntries(
    Object.entries(photoFiles).map(([path, src]) => [path.split('/').pop()!.replace('.webp', ''), src]),
)
const toPhotos = (ids: string[]) => ids.map(id => ({ id, src: photoMap[id]! }))

type Photobook = {
    title: string[]
    paragraphs: string[]
    paragraphsEn?: string[]
    photos: { id: string, src: string }[]
}

const photobooks: Record<string, Photobook> = {
    landscape: {
        title: ['Landscape Photography', '關於風景攝影'],
        paragraphs: [
            '我喜歡試著把自己的家鄉，也就是台灣這塊島上的事物拍的漂亮。',
            '我很喜歡光影的變化，也喜歡記錄美麗的風景和建築。',
            '也嘗試著以不同角度詮釋這些事物。',
            '雖然我還是很愛拍芭樂點啦哈哈。',
        ],
        paragraphsEn: [
            'I like trying to capture the beauty of my home, the island of Taiwan.',
            'I love the play of light and shadow, and documenting beautiful landscapes and architecture.',
            'I also try to interpret these scenes from different perspectives.',
            'Though honestly, I still love shooting the classic tourist spots, haha.',
        ],
        photos: toPhotos([
            'DSC06471-Edit', 'DSC06436', 'DSC06506', 'DSC06676', 'DSC07090',
            'DSC07194', 'DSC07203', 'DSC07238', 'DSC07414', 'DSC07517',
        ]),
    },
    travel: {
        title: ['Travel Photography', '旅行攝影'],
        paragraphs: [
            '我喜歡旅遊，雖然現在大多只有日本，但不同的文化所帶來的事物對我來說都是很新奇的。',
            '旅遊間欣賞不同於家鄉的美，並且記錄下來當作滋養人生的養分。',
            '看著照片就能夠想起當時的回憶、遇見的人事物們。',
            '在這裡放一些出國拍的照片！',
        ],
        paragraphsEn: [
            'I love traveling. Even though it\'s mostly been Japan so far, everything a different culture brings feels new and fascinating to me.',
            'While traveling, I enjoy beauty that\'s different from home, and I capture it as nourishment for life.',
            'Looking at these photos brings back the memories, and the people and things I met along the way.',
            'Here are some photos from my trips abroad!',
        ],
        photos: toPhotos(['20251028-DSC03303', '20251028-DSC03262', '20251028-DSC03273']),
    },
    portrait: {
        title: ['Portrait Photography', '人像攝影'],
        paragraphs: [
            '我也喜歡拍攝人像，每個人有每個人身上的特色美。',
            '希望能夠捕捉到他們的情緒以及美，從而創造出不同於日常的結果。',
            '未來會希望以更動態的方式來呈現！',
        ],
        paragraphsEn: [
            'I also love portrait photography. Everyone has their own unique kind of beauty.',
            'I hope to capture their emotions and beauty, creating something beyond the everyday.',
            'In the future, I hope to present them in a more dynamic way!',
        ],
        photos: toPhotos([
            '20251029-DSC03373', '20251029-DSC03519', '20251029-DSC03526',
            '20260208-DSC04957', '20260208-DSC04966', 'DSC01588-2', 'DSC01597',
        ]),
    },
}

const books = Object.values(photobooks)
const segments = books.map(b => b.photos.length + 1)
const totalVh = segments.reduce((a, b) => a + b, 0) + 1
const current = ref(0)
const book = computed(() => books[current.value]!)

const STAGGER = 500
const ENTER = 1000
const enterDuration = ENTER + STAGGER * 3
const entered = ref(false)

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400&display=swap',
    },
  ],
})

const sectionEl = ref<HTMLElement>()
const trackEl = ref<HTMLElement>()
const offset = ref(0)

let rafId = 0
function update() {
  rafId = 0
  const section = sectionEl.value
  if (!section) return

  const vh = window.innerHeight
  let scrolled = Math.max(-section.getBoundingClientRect().top, 0)
  let index = 0
  while (index < books.length - 1 && scrolled >= segments[index]! * vh) {
    scrolled -= segments[index]! * vh
    index++
  }
  const progress = Math.min(scrolled / (segments[index]! * vh), 1)
  current.value = index
  const track = trackEl.value
  offset.value = track ? -track.offsetHeight * progress : 0
}

let observer: IntersectionObserver | undefined

function onScroll() {
  if (!rafId) rafId = requestAnimationFrame(update)
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => { entered.value = !!entry?.isIntersecting },
    { rootMargin: '0px 0px -30% 0px' },
  )
  observer.observe(sectionEl.value!)
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <section
    ref="sectionEl"
    class="photobook"
    :style="{ height: `${totalVh * 100}vh` }"
  >
    <div class="photobook__sticky">
      <Transition name="photobook-fade" mode="out-in" :duration="{ enter: enterDuration, leave: 400 }">
      <div
        v-if="entered"
        :key="current"
        class="photobook__content"
        :class="{ 'photobook__content--reverse': current % 2 === 1 }"
        :style="{ '--stagger': `${STAGGER}ms`, '--enter': `${ENTER}ms` }"
      >
      <div class="photobook__text">
        <p class="photobook__author">PAKA (Shun Ren)</p>
        <h2 class="photobook__title">
          <span v-for="(line, i) in book.title" :key="i">{{ line }}</span>
        </h2>
        <div class="photobook__paragraphs">
          <p v-for="(text, i) in book.paragraphs" :key="i" class="photobook__desc">
            {{ text }}
          </p>
        </div>
        <div v-if="book.paragraphsEn" class="photobook__paragraphs photobook__paragraphs--en">
          <p v-for="(text, i) in book.paragraphsEn" :key="i" class="photobook__desc">
            {{ text }}
          </p>
        </div>
      </div>
      <div class="photobook__window">
        <div
          ref="trackEl"
          class="photobook__track"
          :style="{ transform: `translate3d(0, ${offset}px, 0)` }"
        >
          <div
            v-for="photo in book.photos"
            :key="photo.id"
            class="photobook__item"
          >
            <img
              :src="photo.src"
              alt=""
              class="photobook__img"
              decoding="async"
            />
          </div>
        </div>
      </div>
      </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.photobook {
  position: relative;
  background-color: #e3e9e9;
}

.photobook__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 0  4%;
}

.photobook__content {
  display: flex;
  justify-content: space-between;
  height: 100%;
}

.photobook__content--reverse {
  flex-direction: row-reverse;
}

.photobook-fade-enter-active :is(.photobook__author, .photobook__title, .photobook__paragraphs, .photobook__window) {
  transition: opacity var(--enter) ease-out, transform var(--enter) ease-out;
}

.photobook-fade-enter-active .photobook__title { transition-delay: var(--stagger); }
.photobook-fade-enter-active .photobook__paragraphs { transition-delay: calc(var(--stagger) * 2); }
.photobook-fade-enter-active .photobook__paragraphs--en { transition-delay: calc(var(--stagger) * 3); }

.photobook-fade-enter-from :is(.photobook__author, .photobook__title, .photobook__paragraphs, .photobook__window) {
  opacity: 0;
  transform: translateY(40px);
}

.photobook-fade-leave-active {
  transition: opacity 0.4s ease;
}

.photobook-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .photobook-fade-enter-active :is(.photobook__author, .photobook__title, .photobook__paragraphs, .photobook__window),
  .photobook-fade-leave-active {
    transition: none;
  }
}

.photobook__text {
  flex: 0 0 30%;
  padding-top: 4vw;
  font-family: 'Inter Tight', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  color: #696c6fdb;
  letter-spacing: 1px;
}

.photobook__author {
  margin: 0;
  font-size: 2.4vw;
  font-weight: 400;
  letter-spacing: 0.1em;
}

.photobook__title {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 1.5em 0 1em;
  font-size: 1.4vw;
  font-weight: 400;
  line-height: 1;
}

.photobook__desc {
  margin: 0 0 1em;
  font-size: 12px;
  line-height: 1.8;
}

.photobook__window {
  flex: 0 0 50%;
  overflow: hidden;
}

.photobook__track {
  display: flex;
  flex-direction: column;
  gap: 10vw;
  padding-top: 80%;
  will-change: transform;
}

.photobook__item {
  width: 100%;
}

.photobook__img {
  display: block;
  width: 100%;
  height: auto;
}

.photobook__paragraphs{
    margin-top: 2.4vw;
}

.photobook__paragraphs--en {
  margin-top: 2vw;
}
</style>
