// All positions use an illustration space; animation never moves the whole scene.
export const sceneWidth = 1400
export const sceneHeight = 900
export interface BreezeMotion {
  branch: number; leaf: number; grass: number; fabric: number; vertical: number
  branchY: number; grassY: number; fabricY: number
}
interface Leaf { x: number; y: number; size: number; angle: number; color: string; phase: number }
interface Bough {
  x: number; y: number; rx: number; ry: number; anchorX: number; anchorY: number
  width: number; leaves: Leaf[]; stiffness: number
}
function seeded(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
}
const random = seeded(8129)
const colors = ['#344f36', '#49613b', '#607744', '#7d8e4b', '#99a659', '#b3bb77', '#cbd091']
const boughs: Bough[] = [
  // Unequal crowns and staggered forks give the tree a left-reaching, open silhouette.
  [947, 329, 119, 84, 788, 508, 19, 245],
  [838, 222, 106, 94, 782, 454, 23, 300],
  [655, 197, 112, 91, 762, 463, 27, 335],
  [534, 268, 140, 92, 759, 486, 22, 360],
  [468, 369, 97, 65, 757, 545, 15, 225],
  [1020, 407, 78, 63, 791, 548, 12, 190],
  [610, 413, 121, 73, 759, 570, 16, 310],
  [878, 397, 121, 86, 783, 522, 17, 310],
  [750, 307, 139, 103, 772, 478, 24, 370],
].map(([x, y, rx, ry, anchorX, anchorY, width, count]) => {
  const lobes = Array.from({ length: 7 }, (_, i) => {
    const angle = i * 2.4 + random() * .7
    return { x: Math.cos(angle) * rx * (.2 + random() * .42),
      y: Math.sin(angle) * ry * (.2 + random() * .4), size: .32 + random() * .27 }
  })
  return { x, y, rx, ry, anchorX, anchorY, width, stiffness: .65 + random() * .6,
    leaves: Array.from({ length: count }, () => {
      const lobe = lobes[Math.floor(random() * lobes.length)]
      const angle = random() * Math.PI * 2, radius = Math.sqrt(random())
      const lx = lobe.x + Math.cos(angle) * radius * rx * lobe.size
      const ly = lobe.y + Math.sin(angle) * radius * ry * lobe.size
      // Keep nearby leaves in a common light/shadow group instead of random confetti.
      const light = Math.max(0, Math.min(6, Math.floor(random() * 1.4 + (1 - ly / ry) * 1.9 - lx / rx * .6)))
      return { x: lx, y: ly, size: 2.3 + random() ** 1.7 * 8.5, angle: -.6 + random() * 2.3,
        color: colors[light], phase: random() * Math.PI * 2 }
    }),
  }
})
// Blades grow in loose tufts, separated by quieter ground, with a perspective gradient.
const grass = Array.from({ length: 320 }, () => {
  const x = random() * sceneWidth, depth = Math.pow(random(), .7)
  const y = hill(x) + 9 + depth * 245
  return Array.from({ length: 2 + Math.floor(random() * 5) }, () => ({
    x: x + (random() - .5) * (9 + depth * 22), y: y + random() * (3 + depth * 8),
    height: 2 + depth * (7 + random() * 26), depth,
    bend: (random() - .65) * (4 + depth * 15), phase: random() * 6,
    color: colors[1 + Math.floor(random() * 5)],
  }))
}).flat().sort((a, b) => a.y - b.y)
const drift = Array.from({ length: 14 }, () => ({ x: 470 + random() * 565,
  y: 470 + random() * 225, size: 3 + random() * 4, phase: random() * 6 }))
export function hill(x: number) { return 661 - 40 * Math.exp(-(((x - 800) / 480) ** 2)) + x * .012 }

function shape(c: CanvasRenderingContext2D, path: string, fill: string) {
  c.fillStyle = fill; c.fill(new Path2D(path))
}
function leaf(c: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color: string) {
  c.save(); c.translate(x, y); c.rotate(angle); c.fillStyle = color
  const width = .48 + .32 * (.5 + .5 * Math.sin(size * 3.17))
  const curl = Math.sin(size * 1.47) * size * .18
  c.beginPath(); c.moveTo(-size, 0); c.quadraticCurveTo(-size * .25, -size * width, size, curl)
  c.quadraticCurveTo(size * .25, size * width * .7, -size, 0); c.fill(); c.restore()
}

// Cache the detailed, still landscape rather than repainting grain every frame.
export function createLandscape() {
  const canvas = document.createElement('canvas'); canvas.width = sceneWidth; canvas.height = sceneHeight
  const c = canvas.getContext('2d')!
  const sky = c.createLinearGradient(0, 0, 0, 740)
  sky.addColorStop(0, '#bcd9e6'); sky.addColorStop(.66, '#e5eddf'); sky.addColorStop(1, '#f5efd8')
  c.fillStyle = sky; c.fillRect(0, 0, sceneWidth, sceneHeight)
  const sun = c.createRadialGradient(330, 235, 0, 330, 235, 570)
  sun.addColorStop(0, '#fff8df55'); sun.addColorStop(1, '#fff8df00')
  c.fillStyle = sun; c.fillRect(0, 0, sceneWidth, sceneHeight)
  shape(c, 'M0 657 Q235 604 461 637 Q906 564 1400 638 L1400 900 L0 900Z', '#c1cca1')
  shape(c, 'M0 673 Q337 606 612 656 Q1060 594 1400 652 L1400 900 L0 900Z', '#acbc85')
  const turf = c.createLinearGradient(0, 620, 0, 900)
  turf.addColorStop(0, '#b3bf7d'); turf.addColorStop(.5, '#95a665'); turf.addColorStop(1, '#738b4c')
  c.fillStyle = turf; c.beginPath(); c.moveTo(0, hill(0))
  for (let x = 0; x <= sceneWidth; x += 10) c.lineTo(x, hill(x))
  c.lineTo(sceneWidth, sceneHeight); c.lineTo(0, sceneHeight); c.fill()
  const r = seeded(512)
  // Broken canopy shade follows the same upper-left daylight as the bark and leaves.
  for (let i = 0; i < 48; i++) {
    const x = 810 + (r() - .5) * 410, y = 724 + (r() - .5) * 70
    c.save(); c.translate(x, y); c.scale(1, .22)
    const shade = c.createRadialGradient(0, 0, 0, 0, 0, 38 + r() * 62)
    shade.addColorStop(0, '#314e2d13'); shade.addColorStop(1, '#314e2d00')
    c.fillStyle = shade; c.fillRect(-110, -110, 220, 220); c.restore()
  }
  c.save(); c.translate(760, 723); c.scale(1, .19)
  const contact = c.createRadialGradient(0, 0, 0, 0, 0, 115)
  contact.addColorStop(0, '#30432d85'); contact.addColorStop(1, '#30432d00')
  c.fillStyle = contact; c.fillRect(-120, -120, 240, 240); c.restore()
  // Low-contrast patches interrupt the otherwise uniform green without new objects.
  for (let i = 0; i < 90; i++) {
    const x = r() * sceneWidth, y = hill(x) + 15 + r() * 240
    c.save(); c.translate(x, y); c.scale(1, .16)
    const patch = c.createRadialGradient(0, 0, 0, 0, 0, 20 + r() * 60)
    patch.addColorStop(0, i % 3 ? '#e9df9610' : '#294c3310'); patch.addColorStop(1, '#e9df9600')
    c.fillStyle = patch; c.fillRect(-90, -90, 180, 180); c.restore()
  }
  for (let i = 0; i < 13000; i++) {
    const x = r() * sceneWidth, y = r() * sceneHeight
    c.fillStyle = y > hill(x) ? (r() > .5 ? '#eff0ba16' : '#263c2411') : '#fffaf013'
    c.fillRect(x, y, 1 + r() * 2, 1 + r() * 2)
  }
  return canvas
}

function trunk(c: CanvasRenderingContext2D) {
  const bark = c.createLinearGradient(734, 0, 804, 0)
  bark.addColorStop(0, '#a6956b'); bark.addColorStop(.35, '#817757'); bark.addColorStop(.74, '#62634b'); bark.addColorStop(1, '#444f3d')
  // Continuous tapered forks: no flat cut faces at the junction with the living branches.
  const outline = new Path2D('M739 721 Q758 654 754 566 Q751 500 734 456 Q718 424 690 398 Q731 420 756 462 Q767 411 772 372 Q775 352 786 338 Q777 383 779 421 Q777 462 784 489 Q798 452 826 428 Q803 458 796 493 Q788 532 791 552 Q784 647 809 719 Q785 709 777 695 Q765 718 739 721Z')
  c.fillStyle = bark; c.fill(outline)
  shape(c, 'M744 718 Q718 731 684 732 Q722 722 757 693 L773 698 Q765 719 744 718Z', '#797c50')
  shape(c, 'M787 699 Q813 712 846 728 Q812 721 802 720Z', '#586343')
  const r = seeded(6)
  c.save(); c.clip(outline)
  c.lineCap = 'round'
  for (let i = 0; i < 42; i++) {
    const x = 757 + r() * 32, y = 475 + r() * 217
    c.strokeStyle = i % 3 ? '#3543304a' : '#ded1a154'; c.lineWidth = .5 + r() * 1.6
    c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - 7, y + 16, x + 7, y + 32, x + (r() - .5) * 10, y + 46); c.stroke()
  }
  c.restore()
}

function child(c: CanvasRenderingContext2D, fabric: number, fabricY: number) {
  // Reclined back rests on the trunk; one knee supports the relaxed forearm.
  c.save(); c.translate(753, 708); c.scale(1.1, 1.1); c.translate(-753, -708)
  c.save(); c.translate(687, 721); c.scale(1, .22)
  const shade = c.createRadialGradient(0, 0, 0, 0, 0, 67)
  shade.addColorStop(0, '#31432e4a'); shade.addColorStop(1, '#31432e00')
  c.fillStyle = shade; c.fillRect(-70, -70, 140, 140); c.restore()
  shape(c, 'M737 689 Q718 685 706 691 Q685 699 669 709 Q649 715 630 708 L623 715 Q648 726 672 720 Q692 710 715 705 L737 708Z', '#465c5b')
  shape(c, 'M731 700 Q713 682 689 657 Q683 651 677 658 Q674 664 675 675 L676 700 L670 726 Q672 732 680 731 Q687 715 687 700 L687 679 Q702 701 722 712 Q732 716 739 707Z', '#627772')
  shape(c, 'M623 707 Q614 707 611 714 Q614 721 636 720 L635 711Z', '#635d48')
  shape(c, 'M671 725 Q661 726 658 732 Q660 737 679 736 L682 728Z', '#635d48')
  c.strokeStyle = '#94a69980'; c.lineWidth = .8
  c.beginPath(); c.moveTo(727, 705); c.quadraticCurveTo(704, 682, 684, 662); c.quadraticCurveTo(680, 686, 680, 704); c.stroke()
  const shirt = c.createLinearGradient(701, 647, 753, 701)
  shirt.addColorStop(0, '#eee2b9'); shirt.addColorStop(.48, '#d5c59b'); shirt.addColorStop(1, '#aaa07c')
  c.fillStyle = shirt; c.fill(new Path2D('M737 645 Q745 643 750 651 Q754 663 752 675 Q747 695 734 706 Q722 710 707 700 Q711 684 720 669 Q725 653 737 645Z'))
  c.strokeStyle = '#827b6166'; c.lineWidth = 1
  c.beginPath(); c.moveTo(747, 659); c.quadraticCurveTo(738, 681, 727 + fabric * 1.8, 696); c.stroke()
  shape(c, 'M747 651 Q754 661 750 675 Q744 692 734 701 L741 678 L740 659Z', '#8b92743b')
  shape(c, `M702 692 Q${718 + fabric * 6} ${700 + fabricY * 5} 734 698 L735 706 Q${716 + fabric * 8} ${707 + fabricY * 5} 700 699Z`, '#c2b18c')
  // Far arm rests beside the hip; the near arm bends onto the raised knee.
  shape(c, 'M745 667 Q746 682 739 695 L731 706 Q729 710 732 713 Q737 714 740 708 L748 697 Q754 683 751 668Z', '#bfa17e')
  shape(c, 'M730 655 Q710 653 690 655 Q682 654 678 658 L673 666 Q673 670 677 670 L683 664 Q686 663 690 664 Q711 667 731 665Z', '#ceb18a')
  shape(c, 'M737 648 Q745 651 742 661 L728 668 Q722 664 723 655 Q729 650 737 648Z', '#dfd0a7')
  c.save(); c.translate(12, 0)
  shape(c, 'M726 636 Q729 642 725 648 Q731 653 738 649 L738 632Z', '#b59976')
  shape(c, 'M715 612 Q728 602 740 613 Q746 620 742 631 Q739 639 731 641 Q722 642 718 634 L716 629 L712 627 Q710 626 714 622Z', '#cfb18c')
  shape(c, 'M714 623 Q708 619 711 610 Q715 599 727 600 Q742 599 748 611 Q752 623 742 634 L739 622 Q727 622 719 615 Q716 616 714 623Z', '#39433a')
  c.strokeStyle = '#7a7b5d'; c.lineWidth = .9
  c.beginPath(); c.moveTo(715, 611); c.quadraticCurveTo(726, 601, 739, 611); c.stroke()
  c.strokeStyle = '#535548'; c.lineWidth = 2; c.lineCap = 'round'
  for (let i = 0; i < 5; i++) {
    c.beginPath(); c.moveTo(716 + i * 3, 605)
    c.quadraticCurveTo(706 + i * 3 + fabric * 5, 595 + fabricY * 4, 711 + i * 3 + fabric * 9, 600 + fabricY * 6); c.stroke()
  }
  // Only a small profile mark; no expressive cartoon face.
  c.strokeStyle = '#91795e'; c.lineWidth = .7
  c.beginPath(); c.moveTo(714, 629); c.lineTo(717, 630); c.stroke()
  c.restore()
  c.restore()
}

function branch(c: CanvasRenderingContext2D, b: Bough, dx: number, dy: number, index: number) {
  const points = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24, u = 1 - t
    const cx1 = b.anchorX + (b.x - b.anchorX) * .13
    const cy1 = b.anchorY - 87
    const cx2 = b.x - (b.x - b.anchorX) * .32 + dx * .5
    const cy2 = b.y + 37 + dy * .5
    return { x: u ** 3 * b.anchorX + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t ** 3 * (b.x + dx),
      y: u ** 3 * b.anchorY + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t ** 3 * (b.y + dy) }
  })
  // A single tapered surface avoids the beads/dashes made by many rounded strokes.
  const edges = points.map((p, i) => {
    const before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 1)]
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1
    const radius = (b.width * (1 - i / 26) ** 1.4 + .7) / 2
    const nx = -(after.y - before.y) / length * radius
    const ny = (after.x - before.x) / length * radius
    return { left: { x: p.x + nx, y: p.y + ny }, right: { x: p.x - nx, y: p.y - ny } }
  })
  const surface = c.createLinearGradient(734, 0, 804, 0)
  surface.addColorStop(0, '#a6956b'); surface.addColorStop(.35, '#817757')
  surface.addColorStop(.74, '#62634b'); surface.addColorStop(1, '#444f3d')
  c.fillStyle = surface; c.beginPath(); c.moveTo(edges[0].left.x, edges[0].left.y)
  for (const edge of edges.slice(1)) c.lineTo(edge.left.x, edge.left.y)
  for (const edge of [...edges].reverse()) c.lineTo(edge.right.x, edge.right.y)
  c.closePath(); c.fill()
  c.strokeStyle = '#d5c39326'; c.lineWidth = .7; c.lineCap = 'round'
  c.beginPath(); c.moveTo(points[3].x - .8, points[3].y)
  for (const p of points.slice(4, 20)) c.lineTo(p.x - .8, p.y)
  c.stroke()
  // Twigs leave staggered positions on a parent branch, rather than radiating from a hub.
  for (let i = 0; i < 7; i++) {
    const from = points[12 + i], tip = b.leaves[(i * 37 + index * 11) % b.leaves.length]
    const tx = b.x + tip.x * .85 + dx, ty = b.y + tip.y * .8 + dy
    c.strokeStyle = '#747151a0'; c.lineWidth = 2.4 - i * .22
    c.beginPath(); c.moveTo(from.x, from.y)
    c.quadraticCurveTo(from.x + (tx - from.x) * .4, ty + 21, tx, ty); c.stroke()
  }
}

export function drawBreeze(c: CanvasRenderingContext2D, background: HTMLCanvasElement, motion: BreezeMotion,
  time: number, floating: { x: number; y: number }[]) {
  c.drawImage(background, 0, 0)
  // Foliage and tapered boughs overlap the upper stem, rather than a solid stem masking them.
  trunk(c)
  for (const [index, bough] of boughs.entries()) {
    const response = bough.stiffness
    const dx = motion.branch * response * 46, dy = motion.branchY * response * 18
    branch(c, bough, dx, dy, index)
    // Canopy depth comes from the grouped leaf colors, not a blurred halo behind them.
    for (const l of bough.leaves) {
      const flutter = Math.sin(time * 5.6 + l.phase) * Math.hypot(motion.leaf, motion.vertical)
      leaf(c, bough.x + l.x + dx + motion.leaf * 13 + flutter * 4,
        bough.y + l.y + dy + motion.vertical * 10 + flutter * 3, l.size,
        l.angle + motion.leaf * .34 + flutter * .24, l.color)
    }
  }
  // Ground blades bend individually; they are not a rotating grass layer.
  for (const [index, g] of grass.entries()) {
    // Quiet gaps around the seated figure; keep fuller tufts toward the foreground edges.
    const central = Math.abs(g.x - 725) < 185 && g.y > 720
    if ((central && index % 3 !== 0) || (g.depth > .7 && index % 4 === 0)) continue
    const bend = motion.grass * (g.height * 1.1) * (.7 + .3 * Math.sin(time * 2 + g.phase))
    c.strokeStyle = g.color; c.lineWidth = .4 + g.depth * 1.1
    c.globalAlpha = .6 + g.depth * .28
    c.beginPath(); c.moveTo(g.x, g.y)
    c.quadraticCurveTo(g.x + bend * .2, g.y - g.height * .6,
      g.x + g.bend + bend, g.y - g.height + Math.abs(bend) * .18 + motion.grassY * g.height * .3); c.stroke()
  }
  c.globalAlpha = 1
  child(c, motion.fabric, motion.fabricY)
  // A few foreground blades overlap the feet and roots, anchoring them in the grass.
  for (const g of grass) {
    if (g.x < 590 || g.x > 850 || g.y < 730 || g.y > 760) continue
    const bend = motion.grass * g.height * 1.1 * (.7 + .3 * Math.sin(time * 2 + g.phase))
    c.strokeStyle = '#73874c'; c.lineWidth = .8
    c.beginPath(); c.moveTo(g.x, g.y)
    c.quadraticCurveTo(g.x + bend * .2, g.y - g.height * .45,
      g.x + g.bend + bend, g.y - g.height + Math.abs(bend) * .18 + motion.grassY * g.height * .3); c.stroke()
  }
  for (const [i, d] of drift.entries()) {
    const p = floating[i]
    leaf(c, p?.x ?? d.x, p?.y ?? d.y, d.size,
      d.phase + Math.sin(time * 2 + d.phase) * Math.abs(motion.leaf) * .5, '#8b8955')
  }
}
export function createFloatingLeaves() { return drift.map(({ x, y }) => ({ x, y })) }
export function moveFloatingLeaves(points: { x: number; y: number }[], motion: BreezeMotion, dt: number) {
  points.forEach((p, i) => {
    p.x += motion.leaf * (65 + i % 5 * 9) * dt
    p.y += (motion.vertical * 36 + (drift[i].y - p.y) * .3) * dt
    if (p.x < 320 || p.x > 1200) { p.x = drift[i].x; p.y = drift[i].y }
  })
}
