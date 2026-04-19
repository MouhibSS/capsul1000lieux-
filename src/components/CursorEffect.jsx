import { useEffect, useRef } from 'react'

export default function CursorEffect() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const dotPos = { x: target.x, y: target.y }
    const ringPos = { x: target.x, y: target.y }

    let raf = 0
    let hovered = false
    let pressed = false
    let dotScale = 1
    let ringScale = 1

    const apply = () => {
      // dot nearly tracks the pointer 1:1 but with a gentle lerp for sub-pixel smoothness
      dotPos.x += (target.x - dotPos.x) * 0.55
      dotPos.y += (target.y - dotPos.y) * 0.55
      // ring trails with more inertia — the signature premium feel
      ringPos.x += (target.x - ringPos.x) * 0.18
      ringPos.y += (target.y - ringPos.y) * 0.18

      const targetDot = pressed ? 0.6 : hovered ? 1.6 : 1
      const targetRing = pressed ? 0.85 : hovered ? 1.7 : 1
      dotScale += (targetDot - dotScale) * 0.22
      ringScale += (targetRing - ringScale) * 0.22

      if (dot.current) {
        dot.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dotScale})`
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale})`
      }
      raf = requestAnimationFrame(apply)
    }
    raf = requestAnimationFrame(apply)

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
    }
    const onDown = () => { pressed = true }
    const onUp = () => { pressed = false }
    const onLeaveWindow = () => {
      if (dot.current) dot.current.style.opacity = '0'
      if (ring.current) ring.current.style.opacity = '0'
    }
    const onEnterWindow = () => {
      if (dot.current) dot.current.style.opacity = ''
      if (ring.current) ring.current.style.opacity = ''
    }

    const interactiveSelector = 'a, button, input, textarea, select, [role="button"], [data-cursor]'

    const onOver = (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest(interactiveSelector)) {
        hovered = true
        dot.current?.classList.add('hovered')
        ring.current?.classList.add('hovered')
      }
    }
    const onOut = (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest(interactiveSelector)) {
        hovered = false
        dot.current?.classList.remove('hovered')
        ring.current?.classList.remove('hovered')
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseleave', onLeaveWindow)
    window.addEventListener('mouseenter', onEnterWindow)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseleave', onLeaveWindow)
      window.removeEventListener('mouseenter', onEnterWindow)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
