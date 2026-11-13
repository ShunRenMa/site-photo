export function useScrollLock() {
  const { $lenis } = useNuxtApp()
  return (locked: boolean) => {
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    if (locked) $lenis?.stop()
    else $lenis?.start()
  }
}
