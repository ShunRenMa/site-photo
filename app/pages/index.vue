<script setup lang="ts">
const siteUrl = 'https://photography.alupaka.tw/'
const description = '台北街頭與人像攝影師 Paka，喜歡旅行，在旅途中記錄珍貴的畫面。Taipei-based street & portrait photographer who loves to travel.'

useSeoMeta({
  description,
  ogTitle: 'Paka | Photography Portfolio',
  ogDescription: description,
  ogUrl: siteUrl,
})

useHead({
  title: 'Photography Portfolio',
  link: [{ rel: 'canonical', href: siteUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': 'https://photography.alupaka.tw/#website',
            name: 'Paka',
            alternateName: 'Shun Ren Ma',
            url: 'https://photography.alupaka.tw/',
            inLanguage: 'zh-Hant',
            publisher: { '@id': 'https://photography.alupaka.tw/#person' },
          },
          {
            '@type': 'Person',
            '@id': 'https://photography.alupaka.tw/#person',
            name: 'Paka',
            alternateName: 'Shun Ren Ma',
            jobTitle: 'Photographer',
            description,
            knowsAbout: ['Street Photography', 'Portrait Photography', 'Travel Photography'],
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Taipei',
              addressCountry: 'TW',
            },
            url: 'https://photography.alupaka.tw/',
            sameAs: ['https://www.instagram.com/paka.ph_024/'],
          },
        ],
      }),
    },
  ],
})

const isIntroDone = ref(false)
const backgroundColor = ref('#e3e9e9')

const lockScroll = useScrollLock()

onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <div class="home">
    <TheLoading v-if="!isIntroDone" @done="isIntroDone = true" />
    <TheNav :is-intro-done="isIntroDone" />
    <div>
      <TheHero :is-intro-done="isIntroDone" @ready="lockScroll(false)" />
    </div>
    <div class="sec"></div>
    <ThePhotobook :background="backgroundColor" />
    <div class="thr"></div>
    <TheGallery />
     <div class="thr"></div>
    <TheShowroom :background="backgroundColor"/>
  </div>
</template>


<style scoped>
.home {
  --nav-delay: 0.4s;
  --brand-delay: 0.6s;
  --title-delay: 0.8s;
  --scroll-delay: 2s;
}

.sec {
  height: 50vh;
  background-color: v-bind(backgroundColor);
}

.thr {
  height: 30vh;
  background-color: v-bind(backgroundColor);
}
</style>
