import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { pixelPhotos } from './photos'
import { BRUSH_RADIUS, IMAGE_WIDTH, IMAGE_HEIGHT, createPixelBrush } from './pixelBrush'
import './pixel-brush.css'

export function PixelBrushExperience() {
  const [selected, setSelected] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const engineRef = useRef<ReturnType<typeof createPixelBrush> | null>(null)
  const pointerRef = useRef<{ id: number; x: number; y: number } | null>(null)
  const photo = pixelPhotos[selected]

  useEffect(() => {
    let active = true
    engineRef.current = null
    pointerRef.current = null
    const image = new Image()
    image.onload = () => {
      if (!active || !canvasRef.current) return
      try {
        engineRef.current = createPixelBrush(canvasRef.current, image)
        setStatus('ready')
      } catch { setStatus('error') }
    }
    image.onerror = () => { if (active) setStatus('error') }
    image.src = photo.src
    return () => { active = false; image.onload = null; image.onerror = null }
  }, [photo.src, retry])

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) * IMAGE_WIDTH / rect.width
    const y = (event.clientY - rect.top) * IMAGE_HEIGHT / rect.height
    const cursor = cursorRef.current
    if (cursor) {
      cursor.style.left = `${event.clientX - rect.left}px`
      cursor.style.top = `${event.clientY - rect.top}px`
      cursor.style.width = `${BRUSH_RADIUS * 2 * rect.width / IMAGE_WIDTH}px`
      cursor.style.height = `${BRUSH_RADIUS * 2 * rect.height / IMAGE_HEIGHT}px`
      cursor.style.opacity = x >= 0 && x <= IMAGE_WIDTH && y >= 0 && y <= IMAGE_HEIGHT ? '1' : '0'
    }
    return { x, y }
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || !event.isPrimary || !engineRef.current) return
    event.preventDefault()
    const current = point(event)
    pointerRef.current = { id: event.pointerId, ...current }
    event.currentTarget.setPointerCapture(event.pointerId)
    engineRef.current.stroke(current, current)
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    const current = point(event)
    const previous = pointerRef.current
    if (!previous || previous.id !== event.pointerId) return
    event.preventDefault()
    engineRef.current?.stroke(previous, current)
    pointerRef.current = { id: event.pointerId, ...current }
  }

  function stop(event: PointerEvent<HTMLCanvasElement>) {
    if (pointerRef.current?.id !== event.pointerId) return
    pointerRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function select(index: number) {
    if (index === selected) return
    setStatus('loading')
    setSelected(index)
    if (cursorRef.current) cursorRef.current.style.opacity = '0'
  }

  return (
    <div className="pixel-experience">
      <div className="pixel-stage">
        <canvas ref={canvasRef} aria-label={`${photo.label}. Click and drag to pixelate.`}
          onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop}
          onLostPointerCapture={() => { pointerRef.current = null }}
          onPointerLeave={() => { if (cursorRef.current) cursorRef.current.style.opacity = '0' }} />
        <span ref={cursorRef} className="pixel-cursor" aria-hidden="true" />
        {status !== 'ready' && <div className="pixel-status" role="status">
          {status === 'loading' ? 'Preparing image' : <><span>Unable to load image</span><button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1) }}>Retry</button></>}
        </div>}
      </div>
      <div className="pixel-toolbar">
        <div className="pixel-thumbnails" aria-label="Choose a photograph">
          {pixelPhotos.map((item, index) => <button key={item.id} type="button" className={`pixel-thumbnail${index === selected ? ' is-selected' : ''}`}
            aria-label={`Select ${item.label}`} aria-pressed={index === selected} onClick={() => select(index)}>
            <img src={item.src} alt={item.label} draggable={false} />
          </button>)}
        </div>
        <button className="pixel-reset" type="button" disabled={status !== 'ready'} onClick={() => engineRef.current?.reset()}><span aria-hidden="true">↺</span> Reset</button>
      </div>
    </div>
  )
}
