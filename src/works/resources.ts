import christmasNight from '../assets/christmas-night.png'
import { pixelPhotos } from './pixel-brush/photos'
import type { Artwork } from './catalog'

const decodedImages = new Map<string, HTMLImageElement>()
const RESOURCE_TIMEOUT_MS = 15000

// Cache successful decodes only; a failed or cancelled request can be retried.
export function loadArtworkImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  if (signal?.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'))
  const cached = decodedImages.get(src)
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve, reject) => {
    const image = new Image()
    let settled = false
    const cleanup = () => {
      clearTimeout(timeout)
      image.onload = image.onerror = null
      signal?.removeEventListener('abort', abort)
    }
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      image.src = ''
      reject(error)
    }
    const abort = () => fail(new DOMException('Cancelled', 'AbortError'))
    const timeout = window.setTimeout(() => fail(new Error('Image preparation timed out')), RESOURCE_TIMEOUT_MS)
    signal?.addEventListener('abort', abort, { once: true })
    image.onerror = () => fail(new Error('Unable to load artwork image'))
    image.onload = async () => {
      try {
        await image.decode()
        if (settled) return
        settled = true
        cleanup()
        decodedImages.set(src, image)
        resolve(image)
      } catch { fail(new Error('Unable to decode artwork image')) }
    }
    image.src = src
  })
}

export async function prepareArtwork(artwork: Artwork, signal: AbortSignal) {
  // Canvas-only Dive and Breeze have no external image resources.
  const sources = artwork.preview === 'pixel' ? pixelPhotos.map((photo) => photo.src)
    : artwork.preview === 'christmas' ? [christmasNight] : []
  await Promise.all(sources.map((src) => loadArtworkImage(src, signal)))
}
