import { CSS2DObject, CSS2DRenderer } from 'three-stdlib';
import { Component } from "./component";
import { Base } from '../base';

export interface Tag2DConfig {
  width: number;
  height: number;
  depth: number;
  position: THREE.Vector3;
}

class Tag2D extends Component {
  labelRenderer: CSS2DRenderer
  constructor(base: Base) {
    super(base)
    var labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    // 相对标签原位置位置偏移大小
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);
    this.labelRenderer = labelRenderer
  }

  createLabel(htmlString: string, options: {
    onClick?: () => void
  } = {}) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.innerHTML = htmlString
    if (options.onClick) {
      labelDiv.style.pointerEvents = 'auto';
      labelDiv.addEventListener('click', () => {
        options.onClick()
      })
    }
    const label2d = new CSS2DObject(labelDiv);
    label2d.center.set(0, 0);
    label2d.layers.set(0);
    return label2d;
  }

  //当标签移出视野时，隐藏标签
  hideOutScreenLabel(label2d: CSS2DObject, option?: {
    deltaX: number;
    deltaY: number;
  }) {
    const defaultOption = {
      deltaX: 0,
      deltaY: 0.05
    }
    option = {
      ...defaultOption,
      ...option
    }
    const rect = label2d.element.getBoundingClientRect()
    const { deltaX, deltaY } = option
    // 检查标签是否在窗口内
    if (rect.top < window.innerHeight * deltaY || rect.bottom > window.innerHeight * (1 - deltaY * 2)) {
      label2d.element.style.display = 'none';

    } else if (rect.left < window.innerWidth * deltaX || rect.right > window.innerWidth * (1 - deltaX * 2)) {
      label2d.element.style.display = 'none';
    }
    else {
      label2d.element.style.display = 'block';
    }
  }
}

export { Tag2D }