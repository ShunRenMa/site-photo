<script setup lang="ts">
import heroSrc from '~/assets/images/cover1.jpg'

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

const isIntroDone = ref(false)
</script>

<template>
  <div class="stage">
    <section class="hero" :class="{ 'is-done': isIntroDone }">
      <div class="hero_img">
        <img :src="heroSrc" alt="Hero Image">
      </div>
      <header class="hero_bar hero_bar--top">Paka</header>
      <h1 class="hero_tagline">Photography Portfolio</h1>
      <footer class="hero_bar hero_bar--bottom">
        <span>Paka (Shun Ren Ma)</span>
        <small>&copy; Shun Ren Ma</small>
      </footer>
    </section>
    <TheLoading
      v-if="!isIntroDone"
      :hero-src="heroSrc"
      @done="isIntroDone = true"
    />
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

.hero_img,
.hero_img img {
  display: block;
  width: 100%;
  height: 100%;
}

.hero_img img {
  object-fit: cover;
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

.hero_bar--bottom {
  bottom: 0;
  transform: translateY(100%);
  transition-delay: 0.15s;
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
