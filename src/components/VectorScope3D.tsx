import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  analyserLeftRef: React.RefObject<AnalyserNode | null>
  expanded: boolean
}

const NUM_SPIKES = 128
const DOTS_PER_SPIKE = 20
const TOTAL_POINTS = NUM_SPIKES * DOTS_PER_SPIKE
const BASE_RADIUS = 1.2
const MAX_SPIKE = 1.8

// Fibonacci sphere — evenly distributes N points on a sphere surface
function fibonacciSphere(n: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
  }
  return points
}

export function VectorScope3D({ analyserLeftRef, expanded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!expanded || !containerRef.current) return

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x030712)
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Geometry
    const positions = new Float32Array(TOTAL_POINTS * 3)
    const colors = new Float32Array(TOTAL_POINTS * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Spike directions on sphere
    const directions = fibonacciSphere(NUM_SPIKES)

    // Random slow rotation speeds
    const rotX = (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1)
    const rotY = (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1)
    const rotZ = (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1)

    const dataArray = new Uint8Array(NUM_SPIKES)

    // Violet color: rgb(139, 92, 246) → normalized
    const vR = 139 / 255
    const vG = 92 / 255
    const vB = 246 / 255

    function tick() {
      rafRef.current = requestAnimationFrame(tick)

      if (analyserLeftRef.current) {
        analyserLeftRef.current.getByteFrequencyData(dataArray)
      }

      for (let i = 0; i < NUM_SPIKES; i++) {
        const amplitude = dataArray[i] / 255
        const spikeEnd = BASE_RADIUS + amplitude * MAX_SPIKE
        const dir = directions[i]

        for (let d = 0; d < DOTS_PER_SPIKE; d++) {
          const t = BASE_RADIUS + (spikeEnd - BASE_RADIUS) * (d / DOTS_PER_SPIKE)
          const idx = (i * DOTS_PER_SPIKE + d) * 3
          positions[idx]     = dir.x * t
          positions[idx + 1] = dir.y * t
          positions[idx + 2] = dir.z * t

          const brightness = 0.2 + (d / DOTS_PER_SPIKE) * 0.8
          colors[idx]     = vR * brightness
          colors[idx + 1] = vG * brightness
          colors[idx + 2] = vB * brightness
        }
      }

      geometry.attributes.position.needsUpdate = true
      geometry.attributes.color.needsUpdate = true

      points.rotation.x += rotX
      points.rotation.y += rotY
      points.rotation.z += rotZ

      renderer.render(scene, camera)
    }

    rafRef.current = requestAnimationFrame(tick)

    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [expanded, analyserLeftRef])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />
}
