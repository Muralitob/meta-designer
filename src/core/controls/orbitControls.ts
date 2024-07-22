import { Base } from "../base";
import { Component } from "../components";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
export interface OrbitControlsConfig {
  enableDamping: boolean;
}
class OrbitControls extends Component {
  controls: OrbitControlsImpl
  constructor(base: Base, config: Partial<OrbitControlsConfig> = {}) {
    super(base)

    const controls = new OrbitControlsImpl(base.camera, base.renderer.domElement)

    this.controls = controls
  }
  update() {
    this.controls.update()
  }
}

export { OrbitControls }
