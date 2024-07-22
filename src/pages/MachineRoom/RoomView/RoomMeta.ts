import * as ECore from '@/core'
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CSS2DObject, EffectComposer, OutlinePass, RenderPass, ShaderPass, SMAAPass } from 'three-stdlib';
import resources from './resources';
import CameraControlsImpl from "camera-controls";
class RoomMeta extends ECore.Base {
  cameraControls: CameraControlsImpl;
  OrbitControls: OrbitControlsImpl
  am: ECore.AssetManager
  composer: EffectComposer
  outlinePass: OutlinePass;
  width: number;
  height: number;
  tag2D: ECore.Tag2D;
  rayArr: any[]
  raycastSelecter: ECore.RaycastSelecter
  //供内部调用
  callBackList?: Record<string, Function>;

  constructor(sel = "#sketch", callBackList?: Record<string, Function>) {
    super(sel, {
      gl: {
        preserveDrawingBuffer: true,
        alpha: true,
      }
    });
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.camera.position.set(-30, 30, 40);
    const resizer = new ECore.Resizer(this)
    resizer.listenForResize()
    this.rayArr = []
    this.callBackList = callBackList

    const { controls } = new ECore.OrbitControls(this);

    this.OrbitControls = controls
    this.camera.far = 200
    this.camera.updateProjectionMatrix()

    const rs = new ECore.RaycastSelecter(this)
    this.raycastSelecter = rs

    const cameraControls = new ECore.CameraControls(this).controls
    cameraControls.verticalDragToForward = false
    cameraControls.maxDistance = 40
    cameraControls.minDistance = 10
    cameraControls.setTarget(0, 0, 0)
    cameraControls.mouseButtons.left = CameraControlsImpl.ACTION.OFFSET
    cameraControls.mouseButtons.right = CameraControlsImpl.ACTION.ROTATE
    this.cameraControls = cameraControls

    this.am = new ECore.AssetManager(this, resources as ECore.ResourceItem[], {
      draco: true
    })

    const tag2D = new ECore.Tag2D(this)
    this.tag2D = tag2D

    this.composer = new EffectComposer(this.renderer);
    /**描边设置 */
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera,
    );
    this.update(() => {
      this.composer && this.composer.render();
      TWEEN.update();
      tag2D.labelRenderer.render(this.scene, this.camera)
    })
  }
}

export default RoomMeta