import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function animatePageIn(root) {
  const elements = Array.from(root?.querySelectorAll('[data-gsap-in]') || [])

  if (!elements.length) return

  elements.forEach((element) => {
    const delay = 0
    const y = Number(element.dataset.gsapY || 120)
    const x = Number(element.dataset.gsapX || 0)
    const rotate = Number(element.dataset.gsapRotate || -6)
    const scale = Number(element.dataset.gsapScale || 0.92)
    const skew = Number(element.dataset.gsapSkew || 0)
    const duration = Number(element.dataset.gsapDuration || 1.2)
    const ease = element.dataset.gsapEase || 'power4.out'
    const start = element.dataset.gsapStart || 'top 80%'

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y,
        x,
        rotate,
        scale,
        skew,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        skew: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
          toggleActions: 'play none none reverse',
        },
      }
    )
  })
}

export function animateOnScroll(root) {
  const elements = Array.from(root?.querySelectorAll('[data-gsap-scroll]') || [])

  if (!elements.length) return

  elements.forEach((element) => {
    const y = Number(element.dataset.gsapY || 90)
    const x = Number(element.dataset.gsapX || 0)
    const rotate = Number(element.dataset.gsapRotate || -3)
    const scale = Number(element.dataset.gsapScale || 0.96)
    const skew = Number(element.dataset.gsapSkew || 0)
    const duration = Number(element.dataset.gsapDuration || 1.05)
    const ease = element.dataset.gsapEase || 'power4.out'
    const start = element.dataset.gsapStart || 'top 80%'

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y,
        x,
        rotate,
        scale,
        skew,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        skew: 0,
        duration,
        ease,
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
          toggleActions: 'play none none reverse',
        },
      }
    )
  })
}
