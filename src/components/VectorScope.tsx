import { useEffect, useRef } from 'react'

interface Props {
  analyserLeftRef: React.RefObject<AnalyserNode | null>
  analyserRightRef: React.RefObject<AnalyserNode | null>
  expanded: boolean
}

const NUM_POINTS = 128
const TWO_PI = Math.PI * 2

export function VectorScope({ analyserLeftRef, expanded }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!expanded || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const dataArray = new Uint8Array(NUM_POINTS)

    function tick() {
      rafRef.current = requestAnimationFrame(tick)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const baseRadius = Math.min(cx, cy) * 0.15
      const maxSpike = Math.min(cx, cy) * 0.75

      // Fade trail
      ctx.fillStyle = 'rgba(3, 7, 18, 0.25)'
      ctx.fillRect(0, 0, w, h)

      if (!analyserLeftRef.current) return
      analyserLeftRef.current.getByteFrequencyData(dataArray)

      for (let i = 0; i < NUM_POINTS; i++) {
        const angle = (i / NUM_POINTS) * TWO_PI - Math.PI / 2
        const amplitude = dataArray[i] / 255
        const spikeLength = baseRadius + amplitude * maxSpike

        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)

        // Draw dots along the spike from base to tip
        const dotCount = Math.max(2, Math.floor(amplitude * 18))
        for (let d = 0; d < dotCount; d++) {
          const t = baseRadius + (spikeLength - baseRadius) * (d / dotCount)
          const x = cx + cosA * t
          const y = cy + sinA * t
          const alpha = 0.3 + (d / dotCount) * 0.7
          const radius = 1 + (d / dotCount) * 1.2

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, TWO_PI)
          ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`
          ctx.fill()
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [expanded, analyserLeftRef])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
