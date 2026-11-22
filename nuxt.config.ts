// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css', '~/assets/css/reveal.css'],
	app: {
		head: {
			htmlAttrs: { lang: 'zh-Hant' },
			titleTemplate: 'Paka | %s',
			meta: [
				{
					property: 'og:site_name',
					content: 'Paka (Shun Ren Ma) / Photographer',
				},
				{ property: 'og:type', content: 'website' },
				{ property: 'og:locale', content: 'zh_TW' },
				{ property: 'og:image', content: 'https://photography.alupaka.tw/og.jpg' },
				{ property: 'og:image:width', content: '1200' },
				{ property: 'og:image:height', content: '630' },
				{ name: 'twitter:card', content: 'summary_large_image' },
			],
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;700&family=Lora:wght@600&display=swap',
				},
				{ rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32' },
				{
					rel: 'icon',
					type: 'image/png',
					href: '/favicon-32.png',
					sizes: '32x32',
				},
				{
					rel: 'apple-touch-icon',
					href: '/apple-touch-icon.png',
					sizes: '180x180',
				},
			],
		},
	},
})
