import gsap from 'gsap'

export function zoomIn(
    tl: gsap.core.Timeline,
    targets: gsap.TweenTarget,
    duration: number,
    position: gsap.Position = '<',
    scale = 1.05,
) {
    return tl.fromTo(targets, { scale: 1 }, { scale, duration, ease: 'none' }, position)
}
