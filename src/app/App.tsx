import { useCallback, useEffect, useState } from 'react'
import { AboutDialog } from './AboutDialog'
import { Gallery } from './Gallery'
import { WorkExperience } from './WorkExperience'
import { artworks, type Artwork } from '../works/catalog'

type Screen = 'gallery' | 'transition' | 'work'

export default function App() {
  const [screen, setScreen] = useState<Screen>('gallery')
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>(artworks[0])
  const [aboutOpen, setAboutOpen] = useState(false)

  const returnToGallery = useCallback(() => setScreen('gallery'), [])

  useEffect(() => {
    if (screen === 'gallery') return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        returnToGallery()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [returnToGallery, screen])

  function openArtwork(artwork: Artwork) {
    setSelectedArtwork(artwork)
    setScreen('transition')
  }

  return (
    <div className="app-root">
      <div hidden={screen !== 'gallery'}>
        <Gallery
          selectedId={selectedArtwork.id}
          onSelectArtwork={openArtwork}
          onOpenAbout={() => setAboutOpen(true)}
        />
      </div>

      {screen !== 'gallery' && (
        <WorkExperience
          key={selectedArtwork.id}
          artwork={selectedArtwork}
          stage={screen}
          onCancel={returnToGallery}
          onTransitionComplete={() => setScreen((current) => current === 'transition' ? 'work' : current)}
        />
      )}

      {aboutOpen && screen === 'gallery' && <AboutDialog onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
