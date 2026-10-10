import { useEffect, useRef, type PointerEvent } from 'react'
import { drawSplash, splashLifetime, reboundDelay, type SplashEvent, type SplashPressure } from './splashScene'
import './splash.css'

export function SplashExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clock = useRef(0)
  const events = useRef<SplashEvent[]>([])
  const pressure = useRef<SplashPressure | undefined>(undefined)
  const lastBurst = useRef(-10)
  const count = useRef(0)
  const pointer = useRef<{ id: number; startX: number; startY: number; lastY: number; lastTime: number; speed: number; triggered: boolean; event?: SplashEvent } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current, context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let frame = 0, lastRender = 0
    const startTime = performance.now() - clock.current * 1000
    const resize = () => {
      const pixels = Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2))
      if (pixels < 1) return
      if (canvas.width === pixels && canvas.height === pixels) return
      canvas.width = canvas.height = pixels
      context.setTransform(pixels / 1000, 0, 0, pixels / 1000, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement!)
    window.addEventListener('resize', resize)
    function animate(now: number) {
      clock.current = (now - startTime) / 1000
      events.current = events.current.filter((event) => clock.current - event.start < splashLifetime(event.strength))
      const latest = events.current.at(-1)
      const age = latest ? clock.current - latest.start : 10
      const rebound = latest ? reboundDelay(latest.strength) : 0
      const phase = !latest ? 'idle' : age < .06 ? 'impact' : age < rebound ? 'cavity' : age < rebound + .5 ? 'rising' : age < rebound + 2 ? 'falling' : 'settling'
      if (canvas!.dataset.phase !== phase) canvas!.dataset.phase = phase
      if (now - lastRender > 1000 / 30) {
        const renderStart = performance.now()
        drawSplash(context!, clock.current, events.current, pressure.current)
        canvas!.dataset.renderMs = (performance.now() - renderStart).toFixed(1)
        lastRender = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', resize); pointer.current = null }
  }, [])

  function position(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) / rect.width * 1000, y: (event.clientY - rect.top) / rect.height * 1000 }
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || !event.isPrimary) return
    const p = position(event)
    if (Math.hypot(p.x - 500, p.y - 500) > 400) return
    event.preventDefault()
    pointer.current = { id: event.pointerId, startX: p.x, startY: p.y, lastY: p.y, lastTime: performance.now(), speed: 0, triggered: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    const state = pointer.current
    if (!state || state.id !== event.pointerId) return
    event.preventDefault()
    const p = position(event), now = performance.now()
    const elapsed = Math.max(.008, (now - state.lastTime) / 1000)
    state.speed = state.speed * .55 + Math.max(0, (p.y - state.lastY) / elapsed) * .45
    state.lastY = p.y; state.lastTime = now
    const distance = Math.max(0, p.y - state.startY)
    const strength = Math.min(1.8, .55 + Math.min(1, distance / 220) * .4 + Math.min(1, state.speed / 450) * .85)
    if (!state.triggered) pressure.current = { x: state.startX, y: state.startY, amount: Math.min(1, distance / 68) }
    if (!state.triggered && distance >= 68) {
      state.triggered = true; pressure.current = undefined
      // A short cooldown bounds repeated impulses; already travelling ripples remain visible.
      if (clock.current - lastBurst.current < .42) return
      const burst = { x: state.startX, y: state.startY, start: clock.current, strength, seed: ++count.current }
      events.current = [...events.current.slice(-2), burst]
      state.event = burst; lastBurst.current = clock.current
      event.currentTarget.dataset.splashCount = String(count.current)
      event.currentTarget.dataset.strength = strength.toFixed(3)
    } else if (state.event && clock.current - state.event.start < .3) {
      // Freeze before the first rim spray so detached droplets keep stable trajectories.
      state.event.strength = Math.max(state.event.strength, strength)
      event.currentTarget.dataset.strength = state.event.strength.toFixed(3)
    }
  }
  function stop(event: PointerEvent<HTMLCanvasElement>) {
    if (pointer.current?.id !== event.pointerId) return
    pointer.current = null; pressure.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return <div className="splash-experience">
    <canvas ref={canvasRef} width="1000" height="1000" data-splash-count="0" data-phase="idle" aria-label="Dive water surface. Drag down to splash."
      onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop}
      onLostPointerCapture={() => { pointer.current = null; pressure.current = undefined }} />
  </div>
}

export function SplashPreview() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const context = ref.current?.getContext('2d')
    if (!context) return
    drawSplash(context, 1, [{ x: 500, y: 580, start: .7, strength: 1.15, seed: 3 }])
  }, [])
  return <canvas className="splash-preview" ref={ref} width="1000" height="1000" aria-hidden="true" />
}
