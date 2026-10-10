export const IMAGE_WIDTH = 1500
export const IMAGE_HEIGHT = 900
export const BRUSH_RADIUS = 48
const BLOCK_SIZE = 25

function layer() {
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_WIDTH
  canvas.height = IMAGE_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable.')
  return { canvas, context }
}

export function createPixelBrush(display: HTMLCanvasElement, image: HTMLImageElement) {
  const original = layer()
  const pixelated = layer()
  const mask = layer()
  const painted = layer()
  display.width = IMAGE_WIDTH
  display.height = IMAGE_HEIGHT
  const context = display.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable.')

  const scale = Math.max(IMAGE_WIDTH / image.naturalWidth, IMAGE_HEIGHT / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  original.context.drawImage(image, (IMAGE_WIDTH - width) / 2, (IMAGE_HEIGHT - height) / 2, width, height)
  const data = original.context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data
  // Average every original pixel in a block; never resample the painted result.
  for (let y = 0; y < IMAGE_HEIGHT; y += BLOCK_SIZE) {
    for (let x = 0; x < IMAGE_WIDTH; x += BLOCK_SIZE) {
      const endX = Math.min(x + BLOCK_SIZE, IMAGE_WIDTH)
      const endY = Math.min(y + BLOCK_SIZE, IMAGE_HEIGHT)
      let red = 0, green = 0, blue = 0
      for (let py = y; py < endY; py += 1) {
        for (let px = x; px < endX; px += 1) {
          const offset = (py * IMAGE_WIDTH + px) * 4
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
    painted.context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
    painted.context.drawImage(pixelated.canvas, 0, 0)
    painted.context.globalCompositeOperation = 'destination-in'
    painted.context.drawImage(mask.canvas, 0, 0)
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
    reset() { mask.context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT); render() },
  }
}
