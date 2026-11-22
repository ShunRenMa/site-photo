<script setup lang="ts">
import bg from '~/assets/images/photobook/20251028-DSC03303.webp'

const navArray = [
    [{ name: 'HOME', url: '/' }],
    [{ name: 'CONTACT', url: 'mailto:e12813726@gmail.com' }],
    [{ name: 'INSTAGRAM', url: 'https://www.instagram.com/paka.ph_024/' }],
]
const introZh = '台北街頭與人像攝影師，喜歡旅行，也常在旅途中記錄珍貴的畫面。'
const intro = 'Paka is a Taipei-based street and portrait photographer who loves to travel, capturing precious moments along the way.'
const copyRight = '© 2026 ShunRen Ma.'
</script>

<template>
    <div class="ending">
        <img class="bg" :src="bg" alt="">
        <div class="thanks">
            <span class="small">Once again, a HUGE</span>
            <span class="big">THANK YOU!</span>
        </div>
        <footer>
            <div class="footer_content">
                <div class="nav_area">
                    <div v-for="(group, index) in navArray" :key="index" class="nav_item">
                        <ul>
                            <li v-for="(item, i) in group" :key="i">
                                <NuxtLink v-if="item.url.startsWith('/')" :to="item.url">{{ item.name }}</NuxtLink>
                                <a
                                    v-else
                                    :href="item.url"
                                    :target="item.url.startsWith('http') ? '_blank' : undefined"
                                    rel="noopener"
                                >{{ item.name }}</a>
                            </li>
                        </ul>
                    </div>
                    <div class="nav_item copy_right_item">
                        <p class="intro">{{ introZh }}<br>{{ intro }}</p>
                        <p>{{ copyRight }}</p>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.ending {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    container-type: size;
    color: #fff;
    font-family: 'Inter Tight', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
}

.bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: breathe 6s ease-in-out infinite alternate;
}

@keyframes breathe {
    from { scale: 1.1; }
    to { scale: 1; }
}

.ending::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 20%);
}

.thanks {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
}

.small {
    font-size: 1.6cqw;
    letter-spacing: 0.1em;
}

.big {
    font-size: 10.1cqw;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.02em;
}

footer {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    width: 100%;
    font-size: 0.95cqw;
}

.footer_content {
    width: 92cqw;
    margin: 0 auto;
    padding: 4cqw 0;
}

.nav_area {
    display: flex;
    justify-content: space-between;
}

.nav_item { flex: 1; }

.copy_right_item { text-align: right; }

ul {
    margin: 0;
    padding: 0;
}

li { list-style: none; }

p { margin: 0; }

.intro { margin-bottom: 0.6em; }

a {
    position: relative;
    color: inherit;
    text-decoration: none;
}

/* hover 熱區上下各撐 25% */
a::before {
    content: '';
    position: absolute;
    left: 0;
    top: -25%;
    width: 100%;
    height: 150%;
}

a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.6s ease;
}

a:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

@media (max-width: 767px) {
    .ending { height: 100dvh; }

    .small { font-size: 4cqw; }

    footer { font-size: 3.5cqw; }
    .nav_area { flex-wrap: wrap; }

    .nav_item { flex: none; }

    .copy_right_item {
        flex-basis: 100%;
        margin-top: 8cqw;
        text-align: center;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bg { animation: none; }
    a::after { transition: none; }
}
</style>
