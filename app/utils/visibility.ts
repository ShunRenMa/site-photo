export function observeVisibility(el: Element, onChange: (visible: boolean) => void) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => onChange(entry.isIntersecting))
  })
  observer.observe(el)
  return () => observer.disconnect()
}
