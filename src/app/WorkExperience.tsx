import { useEffect, useState } from 'react'
import { PreviewArtwork } from './Gallery'
import { artworks, type Artwork } from '../works/catalog'
import { ChristmasExperience } from '../works/christmas/ChristmasExperience'
import { PixelBrushExperience } from '../works/pixel-brush/PixelBrushExperience'
import { SplashExperience } from '../works/splash/SplashExperience'
import { ChildhoodBreezeExperience } from '../works/childhood-breeze/ChildhoodBreezeExperience'

import { prepareArtwork } from '../works/resources'

// Keep the transition design visible while still waiting for actual resources.
const MIN_TRANSITION_DURATION_MS = 2000

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
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (stage !== 'transition') return
    const controller = new AbortController()
    let active = true
    let frame = 0
    let minimumTimer = 0
    const minimumDuration = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, MIN_TRANSITION_DURATION_MS)
    })
    setLoadFailed(false)
    Promise.all([prepareArtwork(artwork, controller.signal), minimumDuration]).then(() => {
      if (active) frame = requestAnimationFrame(() => { if (active) onTransitionComplete() })
    }).catch(() => {
      if (!active) return
      window.clearTimeout(minimumTimer)
      controller.abort()
      setLoadFailed(true)
    })
    return () => { active = false; window.clearTimeout(minimumTimer); controller.abort(); cancelAnimationFrame(frame) }
  }, [artwork, attempt, onTransitionComplete, stage])

  if (stage === 'transition') {
    return (
      <main className={`transition-screen transition-screen--${artwork.preview}${loadFailed ? ' has-loading-error' : ''}`}>
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
            <span className="loading-label" role="status">{loadFailed ? 'UNABLE TO LOAD' : 'LOADING'}</span>
            {loadFailed && <button className="loading-retry" type="button" onClick={() => setAttempt((value) => value + 1)}>Retry</button>}
          </aside>
        </section>
      </main>
    )
  }

  if (artwork.preview === 'christmas') {
    return <ChristmasExperience onClose={onCancel} number={artwork.number} total={artworks.length} />
  }

  return (
    <main className={`work-screen work-screen--${artwork.preview}`}>
      <header className="work-header">
        <span className="work-brand">Pieces <span>of</span> Me</span>
        <span className="work-number">{artwork.number} / {String(artworks.length).padStart(2, '0')}</span>
        <button className="round-control work-close" type="button" onClick={onCancel} aria-label="Close artwork and return to gallery">
          ×
        </button>
      </header>

      <section
        className={`work-placeholder${artwork.preview === 'christmas' ? ' work-placeholder--christmas' : ''}`}
        aria-label={['christmas', 'pixel', 'splash', 'breeze'].includes(artwork.preview) ? artwork.title : `${artwork.title} placeholder`}
      >
        {artwork.preview === 'breeze' ? (
          <ChildhoodBreezeExperience />
        ) : artwork.preview === 'splash' ? (
          <SplashExperience />
        ) : artwork.preview === 'pixel' ? (
          <PixelBrushExperience />
        ) : artwork.preview === 'christmas' ? (
          <ChristmasExperience onClose={onCancel} number={artwork.number} total={artworks.length} />
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
