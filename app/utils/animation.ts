export function animationsDone(el: Element, options?: GetAnimationsOptions) {
  return Promise.allSettled(el.getAnimations(options).map((a) => a.finished))
}
