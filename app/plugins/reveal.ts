import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
	let observer: IntersectionObserver | undefined

	nuxtApp.vueApp.directive('reveal', {
		mounted(el: HTMLElement) {
			observer ??= new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return
					entry.target.classList.add('on')
					observer?.unobserve(entry.target)
				})
			}, { rootMargin: '-25% 0px' })
			observer.observe(el)
		},
		unmounted(el: HTMLElement) {
			observer?.unobserve(el)
		},
	})
})
