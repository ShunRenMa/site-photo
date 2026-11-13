<script setup lang="ts">
const pages = [
  { name: 'HOME', url: '/' },
  { name: 'CONTACT', url: 'mailto:e12813726@gmail.com' },
]

const socials = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/paka.ph_024/',
    path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.439.645 1.439 1.439z',
  },
]

const copyRight = '© 2026 ShunRen Ma.'

const route = useRoute()
const open = ref(false)
const hidden = ref(false)

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

// 往下滑收起漢堡鈕，往上滑或回到頂端再出現
let lastY = 0
let ticking = false

function updateBurger() {
  const y = window.scrollY
  if (open.value) hidden.value = false
  else if (y > lastY && y > 80) hidden.value = true
  else if (y < lastY) hidden.value = false
  lastY = y
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateBurger)
}

onMounted(() => {
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})

const props = defineProps<{ isIntroDone: boolean }>()

const menuEl = ref<HTMLElement>()
const burgerEl = ref<HTMLElement>()
const wipeStyle = ref<Record<string, string>>()

watch(
  () => props.isIntroDone,
  (done) => {
    if (!done) return
    const target = [menuEl.value, burgerEl.value].find(
      (el) => el && el.getClientRects().length > 0,
    )
    if (!target) return
    const { top, left, width, height } = target.getBoundingClientRect()
    wipeStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  },
)
</script>

<template>
  <div class="nav_root">
    <nav class="nav" :class="{ 'is-playing': isIntroDone }">
      <div ref="menuEl" class="nav_menu">
        <ul class="nav_pages">
          <li v-for="page in pages" :key="page.name">
            <NuxtLink
              v-if="page.url.startsWith('/')"
              :to="page.url"
              class="nav_link"
              >{{ page.name }}</NuxtLink
            >
            <a v-else :href="page.url" class="nav_link">{{ page.name }}</a>
          </li>
        </ul>

        <ul class="nav_socials">
          <li v-for="social in socials" :key="social.name">
            <a
              :href="social.url"
              target="_blank"
              rel="noopener"
              :aria-label="social.name"
              class="nav_icon"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="social.path" />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <button
        ref="burgerEl"
        type="button"
        class="nav_burger"
        :class="{ 'is-open': open, 'is-hidden': hidden && !open }"
        :aria-expanded="open"
        aria-controls="nav-panel"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>

      <div
        class="panel_backdrop"
        :class="{ 'is-open': open }"
        @click="open = false"
      />

      <div
        id="nav-panel"
        class="panel"
        :class="{ 'is-open': open }"
        :aria-hidden="!open"
      >
        <ul class="panel_list">
          <li v-for="page in pages" :key="page.name">
            <NuxtLink
              v-if="page.url.startsWith('/')"
              :to="page.url"
              class="panel_link"
              :tabindex="open ? 0 : -1"
              >{{ page.name }}</NuxtLink
            >
            <a
              v-else
              :href="page.url"
              class="panel_link"
              :tabindex="open ? 0 : -1"
              >{{ page.name }}</a
            >
          </li>

          <li class="panel_socials">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener"
              :aria-label="social.name"
              class="panel_icon"
              :tabindex="open ? 0 : -1"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="social.path" />
              </svg>
            </a>
          </li>
        </ul>

        <p class="panel_copy">{{ copyRight }}</p>
      </div>
    </nav>

    <div v-if="wipeStyle" class="nav_wipe" :style="wipeStyle" aria-hidden="true" />
  </div>
</template>

<style scoped>
.nav_root {
  --gutter: 4vw;
  --nav-wipe-color: #053056;
  --nav-wipe-duration: 0.8s;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483647;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  padding: 8px var(--gutter);
  line-height: 1.3;
  flex-direction: row-reverse;
  color: #767676;
  pointer-events: none;
  font-family: 'Lora', serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
  mix-blend-mode: difference;
}

.nav a {
  color: inherit;
  text-decoration: none;
  pointer-events: auto;
}

.nav_wipe {
  display: none;
  position: fixed;
  z-index: 2147483647;
  background: var(--nav-wipe-color);
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .nav:not(.is-playing) .nav_menu,
  .nav:not(.is-playing) .nav_burger {
    visibility: hidden;
  }

  .nav.is-playing .nav_menu,
  .nav.is-playing .nav_burger {
    animation: nav-content-in var(--nav-wipe-duration) var(--nav-delay, 0s) both;
  }

  .nav_wipe {
    display: block;
    animation: nav-wipe var(--nav-wipe-duration) var(--nav-delay, 0s)
      cubic-bezier(0.76, 0, 0.24, 1) both;
  }
}

/* 方塊刷滿的瞬間（50%）才讓內容出現 */
@keyframes nav-content-in {
  0%,
  49.9% {
    visibility: hidden;
  }

  50%,
  100% {
    visibility: visible;
  }
}

@keyframes nav-wipe {
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

.nav_menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav_pages,
.nav_socials {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav_link {
  position: relative;
  font-size: 14px;
}

/* 把 hover 熱區上下各撐 25% */
.nav_link::before {
  content: '';
  position: absolute;
  left: 0;
  top: -25%;
  width: 100%;
  height: 150%;
}

.nav_link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.6s ease;
}

.nav_link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav_icon {
  display: block;
  opacity: 0.85;
  transition: opacity 0.4s ease;
}

.nav_icon:hover {
  opacity: 1;
}

.nav_icon svg {
  display: block;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.nav_burger {
  --burger: clamp(36px, 12vw, 44px);
  --bar-gap: calc(var(--burger) * 0.14);

  display: none;
  position: fixed;
  top: 0.5rem;
  right: var(--gutter);
  z-index: 2;
  width: var(--burger);
  height: var(--burger);
  padding: 0;
  border: 0;
  background: none;
  color: #0f1419;
  filter: drop-shadow(0 0 3px rgb(255 255 255 / 55%));
  cursor: pointer;
  pointer-events: auto;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.nav_burger.is-hidden {
  transform: translateY(calc(var(--burger) * -1.6));
  opacity: 0;
  pointer-events: none;
}

.nav_burger span {
  position: absolute;
  left: 25%;
  width: 60%;
  height: 1.5px;
  margin-top: -0.75px;
  background: #6a6a6a;
  transition:
    transform 0.4s ease,
    opacity 0.3s ease;
}

.nav_burger span:nth-child(1) {
  top: calc(50% - var(--bar-gap));
}

.nav_burger span:nth-child(2) {
  top: 50%;
}

.nav_burger span:nth-child(3) {
  top: calc(50% + var(--bar-gap));
}

.nav_burger.is-open span:nth-child(1) {
  transform: translateY(var(--bar-gap)) rotate(45deg);
}

.nav_burger.is-open span:nth-child(2) {
  opacity: 0;
}

.nav_burger.is-open span:nth-child(3) {
  transform: translateY(calc(var(--bar-gap) * -1)) rotate(-45deg);
}

.panel_backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: none;
  background: rgb(26 26 26 / 60%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.6s ease,
    visibility 0.6s;
}

.panel_backdrop.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.panel {
  --panel-pad: 8vw;
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 1;
  box-sizing: border-box;
  width: 80%;
  display: none;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 28vh 0 0 var(--panel-pad);
  background: #f7f8f7;
  color: #767676;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(100%);
  transition:
    transform 0.6s cubic-bezier(0.76, 0, 0.24, 1),
    visibility 0.6s;
  font-family: 'Lora', serif;
  font-weight: 600;
}

.panel.is-open {
  visibility: visible;
  pointer-events: auto;
  transform: none;
}

.panel_list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12vw;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

.panel_socials {
  display: flex;
  gap: 2rem;
}

.panel_copy {
  position: absolute;
  left: var(--panel-pad);
  bottom: var(--panel-pad);
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

.panel_link {
  display: block;
  font-size: clamp(2rem, 12vw, 3.5rem);
  line-height: 1.1;
}

.panel_icon svg {
  display: block;
  width: 26px;
  height: 26px;
  fill: currentColor;
}

@media (max-width: 768px) {
  .nav {
    align-items: center;
    padding-block: 0.5rem;
    mix-blend-mode: unset;
  }

  .panel_link {
    font-size: 1.75rem;
  }

  .nav_menu {
    display: none;
  }

  .nav_burger {
    display: block;
  }

  .panel_backdrop {
    display: block;
  }

  .panel {
    display: flex;
  }
}
</style>
