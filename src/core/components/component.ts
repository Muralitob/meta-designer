import * as THREE from "three";
import mitt, { type Emitter } from "mitt";
import type { Base } from "../base/base";

class Component<T extends Base = Base> {
  base: T;
  emitter: Emitter;
  container: THREE.Scene;
  constructor(base: T) {
    this.base = base;
    this.base.update((time: number) => this.update(time));

    this.emitter = mitt();

    this.container = this.base.scene;
  }
  addExisting() {
  }
  update(time: number) {
  }
  // 监听事件
  on(type: string, handler: any) {
    this.emitter.on(type, handler);
  }
  // 移除事件
  off(type: string, handler: any) {
    this.emitter.off(type, handler);
  }
  // 触发事件
  emit(type: string, event: any = {}) {
    this.emitter.emit(type, event);
  }
}

export { Component };
