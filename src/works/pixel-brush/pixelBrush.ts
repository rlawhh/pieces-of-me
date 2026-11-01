const MAX_WIDTH = 1500
const MAX_HEIGHT = 900
export const BRUSH_RADIUS = 48
const BLOCK_SIZE = 25

function layer(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable.')
  return { canvas, context }
}

export function createPixelBrush(display: HTMLCanvasElement, image: HTMLImageElement) {
  // Fit the full photograph; portrait and square images must not be centre-cropped.
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const original = layer(width, height)
  const pixelated = layer(width, height)
  const mask = layer(width, height)
  const painted = layer(width, height)
  display.width = width
  display.height = height
  const context = display.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable.')

  original.context.drawImage(image, 0, 0, width, height)
  const data = original.context.getImageData(0, 0, width, height).data
  // Average every original pixel in a block; never resample the painted result.
  for (let y = 0; y < height; y += BLOCK_SIZE) {
    for (let x = 0; x < width; x += BLOCK_SIZE) {
      const endX = Math.min(x + BLOCK_SIZE, width)
      const endY = Math.min(y + BLOCK_SIZE, height)
      let red = 0, green = 0, blue = 0
      for (let py = y; py < endY; py += 1) {
        for (let px = x; px < endX; px += 1) {
          const offset = (py * width + px) * 4
          red += data[offset]; green += data[offset + 1]; blue += data[offset + 2]
        }
      }
      const count = (endX - x) * (endY - y)
      pixelated.context.fillStyle = `rgb(${Math.round(red / count)} ${Math.round(green / count)} ${Math.round(blue / count)})`
      pixelated.context.fillRect(x, y, endX - x, endY - y)
    }
  }

  function render() {
    painted.context.globalCompositeOperation = 'source-over'
    painted.context.clearRect(0, 0, width, height)
    painted.context.drawImage(pixelated.canvas, 0, 0)
    painted.context.globalCompositeOperation = 'destination-in'
    painted.context.drawImage(mask.canvas, 0, 0)
    context!.clearRect(0, 0, width, height)
    context!.drawImage(original.canvas, 0, 0)
    context!.drawImage(painted.canvas, 0, 0)
  }

  function stroke(from: { x: number; y: number }, to: { x: number; y: number }) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(1, Math.ceil(distance / (BRUSH_RADIUS * .3)))
    mask.context.fillStyle = '#fff'
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      mask.context.beginPath()
      mask.context.arc(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, BRUSH_RADIUS, 0, Math.PI * 2)
      mask.context.fill()
    }
    render()
  }

  render()
  return {
    stroke,
    reset() { mask.context.clearRect(0, 0, width, height); render() },
  }
}
