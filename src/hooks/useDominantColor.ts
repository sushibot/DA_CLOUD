import { useEffect, useState } from 'react'

export type RGB = { r: number; g: number; b: number }

function extractDominantColor(img: HTMLImageElement): RGB {
  const SIZE = 30
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

  let r = 0, g = 0, b = 0, n = 0
  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3]
    if (pa < 128) continue
    const brightness = (pr + pg + pb) / 3
    // skip near-black and near-white pixels — they wash out the result
    if (brightness < 20 || brightness > 235) continue
    r += pr; g += pg; b += pb; n++
  }

  if (n === 0) return { r: 50, g: 50, b: 80 }

  let ar = Math.round(r / n)
  let ag = Math.round(g / n)
  let ab = Math.round(b / n)

  // cap max channel at 160 so the gradient reads as ambient glow, not a neon blast
  const peak = Math.max(ar, ag, ab)
  if (peak > 160) {
    const scale = 160 / peak
    ar = Math.round(ar * scale)
    ag = Math.round(ag * scale)
    ab = Math.round(ab * scale)
  }

  return { r: ar, g: ag, b: ab }
}

export function useDominantColor(src: string | null) {
  const [color, setColor] = useState<RGB | null>(null)

  useEffect(() => {
    if (!src) return
    let cancelled = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!cancelled) setColor(extractDominantColor(img))
    }
    img.src = src

    return () => { cancelled = true }
  }, [src])

  return color
}
