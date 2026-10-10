export interface Artwork {
  id: string
  number: string
  title: string
  hint: string
  preview: string
}

export const artworks = [
  {
    id: 'a-day-in-new-york',
    number: '01',
    title: 'A Day in New York',
    hint: 'SCROLL TO CHANGE TIME',
    preview: 'new-york',
  },
  {
    id: 'pixel-brush',
    number: '02',
    title: 'Pixel Brush',
    hint: 'CLICK + DRAG TO PIXELATE',
    preview: 'pixel',
  },
  {
    id: 'theatre-of-dreams',
    number: '03',
    title: 'The Theatre of Dreams',
    hint: 'DRAG TO LOOK AROUND',
    preview: 'theatre',
  },
  {
    id: 'christmas-in-new-york',
    number: '04',
    title: 'Christmas in New York',
    hint: 'USE + / − TO LIGHT UP',
    preview: 'christmas',
  },
  {
    id: 'through-the-rain',
    number: '05',
    title: 'Through the Rain',
    hint: 'DRAG THE WIPER',
    preview: 'rain',
  },
  {
    id: 'dive',
    number: '06',
    title: 'Dive',
    hint: 'DRAG DOWN TO SPLASH',
    preview: 'splash',
  },
  {
    id: 'folding-city',
    number: '07',
    title: 'Folding City',
    hint: 'DRAG UP TO FOLD',
    preview: 'folding-city',
  },
  {
    id: 'childhood-breeze',
    number: '08',
    title: 'Childhood Breeze',
    hint: 'MOVE TO CREATE WIND',
    preview: 'breeze',
  },
] as const satisfies readonly Artwork[]
