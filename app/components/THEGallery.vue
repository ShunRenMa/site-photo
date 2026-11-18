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

// s3：enterAt / enterEnd = 照片開始上來 / 最後一張升完（1 = 區塊滿版），spread = 之後再捲多少到定位
// mid = 疊在中間時相對畫面中心的偏移 [vw, vh]，順序同 template
// 依 p1→p5 順序上來，一張到定點後下一張才出發
const S3 = {
    enterAt: 0.5,
    enterEnd: 1.5,
    centerFrom: 0.6,
    spread: 0.5,
    mid: [ [0.1, -0.1],[-0.18, 0.25], [-0.15, -0.15] , [0.13, 0.12],[0, 0]],
}

const root = ref<HTMLElement>()
const gallery = ref<HTMLElement>()
const s3 = ref<HTMLElement>()
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

        gsap.fromTo(gallery.value!, { backgroundColor: C.bgFrom }, {
            backgroundColor: C.bgTo,
            duration: C.bgDuration,
            ease: 'power2.out',
            scrollTrigger: { trigger: gallery.value, start: at(C.bgStart), toggleActions: 'play none none reverse' },
        })

        ScrollTrigger.create({
            trigger: gallery.value,
            start: 'top top',
            end: () => '+=' + H() * (total - C.enterAt),
            pin: true,
            anticipatePin: 1,
        })

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: gallery.value,
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

        // s3：照片從下方升上來疊在中間，pin 住後散開到 CSS 定位
        const els = gsap.utils.toArray<HTMLElement>('.s3 .ph')
        const midX = (i: number) => {
            const el = els[i]!
            return W() / 2 - (el.offsetLeft + el.offsetWidth / 2) + S3.mid[i]![0]! * W()
        }
        const midY = (i: number) => {
            const el = els[i]!
            return H() / 2 - (el.offsetTop + el.offsetHeight / 2) + S3.mid[i]![1]! * H()
        }

        ScrollTrigger.create({
            trigger: s3.value,
            start: 'top top',
            end: () => '+=' + H() * (S3.enterEnd - 1 + S3.spread),
            pin: true,
        })

        const tl3 = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: s3.value,
                start: at(1 - S3.enterAt),
                end: () => '+=' + H() * (S3.enterEnd - S3.enterAt + S3.spread),
                scrub: true,
                invalidateOnRefresh: true,
            },
        })
            .set(els, { x: midX, y: (i: number) => midY(i) + H(), scale: (i: number) => i === 4 ? S3.centerFrom : 1, immediateRender: true }, 0)
            .to(els, {
                y: midY,
                ease: 'power1.out',
                duration: (S3.enterEnd - S3.enterAt) / els.length,
                stagger: (S3.enterEnd - S3.enterAt) / els.length,
            })
            .to(els, { x: 0, y: 0, scale: 1, duration: S3.spread })
        zoomIn(tl3, '.s3 .ph img', S3.spread, '<', 1.1)
    })
})

onBeforeUnmount(() => {
    mm?.revert()
    offLenis?.()
})
</script>

<template>
    <div ref="root">
        <section ref="gallery" class="gallery">
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
        <section ref="s3" class="s3">
            <div class="ph p1"><img :src="p('DSC06429')" alt=""></div>
            <div class="ph p2"><img :src="p('DSC06506')" alt=""></div>
            <div class="ph p3"><img :src="p('DSC07238')" alt=""></div>
            <div class="ph p4"><img :src="p('DSC06162')" alt=""></div>
            <div class="ph p5"><img :src="p('DSC07461')" alt=""></div>
        </section>
    </div>
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

.s3 {
    position: relative;
    height: 100vh;
    overflow-x: clip;
    background: #1f2433;
}

.s3 .ph { aspect-ratio: 3 / 2; }
.p1 { left: 0; bottom: 5%; width: 26vw; z-index: 4; }
.p2 { left: 10%; top: 5%; width: 22vw; z-index: 1; }
.p3 { left: 70%; top: 45%; width: 24vw; z-index: 5; }
.p4 { right: 0; top: 5%; width: 22vw; z-index: 2; }
.s3 .p5 { left: calc(50vw - 100vh / 3); top: 0; height: 100%; aspect-ratio: 2 / 3; z-index: 3; }
</style>
