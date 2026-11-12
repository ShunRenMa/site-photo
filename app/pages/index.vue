<script setup lang="ts">
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
const backgroundColor = ref('#e3e9e9')

onMounted(() => {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
})
</script>

<template>
  <div class="home">
    <TheLoading v-if="!isIntroDone" @done="isIntroDone = true" />
    <TheNav :is-intro-done="isIntroDone" />
    <div>
      <TheHero :is-intro-done="isIntroDone" />
    </div>
    <div class="sec">
    </div>
    <ThePhotobook :background="backgroundColor" />
    
  </div>
</template>


<style scoped>
.home {
  --nav-delay: 0.4s;
  --title-delay: 0.8s;
  --scroll-delay: 2s;
}

.sec {
  height: 100vh;
  background-color: v-bind(backgroundColor);
}
</style>
