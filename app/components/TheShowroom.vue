<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import p1 from '~/assets/images/photobook/DSC06471-Edit.webp'
import p2 from '~/assets/images/gallery/DSC06506.webp'
import p3 from '~/assets/images/photobook/DSC06436.webp'
import n1 from '~/assets/images/gallery/DSC00538.webp'
import n2 from '~/assets/images/gallery/DSC07461.webp'
import rollLead from '~/assets/images/gallery/DSC02293.webp'

const files = import.meta.glob<string>('~/assets/images/gallery/*.webp', { eager: true, import: 'default' })
const photoMap = Object.fromEntries(
    Object.entries(files).map(([path, src]) => [path.split('/').pop()!.replace('.webp', ''), src]),
)
// 右邊交錯排列的照片（暫定）
const stream = ['DSC00486', 'DSC03487', 'DSC03803', 'DSC02412', 'DSC02947', 'DSC04059', 'DSC04216', 'DSC04401', 'DSC05328', 'DSC02972'].map(id => photoMap[id])
// 電腦版有視差的張數（第幾張），幅度見 CONFIG.parallax
const PARALLAX = [3, 6, 8, 9]

defineProps<{ background: string }>()

// 長度：1 = 捲動一個畫面高
// leadFrom = p1 起始 left（vw），peek = 右側兩張起始露出比例
// textAt = 文字在 slide 進行到多少時開始淡入，textFrom = 文字從右邊多少 px 進來
// wipe = 從右往左刷出新照片（右邊大圖先、p1 後）
// lift = 右上那張起始在 top -lift 畫面高，碰到視窗上緣後被帶下來，pin 時剛好回到 top 0
// shrinkTo = 刷完的兩張縮到多少再往左出場，pan = 橫移到 end roll
// leadFrom2 = roll 左側小圖起始比例，grow = 放大到上下頂滿，roll = 右側照片往上捲
// listFrom = 右側照片橫移時多落後幾個畫面寬，pan + grow 期間追上
// endSize = footer 縮圖佔畫面的比例（右下），footIn = footer 縮圖升上來，expand = 放大到滿版
const CONFIG = {
    leadFrom: 20,
    peek: 0.2,
    lift: 0.2,
    slide: 1.5,
    gap: 0.2,
    wipe: 1,
    hold: 0.5,
    textAt: 0.2,
    textFrom: 60,
    shrinkTo: 0.6,
    shrink: 0.6,
    pan: 1.5,
    leadFrom2: 0.4,
    grow: 1,
    listFrom: 0.3,
    roll: 4,
    parallax: 50,
    endSize: 0.22,
    footIn: 0.8,
    expand: 1.2,
    endHold: 0.3,
}

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)
    mm = gsap.matchMedia(root.value)
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const C = CONFIG
        const W = () => innerWidth
        const H = () => innerHeight
        const streamEl = root.value!.querySelector<HTMLElement>('.stream')!

        gsap.fromTo('.rt', { y: () => -H() * C.lift }, {
            y: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: root.value,
                start: `top ${C.lift * 100}%`,
                end: 'top top',
                scrub: true,
                invalidateOnRefresh: true,
            },
        })

        const tl = gsap.timeline({ defaults: { ease: 'none' } })
            .fromTo('.lead', { x: () => W() * C.leadFrom / 100 }, { x: 0, duration: C.slide }, 0)
            .fromTo('.side', { xPercent: (1 - C.peek) * 100 }, { xPercent: 0, duration: C.slide }, 0)
            .fromTo('.text p', { x: C.textFrom, opacity: 0 }, {
                x: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: C.slide * (1 - C.textAt) * 0.8,
                stagger: C.slide * (1 - C.textAt) * 0.06,
            }, C.slide * C.textAt)
        zoomIn(tl, '.frame img, .side img', C.slide, 0)
        tl.to({}, { duration: C.gap })
            .fromTo(['.cover', '.frame .next'], { clipPath: 'inset(0% 0% 0% 100%)' }, {
                clipPath: 'inset(0% 0% 0% 0%)',
                ease: 'power2.inOut',
                duration: C.wipe * 0.7,
                stagger: C.wipe * 0.3,
            })
            .to({}, { duration: C.hold })
            // 剩下的兩張縮小，再跟著整排往左出場
            .to(['.frame', '.cover', '.side'], { scale: C.shrinkTo, ease: 'power2.inOut', duration: C.shrink })
            .to('.text', { opacity: 0, duration: C.shrink }, '<')
            .to('.track', { x: () => -W(), ease: 'power2.inOut', duration: C.pan })
            .addLabel('grow')
            // 右側照片比 roll 晚到，roll-lead 放大時還在往左靠
            .fromTo('.stream', { x: () => W() * C.listFrom }, { x: 0, ease: 'power2.out', duration: C.pan + C.grow }, `grow-=${C.pan}`)
            .fromTo('.roll-lead', { scale: C.leadFrom2 }, { scale: 1, ease: 'power2.inOut', duration: C.grow }, 'grow')
            // 右側照片往上捲，每張帶一點視差和縮放
            .fromTo('.stream', { y: 0 }, { y: () => -(streamEl.offsetTop + streamEl.offsetHeight), duration: C.roll }, `-=${C.grow * 0.5}`)
            .fromTo('.stream .item', { yPercent: (i: number) => PARALLAX.includes(i + 1) ? C.parallax : 0 }, { yPercent: (i: number) => PARALLAX.includes(i + 1) ? -C.parallax : 0, duration: C.roll }, '<')
            .fromTo('.stream .item img', { scale: 1.15 }, { scale: 1, duration: C.roll }, '<')
            .fromTo('.roll-lead img', { scale: 1 }, { scale: 1.05, duration: C.roll }, '<')
            // footer 縮圖從下方升到右下，再放大到滿版
            .fromTo('.end', {
                width: () => W() * C.endSize,
                height: () => H() * C.endSize,
                right: () => W() * 0.04,
                bottom: () => H() * 0.04,
                y: () => H(),
            }, { y: 0, ease: 'power2.out', duration: C.footIn }, `-=${C.footIn}`)
            .to('.end', { width: W, height: H, right: 0, bottom: 0, ease: 'power2.inOut', duration: C.expand })
            .to({}, { duration: C.endHold })

        ScrollTrigger.create({
            trigger: root.value,
            start: 'top top',
            end: () => '+=' + H() * tl.duration(),
            pin: true,
            scrub: true,
            animation: tl,
            invalidateOnRefresh: true,
        })
    })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
    <section ref="root" class="showroom">
        <div class="track">
            <div class="panel intro">
                <div class="lead">
                    <div class="frame"><img :src="p1" alt=""><img class="next" :src="n1" alt=""></div>
                    <div class="text">
                        <p>謝謝你看到這裡，接下來是系列照片。</p>
                        <p>我期望在生活中創造出一些驚喜與不平凡。</p>
                        <div class="en">
                            <p>Thank you for making it this far. Up next is a photo series.</p>
                            <p>I hope to create a little surprise and something extraordinary in everyday life.</p>
                        </div>
                    </div>
                </div>
                <div class="side rt"><img :src="p2" alt=""></div>
                <div class="side rb"><img :src="p3" alt=""></div>
                <div class="cover"><img :src="n2" alt=""></div>
            </div>
            <div class="panel roll">
                <div class="roll-lead"><img :src="rollLead" alt=""></div>
                <div class="stream">
                    <div v-for="(src, i) in stream" :key="i" class="item"><img :src="src" alt=""></div>
                </div>
                <TheFooter class="end" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.showroom {
    position: relative;
    height: 100vh;
    overflow-x: clip;
    background-color: v-bind(background);
}

.track {
    display: flex;
    width: 200vw;
    height: 100%;
}

.panel {
    position: relative;
    flex: 0 0 100vw;
    height: 100vh;
}

.lead {
    position: absolute;
    top: 0;
    left: 0;
    width: 50vw;
}

.frame {
    position: relative;
    width: 50vw;
    max-width: calc(70vh * 3 / 2);
    aspect-ratio: 3 / 2;
    overflow: hidden;
}

.frame img,
.side img,
.cover img,
.roll-lead img,
.item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text {
    margin-top: 2rem;
    padding-left: 4vw;
    font-family: 'Inter Tight', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
    color: #696c6fdb;
    letter-spacing: 1px;
}

.text p {
    margin: 0 0 1em;
    font-size: 14px;
    line-height: 1.8;
}

.text .en { margin-top: 2vw; }

.side {
    position: absolute;
    right: 0;
    height: 50vh;
    overflow: hidden;
}

.rt { top: 0; aspect-ratio: 3 / 2; transform-origin: 50% 100%; }
.rb { top: 50vh; aspect-ratio: 3 / 2; transform-origin: 50% 0%; }

.frame .next {
    position: absolute;
    inset: 0;
}

.frame .next,
.cover { clip-path: inset(0% 0% 0% 100%); }

.cover {
    position: absolute;
    top: 0;
    right: 0;
    height: 100vh;
    aspect-ratio: 3 / 4;
    overflow: hidden;
}

.roll { overflow: hidden; }

.roll-lead {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
}

.stream {
    position: absolute;
    top: 55%;
    left: 100vh;
    right: 4vw;
    display: flex;
    flex-direction: column;
    gap: 5vh;
}

.item {
    width: 18vw;
    overflow: hidden;
}

.item img { height: auto; }

.item:nth-child(even) { align-self: flex-end; }

@media (min-width: 768px) {
    .stream .item:nth-child(1) { width: 18vw; align-self: flex-start; position: relative; top: 15vw; }
    .stream .item:nth-child(2) { width: 18vw; align-self: flex-end; margin-right: -4vw; }
    .stream .item:nth-child(3) { width: 18vw; align-self: flex-start; margin-left: 4vw; margin-top: -15vw; }
    .stream .item:nth-child(4) { width: 18vw; align-self: flex-end; margin-right: -4vw; }
    .stream .item:nth-child(5) { width: 18vw; align-self: flex-start; }
    .stream .item:nth-child(6) { width: 14vw; align-self: flex-end; margin-right: 0; }
    .stream .item:nth-child(7) { width: 18vw; align-self: flex-start; margin-left: 4vw; margin-top: -8vw; }
    .stream .item:nth-child(8) { width: 18vw; align-self: flex-end; margin-right: -4vw; }
    .stream .item:nth-child(9) { width: 14vw; align-self: flex-start; margin-top: -16vw; }
    .stream .item:nth-child(10) { width: 16vw; align-self: flex-end; margin-right: -2vw; }
}

.end {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 2;
}

@media (max-width: 767px) {
    .intro {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: auto;
        padding-bottom: 16px;
    }

    .lead,
    .side {
        position: static;
        width: 100%;
        height: auto;
    }

    .side { display: block; }

    .lead {
        display: flex;
        flex-direction: column;
    }

    .frame {
        width: 100%;
        max-width: none;
    }

    .text {
        order: -1;
        margin: 0 0 2rem;
    }
}

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
    .showroom,
    .roll { height: auto; }

    .track {
        display: block;
        width: auto;
    }

    .roll-lead,
    .stream { position: static; }

    .end { position: relative; }

    .roll-lead {
        width: 100%;
        max-width: 100vh;
        height: auto;
        margin: 0 auto;
    }

    .stream {
        gap: 4vw;
        padding: 4vw;
    }

    .item { width: min(70%, 40vw); }
}

/* 參考 okeystudio 手機版 step 10：8 欄 grid 交錯排列 */
@media (max-width: 767px) {
    .stream {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        align-items: start;
        gap: 0;
        padding: 0 0 8vw;
    }

    .stream .item {
        width: auto;
        align-self: start;
    }

    .stream .item:nth-child(1) { grid-column: 1 / 8; margin-top: 4vw; }
    .stream .item:nth-child(2) { grid-column: 9 / 13; margin-top: 16vw; }
    .stream .item:nth-child(3) { grid-column: 1 / 6; margin-top: -4vw; margin-left: 4vw; margin-right: 6px; }
    .stream .item:nth-child(4) { grid-column: 7 / 12; margin-top: 40vw; margin-left: 6px; margin-right: 4vw; }
    .stream .item:nth-child(5) { grid-column: 1 / 7; margin-top: 8vw; }
    .stream .item:nth-child(6) { grid-column: 8 / 13; margin-top: 24vw; margin-right:-10%;}
    .stream .item:nth-child(7) { grid-column: 1 / 6; margin-top: -10vw; }
    .stream .item:nth-child(8) { grid-column: 9 / 13; margin-top: 30vh; }
    .stream .item:nth-child(9) { grid-column: 3 / 7; margin-top: -8vw; margin-left: -4vw; }
    .stream .item:nth-child(10) { grid-column: 4 / 12; margin-top: 12px; margin-right: 4vw; }
}
</style>
