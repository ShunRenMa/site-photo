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
  </div>
</template>


<style scoped>
.home {
  --brand-delay: 0s;
  --nav-delay: 0.4s;
  --title-delay: 0.8s;
}

.sec {
  height: 100vh;
  background-color: #dde1e1;
}
</style>
