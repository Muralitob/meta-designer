import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

export function createLabelDiv(data: any, FC: (d: any) => string) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'label';
  labelDiv.innerHTML = FC(data);
  return labelDiv;
}

function create2DObject(labelDiv: HTMLDivElement) {
  const label2d = new CSS2DObject(labelDiv);
  label2d.center.set(0, 0);
  label2d.layers.set(0);
  return label2d;
}

//展示你可滚动内容label
export function createScrollLabel(data: any, FC: (d: any) => string) {
  const labelDiv = createLabelDiv(data, FC);
  let scrollContent: HTMLDivElement = labelDiv.querySelector('#scroll-content')!;
  scrollContent.style.pointerEvents = 'auto';
  return create2DObject(labelDiv);
}

//展示无特殊交互label
export function createLabel(data: any, FC: (d: any) => string) {
  const labelDiv = createLabelDiv(data, FC);
  return create2DObject(labelDiv);
}

//展示服务器详情label
export function createDetailLabel(data: any, FC: (d: any) => string, callback: () => void) {
  const labelDiv = createLabelDiv(data, FC);
  let btn: HTMLButtonElement | null = labelDiv.querySelector('#tag-link-btn');
  if (btn) {
    btn.style.pointerEvents = 'auto';
    btn.addEventListener('click', function () {
      callback && callback();
    });
  }
  return create2DObject(labelDiv);
}

//展示报错标签label
export function createServerErrorTag(data: any, FC: (d: any) => string, callback: () => void) {
  const labelDiv = createLabelDiv(data, FC);
  labelDiv.addEventListener('click', function () {
    callback && callback();
  });
  return create2DObject(labelDiv);
}

export function labelRenderer(canvas: HTMLCanvasElement) {
  var labelRenderer = new CSS2DRenderer();
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
