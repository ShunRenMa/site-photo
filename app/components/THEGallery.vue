<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const files = import.meta.glob<string>('~/assets/images/gallery/*.webp', { eager: true, import: 'default' })
const photoMap = Object.fromEntries(
    Object.entries(files).map(([path, src]) => [path.split('/').pop()!.replace('.webp', ''), src]),
)
const p = (id: string) => photoMap[id]

// 位置：區塊頂端在畫面的哪裡（1 = 畫面底、0 = 畫面頂）
// 長度：1 = 捲動一個畫面高
const CONFIG = {
    bgFrom: '#e3e9e9',
    bgTo: '#000',
    bgStart: 0.1,
    bgDuration: 1,
    enterAt: 0.3,
    enter: 1,
    expand: 2,
    zoom: 1.5,
    hold: 1,
    wipe: 2.5,
    end: 1,
}

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined
let offLenis: (() => void) | undefined

onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)
    offLenis = useNuxtApp().$lenis?.on('scroll', ScrollTrigger.update)

    mm = gsap.matchMedia(root.value)
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const W = () => innerWidth
        const H = () => innerHeight
        // 四張的最終位置 [left, top, width, height]，順序同 template
        const rect = (i: number) => [
            [0, 0, W() * 0.36, H() / 2],
            [0, H() / 2, W() * 0.36, H() / 2],
            [W() * 0.36, 0, W() * 0.32, H()],
            [W() * 0.68, 0, W() * 0.32, H()],
        ][i]!
        // 進場時的小圖：在各自的格子裡縮成 K 倍置中
        const K = 0.4
        const small = (i: number) => {
            const [x, y, w, h] = rect(i) as [number, number, number, number]
            return [x + w * (1 - K) / 2, y + h * (1 - K) / 2, w * K, h * K]
        }

        const C = CONFIG
        const at = (v: number) => `top ${v * 100}%`
        const total = C.enter + C.expand + C.zoom + C.hold + C.wipe + C.end

        gsap.fromTo(root.value!, { backgroundColor: C.bgFrom }, {
            backgroundColor: C.bgTo,
            duration: C.bgDuration,
            ease: 'power2.out',
            scrollTrigger: { trigger: root.value, start: at(C.bgStart), toggleActions: 'play none none reverse' },
        })

        ScrollTrigger.create({
            trigger: root.value,
            start: 'top top',
            end: () => '+=' + H() * (total - C.enterAt),
            pin: true,
            anticipatePin: 1,
        })

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: root.value,
                start: at(C.enterAt),
                end: () => '+=' + H() * total,
                scrub: true,
                invalidateOnRefresh: true,
            },
        })
            // 四張小圖從右邊一起進場，越左邊的跑越快
            .fromTo('.s1 .ph', {
                left: W,
                top: (i: number) => small(i)[1]!,
                width: (i: number) => small(i)[2]!,
                height: (i: number) => small(i)[3]!,
            }, { left: (i: number) => small(i)[0]!, duration: C.enter })
            // 在各自格子裡展開填滿
            .to('.s1 .ph', {
                left: (i: number) => rect(i)[0]!,
                top: (i: number) => rect(i)[1]!,
                width: (i: number) => rect(i)[2]!,
                height: (i: number) => rect(i)[3]!,
                duration: C.expand,
            })
        zoomIn(tl, '.s1 .ph img', C.zoom, '>')
        tl.to({}, { duration: C.hold })
            // 灰色層由右往左刷過去
            .fromTo('.s2', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: C.wipe })
            .to({}, { duration: C.end })
    })
})

onBeforeUnmount(() => {
    mm?.revert()
    offLenis?.()
})
</script>

<template>
    <section ref="root" class="gallery">
        <div class="scene s1">
            <div class="ph lt"><img :src="p('DSC06176')" alt=""></div>
            <div class="ph lb"><img :src="p('DSC06177')" alt=""></div>
            <div class="ph c3"><img :src="p('DSC06350')" alt=""></div>
            <div class="ph rc"><img :src="p('DSC05522')" alt=""></div>
        </div>
        <div class="scene s2">
            <div class="ph lt"><img :src="p('DSC04570')" alt=""></div>
            <div class="ph lb"><img :src="p('DSC02469')" alt=""></div>
            <div class="ph c3"><img :src="p('20251029-DSC03373')" alt=""></div>
            <div class="ph rc"><img :src="p('20260208-DSC04966')" alt=""></div>
        </div>
    </section>
</template>

<style scoped>
.gallery {
    --L: 36vw;
    position: relative;
    height: 100vh;
    overflow: hidden;
    background: #000;
}

.scene {
    position: absolute;
    inset: 0;
}

.s2 {
    background: #6b6b6b;
    clip-path: inset(0% 0% 0% 100%);
}

.ph {
    position: absolute;
    overflow: hidden;
}

.ph img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.lt,
.lb {
    left: 0;
    width: var(--L);
    height: 50vh;
}

.lt { top: 0; }
.lb { top: 50vh; }

.c3,
.rc {
    top: 0;
    width: 32vw;
    height: 100vh;
}

.c3 { left: var(--L); }
.rc { left: calc(var(--L) + 32vw); }
</style>
