import * as THREE from "three";

import type { Base } from "../base/base";
import { Component } from "../components/component";

import CameraControlsImpl from "camera-controls";

class CameraControls extends Component {
  controls: CameraControlsImpl
  constructor(base: Base) {
    super(base);

    CameraControlsImpl.install({ THREE });

    const cameraControls = new CameraControlsImpl(base.camera, base.renderer.domElement);
    this.controls = cameraControls
  }

  update(time: number): void {
    // console.log('asdasdasd');
    this.controls.update(this.base.clock.deltaTime)
  }
}

export { CameraControls }