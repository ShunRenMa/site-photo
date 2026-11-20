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
    enter: 0.64,
    expand: 1.28,
    zoom: 0.96,
    hold: 0.64,
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
    wipe: 1,
    pan: 1.5,
    gap: 0.2,
    mid: [ [0.1, -0.1],[-0.18, 0.25], [-0.15, -0.15] , [0.13, 0.12],[0, 0]],
}

// s4：第一張橫移進來，之後每張停 hold 再花 rise 從下方升上來；pos = tl / tr / bl / br
const S4 = { hold: 0.8, rise: 1, fromScale: 0.5 }
const photos = s4Photos.map(ph => ({ ...ph, src: p(ph.id) }))
const s4Len = (photos.length - 1) * (S4.hold + S4.rise) + S4.hold

const cards = ref<HTMLElement[]>([])
const shown = reactive<Record<number, string>>({})
let observer: IntersectionObserver | undefined

const root = ref<HTMLElement>()
const gallery = ref<HTMLElement>()
const s3 = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined
let offLenis: (() => void) | undefined

onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)
    offLenis = useNuxtApp().$lenis?.on('scroll', ScrollTrigger.update)

    observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
            const i = Number((e.target as HTMLElement).dataset.i)
            if (e.intersectionRatio >= 0.85) shown[i] = 'is-inview'
            else if (e.intersectionRatio < 0.2) shown[i] = 'is-out'
        }
    }, { threshold: [0.2, 0.85] })
    cards.value.forEach(el => observer!.observe(el))

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
            end: () => '+=' + H() * (S3.enterEnd - 1 + S3.spread + S3.wipe + S3.pan + S3.gap * 2 + s4Len),
            pin: true,
        })

        const tl3 = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: s3.value,
                start: at(1 - S3.enterAt),
                end: () => '+=' + H() * (S3.enterEnd - S3.enterAt + S3.spread + S3.wipe + S3.pan + S3.gap * 2 + s4Len),
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
        zoomIn(tl3, '.s3 .ph img:not(.next)', S3.spread, '<', 1.1)
        tl3.to({}, { duration: S3.gap })
            .fromTo('.s3 .next', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: S3.wipe })
            // s3 與 s4 並排一起往左移
            .to({}, { duration: S3.gap })
            .to('.track', { x: () => -W(), duration: S3.pan })

        const cardEls = gsap.utils.toArray<HTMLElement>('.s4 .card').slice(1)
        tl3.set(cardEls, { yPercent: 100, scaleX: S4.fromScale, scaleY: S4.fromScale, immediateRender: true }, 0)
        const midScale = S4.fromScale + (1 - S4.fromScale) * 0.8
        cardEls.forEach((el) => {
            tl3.to({}, { duration: S4.hold })
                .to(el, { keyframes: { '50%': { scaleX: midScale, scaleY: 1 }, '100%': { yPercent: 0, scaleX: 1, scaleY: 1 }, easeEach: 'none' }, duration: S4.rise })
        })
        tl3.to({}, { duration: S4.hold })
    })
})

onBeforeUnmount(() => {
    mm?.revert()
    observer?.disconnect()
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
        <section ref="s3" class="s34">
            <div class="track">
                <div class="s3">
                    <div class="ph p1"><img :src="p('DSC06429')" alt=""><img class="next" :src="p('DSC06676')" alt=""></div>
                    <div class="ph p2"><img :src="p('DSC06506')" alt=""><img class="next" :src="p('DSC07180')" alt=""></div>
                    <div class="ph p3"><img :src="p('DSC07238')" alt=""><img class="next" :src="p('DSC07194')" alt=""></div>
                    <div class="ph p4"><img :src="p('DSC06162')" alt=""><img class="next" :src="p('DSC07210')" alt=""></div>
                    <div class="ph p5"><img :src="p('DSC07461')" alt=""><img class="next" :src="p('DSC06350')" alt=""></div>
                </div>
                <div class="s4">
                    <article v-for="(photo, i) in photos" :key="i" ref="cards" class="card" :style="{ '--i': i }" :data-i="i">
                        <img :src="photo.src" :alt="photo.alt">
                        <span class="info tagline" :class="[photo.taglinePos, shown[i]]"><span class="info_text">{{ photo.tagline }}</span></span>
                        <span class="info date" :class="[photo.datePos, shown[i]]"><span class="info_text">{{ photo.date }}</span></span>
                    </article>
                </div>
            </div>
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

.s34 { overflow-x: clip; }

.s3 {
    position: relative;
    height: 100vh;
    background: #1f2433;
}

.s4 {
    --gutter: 4vw;
    position: relative;
    overflow: hidden;
}

.card {
    position: relative;
    height: 100vh;
    overflow: hidden;
    z-index: var(--i);
}

.card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: breathe 6s ease-in-out infinite alternate;
}

@keyframes breathe {
    from { scale: 1.1; }
    to { scale: 1; }
}

.card::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 40%;
    background: linear-gradient(to top, #0009, transparent);
    pointer-events: none;
}

/* 色塊從 --from 長滿，再往 --to 收掉，收的同時刷出字 */
.info {
    position: absolute;
    z-index: 1;
    max-width: calc(100% - var(--gutter) * 2);
    color: #fff;
    line-height: 1.4;
    user-select: none;
    --from: left;
    --to: right;
    --clip-hidden: inset(0 100% 0 0);
    opacity: 0;
    transition: opacity 0.5s ease-out, translate 0.5s ease-out;
}

.info.is-inview {
    opacity: 1;
    translate: 0 0;
}

.info.is-out {
    opacity: 0;
    translate: 0 0.6rem;
}

.info.is-out .info_text { clip-path: inset(0 0 0 0); }

.info::after {
    content: '';
    position: absolute;
    inset: -0.08em 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: var(--from) center;
}

.info_text {
    display: inline-block;
    clip-path: var(--clip-hidden);
}

.info.is-inview::after { animation: info-block 0.9s both; }
.info.is-inview .info_text { animation: info-text 0.45s cubic-bezier(1, -0.05, 0, 1.05) 0.45s both; }

@keyframes info-block {
    0% {
        transform: scaleX(0);
        transform-origin: var(--from) center;
        animation-timing-function: cubic-bezier(1, -0.05, 0, 1.05);
    }
    35% {
        transform: scaleX(1);
        transform-origin: var(--from) center;
    }
    50% {
        transform: scaleX(1);
        transform-origin: var(--to) center;
        animation-timing-function: cubic-bezier(1, -0.05, 0, 1.05);
    }
    100% {
        transform: scaleX(0);
        transform-origin: var(--to) center;
    }
}

@keyframes info-text {
    from { clip-path: var(--clip-hidden); }
    to { clip-path: inset(0 0 0 0); }
}

.info.tl, .info.tr { top: var(--gutter); }
.info.bl, .info.br { bottom: var(--gutter); }
.info.tl, .info.bl { left: var(--gutter); }

.info.tr,
.info.br {
    right: var(--gutter);
    text-align: right;
    --from: right;
    --to: left;
    --clip-hidden: inset(0 0 0 100%);
}

.info.tagline {
    top: 4%;
    bottom: auto;
    font-size: 6vw;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.info.date {
    font-size: clamp(0.75rem, 1vw, 1rem);
    letter-spacing: 0.14em;
    color: #ffffffcc;
}

@media (max-width: 767px) {
    .info.tagline { font-size: 3em; }
}

@media (prefers-reduced-motion: reduce) {
    .card img { animation: none; }
    .info { transition: none; }
    .info::after { display: none; }
    .info_text { clip-path: none; }
}

@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
    .track {
        display: flex;
        width: 200vw;
    }

    .s3,
    .s4 { flex: 0 0 100vw; }

    .s4 { height: 100vh; }

    .card {
        position: absolute;
        inset: 0;
        height: auto;
    }
}

.s3 .ph { aspect-ratio: 3 / 2; }
.s3 .next {
    position: absolute;
    inset: 0;
    clip-path: inset(0% 0% 0% 100%);
}
.p1 { left: 0; bottom: 5%; width: 26vw; z-index: 4; }
.p2 { left: 10%; top: 5%; width: 22vw; z-index: 1; }
.p3 { left: 70%; top: 45%; width: 24vw; z-index: 5; }
.p4 { right: 0; top: 5%; width: 22vw; z-index: 2; }
.s3 .p5 { left: calc(50vw - 100vh / 3); top: 0; height: 100%; aspect-ratio: 2 / 3; z-index: 3; }

@media (max-width: 767px) {
    .gallery { height: auto; }

    .s1 {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 15vw 4%;
    }

    .s1 .ph {
        position: relative;
        inset: auto;
        width: 60%;
        height: auto;
    }

    .s1 .ph img { height: auto; }

    .s1 .lb,
    .s1 .rc { margin-left: auto; }

    .s3 {
        display: flex;
        flex-direction: column;
        gap: 24px;
        height: auto;
        padding: 15vw 4%;
    }

    .s3 .ph {
        position: relative;
        inset: auto;
        width: 60%;
    }

    .s3 .p2,
    .s3 .p4 { margin-left: auto; }

    .s3 .p5 {
        width: 100%;
        height: auto;
    }

    .s4 { overflow: clip; }
}

@supports (animation-timeline: view()) {
    @media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
        .card {
            position: sticky;
            top: 0;
            height: 100dvh;
            animation: card-rise linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 100%;
        }
    }
}

@keyframes card-rise {
    from { scale: 0.5; }
    50% { scale: 0.9 1; }
    to { scale: 1; }
}
</style>
