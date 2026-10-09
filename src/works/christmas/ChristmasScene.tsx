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
const starTips = [[-5, -22], [8, -13], [16, -8], [20, -2], [16, 6], [8, 17],
  [0, 24], [-7, 15], [-15, 8], [-18, 5], [-12, -2], [-18, -10]]

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
          <stop stopColor={lighting.style === 'gold' ? '#ffd88b' : '#fff4dd'} stopOpacity=".6" />
          <stop offset=".3" stopColor="#fff6df" stopOpacity=".16" />
          <stop offset="1" stopColor="#f7e8c7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-star-crystal`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="25">
          <stop stopColor="#fff9e9" stopOpacity=".88" />
          <stop offset=".45" stopColor="#ecdfc0" stopOpacity=".6" />
          <stop offset="1" stopColor="#e3d4af" stopOpacity=".1" />
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
        <circle className="tree-star-halo" r="30" fill={`url(#${id}-star-bloom)`} />
        <g className="tree-star-rays" transform="scale(.82)" stroke={`url(#${id}-star-crystal)`} strokeLinecap="round">
          {lighting.style === 'rockefeller' && <>
            <circle r="10" fill={`url(#${id}-star-bloom)`} stroke="none" />
            {starTips.map(([x, y], index) => {
              const length = Math.hypot(x, y)
              const width = index % 2 ? .85 : 1.2
              const dx = -y / length * width
              const dy = x / length * width
              return <polygon key={index} points={`${dx},${dy} ${x},${y} ${-dx},${-dy}`} fill={`url(#${id}-star-crystal)`} stroke="none" opacity=".65" />
            })}
          </>}
          {starTips.map(([x, y], index) => <path key={index} d={`M0 0L${x} ${y}`} strokeWidth={index % 2 ? .8 : 1.15} />)}
          <circle r="2.5" fill="#fff3dc" opacity=".9" stroke="none" />
        </g>
      </g>
      </g>
    </svg>
  )
}
