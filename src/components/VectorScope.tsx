import { useEffect, useRef } from 'react'

interface Props {
  analyserLeftRef: React.RefObject<AnalyserNode | null>
  analyserRightRef: React.RefObject<AnalyserNode | null>
  expanded: boolean
}

export function VectorScope({ analyserLeftRef, analyserRightRef, expanded }: Props) {
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

    const bufferLength = analyserLeftRef.current?.frequencyBinCount ?? 1024
    const dataL = new Float32Array(bufferLength)
    const dataR = new Float32Array(bufferLength)

    function tick() {
      rafRef.current = requestAnimationFrame(tick)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(cx, cy) * 0.85

      // Fade previous frame instead of clearing — creates trails
      ctx.fillStyle = 'rgba(17, 24, 39, 0.35)'
      ctx.fillRect(0, 0, w, h)

      if (!analyserLeftRef.current || !analyserRightRef.current) return

      analyserLeftRef.current.getFloatTimeDomainData(dataL)
      analyserRightRef.current.getFloatTimeDomainData(dataR)

      for (let i = 0; i < bufferLength; i++) {
        const x = cx + dataL[i] * radius
        const y = cy - dataR[i] * radius

        const intensity = Math.abs(dataL[i]) + Math.abs(dataR[i])
        const alpha = Math.min(0.15 + intensity * 0.85, 1)

        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [expanded, analyserLeftRef, analyserRightRef])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}
