import { Base } from "../base";
import { Component } from "./component";
import { GLTFLoader, OBJLoader, DRACOLoader } from 'three-stdlib';
import * as THREE from 'three';
import { isEmpty } from "lodash";
export type ResoureType = 'texture' | 'objModel' | 'gltfModel'
export interface ResourceItem {
  name: string;
  type: ResoureType;
  path: string | string[];
}

export type ResourceList = ResourceItem[]
export interface Loaders {
  textureLoader: THREE.TextureLoader;
  objLoader: OBJLoader,
  glftLoader: GLTFLoader
}

export interface AMConfig {
  draco: boolean
}

class AssetManager extends Component {
  loaders: Partial<Loaders>
  resourceList: ResourceList
  items: Record<string, any>
  loaded: number;
  totalLoad: number;
  constructor(base: Base, resourceList: ResourceList, config: AMConfig = {
    draco: false
  }) {
    super(base)
    this.items = {}
    this.resourceList = resourceList
    this.loaders = {}
    this.loaded = 0
    this.totalLoad = resourceList.length
    this.setLoaders(config)
    this.startLoading()
  }

  setLoaders(config: AMConfig) {
    this.loaders.textureLoader = new THREE.TextureLoader()
    const glftLoader = new GLTFLoader()
    this.loaders.glftLoader = glftLoader
    this.loaders.objLoader = new OBJLoader()

    if (config.draco) {
      const dracoLoader = new DRACOLoader()
      this.loaders.glftLoader.setDRACOLoader(dracoLoader)
      dracoLoader.setDecoderPath('/it-fronted/draco/')
      dracoLoader.setDecoderConfig({ type: "js" });
      dracoLoader.preload();
    }
  }
  startLoading() {
    this.resourceList.map((resource) => {
      switch (resource.type) {
        case 'texture':
          this.loaders.textureLoader?.load(resource.path as string, (file) => {
            console.log('file', file);
            this.resourceLoaded(resource, file)
          }, undefined, (err) => {
            console.error(err)
          })
          break;
        case 'gltfModel':
          this.loaders.glftLoader?.load(resource.path as string, (file) => {
            this.resourceLoaded(resource, file)
          })
          break;
        case 'objModel':
          this.loaders.objLoader?.load(resource.path as string, (file) => {
            console.log('file', file)
            this.resourceLoaded(resource, file)
          })
          break;
        default:
          break;
      }
    })
  }
  resourceLoaded(resource: ResourceItem, file: any) {
    this.items[resource.name] = file;
    this.loaded += 1;
    if (this.isLoaded) {
      this.emit("ready");
    }
  }

  get loadProgress() {
    return this.loaded / this.totalLoad
  }

  get isLoaded() {
    return this.loaded === this.totalLoad
  }
}

export { AssetManager }
