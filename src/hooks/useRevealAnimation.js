import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const VARIANTS = {
  fade: {
    from: { opacity: 0, y: 40, scale: 0.94 },
    to: { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: 'power2.out' },
  },
  'slide-left': {
    from: { opacity: 0, x: -80, rotate: -3 },
    to: { opacity: 1, x: 0, rotate: 0, duration: 1.7, ease: 'power2.out' },
  },
  'slide-right': {
    from: { opacity: 0, x: 80, rotate: 3 },
    to: { opacity: 1, x: 0, rotate: 0, duration: 1.7, ease: 'power2.out' },
  },
  'slide-up': {
    from: { opacity: 0, y: 100 },
    to: { opacity: 1, y: 0, duration: 1.7, ease: 'power2.out' },
  },
  'zoom-flip': {
    from: { opacity: 0, scale: 0.7, rotateX: 40, transformPerspective: 600 },
    to: { opacity: 1, scale: 1, rotateX: 0, duration: 1.8, ease: 'power1.out' },
  },
  'drop-in': {
    from: { opacity: 0, y: -100, scale: 1.1 },
    to: { opacity: 1, y: 0, scale: 1, duration: 1.7, ease: 'power1.out' },
  },
  blur: {
    from: { opacity: 0, filter: 'blur(12px)', scale: 1.05 },
    to: { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.8, ease: 'power1.out' },
  },
  'flip-3d': {
    from: { opacity: 0, rotateY: 90, transformPerspective: 800 },
    to: { opacity: 1, rotateY: 0, duration: 1.3, ease: 'power1.out' },
  },
  spin: {
    from: { opacity: 0, rotate: -15, scale: 0.85 },
    to: { opacity: 1, rotate: 0, scale: 1, duration: 1.6, ease: 'power1.out' },
  },
  elastic: {
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1, duration: 1.9, ease: 'elastic.out(1, 0.9)' },
  },
}

export function useRevealAnimation(ready) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!ready || !rootRef.current) return

    const groups = Array.from(rootRef.current.querySelectorAll('[data-gsap-in]'))
    if (!groups.length) return

    groups.forEach((group) => {
      const variantName = group.dataset.gsapIn || 'fade'
      const variant = VARIANTS[variantName] || VARIANTS.fade
      const targets = group.children.length ? group.children : [group]
      gsap.set(targets, variant.from)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const group = entry.target
          const variantName = group.dataset.gsapIn || 'fade'
          const variant = VARIANTS[variantName] || VARIANTS.fade
          const targets = group.children.length ? group.children : [group]
          const extraDelay = Number(group.dataset.gsapDelay || 0)
          gsap.to(targets, {
            ...variant.to,
            delay: extraDelay,
            stagger: Math.min(0.06, 1.5 / targets.length),
          })
          observer.unobserve(group)
        })
      },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    )

    groups.forEach((group) => observer.observe(group))

    return () => observer.disconnect()
  }, [ready])

  return rootRef
}