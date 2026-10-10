export interface SplashEvent { x: number; y: number; start: number; strength: number; seed: number }
export interface SplashPressure { x: number; y: number; amount: number }
export const splashLifetime = (strength: number) => 5 + strength * 1.8
export const reboundDelay = (strength: number) => 1.6 + strength * .12
export const cavityLifetime = (strength: number) => 2.25 + strength * .18
export function cavityState(age: number, strength: number) {
  const t = Math.max(0, age)
  const ease = (value: number) => { const u = Math.max(0, Math.min(1, value)); return u * u * (3 - 2 * u) }
  const descent = .68 + strength * .08
  const recoveryStart = descent + .22
  const closing = ease((t - recoveryStart) / (cavityLifetime(strength) - recoveryStart))
  // Slow downward travel, a brief deep hold, then a longer continuous refill.
  const depression = ease(t / descent) * (1 - closing) * 1.35
  const reboundTime = Math.max(0, age - reboundDelay(strength))
  return { amount: depression * strength, radius: (48 + strength * 38) * (1 + ease(t / descent) * .08) * (1 - closing * .12),
    rebound: (1 - Math.exp(-reboundTime * 4)) * Math.exp(-reboundTime * 2.4) * strength }
}

type Point = { x: number; y: number }
function textureTriangle(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, src: Point[], dst: Point[], shade = 0) {
  const u1 = src[1].x - src[0].x, v1 = src[1].y - src[0].y
  const u2 = src[2].x - src[0].x, v2 = src[2].y - src[0].y
  const determinant = u1 * v2 - u2 * v1
  if (Math.abs(determinant) < .0001) return
  const x1 = dst[1].x - dst[0].x, y1 = dst[1].y - dst[0].y
  const x2 = dst[2].x - dst[0].x, y2 = dst[2].y - dst[0].y
  const a = (x1 * v2 - x2 * v1) / determinant, c = (x2 * u1 - x1 * u2) / determinant
  const b = (y1 * v2 - y2 * v1) / determinant, d = (y2 * u1 - y1 * u2) / determinant
  const cx = (dst[0].x + dst[1].x + dst[2].x) / 3, cy = (dst[0].y + dst[1].y + dst[2].y) / 3
  ctx.save(); ctx.beginPath()
  dst.forEach((p, index) => {
    const x = cx + (p.x - cx) * 1.025, y = cy + (p.y - cy) * 1.025
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  })
  ctx.closePath(); ctx.clip()
  ctx.transform(a, b, c, d, dst[0].x - a * src[0].x - c * src[0].y, dst[0].y - b * src[0].x - d * src[0].y)
  ctx.drawImage(image, 0, 0); ctx.restore()
  if (shade > 0) {
    ctx.beginPath(); dst.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath()
    ctx.fillStyle = `rgba(4,38,62,${shade})`; ctx.fill()
  }
}

function drawCavity(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, event: SplashEvent, age: number) {
  const state = cavityState(age, event.strength)
  if (state.amount < .025) return
  const depth = state.amount * 128
  const radius = state.radius
  const rings = [0, .18, .36, .52, .66, .78, .88, .96, 1.06]
  const sectors = 40
  const vertex = (r: number, angle: number) => {
    const irregularity = 1 + Math.sin(angle * 3 + event.seed) * .035 + Math.sin(angle * 7 - age * 6) * .018
    const x = event.x + Math.cos(angle) * radius * r * irregularity
    const y = event.y + Math.sin(angle) * radius * r * .62 * irregularity
    const bowl = Math.max(0, 1 - r * r) ** .7
    return {
      src: { x: (x - 100) / 800 * RES, y: (y - 100) / 800 * RES },
      dst: { x: event.x + (x - event.x) * (1 - bowl * .42), y: y + depth * bowl - state.amount * 5 * r * r },
    }
  }
  ctx.save(); ctx.beginPath()
  for (let i = 0; i <= sectors; i += 1) {
    const p = vertex(1, i / sectors * Math.PI * 2).dst
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y)
  }
  ctx.closePath(); ctx.clip()
  // Live water texture follows the bowl's descending floor and stretched walls.
  // The foreground lip occludes the lowered floor, making depth visible in projection.
  // Draw from the deep floor toward the surface: the near wall occludes the floor.
  for (let ring = 0; ring < rings.length - 1; ring += 1) {
    for (let sector = 0; sector < sectors; sector += 1) {
      const angle = sector / sectors * Math.PI * 2, next = (sector + 1) / sectors * Math.PI * 2
      const a = vertex(rings[ring], angle), b = vertex(rings[ring + 1], angle)
      const c = vertex(rings[ring + 1], next), d = vertex(rings[ring], next)
      const radial = (rings[ring] + rings[ring + 1]) * .5
      const shade = Math.min(.72, state.amount * .52) * Math.max(0, 1 - radial) ** .6
        * (.78 + Math.sin(angle) * .22)
      textureTriangle(ctx, image, [a.src, b.src, c.src], [a.dst, b.dst, c.dst], shade)
      textureTriangle(ctx, image, [a.src, c.src, d.src], [a.dst, c.dst, d.dst], shade)
    }
  }
  ctx.restore()
  // Broken grazing reflections along the wet rim, rather than a perfect white ellipse.
  for (let arc = 0; arc < 5; arc += 1) {
    ctx.beginPath()
    for (let i = 0; i <= 8; i += 1) {
      const angle = arc / 5 * Math.PI + i / 8 * .38
      const p = vertex(.98, angle).dst
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = `rgba(211,241,253,${Math.min(.65, state.amount * .38)})`
    ctx.lineWidth = 1.2 + state.amount * .7; ctx.stroke()
  }
}
const random = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value) }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const table = Float32Array.from({ length: 16384 }, (_, index) => random(index))
function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y)
  let fx = x - ix, fy = y - iy
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
  const a = table[(iy & 127) * 128 + (ix & 127)], b = table[(iy & 127) * 128 + ((ix + 1) & 127)]
  const c = table[((iy + 1) & 127) * 128 + (ix & 127)], d = table[((iy + 1) & 127) * 128 + ((ix + 1) & 127)]
  return a + (b - a) * fx + (c - a + (d - c - b + a) * fx) * fy
}
const RES = 352
const cache = new WeakMap<CanvasRenderingContext2D, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; image: ImageData; heights: Float32Array; below: Float32Array; sunlight: Float32Array }>()
function buffer(context: CanvasRenderingContext2D) {
  let item = cache.get(context)
  if (!item) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = RES
    const ctx = canvas.getContext('2d')!
    const below = new Float32Array(RES * RES)
    const sunlight = new Float32Array(RES * RES)
    for (let y = 0; y < RES; y += 1) for (let x = 0; x < RES; x += 1) {
      const px = 100 + x / (RES - 1) * 800, py = 100 + y / (RES - 1) * 800
      below[y * RES + x] = noise(px * .004, py * .004)
      sunlight[y * RES + x] = Math.exp(-((px - 680) ** 2 / 85000 + (py - 260) ** 2 / 200000))
    }
    item = { canvas, ctx, image: ctx.createImageData(RES, RES), heights: new Float32Array((RES + 1) ** 2), below, sunlight }; cache.set(context, item)
  }
  return item
}

export function splashDrops(event: SplashEvent) {
  return Array.from({ length: Math.round(30 + event.strength * 22) }, (_, index) => {
    const seed = event.seed * 137 + index
    const angle = random(seed) * Math.PI * 2
    const outward = (70 + random(seed + 50) * 170) * (.6 + event.strength * .65)
    const up = (220 + random(seed + 100) * 280) * Math.sqrt(event.strength)
    const vx = Math.cos(angle) * outward
    const groundY = Math.sin(angle) * outward * .24
    const early = index % 3 === 0
    const launchHeight = 8 + random(seed + 240) * 27 * Math.sqrt(event.strength)
    const originRadius = early ? 48 + event.strength * 25 : 17 * Math.sqrt(event.strength)
    const baseX = event.x + Math.cos(angle) * originRadius
    const baseY = event.y + Math.sin(angle) * originRadius * .38
    const flight = (up + Math.sqrt(up * up + 1220 * launchHeight)) / 610
    return { vx, groundY, up, flight, launchHeight, baseX, baseY,
      delay: (early ? .55 : reboundDelay(event.strength)) + .03 + random(seed + 270) * .1,
      contactX: baseX + vx * flight, contactY: baseY + groundY * flight,
      r: (1 + random(seed + 200) ** 2 * 4.8) * (.8 + Math.sin(angle) * .18 + event.strength * .15), index }
  })
}

export function drawSplash(ctx: CanvasRenderingContext2D, time: number, events: SplashEvent[], pressure?: SplashPressure) {
  const layer = buffer(ctx)
  const active = events.filter((event) => time - event.start < splashLifetime(event.strength))
  const packets = active.map((event) => ({ event, age: Math.max(0, time - event.start), drops: splashDrops(event) }))
  const cavities = packets.filter(({ event, age }) => age < cavityLifetime(event.strength)).map(({ event, age }) => ({ event, ...cavityState(age, event.strength) }))
  if (pressure && pressure.amount > 0) cavities.push({ event: { x: pressure.x, y: pressure.y, start: time, strength: pressure.amount, seed: 0 },
    amount: pressure.amount * .06, radius: 28 + pressure.amount * 12, rebound: 0 })
  const waves = packets.flatMap(({ event, age, drops: droplets }) => [
    ...[0, .17, .36].filter((delay) => age >= delay).map((delay, index) => ({
      x: event.x, y: event.y, age: age - delay,
      amplitude: event.strength * [.7, .32, .14][index] * Math.exp(-age * (1.1 / (.6 + event.strength))) * clamp((splashLifetime(event.strength) - age) / .85),
      speed: 85 + index * 13,
    })),
    ...droplets.filter((drop) => drop.r > 3 && age >= drop.delay + drop.flight && age - drop.delay - drop.flight < 1.3).map((drop) => ({
      x: drop.contactX, y: drop.contactY,
      age: age - drop.delay - drop.flight, amplitude: Math.min(.14, drop.r * .018) * Math.exp(-(age - drop.delay - drop.flight) * 3), speed: 52,
    })),
  ])
  function height(x: number, y: number) {
    const perspective = .72 + (y - 100) / 800 * .55
    let sampleX = x, sampleY = y, deformation = 0
    for (const cavity of cavities) {
      const dx = x - cavity.event.x, dy = (y - cavity.event.y) * 1.55
      const r2 = dx * dx + dy * dy
      if (r2 > cavity.radius * cavity.radius * 5) continue
      const r = Math.sqrt(r2), normalized = r / cavity.radius
      const bowl = Math.exp(-normalized * normalized * 2.2)
      const lip = Math.exp(-((normalized - .95) ** 2) * 48)
      deformation += -cavity.amount * bowl * 1.2 + cavity.amount * lip * .35 + cavity.rebound * bowl * .24
      const bend = cavity.amount * bowl * 17 / Math.max(1, r)
      sampleX += dx * bend; sampleY += dy / 1.55 * bend
    }
    let h = noise(sampleX * .017 / perspective + time * .12, sampleY * .022 / perspective - time * .11) * .54
      + noise(sampleX * .041 / perspective - time * .1, sampleY * .034 / perspective + time * .12) * .3
      + noise(sampleX * .083 / perspective + time * .07, sampleY * .068 / perspective - time * .05) * .09 + deformation
    for (const wave of waves) {
      const dx = x - wave.x, dy = (y - wave.y) * 1.55
      const distanceSquared = dx * dx + dy * dy
      const front = wave.age * wave.speed
      if (distanceSquared > (front + 100) ** 2 || (front > 155 && distanceSquared < (front - 100) ** 2)) continue
      const distance = Math.sqrt(distanceSquared)
      const offset = distance - front - Math.sin(Math.atan2(dy, dx) * 5 + time * .4) * 5
      if (Math.abs(offset) < 85) h += Math.sin(offset * .13) * Math.exp(-Math.abs(offset) / 22) * wave.amplitude * .34
    }
    return h
  }
  const stride = RES + 1
  const step = 800 / (RES - 1)
  for (let y = 0; y <= RES; y += 1) for (let x = 0; x <= RES; x += 1) {
    layer.heights[y * stride + x] = height(100 + x * step, 100 + y * step)
  }
  const data = layer.image.data
  for (let py = 0; py < RES; py += 1) {
    const y = 100 + py / (RES - 1) * 800
    for (let px = 0; px < RES; px += 1) {
      const x = 100 + px / (RES - 1) * 800
      const fieldIndex = py * stride + px
      const h = layer.heights[fieldIndex]
      const nx = (layer.heights[fieldIndex + 1] - h) * 9 / step
      const ny = (layer.heights[fieldIndex + stride] - h) * 9 / step
      const reflection = clamp(1 - Math.abs(nx - .08) * 5) * clamp(1 - Math.abs(ny + .1) * 5)
      const squared = reflection * reflection
      const glint = squared * squared * squared
      const sun = layer.sunlight[py * RES + px]
      const illumination = Math.max(-48, Math.min(75, ny * 58 - nx * 35 + (h - .4) * 36 + glint * sun * 88))
      const depthShade = (y - 100) / 800
      // Domain-warped transmitted light below the surface; not a white grid overlay.
      const warp = h * 1.4
      const lightA = noise(x * .019 + warp * 2 + time * .06, y * .021 - time * .05)
      const lightB = noise(x * .017 - time * .04, y * .023 + warp * 2 + time * .04)
      const ridge = clamp(1 - Math.abs(lightA - lightB) * 13)
      const transmitted = ridge * ridge * 11 * (.4 + sun * .6)
      const belowX = Math.max(0, Math.min(RES - 1, px + Math.round(nx * 3)))
      const belowY = Math.max(0, Math.min(RES - 1, py + Math.round(ny * 3)))
      const below = layer.below[belowY * RES + belowX]
      const i = (py * RES + px) * 4
      data[i] = 125 - below * 80 - depthShade * 12 + illumination + transmitted + sun * 9
      data[i + 1] = 204 - below * 66 - depthShade * 17 + illumination * .95 + transmitted + sun * 9
      data[i + 2] = 244 - below * 40 - depthShade * 12 + illumination * .74 + transmitted * .7
      data[i + 3] = 255
    }
  }
  layer.ctx.putImageData(layer.image, 0, 0)
  ctx.clearRect(0, 0, 1000, 1000)
  ctx.save(); ctx.beginPath(); ctx.arc(500, 500, 400, 0, Math.PI * 2); ctx.clip()
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(layer.canvas, 100, 100, 800, 800)
  for (const { event, age } of packets) {
    if (age < cavityLifetime(event.strength)) drawCavity(ctx, layer.canvas, event, age)
  }
  // The impact shading comes from the deformed surface, without a painted hole/glow.
  ctx.restore()
  // Only a narrow band outside the frame is available for spray, protecting the UI.
  ctx.save(); ctx.beginPath(); ctx.arc(500, 500, 470, 0, Math.PI * 2); ctx.clip()

  // The displaced rim throws an irregular curtain outward before the cavity closes.
  for (const { event, age: impactAge } of packets) {
    const age = impactAge - .5
    if (age < 0 || age > .85) continue
    const pulse = Math.sin(Math.PI * clamp(age / .85)) * Math.exp(-age * 1.8)
    const radius = cavityState(impactAge, event.strength).radius
    for (let index = 0; index < 13; index += 1) {
      const angle = index / 13 * Math.PI * 2 + random(event.seed + index * 7) * .19
      const direction = Math.cos(angle)
      const baseX = event.x + direction * radius * .92
      const baseY = event.y + Math.sin(angle) * radius * .57
      const height = pulse * (42 + random(index * 39 + event.seed) * 75) * Math.sqrt(event.strength)
      const tipX = baseX + direction * pulse * (18 + random(index + 5) * 40)
      const tipY = baseY - height
      const width = (3 + random(index + 31) * 6) * pulse
      const water = ctx.createLinearGradient(baseX, baseY, tipX, tipY)
      water.addColorStop(0, 'rgba(40,128,174,0)')
      water.addColorStop(.35, `rgba(93,183,220,${pulse * .34})`)
      water.addColorStop(.85, `rgba(214,242,252,${pulse * .66})`)
      water.addColorStop(1, `rgba(245,253,255,${pulse * .75})`)
      ctx.beginPath(); ctx.moveTo(baseX - width, baseY)
      ctx.bezierCurveTo(baseX - width * .7, baseY - height * .5, tipX - width * .25, tipY + 10, tipX, tipY)
      ctx.bezierCurveTo(tipX + width * .2, tipY + 8, baseX + width * .4, baseY - height * .45, baseX + width, baseY)
      ctx.closePath(); ctx.fillStyle = water; ctx.fill()
      ctx.beginPath(); ctx.moveTo(baseX, baseY - 4)
      ctx.bezierCurveTo(baseX, baseY - height * .5, tipX, tipY + 12, tipX, tipY)
      ctx.strokeStyle = `rgba(232,249,255,${pulse * .5})`; ctx.lineWidth = .65; ctx.stroke()
    }
  }
  // A fragmented rebound sheet rises from the closing cavity.
  for (const { event, age: impactAge } of packets) {
    const age = impactAge - reboundDelay(event.strength)
    if (age < 0) continue
    const flight = 1.05 + event.strength * .24
    if (age > flight) continue
    const envelope = Math.sin(Math.PI * clamp(age / flight)) * Math.exp(-age * .7)
    const radius = (30 + age * 100) * Math.sqrt(event.strength)
    const crownHeight = Math.min(envelope * (70 + event.strength * 92), Math.max(36, event.y - 50))
    const rim: { x: number; y: number }[] = []
    for (let step = 0; step <= 48; step += 1) {
      const angle = step / 48 * Math.PI * 2
      const fingers = .82 + Math.sin(angle * 5 + event.seed) * .13 + Math.sin(angle * 9 - event.seed) * .065
      rim.push({ x: event.x + Math.cos(angle) * radius, y: event.y + Math.sin(angle) * radius * .33 - crownHeight * fingers })
    }
    const sheet = ctx.createLinearGradient(0, event.y - crownHeight, 0, event.y + radius)
    sheet.addColorStop(0, `rgba(228,247,255,${envelope * .42})`)
    sheet.addColorStop(.3, `rgba(139,213,245,${envelope * .2})`)
    sheet.addColorStop(.64, `rgba(36,125,189,${envelope * .12})`)
    sheet.addColorStop(1, 'rgba(21,90,145,0)')
    ctx.strokeStyle = `rgba(228,247,255,${envelope * .32})`; ctx.lineWidth = .8
    ctx.beginPath(); ctx.moveTo(rim[0].x, rim[0].y)
    rim.forEach((p, index) => {
      if (index % 12 === 0) ctx.moveTo(p.x, p.y)
      const next = rim[Math.min(index + 1, rim.length - 1)]
      ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2)
    }); ctx.stroke()
    // Uneven narrow ribbons break the single solid crown silhouette into liquid strands.
    for (let strand = 0; strand < 11; strand += 1) {
      const angle = strand / 11 * Math.PI * 2 + random(event.seed + strand) * .3
      const baseX = event.x + Math.cos(angle) * radius * .55
      const baseY = event.y + Math.sin(angle) * radius * .22
      const tipX = event.x + Math.cos(angle) * radius * (1.05 + age * .25)
      const tipY = baseY - crownHeight * (.75 + random(event.seed * 31 + strand) * .45)
      const width = (4 + random(strand + event.seed * 13) * 10) * envelope
      ctx.beginPath(); ctx.moveTo(baseX - width, baseY)
      ctx.bezierCurveTo(baseX - width * .7, baseY - crownHeight * .4, tipX - width * .2, tipY + 18, tipX, tipY)
      ctx.bezierCurveTo(tipX + width * .25, tipY + 16, baseX + width * .6, baseY - crownHeight * .3, baseX + width, baseY)
      ctx.closePath(); ctx.fillStyle = sheet; ctx.fill()
      ctx.beginPath(); ctx.moveTo(baseX - width * .5, baseY - 3)
      ctx.bezierCurveTo(baseX - width * .4, baseY - crownHeight * .4, tipX, tipY + 18, tipX, tipY)
      ctx.strokeStyle = `rgba(230,248,255,${envelope * .62})`; ctx.lineWidth = .7 + random(strand + 11) * .7; ctx.stroke()
    }
  }
  // Gravity is analytic, so rise and landing do not depend on frame rate.
  for (const { age, drops: droplets } of packets) {
    for (const drop of droplets) {
      const t = age - drop.delay
      if (t < 0 || t > drop.flight) continue
      const x = drop.baseX + drop.vx * t
      const y = drop.baseY - drop.launchHeight + drop.groundY * t - drop.up * t + 305 * t * t
      const vy = drop.groundY - drop.up + 610 * t
      const angle = Math.atan2(vy, drop.vx)
      const stretch = Math.min(2.3, 1 + Math.hypot(drop.vx, vy) / 420)
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
      ctx.globalAlpha = clamp((480 - Math.hypot(x - 500, y - 500)) / 35) * clamp(t / .025) * clamp((drop.flight - t) / .025)
      const bead = ctx.createRadialGradient(-drop.r * .2, -drop.r * .15, 0, 0, 0, drop.r * stretch)
      bead.addColorStop(0, 'rgba(251,254,255,.95)'); bead.addColorStop(.23, 'rgba(210,242,255,.8)'); bead.addColorStop(.5, 'rgba(56,143,188,.48)'); bead.addColorStop(.82, 'rgba(175,228,248,.55)'); bead.addColorStop(1, 'rgba(226,246,255,.08)')
      ctx.fillStyle = bead; ctx.beginPath(); ctx.ellipse(0, 0, drop.r * stretch, drop.r * .7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    }
  }
  ctx.restore()
}
