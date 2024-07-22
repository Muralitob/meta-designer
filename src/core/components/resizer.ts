import * as THREE from "three";

import { Component } from "./component";
import { Base } from "../base/base";

import type { EffectComposer } from "three-stdlib";
import { CSS2DObject, CSS2DRenderer } from 'three-stdlib';
export interface ResizerConfig {
  autoAdaptMobile: boolean;
}

class Resizer extends Component {
  enabled: boolean;
  autoAdaptMobile: boolean;
  constructor(base: Base, config: Partial<ResizerConfig> = {}) {
    super(base);

    this.enabled = true;

    const { autoAdaptMobile = false } = config;

    this.autoAdaptMobile = autoAdaptMobile;

    if (this.autoAdaptMobile) {
      this.resize();
    }
  }
  get aspect() {
    return window.innerWidth / window.innerHeight;
  }
  resizeRenderer(renderer: THREE.WebGLRenderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }
  resizeComposer(composer: EffectComposer) {
    composer.setSize(window.innerWidth, window.innerHeight);
    if (composer.setPixelRatio) {
      composer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    }
  }
  resizeCamera(camera: THREE.Camera) {
    const { aspect } = this;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }

  resizeCss2dRender(css2Renderer: CSS2DRenderer) {
    css2Renderer.setSize(window.innerWidth, window.innerHeight);
  }

  resize() {
    const { base } = this;
    const { renderer, camera, composer, tag2D } = base;

    // renderer
    this.resizeRenderer(renderer);

    // composer
    if (composer) {
      this.resizeComposer(composer);
    }

    if (tag2D) {
      this.resizeCss2dRender(tag2D.labelRenderer)
    }

    // camera
    this.resizeCamera(camera);

    // mobile
    if (this.autoAdaptMobile) {
      this.adaptMobile();
    }

    this.emit("resize");
  }
  listenForResize() {
    window.addEventListener("resize", () => {
      if (!this.enabled) {
        return;
      }

      this.resize();
    });
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  adaptMobile() {
    const { base } = this;
    const { renderer, camera } = base;

    const width = document.documentElement.clientWidth,
      height = document.documentElement.clientHeight;

    if (width > height) {
      renderer.setSize(width, height);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    } else {
      renderer.setSize(height, width);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = height / width;
        camera.updateProjectionMatrix();
      }
    }
  }
}

export { Resizer };
