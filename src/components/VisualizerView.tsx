import { useRef, useEffect } from 'react'
import { CiCircleChevDown } from 'react-icons/ci'
import * as THREE from 'three'
import { usePlayer } from '../context/PlayerContext'

interface Props {
  onClose: () => void
  expanded: boolean
}

export function VisualizerView({ onClose, expanded }: Props) {
  const { state } = usePlayer()
  const canvasRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!expanded || !canvasRef.current) return

    const container = canvasRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.z = 3

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.6)
    fillLight.position.set(-3, -2, -3)
    scene.add(fillLight)

    // Tetrahedron (4 triangular faces — natural 3D triangle)
    const geometry = new THREE.TetrahedronGeometry(1.4)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.3,
      metalness: 0.5,
    })
    const triangle = new THREE.Mesh(geometry, material)
    scene.add(triangle)

    // Resize handler
    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    function tick() {
      triangle.rotation.y += 0.008
      triangle.rotation.x += 0.004
      triangle.rotation.z += 0.002
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [expanded])

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col">
      <div className="shrink-0 flex items-center justify-between px-6 pt-4">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Now Playing</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer"
          title="Close"
        >
          <CiCircleChevDown size={28} />
        </button>
      </div>

      <p className="shrink-0 text-white text-xl font-semibold text-center px-6 mt-2">
        {state.currentTrack?.title ?? '—'}
      </p>

      <div ref={canvasRef} className="flex-1 min-h-0" />
    </div>
  )
}
