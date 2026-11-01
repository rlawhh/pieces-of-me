import { useEffect, useRef } from 'react'
import { createFloatingLeaves, createLandscape, drawBreeze, moveFloatingLeaves, sceneHeight, sceneWidth, type BreezeMotion } from './breezeScene'
import './childhood-breeze.css'

interface Spring { value: number; velocity: number }
function spring(state: Spring, target: number, stiffness: number, damping: number, dt: number) {
  state.velocity += ((target - state.value) * stiffness - state.velocity * damping) * dt
  state.value += state.velocity * dt
  return state.value
}

export function ChildhoodBreezeExperience() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current, context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const background = createLandscape(), floating = createFloatingLeaves()
    const channels = { branch: { value: 0, velocity: 0 }, leaf: { value: 0, velocity: 0 },
      grass: { value: 0, velocity: 0 }, fabric: { value: 0, velocity: 0 }, vertical: { value: 0, velocity: 0 },
      branchY: { value: 0, velocity: 0 }, grassY: { value: 0, velocity: 0 }, fabricY: { value: 0, velocity: 0 } }
    let targetX = 0, targetY = 0, last = 0, frame = 0, renderTime = 0
    let previous: { x: number; y: number; time: number } | null = null
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize()
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      const now = performance.now()
      if (previous && now - previous.time < 250) {
        const elapsed = Math.max(8, now - previous.time) / 1000
        const vx = (event.clientX - previous.x) / elapsed, vy = (event.clientY - previous.y) / elapsed
        const speed = Math.hypot(vx, vy)
        // Direction survives the strength clamp; no positional jump on re-entry.
        // Ordinary mouse movement should read as a breeze at the displayed canvas size.
        const strength = Math.min(1.7, Math.pow(speed / 500, .8))
        if (speed > 0) { targetX = vx / speed * strength; targetY = vy / speed * strength }
      }
      previous = { x: event.clientX, y: event.clientY, time: now }
    }
    const leave = (event: PointerEvent) => { if (event.relatedTarget === null) previous = null }
    const reset = () => { previous = null; targetX = targetY = 0; last = 0 }
    // The whole artwork viewport is an input surface, including the surrounding margins.
    // These listeners only exist while this artwork is mounted.
    window.addEventListener('pointermove', move); window.addEventListener('pointerout', leave)
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset)
    function animate(now: number) {
      const dt = Math.min(.033, last ? (now - last) / 1000 : .016); last = now
      targetX *= Math.exp(-dt * .95); targetY *= Math.exp(-dt * .95)
      const motion: BreezeMotion = {
        branch: spring(channels.branch, targetX, 12, 4.8, dt),
        leaf: spring(channels.leaf, targetX, 42, 10, dt),
        grass: spring(channels.grass, targetX, 23, 7, dt),
        fabric: spring(channels.fabric, targetX * .42, 12, 6, dt),
        vertical: spring(channels.vertical, targetY, 42, 10, dt),
        branchY: spring(channels.branchY, targetY, 12, 4.8, dt),
        grassY: spring(channels.grassY, targetY, 23, 7, dt),
        fabricY: spring(channels.fabricY, targetY * .42, 12, 6, dt),
      }
      moveFloatingLeaves(floating, motion, dt)
      if (now - renderTime >= 1000 / 30) {
        context!.setTransform(canvas!.width / sceneWidth, 0, 0, canvas!.height / sceneHeight, 0, 0)
        drawBreeze(context!, background, motion, now / 1000, floating)
        canvas!.dataset.windX = motion.leaf.toFixed(3); canvas!.dataset.windY = motion.vertical.toFixed(3)
        canvas!.dataset.branch = motion.branch.toFixed(3); canvas!.dataset.grass = motion.grass.toFixed(3)
        canvas!.dataset.fabric = motion.fabric.toFixed(3)
        canvas!.dataset.branchY = motion.branchY.toFixed(3); canvas!.dataset.grassY = motion.grassY.toFixed(3)
        canvas!.dataset.fabricY = motion.fabricY.toFixed(3)
        renderTime = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame); observer.disconnect()
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset)
    }
  }, [])
  return <div className="breeze-experience"><canvas ref={ref}
    aria-label="Childhood Breeze. Move the mouse to create wind through the tree and hillside." /></div>
}

export function ChildhoodBreezePreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const context = ref.current?.getContext('2d')
    if (context) drawBreeze(context, createLandscape(), { branch: 0, leaf: 0, grass: 0, fabric: 0, vertical: 0,
      branchY: 0, grassY: 0, fabricY: 0 }, 0, createFloatingLeaves())
  }, [])
  return <canvas className="breeze-preview" ref={ref} width={sceneWidth} height={sceneHeight} aria-hidden="true" />
}
