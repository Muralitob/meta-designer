import * as THREE from "three"
import { InteractionManager } from "three.interactive"
import type { EffectComposer } from "three-stdlib"
import { Animator } from "../components"
import { WebGLRendererParameters } from "three"
import { Clock } from '../components';
export interface BaseConfig {
  hello: boolean
  gl: WebGLRendererParameters
  autoAdaptMobile: boolean
}

class Base {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  container: HTMLElement
  animator: Animator
  interactionManager: InteractionManager
  composer: EffectComposer | null
  clock: Clock
  constructor(sel = "#sketch", config: Partial<BaseConfig> = {}) {
    const { gl = {} } = config
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    )

    camera.position.z = 1
    this.camera = camera

    const scene = new THREE.Scene()
    this.scene = scene

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      ...gl,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    this.renderer = renderer

    const container = document.querySelector(sel) as HTMLElement
    container?.appendChild(renderer.domElement)
    this.container = container

    const animator = new Animator(this)
    this.animator = animator

    const interactionManager = new InteractionManager(
      this.renderer,
      this.camera,
      this.renderer.domElement
    )
    this.interactionManager = interactionManager

    this.composer = null

    this.clock = new Clock(this)
    this.init()
  }
  update(fn: any) {
    this.animator.add(fn)
  }
  init() {
    this.update(() => {
      this.interactionManager.update()
    })

    this.animator.update()
  }
  render() {
    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
  destroy() {
    // scene
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose()

        Object.values(child.material).forEach((value: any) => {
          if (value && typeof value.dispose === "function") {
            value.dispose()
          }
        })
      }
    })

    // renderer
    this.renderer.dispose()
  }
}

export { Base }
