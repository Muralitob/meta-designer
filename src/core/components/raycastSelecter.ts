import { Raycaster } from "three";
import { Base } from "../base";
import { Component } from "./component";
import * as THREE from 'three'
class RaycastSelecter extends Component {
	raycaster: Raycaster;
	constructor(base: Base) {
		super(base)

		const raycaster = new Raycaster()
		this.raycaster = raycaster
	}

	getInterSects(targets = this.container.children) {
		console.log('targets', targets)
		this.raycaster.setFromCamera(this.base.interactionManager.mouse, this.base.camera)
		const intersects = this.raycaster.intersectObjects(targets, true);
		return intersects;
	}

	getFirstIntersect(targets = this.container.children) {
		const intersects = this.getInterSects(targets)
		const result = intersects[0]
		if (!result || !result.face) {
			return null
		}
		return result
	}

	// 选中点击物时
	onChooseIntersect(target: THREE.Object3D) {
		const intersect = this.getFirstIntersect();
		if (!intersect) {
			return null;
		}
		const object = intersect.object;
		return target === object ? intersect : null;
	}

	// 选中物包含某个点击物时
	onChooseInclude(target: THREE.Object3D) {
		const targets = this.getInterSects();
		const includedTarget = targets.find((item) => item.object === target);
		return includedTarget ? includedTarget : null;
	}
}

export { RaycastSelecter }