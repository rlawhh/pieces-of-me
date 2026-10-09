import { useState } from 'react'
import { ChristmasScene } from './ChristmasScene'

interface ChristmasExperienceProps {
  onClose: () => void
}

export function ChristmasExperience({ onClose }: ChristmasExperienceProps) {
  const [level, setLevel] = useState(0)

  function changeLevel(amount: number) {
    setLevel((current) => Math.max(0, Math.min(5, current + amount)))
  }

  return (
    <main className="christmas-experience">
      <ChristmasScene level={level} className="christmas-scene--experience" />
      <div className="christmas-overlay" aria-hidden="true" />
      <header className="christmas-header">
        <span className="christmas-brand">Pieces of Me</span>
        <div className="christmas-header-actions">
          <span className="christmas-index">04 <span>/</span> 08</span>
          <button type="button" className="christmas-close" onClick={onClose} aria-label="Close artwork and return to gallery">
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="christmas-copy" aria-labelledby="christmas-title">
        <h1 id="christmas-title">Christmas in<br />New York</h1>
        <span className="christmas-copy-rule" aria-hidden="true" />
        <p>A winter memory<br />at Rockefeller Center</p>
      </section>

      <div className="christmas-level-control" aria-label="Christmas tree lights">
        <button className="christmas-level-button" type="button" aria-label="Increase lights level"
          onClick={() => changeLevel(1)} disabled={level === 5}>
          <span className="christmas-plus" aria-hidden="true" />
        </button>
        <div className="christmas-level-readout">
          <output className="christmas-level-value" aria-live="polite" aria-label="Lights level">{level}</output>
          <span className="christmas-level-label">Lights level</span>
        </div>
        <button className="christmas-level-button" type="button" aria-label="Decrease lights level"
          onClick={() => changeLevel(-1)} disabled={level === 0}>
          <span className="christmas-minus" aria-hidden="true" />
        </button>
      </div>

      <footer className="christmas-footer">
        <span>New York, USA<br /><span>Rockefeller Center</span></span>
        <span>Use + / − to light up</span>
      </footer>
    </main>
  )
}
