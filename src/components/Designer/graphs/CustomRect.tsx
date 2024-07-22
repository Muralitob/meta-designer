// 1. 编写图形绘画函数
// 其中，calculative.worldRect为canvas的世界坐标。更多信息，参考 “架构” - “概要” 和 Pen 相关文档

import { Pen, Point } from '@meta2d/core';

// 1. 编写图形绘画函数
// 其中，calculative.worldRect为canvas的世界坐标。更多信息，参考 “架构” - “概要” 和 Pen 相关文档
// 形参 ctx 仅仅在 downloadSvg 时有值
export function DeviceRect(pen: Pen, ctx?: CanvasRenderingContext2D): Path2D {
  const path = !ctx ? new Path2D() : ctx;

  const { x, y, width, height } = pen.calculative!.worldRect!;
  console.log('x, y, width, height', x, y, width, height);
  path.moveTo(x!, y!);
  path.lineTo(x! + width!, y!);
  // path.moveTo(x! + width! / 2, y!);
  path.lineTo(x! + width!, y! + height!);
  path.lineTo(x!, y! + height!);

  path.closePath();
  if (path instanceof Path2D) return path;
}

export function linkItemAnchors(pen: Pen) {
  const anchors: Point[] = [];
  anchors.push({
    id: '1',
    penId: pen.id,
    x: 0.5,
    y: 0,
  });

  pen.anchors = anchors;
}

export function nonAnchors(pen: Pen) {
  const anchors: Point[] = [];
  anchors.push({});

  pen.anchors = anchors;
}
