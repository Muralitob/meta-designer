import * as TWEEN from "@tweenjs/tween.js"
import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  NearestFilter,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Raycaster,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
// FXAA抗锯齿Shader
import { CSG } from "three-csg-ts"
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer"
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js"
import { createLabel, labelRenderer as css2LabelRenderer } from "./utils/tag2D"
import {
  labelRenderer as css3LabelRenderer,
} from "./utils/tag3D"
import { Pen3D, transformCustomSkinData } from "./utils/transform"
interface MaterialType extends Material {
  originOpacity: number
}
const textureLoader = new TextureLoader()
interface cacheTextureItem {
  preset?: Texture[]
  custom?: Record<string, Texture[]>
}

export interface MetaObject extends Object3D {
  itemType: string;
  handleClick?: () => void
}

export interface MetaMesh extends Mesh {
  itemType?: string;
  handleClick?: () => void
}

class MetaEngine {
  container: Element
  width: number
  height: number
  //渲染器
  renderer: WebGLRenderer | null
  // 场景
  scene: Scene | null
  //相机
  camera: PerspectiveCamera | null
  // 相机轨道控制器
  tag2d: any
  css2Renderer: CSS2DRenderer | null
  css3Renderer: CSS3DRenderer | null
  outlinePass: OutlinePass
  centerPosition: Vector3
  //贴图缓存
  textureMap: Map<string, Texture[]>
  animationList: Function[]
  controls: Partial<OrbitControls> | null
  composer: EffectComposer | null
  requestId: number
  skinTextureMap: Partial<Record<string, cacheTextureItem>>
  constructor(canvas: HTMLCanvasElement) {
    this.textureMap = new Map()
    this.container = canvas
    this.renderer = new WebGLRenderer({ canvas })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap // default PCFShadowMap
    this.animationList = []
    this.scene = new Scene()
    this.width = canvas.width
    this.height = canvas.height
    this.centerPosition = new Vector3(0, 0, 0)
    this.requestId = 0
    this.skinTextureMap = {}
    this.css2Renderer = css2LabelRenderer(canvas)
    this.css3Renderer = css3LabelRenderer(canvas)

    this.camera = new PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    )
    this.camera!.position.set(0, 20, 15)
    this.camera!.lookAt(0, 0, 0)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls!.maxDistance = 30
    this.composer = new EffectComposer(this.renderer)
    /**描边设置 */
    this.outlinePass = new OutlinePass(
      new Vector2(this.width, this.height),
      this.scene,
      this.camera
    )
    this._initEffectComposet()
    this._createLight()
  }

  private _initEffectComposet() {
    //添加后处理-EffectComposet
    const renderPass = new RenderPass(this.scene!, this.camera!)
    this.composer!.addPass(renderPass)
    const outputPass = new OutputPass()
    this.composer!.addPass(outputPass)

    this.outlinePass.edgeStrength = 10
    this.outlinePass.edgeGlow = 1
    this.outlinePass.edgeThickness = 4
    this.outlinePass.pulsePeriod = 10

    this.outlinePass.visibleEdgeColor.set(new Color("#208CFF"))
    this.outlinePass.hiddenEdgeColor.set(new Color("#208CFF"))

    this.composer!.addPass(this.outlinePass)
    /**FXAA抗锯齿 */
    //获取.setPixelRatio()设置的设备像素比
    const pixelRatio = this.renderer!.getPixelRatio()
    const FXAAPass = new ShaderPass(FXAAShader)
    FXAAPass.uniforms.resolution.value.x = 1 / (this.width * pixelRatio)
    FXAAPass.uniforms.resolution.value.y = 1 / (this.height * pixelRatio)
    this.composer!.addPass(FXAAPass)
  }

  private _createLight() {
    // 创建环境光
    var ambientLight = new AmbientLight(0xffffff, 1) // 设置白色环境光，强度为0.2
    ambientLight.position.set(10, 2, 10) // 设置光源位置
    this.scene!.add(ambientLight)
    // 创建平行光
    var directionalLight1 = new DirectionalLight(new Color("#3392FF"), 8) // 设置白色平行光，强度为0.5
    directionalLight1.position.set(6.14, 16.461, 3.1859) // 设置光源位置
    this.scene!.add(directionalLight1)
    directionalLight1.castShadow = true // default false
    directionalLight1.shadow.mapSize.width = 512 // default
    directionalLight1.shadow.mapSize.height = 512 // default
    directionalLight1.shadow.camera.near = 0.5 // default
    directionalLight1.shadow.camera.far = 500 // default
    var directionalLight2 = new DirectionalLight(0xffffff, 6) // 设置白色平行光，强度为0.5
    directionalLight2.position.set(-11.527, 1.7, 3) // 设置光源位置
    directionalLight2.castShadow = true // default false
    directionalLight2.shadow.mapSize.width = 512 // default
    directionalLight2.shadow.mapSize.height = 512 // default
    directionalLight2.shadow.camera.near = 0.5 // default
    directionalLight2.shadow.camera.far = 500 // default
    this.scene!.add(directionalLight2)
  }

  createLight(lights?: undefined | any[]) {
    console.log("lights", lights)
    lights = lights ?? [
      {
        x: 10,
        z: 4,
        y: 10,
        color: "#3392FF",
        lightStength: 1,
      },
    ]
    function generateTexture() {
      const canvas = document.createElement("canvas")
      canvas.width = 2
      canvas.height = 2

      const context = canvas.getContext("2d")!
      context.fillStyle = "white"
      context.fillRect(0, 1, 2, 1)

      return canvas
    }
    function createL(color: string) {
      console.log("colorcolor", color)
      const intensity = 200

      const light = new PointLight(color, intensity, 20)
      light.castShadow = true
      light.shadow.bias = -0.005 // reduces self-shadowing on double-sided objects

      let geometry = new SphereGeometry(0.3, 12, 6)
      let material = new MeshBasicMaterial({ color: color })
      material.color.multiplyScalar(intensity)
      let sphere = new Mesh(geometry, material)
      light.add(sphere)

      const texture = new CanvasTexture(generateTexture())
      texture.magFilter = NearestFilter
      texture.wrapT = RepeatWrapping
      texture.wrapS = RepeatWrapping
      texture.repeat.set(1, 4.5)

      geometry = new SphereGeometry(2, 32, 8)
      material = new MeshPhongMaterial({
        side: DoubleSide,
        alphaMap: texture,
        alphaTest: 0.5,
      })

      sphere = new Mesh(geometry, material)
      sphere.castShadow = true
      sphere.receiveShadow = true
      // light.add(sphere);

      return light
    }
    lights.map((light) => {
      const { lightStength = 1, lightColor = 0xffffff, x, y, z = 3 } = light
      // 创建点光源
      var pointLight = new PointLight(0xffffff, lightStength, 2) // 设置白色环境光，强度为0.2
      pointLight = createL(lightColor)
      pointLight.position.set(x / 100, z, y / 100) // 设置光源位置
      pointLight.castShadow = true // default false
      pointLight.shadow.bias = -0.005 // reduces self-shadowing on double-sided objects
      this.scene!.add(pointLight)
    })
    // 创建环境光
    var ambientLight = new AmbientLight(new Color("white"), 1) // 设置白色环境光，强度为0.2
    ambientLight.position.set(10, 2, 10) // 设置光源位置
    this.scene!.add(ambientLight)
    // 创建平行光
    var directionalLight1 = new DirectionalLight(new Color("#3392FF"), 8) // 设置白色平行光，强度为0.5
    directionalLight1.position.set(6.14, 16.461, 3.1859) // 设置光源位置
    this.scene!.add(directionalLight1)
    directionalLight1.castShadow = true // default false
    directionalLight1.shadow.mapSize.width = 512 // default
    directionalLight1.shadow.mapSize.height = 512 // default
    directionalLight1.shadow.camera.near = 0.5 // default
    directionalLight1.shadow.camera.far = 500 // default
    var directionalLight2 = new DirectionalLight(0xffffff, 6) // 设置白色平行光，强度为0.5
    directionalLight2.position.set(-11.527, 1.7, 3) // 设置光源位置
    directionalLight2.castShadow = true // default false
    directionalLight2.shadow.mapSize.width = 512 // default
    directionalLight2.shadow.mapSize.height = 512 // default
    directionalLight2.shadow.camera.near = 0.5 // default
    directionalLight2.shadow.camera.far = 500 // default
    this.scene!.add(directionalLight2)
  }

  //无交互
  create2DLabel(
    data: any,
    position: [number, number, number],
    FC: (d: any) => string
  ) {
    const tag = createLabel(data, FC)
    tag.position.set(...position)
    this.scene!.add(tag)
    return tag
  }

  loadMeshTexture(imgUrl: string, success?: () => void) {
    let sieds = ["side", "side", "top", "top", "front", "back"]
    const _texture: any[] = []
    let stored: Record<string, Texture> = {}
    sieds.map((text) => {
      let texture = null
      if (stored[text]) {
        texture = stored[text]
      } else {
        texture = textureLoader.load(require(imgUrl))
        stored[text] = texture
      }
      _texture!.push(texture)
    })
    return _texture
  }

  //创建通用立方体模型
  createCommonBox(
    { width, height, position, rotation, depth, itemType }: Pen3D,
    success?: () => void
  ) {
    let curTexture = this.textureMap.get(`${itemType}`)
    let sieds = ["side", "side", "top", "top", "front", "back"]
    if (!curTexture) {
      curTexture = []
      let stored: Record<string, Texture> = {}
      sieds.map((text) => {
        let texture = null
        if (stored[text]) {
          texture = stored[text]
        } else {
          texture = textureLoader.load(
            new URL(
              `../../../public/textures/${itemType}-${text}.jpg`,
              import.meta.url
            ).href,
            function (xhr) {
              success && success()
            }
          )
          stored[text] = texture
        }
        curTexture!.push(texture)
      })
      this.textureMap.set(`${itemType}`, curTexture!)
    }
    let materialList: MeshLambertMaterial[] = []
    materialList = curTexture!.map((texture, index) => {
      return new MeshLambertMaterial({
        map: texture,
        opacity: 1,
        name: sieds[index],
      })
    })
    const CommonBoxGeometry = new BoxGeometry(width, height, depth)
    const box: Mesh & Record<string, any> = new Mesh(
      CommonBoxGeometry,
      materialList
    )
    box.castShadow = true //default is false
    box.receiveShadow = true //default
    box.rotation.set(...rotation)
    box.position.set(...position)
    box.width = width
    box.height = height
    box.depth = depth
    box.itemType = itemType
    box.layers.enable(1)
    this.scene!.add(box)

    return box
  }

  //创建地板
  createFloor(width: number, height: number, path?: any[]) {
    let curTexture = this.textureMap.get("floor")
    if (!curTexture) {
      const texture = textureLoader.load(
        new URL(`../../../public/textures/floor.jpg`, import.meta.url).href
      )
      curTexture = [texture]
      this.textureMap.set("floor", curTexture)
    }

    curTexture[0].wrapS = RepeatWrapping // 水平方向重复
    curTexture[0].wrapT = RepeatWrapping // 垂直方向重复
    let floorGeometry = new PlaneGeometry(width, height)
    var floorMaterial = new MeshBasicMaterial({
      side: DoubleSide,
      map: curTexture[0],
      opacity: 1,
    })
    let floor = new Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = Math.PI / 2
    floor.name = "floor-" + Math.random()
    const heartShape = new Shape()
    if (path?.length) {
      heartShape.moveTo(path[0][0], path[0][1])
      for (let i = 1; i < path.length; i++) {
        heartShape.lineTo(path[i][0], path[i][1])
      }
      heartShape.closePath()
      const sphere = new Mesh(new ShapeGeometry(heartShape))
      sphere.rotation.x = Math.PI / 2
      sphere.position.y = 0.001
      sphere.updateMatrix()
      floor.updateMatrix()
      let result = CSG.intersect(floor, sphere)
      this.scene!.add(result)
      return result
    } else {
      this.scene!.add(floor)
      return floor
    }
  }

  //创建房屋墙壁
  createRoomWall(wallData: Record<string, any>) {
    const doorsResult: Pen3D[] = []
    const wallResult: Pen3D[] = []
    wallData.forEach(
      (
        data: Pen3D & {
          depth: number
          holes: Pen3D[]
        }
      ) => {
        const { wall, doors } = this.createWall(data)
        wallResult.push(wall)
        doorsResult.push(...doors)
        this.scene!.add(wall)
      }
    )
    return {
      doorsResult,
      wallResult,
    } as const
  }

 //创建门
 createDoor({ width, height, position, rotation }: Pen3D) {
  let curTexture = this.textureMap.get(`door`);
  if (!curTexture) {
    curTexture = [
      new TextureLoader().load(
        'https://th.bing.com/th/id/R.87a3596f5afcd4daa03493a35d01e4ce?rik=2sz0myob1F2fAA&riu=http%3a%2f%2fmap.cgahz.com%2fuploads%2fallimg%2f181108%2f1-1Q10QQ6250-L.jpg&ehk=zYM1gp9gezGGptjlTECvWitqPWZQVrLfL1VURNTzsBg%3d&risl=&pid=ImgRaw&r=0',
      ),
    ];
    this.textureMap.set('door', curTexture);
  }
  var doorGeometry = new BoxGeometry(width, height, 0.2);
  var material = new MeshBasicMaterial({
    color: new Color('#1E50FF'),
    opacity: 0.4,
    transparent: true,
  });
  let radian = Math.abs((rotation[1] / Math.PI) * 180);
  console.log('radian', radian);
  //旋转的问题导致需要对位置进行调整
  position =
    radian / 90 > 0
      ? [position[0], position[1], position[2] - width! / 2]
      : [position[0] - width! / 2, position[1], position[2]];
  var doorMesh = new Mesh(doorGeometry, material);
  doorMesh.position.set(...position);
  doorMesh.rotation.set(...rotation);
  // 创建门的容器，并将门添加到容器中
  const doorContainer = new Object3D();
  doorContainer.add(doorMesh);
  /**
   * 设置物体绕Y轴旋转实现动画，
   * 这里需要注意的是物体旋转是以自身中心进行旋转的，
   * 所以这里需要把几何体THREE.BoxGeometry平移自身宽度的一半，
   * 这样物体中心就是THREE.BoxGeometry几何体的边缘。
   */
  doorGeometry.translate(width! / 2, 0, 0);
  // 设置门的初始位置和旋转中心点
  doorMesh.name = 'door';
  this.scene!.add(doorMesh);
  return doorMesh;
}


  //创建墙体
  createWall({ width, height, depth, position, rotation, holes }: Pen3D) {
    var wallGeometry = new BoxGeometry(width, height, 0.2)
    var wallMaterial = new MeshLambertMaterial({
      color: new Color("#EDF6FF"),
      opacity: 1,
      transparent: false,
    })
    var wall = new Mesh(wallGeometry, wallMaterial)
    wall.rotation.set(...rotation)
    wall.position.set(...position)
    let result: any = wall
    wall.castShadow = true //default is false
    wall.receiveShadow = true //default
    //批量开洞
    const doors: MetaMesh[] = []
    let wallItem: MetaMesh = wall
    if (holes && holes.length) {
      result.updateMatrix()
      holes.map((cur) => {
        const sphere = new Mesh(new BoxGeometry(cur.width, cur.height, 0.2))
        sphere.position.set(...cur.position)
        sphere.rotation.set(...cur.rotation)
        let door = this.createDoor(cur)
        doors.push(door)
        sphere.updateMatrix()
        result = CSG.subtract(result, sphere)
      })
      wallItem = result 
    }
    wall.name = "wall-" + Math.random()
    return {
      wall: wallItem,
      doors,
    }
  }

  toggleMeshShow(children: (Mesh | CSS2DObject | CSS3DObject)[], visible: boolean, time: number = 1000) {
    children.map((child) => {
      if (child.type == "Mesh") {
        const childObject = child as Mesh
        if (Array.isArray(childObject.material)) {
          childObject.material.map((m) => {
            const material = m as MaterialType
            material.originOpacity = material.originOpacity
              ? material.originOpacity
              : material.opacity
            new TWEEN.Tween({ opacity: !visible ? material.originOpacity : 0 })
              .to({ opacity: !visible ? 0 : material.originOpacity }, time)
              .onStart(() => {
                if (visible) {
                  this.scene!.add(child)
                  child.visible = true
                }
                //动画开始：允许透明opacity属性才能生效,needsUpdate为true，告知需要更新，不要缓存
                material.transparent = true
                material.needsUpdate = true
              })

              .onUpdate(function (obj) {
                material.opacity = obj.opacity
              })
              .onComplete(() => {
                if (!visible) {
                  this.scene!.remove(child)
                }
                material.transparent = false
                material.needsUpdate = true
              })
              .start()
          })
        } else {
          const material = childObject.material as MaterialType
          material.originOpacity = material.originOpacity
            ? material.originOpacity
            : material.opacity
          new TWEEN.Tween({ opacity: !visible ? material.originOpacity : 0 })
            .to({ opacity: !visible ? 0 : material.originOpacity }, time)
            .onStart(() => {
              //动画开始：允许透明opacity属性才能生效
              if (visible) {
                this.scene!.add(childObject)
                childObject.visible = true
              }
              material.transparent = true
              material.needsUpdate = true
            })
            .onUpdate(function (obj) {
              if (childObject.name == "light-wall") childObject.visible = visible
              material.opacity = obj.opacity
            })
            .onComplete(() => {
              childObject.visible = visible
              if (!visible) {
                this.scene!.remove(childObject)
              }
            })
            .start()
        }
      }

      if (child.type == "Object3D") {
        const childObject3D = child as unknown as (CSS2DObject | CSS3DObject)
        new TWEEN.Tween({ opacity: visible ? 0 : 1 })
          .to({ opacity: visible ? 1 : 0 }, 400)
          .onUpdate(function (obj) {
            //动态更新div元素透明度
            childObject3D.element.style.opacity = obj.opacity + ''
          })
          .start()
      }
    })
  }

  showCabientDetail({ size, position, servers }: any) {
    const { w, h, d } = size
    const { px, py, pz } = position
    var cabinet: Record<string, any> = {}
    let cabinetList = []
    let thickness = 0.05
    // // 机柜的后
    var backTexture = textureLoader.load(
      new URL(`../../../public/textures/cabinet-back.jpg`, import.meta.url).href
    )
    var geometry = new BoxGeometry(w - thickness, h, thickness)
    var meterial = new MeshLambertMaterial({
      map: backTexture,
      transparent: true,
      side: DoubleSide,
    })

    var back: Mesh & Record<string, any> = new Mesh(geometry, meterial)

    back.position.x = px
    back.position.y = py + thickness
    back.position.z = pz - d / 2 + thickness
    back.container = cabinet

    // this.scene!.add(back);
    cabinet.back = back
    cabinetList.push(back)
    var rightFrontTexture = textureLoader.load(
      new URL(
        `../../../public/textures/cabinet-detail-side-front.jpg`,
        import.meta.url
      ).href
    )
    var leftFrontTexture = textureLoader.load(
      new URL(
        `../../../public/textures/cabinet-detail-left-side-front.jpg`,
        import.meta.url
      ).href
    )
    var sideTexture = textureLoader.load(
      new URL(
        `../../../public/textures/cabinet-detail-side.jpg`,
        import.meta.url
      ).href
    )
    // 机柜的左、右
    var geometry = new BoxGeometry(d, h, thickness)
    var frontMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      map: sideTexture,
    })
    var rightSideMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      map: rightFrontTexture,
    })
    var leftSideMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      map: leftFrontTexture,
    })
    // 创建灰色材质
    var grayMaterial = new MeshLambertMaterial({ color: new Color("#020410") })
    var rightmaterials = [
      leftSideMaterial, // 右侧面
      rightSideMaterial, // 左侧面
      grayMaterial, // 顶部面
      grayMaterial, // 底部面
      frontMaterial, // 正面
      frontMaterial, // 背面
    ]
    var leftmaterials = [
      rightSideMaterial, // 左侧面
      leftSideMaterial, // 右侧面
      grayMaterial, // 顶部面
      grayMaterial, // 底部面
      frontMaterial, // 正面
      frontMaterial, // 背面
    ]
    var left: Mesh & Record<string, any> = new Mesh(geometry, leftmaterials)
    var right: Mesh & Record<string, any> = new Mesh(geometry, rightmaterials)

    left.position.x = px + w / 2 - thickness / 2
    left.position.y = py + thickness
    left.position.z = pz
    left.rotation.y = -Math.PI / 2

    right.position.x = px - w / 2 + thickness / 2
    right.position.y = py + thickness
    right.position.z = pz
    right.rotation.y = -Math.PI / 2

    left.container = cabinet

    right.container = cabinet

    cabinet.left = left
    cabinet.right = right
    cabinetList.push(left)
    cabinetList.push(right)
    // 机柜的底部、顶部
    var geometry = new BoxGeometry(w, thickness * 2, d)
    var meterial = new MeshLambertMaterial({
      color: new Color("blue"),
      transparent: true,
    })

    var topFrontTexture = textureLoader.load(
      new URL(
        `../../../public/textures/cabinet-detail-top-front.jpg`,
        import.meta.url
      ).href
    )
    var topFrontMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      map: topFrontTexture,
    })
    var bottomFrontTexture = textureLoader.load(
      new URL(
        `../../../public/textures/cabinet-detail-bottom-front.jpg`,
        import.meta.url
      ).href
    )
    var bottomFrontMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      map: bottomFrontTexture,
    })
    var grayMaterial = new MeshLambertMaterial({ color: new Color("#263441") })
    var topmaterials = [
      grayMaterial, // 左侧面
      grayMaterial, // 右侧面
      grayMaterial, // 顶部面
      grayMaterial, // 底部面
      topFrontMaterial, // 正面
      grayMaterial, // 背面
    ]
    var bottommaterials = [
      grayMaterial, // 左侧面
      grayMaterial, // 右侧面
      grayMaterial, // 顶部面
      grayMaterial, // 底部面
      bottomFrontMaterial, // 正面
      grayMaterial, // 背面
    ]

    var top: Mesh & Record<string, any> = new Mesh(geometry, topmaterials)
    var bottom: Mesh & Record<string, any> = new Mesh(geometry, bottommaterials)

    top.position.x = px
    top.position.y = h + thickness * 2
    top.position.z = pz

    bottom.position.x = px
    bottom.position.y = py - h / 2
    bottom.position.z = pz
    top.container = cabinet
    bottom.container = cabinet

    cabinet.top = top
    cabinet.bottom = bottom
    cabinetList.push(top)
    cabinetList.push(bottom)
    //
    cabinet.servers = []
    servers.map((server: any) => {
      let serverBox = this.createService({
        size,
        position,
        server,
        thickness,
        data: server,
      })
      cabinet.servers.push(serverBox)
    })
    cabinetList = [...cabinetList, ...cabinet.servers]
    const group = new Group()
    Object.keys(cabinet).map((item: any) => {
      if (item == "servers") {
        group.add(...cabinet[item])
      } else {
        group.add(cabinet[item])
      }
    })
    let LightCircleGeometry = new PlaneGeometry(2, 2)
    var LightCircleMaterial = new MeshBasicMaterial({
      color: new Color("#57E5FF"), //设置光圈颜色
      map: textureLoader.load(
        new URL(`../../../public/textures/light-circle.jpg`, import.meta.url)
          .href
      ),
      transparent: true, //使用背景透明的png贴图，注意开启透明计算
      side: DoubleSide, //双面可见
    })
    var LightCircleMesh = new Mesh(LightCircleGeometry, LightCircleMaterial)
    LightCircleMesh.rotation.x = -Math.PI / 2
    LightCircleMesh.position.x = px
    LightCircleMesh.position.y = -0.1
    LightCircleMesh.position.z = pz
    let RulerGeometry = new PlaneGeometry(0.1, 2)
    var RulerMaterial = new MeshBasicMaterial({
      color: new Color("#57E5FF"), //设置光圈颜色
      map: textureLoader.load(
        new URL(`../../../public/textures/u-ruler.jpg`, import.meta.url).href
      ),
      transparent: true, //使用背景透明的png贴图，注意开启透明计算
      side: DoubleSide, //双面可见
    })
    var RulterMesh = new Mesh(RulerGeometry, RulerMaterial)
    RulterMesh.position.z = pz + d / 2
    RulterMesh.position.x = px - 0.5
    RulterMesh.position.y = py + 0.05
    RulterMesh.name = "u-ruler"
    // this.scene!.add(ruler);
    group.add(RulterMesh)
    new TWEEN.Tween({ scale: 1, opacity: 1 })
      .to({ scale: 1.5, opacity: 0 }, 1000)
      .repeat(Infinity)
      .delay(500)
      .onUpdate(function (obj) {
        LightCircleMesh.material.opacity = obj.opacity
        LightCircleMesh.scale.set(obj.scale, obj.scale, obj.scale)
      })
      .start()
    group.add(LightCircleMesh)
    this.scene!.add(group)
    return {
      cabinetObj: cabinet,
      cabinetGroup: group,
    }
  }

  createService({ size, position, c, name, server, thickness, data }: any) {
    var grayMaterial = new MeshLambertMaterial({ color: new Color("#263441") })
    const { w, h, d } = size
    const { px, py, pz } = position
    const { uNum, uPosition } = server
    let uheight = h / 42
    let boxHeight = uheight * uNum
    var geometry = new BoxGeometry(w - thickness * 2, boxHeight, d - thickness)
    const { machineType, alarmData } = data
    var bottomFrontTexture = textureLoader.load(
      new URL(
        `../../../public/textures/${
          machineType == 2
            ? `network-service-${alarmData ? "error" : "work"}`
            : `service-${uNum}u-${alarmData ? "error" : "work"}`
        }.jpg`,
        import.meta.url
      ).href
    )
    var bottomFrontMaterial = new MeshLambertMaterial({
      side: DoubleSide,
      transparent: true,
      map: bottomFrontTexture,
    })
    var bottommaterials = [
      grayMaterial, // 左侧面
      grayMaterial, // 右侧面
      grayMaterial, // 顶部面
      grayMaterial, // 底部面
      bottomFrontMaterial, // 正面
      grayMaterial, // 背面
    ]
    var serviceBox: Mesh & Record<string, any> = new Mesh(
      geometry,
      bottommaterials
    )
    serviceBox.position.x = px
    serviceBox.position.y =
      thickness + boxHeight / 2 + (uPosition - 1) * uheight
    serviceBox.position.z = pz + thickness / 2
    serviceBox.brand = data.brand
    serviceBox.serviceId = data.id
    serviceBox.ip = data.ip
    serviceBox.layers.enable(2)
    serviceBox.detailData = data
    serviceBox.active = false
    serviceBox.alarmData = alarmData
    serviceBox.boxType = "service"
    serviceBox.originpz = serviceBox.position.z
    serviceBox.activepz = serviceBox.position.z + 0.3
    serviceBox.boxWidth = w - thickness * 2
    serviceBox.boxHeight = boxHeight
    serviceBox.boxDepth = d
    this.scene!.add(serviceBox)
    return serviceBox
  }

  // 相机动画函数，从A点飞行到B点，A点表示相机当前所处状态
  // pos: 三维向量Vector3，表示动画结束相机位置
  // target: 三维向量Vector3，表示相机动画结束lookAt指向的目标观察点
  createCameraTween(endPos: Vector3, endTarget: Vector3, duration = 1000) {
    new TWEEN.Tween({
      // 不管相机此刻处于什么状态，直接读取当前的位置和目标观察点
      x: this.camera?.position.x,
      y: this.camera?.position.y,
      z: this.camera?.position.z,
      tx: this.controls?.target?.x,
      ty: this.controls?.target?.y,
      tz: this.controls?.target?.z,
    })
      .to(
        {
          // 动画结束相机位置坐标
          x: endPos.x,
          y: endPos.y,
          z: endPos.z,
          // 动画结束相机指向的目标观察点
          tx: endTarget.x,
          ty: endTarget.y,
          tz: endTarget.z,
        },
        duration
      )
      .onUpdate((obj) => {
        const { x = 0, y = 0, z = 0, tx = 0, ty = 0, tz = 0 } = obj
        // 动态改变相机位置
        this.camera!.position.set(x, y, z)
        // 动态计算相机视线
        this.camera?.lookAt(tx, ty, tz)
        this.controls?.target?.set(tx, ty, tz)
        this.controls?.update!() //内部会执行.lookAt()
      })
      .start()
  }

  clearAllMesh() {
    if (this.scene) {
      this.scene!.traverse((v: any) => {
        if (v.type === "Mesh") {
          v.geometry.dispose()
          if (v.material) {
            if (v.material.length) {
              v.material.map((item: Material) => {
                item.dispose()
              })
            } else {
              v.material.dispose()
            }
          }
        } else if (v.type == "Group") {
          v.children.map((item: Mesh) => {
            if (item.type == "Object3D") {
              v.remove(item)
            }
          })
        }
      })
    }
    while (this.scene!.children.length > 0) {
      this.scene!.remove(this.scene!.children[0])
    }
  }

  beforeDestroy() {
    if (this.scene) {
      this.clearAllMesh()
      this.renderer!.dispose()
      this.renderer!.forceContextLoss()
      this.renderer = null
      this.scene!.clear()
      this.composer = null
      this.css2Renderer = null
      this.css3Renderer = null
      this.scene = null
      this.camera = null
      this.controls = null
      cancelAnimationFrame(this.requestId)
    }
  }

  getCanvasRelativePosition(event: MouseEvent) {
    const rect = this.container.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) * this.width) / rect.width,
      y: ((event.clientY - rect.top) * this.height) / rect.height,
    }
  }

  setPickPosition(event: MouseEvent): Vector2 {
    let pickPosition = new Vector2()
    const pos = this.getCanvasRelativePosition(event)
    pickPosition.x = (pos.x / this.width) * 2 - 1
    pickPosition.y = (pos.y / this.height) * -2 + 1
    return pickPosition
  }
  raycasterConfirm(
    e: any,
    observer: any[]
  ): MetaObject | null {
    let pickPosition = this.setPickPosition(e)
    const raycaster = new Raycaster()
    raycaster.setFromCamera(pickPosition, this.camera!)
    const intersects = raycaster.intersectObjects(observer, true)
    if (intersects.length > 0) {
      const result = intersects[0].object as MetaObject
      return result
    }
    return null
  }

  // 连续渲染
  animate() {
    if (this.composer) {
      this.composer.render()
    }
    this.css3Renderer && this.css3Renderer.render(this.scene!, this.camera!)
    this.css2Renderer && this.css2Renderer.render(this.scene!, this.camera!)
    this.requestId = requestAnimationFrame(() => {
      TWEEN.update()
      this.animationList.map((fn) => fn())
      this.animate()
    })
  }
}

export default MetaEngine
