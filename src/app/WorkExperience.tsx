import { useEffect } from 'react'
import { PreviewArtwork } from './Gallery'
import { artworks, type Artwork } from '../works/catalog'
import { ChristmasExperience } from '../works/christmas/ChristmasExperience'

// Temporary design-review delay; replace with resource readiness in checkpoint 13.
const TRANSITION_PREVIEW_MIN_DURATION_MS = 2000

interface WorkExperienceProps {
  artwork: Artwork
  stage: 'transition' | 'work'
  onCancel: () => void
  onTransitionComplete: () => void
}

export function WorkExperience({
  artwork,
  stage,
  onCancel,
  onTransitionComplete,
}: WorkExperienceProps) {
  useEffect(() => {
    if (stage !== 'transition') return

    const timeout = window.setTimeout(onTransitionComplete, TRANSITION_PREVIEW_MIN_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [onTransitionComplete, stage])

  if (stage === 'transition') {
    return (
      <main className={`transition-screen transition-screen--${artwork.preview}`}>
        <header className="transition-header">
          <div className="transition-brand">Pieces of Me</div>
          <div className="transition-index" aria-label={`Work ${artwork.number} of ${artworks.length}`}>
            <span>{artwork.number}</span>
            <span className="transition-index-divider">/</span>
            <span>{String(artworks.length).padStart(2, '0')}</span>
          </div>
        </header>

        <section className="transition-layout">
          <aside className="transition-piece-number" aria-label={`Interactive piece ${artwork.number}`}>
            <p>INTERACTIVE<br />PIECE</p>
            <span aria-hidden="true" />
            <strong>{artwork.number}</strong>
          </aside>

          <div className="transition-artwork">
            <PreviewArtwork artwork={artwork} />
            <div className="transition-copy">
              <h1>{artwork.title}</h1>
            </div>
          </div>

          <aside className="transition-actions" aria-label="Transition controls">
            <div className="loading-gauge">
              <span className="loading-gauge-arc" aria-hidden="true" />
              <button className="loading-cancel" type="button" onClick={onCancel} aria-label="Cancel and return to gallery">
                ×
              </button>
            </div>
            <span className="loading-label" role="status">LOADING</span>
          </aside>
        </section>
      </main>
    )
  }

  if (artwork.preview === 'christmas') {
    return <ChristmasExperience onClose={onCancel} />
  }

  return (
    <main className={`work-screen work-screen--${artwork.preview}`}>
      <header className="work-header">
        <span className="work-brand">Pieces <span>of</span> Me</span>
        <span className="work-number">{artwork.number}</span>
        <button className="round-control work-close" type="button" onClick={onCancel} aria-label="Close artwork and return to gallery">
          ×
        </button>
      </header>

      <section
        className={`work-placeholder${artwork.preview === 'christmas' ? ' work-placeholder--christmas' : ''}`}
        aria-label={artwork.preview === 'christmas' ? artwork.title : `${artwork.title} placeholder`}
      >
        {artwork.preview === 'christmas' ? (
          <ChristmasExperience onClose={onCancel} />
        ) : (
          <>
            <PreviewArtwork artwork={artwork} large />
            <span className="placeholder-label">WORK IN PROGRESS</span>
          </>
        )}
      </section>

      <footer className="work-footer">
        <h1>{artwork.title}</h1>
        <p>{artwork.hint}</p>
      </footer>
    </main>
  )
}
