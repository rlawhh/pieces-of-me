import { useEffect, useRef } from 'react'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="about-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title">
        <button ref={closeButtonRef} className="round-control about-close" type="button" onClick={onClose} aria-label="Close About">
          ×
        </button>
        <span className="about-kicker">A PERSONAL INTERACTIVE COLLECTION</span>
        <h2 id="about-title">Pieces of Me</h2>
        <p>
          Small interactive scenes shaped by personal memories, experiences, and things I love.
        </p>
        <a href="https://github.com/rlawhh/pieces-of-me" target="_blank" rel="noreferrer">
          View on GitHub <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  )
}
