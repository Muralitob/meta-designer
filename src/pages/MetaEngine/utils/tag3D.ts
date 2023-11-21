import {
  CSS3DObject,
  CSS3DRenderer,
  CSS3DSprite,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export function createLabelDiv(data: any, FC: (d: any) => string) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'label';
  labelDiv.innerHTML = FC(data);
  return labelDiv;
}

export function createWarningTag(data: any, FC: (d: any) => string, callback: () => void) {
  const labelDiv = createLabelDiv(data, FC);
  labelDiv.style.pointerEvents = 'auto';
  labelDiv.addEventListener('click', function () {
    callback && callback();
  });
  labelDiv.style.pointerEvents = 'none'; //避免HTML标签遮挡三维场景的鼠标事件
  var label = new CSS3DObject(labelDiv);
  label.scale.set(0.004, 0.004, 0.004); //根据相机渲染范围控制HTML 3D标签尺寸
  return label; //返回CSS3模型标签
}

export function tag3DSprite(name: string) {
  var div = document.createElement('div');
  div.innerHTML = name;
  div.classList.add('tag');
  var label = new CSS3DSprite(div);
  div.style.pointerEvents = 'none';
  label.scale.set(0.2, 0.2, 0.2);
  label.rotateY(Math.PI / 2);
  return label;
}

export function labelRenderer(canvas: HTMLCanvasElement) {
  var labelRenderer = new CSS3DRenderer();
  labelRenderer.setSize(canvas.width, canvas.height);
  labelRenderer.domElement.style.position = 'absolute';
  // 相对标签原位置位置偏移大小
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.left = '0px';
  // 设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(labelRenderer.domElement);
  return labelRenderer;
}
