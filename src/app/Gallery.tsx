import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent, WheelEvent } from 'react'
import { artworks, type Artwork } from '../works/catalog'
import { ChristmasScene } from '../works/christmas/ChristmasScene'

interface GalleryProps {
  selectedId: string
  onSelectArtwork: (artwork: Artwork) => void
  onOpenAbout: () => void
}

export function Gallery({ selectedId, onSelectArtwork, onOpenAbout }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])
  const captureTargetRef = useRef<HTMLElement | null>(null)
  const pointerRef = useRef({
    id: -1,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
  })
  const suppressClickRef = useRef(false)
  const settleTimerRef = useRef<number | undefined>(undefined)
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, artworks.findIndex((artwork) => artwork.id === selectedId)),
  )
  const [isDragging, setIsDragging] = useState(false)

  const centerCard = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card || track.clientWidth === 0) return

    const trackRect = track.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const cardCenter = cardRect.left + cardRect.width / 2
    const left = track.scrollLeft + cardCenter - trackRect.left - track.clientWidth / 2
    track.scrollTo({ left, behavior })
    setSelectedIndex(index)
  }, [])

  const findClosestIndex = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0

    const centerX = track.getBoundingClientRect().left + track.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const cardRect = card.getBoundingClientRect()
      const cardCenter = cardRect.left + cardRect.width / 2
      const distance = Math.abs(centerX - cardCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }, [])

  const settleOnClosest = useCallback(() => {
    if (!trackRef.current?.clientWidth) return
    const closestIndex = findClosestIndex()
    centerCard(closestIndex)
  }, [centerCard, findClosestIndex])

  useEffect(() => () => window.clearTimeout(settleTimerRef.current), [])

  function handleScroll() {
    if (!trackRef.current?.clientWidth) return
    const closestIndex = findClosestIndex()
    setSelectedIndex((current) => current === closestIndex ? current : closestIndex)
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX
    if (dominantDelta === 0) return

    event.preventDefault()
    const track = trackRef.current
    if (track) track.scrollLeft += dominantDelta

    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(settleOnClosest, 140)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.isPrimary === false) return
    const track = trackRef.current
    if (!track) return

    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      dragged: false,
    }
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.film-card')
    const captureTarget = target ?? track
    captureTargetRef.current = captureTarget
    captureTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return

    const delta = event.clientX - pointer.startX
    if (!pointer.dragged && Math.abs(delta) < 6) return
    pointer.dragged = true
    setIsDragging(true)
    event.preventDefault()

    const track = trackRef.current
    if (track) track.scrollLeft = pointer.startScrollLeft - delta
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return

    pointerRef.current.id = -1
    setIsDragging(false)
    const captureTarget = captureTargetRef.current
    if (captureTarget?.hasPointerCapture(event.pointerId)) {
      captureTarget.releasePointerCapture(event.pointerId)
    }
    captureTargetRef.current = null

    if (pointer.dragged) {
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 400)
      settleOnClosest()
    }
  }

  function handleArtworkClick(artwork: Artwork, index: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    centerCard(index, 'auto')
    onSelectArtwork(artwork)
  }

  function moveSelection(offset: number) {
    const nextIndex = Math.min(artworks.length - 1, Math.max(0, selectedIndex + offset))
    centerCard(nextIndex)
  }

  const selectedArtwork = artworks[selectedIndex] ?? artworks[0]
  const progress = ((selectedIndex + 1) / artworks.length) * 100

  return (
    <main className="gallery-page">
      <header className="site-header">
        <a className="site-wordmark" href="#gallery" aria-label="Pieces of Me home">
          Pieces <span>of</span> Me
        </a>
        <button className="about-trigger" type="button" onClick={onOpenAbout}>
          About <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="gallery-content" aria-label="Artwork gallery">
        <div className="selection-heading" aria-live="polite">
          <span className="selection-number">{selectedArtwork.number}</span>
          <span className="selection-divider" aria-hidden="true">/</span>
          <span className="selection-total">{String(artworks.length).padStart(2, '0')}</span>
        </div>

        <div
          ref={trackRef}
          className={`filmstrip${isDragging ? ' is-dragging' : ''}`}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          aria-label="Artwork filmstrip. Drag or use the mouse wheel to explore."
        >
          {artworks.map((artwork, index) => (
            <button
              key={artwork.id}
              ref={(element) => { cardRefs.current[index] = element }}
              className={`film-card${selectedIndex === index ? ' is-selected' : ''}`}
              type="button"
              aria-pressed={selectedIndex === index}
              aria-label={`Open ${artwork.number}, ${artwork.title}`}
              onClick={() => handleArtworkClick(artwork, index)}
            >
              <PreviewArtwork artwork={artwork} />
              <span className="film-card-caption">
                <span className="film-card-number">{artwork.number}</span>
                <span>{artwork.title}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="gallery-footer">
        <nav className="gallery-navigation" aria-label="Artwork navigation">
          <button
            className="gallery-arrow"
            type="button"
            aria-label="Previous artwork"
            disabled={selectedIndex === 0}
            onClick={() => moveSelection(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <div
            className="gallery-progress"
            role="progressbar"
            aria-label="Gallery position"
            aria-valuemin={1}
            aria-valuemax={artworks.length}
            aria-valuenow={selectedIndex + 1}
            aria-valuetext={`${selectedIndex + 1} of ${artworks.length}`}
          >
            <span className="gallery-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <button
            className="gallery-arrow"
            type="button"
            aria-label="Next artwork"
            disabled={selectedIndex === artworks.length - 1}
            onClick={() => moveSelection(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </nav>

        <div className="gallery-meta">
          <span>© 2026 Pieces of Me</span>
          <span>INTERACTIVE COLLECTION</span>
        </div>
      </footer>
    </main>
  )
}

export function PreviewArtwork({ artwork, large = false }: { artwork: Artwork; large?: boolean }) {
  return (
    <div
      className={`preview-artwork preview-artwork--${artwork.preview}${large ? ' is-large' : ''}`}
      aria-hidden="true"
    >
      {artwork.preview === 'christmas' ? (
        <>
          <ChristmasScene level={5} className="christmas-scene--preview" />
          <span className="preview-number">{artwork.number}</span>
        </>
      ) : (
        <>
          <span className="preview-label">VISUAL STUDY</span>
          <span className="preview-shape preview-shape--one" />
          <span className="preview-shape preview-shape--two" />
          <span className="preview-shape preview-shape--three" />
          <span className="preview-number">{artwork.number}</span>
        </>
      )}
    </div>
  )
}
