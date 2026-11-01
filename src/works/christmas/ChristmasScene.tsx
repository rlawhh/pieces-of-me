import { useId, type CSSProperties } from 'react'
import christmasNight from '../../assets/christmas-night.png'
import './christmas.css'
import { treeLightPositions } from './treeLightPositions'

interface ChristmasSceneProps {
  level: number
  className?: string
}

function random(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

// Set style to 'gold' to restore the previous lighting palette for comparison.
const lighting = { style: 'rockefeller' as 'gold' | 'rockefeller' }
const palettes = {
  gold: [
    { name: 'warm', core: '#fff5da', color: '#ffe0a0', glow: '#eda84d' },
    { name: 'amber', core: '#ffe1a1', color: '#ffe0a0', glow: '#eda84d' },
  ],
  rockefeller: [
    { name: 'white', core: '#fff8eb', color: '#f5e4c9', glow: '#d8b77e' },
    { name: 'blue', core: '#edf2fb', color: '#a1b5dc', glow: '#647faa' },
    { name: 'red', core: '#fae9e0', color: '#e09a92', glow: '#ad625b' },
    { name: 'green', core: '#f0f7e9', color: '#a6c5a0', glow: '#6b956c' },
    { name: 'amber', core: '#fff4d5', color: '#ffd48c', glow: '#c89543' },
    { name: 'violet', core: '#f5edf8', color: '#c5b3d3', glow: '#927ba5' },
  ],
}
const palette = palettes[lighting.style]
const colorWeights = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5]

// Centers are sampled from the actual foliage, including branch gaps and tips.
// The photograph and lights share one coordinate system during resizing.
const bulbs = treeLightPositions.map(([x, y], index) => ({
  x,
  y,
  threshold: 1 + index % 5,
  radius: .65 + random(index + 20000) ** 2 * 1.05,
  brightness: .48 + random(index + 23000) ** .8 * .52,
  tone: lighting.style === 'gold'
    ? palette[random(index + 26000) > .7 ? 1 : 0]
    : palette[colorWeights[Math.floor(random(index + 26000) * colorWeights.length)]],
  delay: index % 8 * 24,
}))

// Center of the unlit topper in the photograph, mapped to the SVG viewBox.
const star = { x: 805.5, y: 103.5 }
// A compact crystal topper: long structural points and shorter facets between them.
const starFacets = Array.from({ length: 18 }, (_, index) => {
  const angle = -Math.PI / 2 + index * Math.PI / 9
  const radius = index % 3 === 0 ? 27 : index % 3 === 1 ? 17 : 12
  const dx = Math.cos(angle), dy = Math.sin(angle)
  const base = 4.2, halfWidth = index % 3 === 0 ? 2.6 : 1.65
  return { tip: `${dx * radius},${dy * radius}`,
    left: `${dx * base - dy * halfWidth},${dy * base + dx * halfWidth}`,
    right: `${dx * base + dy * halfWidth},${dy * base - dx * halfWidth}`,
    ridgeX: dx * radius * .89, ridgeY: dy * radius * .89,
    opacity: index % 3 === 0 ? 1 : .84 }
})

export function ChristmasScene({ level, className = '' }: ChristmasSceneProps) {
  const id = useId().replace(/:/g, '')
  const isExperience = className.includes('christmas-scene--experience')
  return (
    <svg className={`christmas-scene ${className}`.trim()} viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice" role="img"
      aria-label={`Rockefeller Center Christmas tree, lights level ${level} of 5`}>
      <defs>
        {palette.map((tone) => (
          <g key={tone.name}>
            <radialGradient id={`${id}-bulb-${tone.name}`}>
              <stop stopColor={tone.core} />
              <stop offset=".4" stopColor={tone.color} stopOpacity=".88" />
              <stop offset=".72" stopColor={tone.glow} stopOpacity=".3" />
              <stop offset="1" stopColor={tone.glow} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-halo-${tone.name}`}>
              <stop stopColor={tone.color} stopOpacity=".6" />
              <stop offset="1" stopColor={tone.glow} stopOpacity="0" />
            </radialGradient>
          </g>
        ))}
        <radialGradient id={`${id}-star-bloom`}>
          <stop stopColor="#fff7df" stopOpacity=".54" />
          <stop offset=".25" stopColor="#ffe9b9" stopOpacity=".22" />
          <stop offset=".65" stopColor="#e9cf96" stopOpacity=".05" />
          <stop offset="1" stopColor="#e9cf96" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-star-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset=".5" stopColor="#fff7df" />
          <stop offset="1" stopColor="#d9c79f" />
        </linearGradient>
        <linearGradient id={`${id}-star-shade`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#e5d9be" />
          <stop offset=".55" stopColor="#bdaa82" />
          <stop offset="1" stopColor="#f5e9cb" />
        </linearGradient>
        <radialGradient id={`${id}-star-core`} cx=".35" cy=".3" r=".8">
          <stop stopColor="#fffef6" />
          <stop offset=".48" stopColor="#fff3d4" />
          <stop offset="1" stopColor="#cab68c" />
        </radialGradient>
        <image id={`${id}-photo`} href={christmasNight} width="1600" height="1000" preserveAspectRatio="xMidYMid slice" />
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#ffd88b" stopOpacity=".7" />
          <stop offset="1" stopColor="#ffd88b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* A slight vertical compression gives the star headroom. Photo and lights
          move together; reflected edge strips keep the hero full bleed. */}
      <g transform={isExperience ? 'translate(12 49) scale(1 .925)' : undefined}>
      {isExperience && <>
        <use href={`#${id}-photo`} transform="scale(1 -1)" />
        <use href={`#${id}-photo`} transform="translate(0 2000) scale(1 -1)" />
        <use href={`#${id}-photo`} transform="scale(-1 1)" />
      </>}
      <use href={`#${id}-photo`} />
      <ellipse className={`christmas-reflection${level > 0 ? ' is-lit' : ''}`} cx="794" cy="926" rx="190" ry="57" fill={`url(#${id}-glow)`} />
      {bulbs.map((bulb, index) => (
        <g key={index} className={`tree-light${level >= bulb.threshold ? ' is-lit' : ''}`} style={{ transitionDelay: `${bulb.delay}ms`, '--bulb-opacity': bulb.brightness, '--halo-opacity': bulb.brightness * .38 } as CSSProperties}>
          <circle className="tree-bulb-halo" cx={bulb.x} cy={bulb.y} r={bulb.radius * 5.5} fill={`url(#${id}-halo-${bulb.tone.name})`} />
          <circle className="tree-bulb" cx={bulb.x} cy={bulb.y} r={bulb.radius * 2.3} fill={`url(#${id}-bulb-${bulb.tone.name})`} />
        </g>
      ))}
      <g className={`tree-star${level === 5 ? ' is-lit' : ''}`} transform={`translate(${star.x} ${star.y})`}>
        <circle className="tree-star-halo" r="35" fill={`url(#${id}-star-bloom)`} />
        <g className="tree-star-rays" strokeLinejoin="round">
          {starFacets.map((facet, index) => (
            <g key={index} opacity={facet.opacity}>
              <polygon points={`0,0 ${facet.left} ${facet.tip}`} fill={`url(#${id}-star-light)`} />
              <polygon points={`0,0 ${facet.tip} ${facet.right}`} fill={`url(#${id}-star-shade)`} />
              <path d={`M0 0L${facet.ridgeX} ${facet.ridgeY}`} fill="none" stroke="#fffdf0" strokeWidth=".32" opacity=".65" />
            </g>
          ))}
          <path d="M0 -6.2L5.4 -3.1L5.4 3.1L0 6.2L-5.4 3.1L-5.4 -3.1Z"
            fill={`url(#${id}-star-core)`} stroke="#fff7df" strokeWidth=".35" />
          <path d="M-5.4 -3.1L0 0L0 6.2M0 0L5.4 -3.1M0 0L0 -6.2"
            fill="none" stroke="#a18b634d" strokeWidth=".4" />
          <circle r="1.8" cx="-.7" cy="-.8" fill="#fffdf1" opacity=".85" />
        </g>
      </g>
      </g>
    </svg>
  )
}
