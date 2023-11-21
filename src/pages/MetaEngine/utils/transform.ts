import { Pen } from '@meta2d/core';
import { chunk, find, flatten, groupBy } from 'lodash';
import DeviceENUM from './DeviceENUM';

export type RoomItemType = keyof typeof DeviceENUM;
export type PenValue = Pen3D | null | undefined
//允许的误差范围
const extra = 0.5;

export interface Pen3D extends Pen {
  status: string;
  depth: number;
  position: [number, number, number];
  rotation: [number, number, number];
  origin2DInfo: Pen;
  itemType: string;
  typeId?: string;
  holes?: Pen3D[];
  //是否是外墙
  exteriorWall?: boolean
}

//分类
export function categorizeData<T extends string>(
  pens: Pen3D[] = [],
  scale: number,
): Record<T, Pen3D[]> {
  let lineData: Pen3D[] = [];
  pens = pens ?? [];
  pens = pens.filter((item) => {
    if (item.name !== 'line') {
      return true;
    } else {
      if (!item.isRuleLine) {
        lineData.push(item);
        return false;
      }
    }
  });
  let groupNodesData = groupBy(pens, 'itemType');
  Object.keys(groupNodesData).map((type) => {
    const key = type as RoomItemType
    groupNodesData[type] = groupNodesData[key].map((item: any) => {
      return formatItem(item, DeviceENUM[key].height, scale );
    });
  });
  //根据lineData处理墙体上的门数据
  if (lineData.length) {
    const wall = groupNodesData.wall;
    const door = groupNodesData.door;
    lineData.map((line) => {
      let anchors = line.anchors;
      let prev = anchors![0];
      let next = anchors![1];

      let targetWall: Pen3D | null | undefined = find(wall, { id: prev.connectTo });
      let targetDoor = find(door, { id: next.connectTo });
      if (!targetDoor && !targetDoor) {
      } else if (targetWall && targetDoor) {
        targetWall.holes = targetWall.holes ?? [];
        targetWall.holes.push(targetDoor!);
      } else {
        targetWall = find(wall, { id: next.connectTo });
        const targetDoor = find(door, { id: prev.connectTo });
        targetWall!.holes = targetWall!.holes ?? [];
        targetWall!.holes.push(targetDoor!);
      }
    });
  }
  let newData = { ...groupNodesData } as Record<T, Pen3D[]>;
  return newData;
}

//格式化-从2D转换成3D需要的数据
export function formatItem(item: Pen3D, height: number, scale: number, ) {
  item.origin2DInfo = { ...item };
  item.rotation = [0, -((item.rotate || 0) / 180) * Math.PI, 0];
  //meta2d的xywh按scale动态变化的，默认需要100%的数据
  item.x = item.x! / scale;
  item.y = item.y! / scale;
  item.width = item.width! / scale;
  item.height = item.height! / scale;
  item.position = [
    item.x! / 100 + item.width! / 100 / 2,
    height / 2 + 0.005,
    item.y! / 100 + item.height! / 100 / 2,
  ];
  item.status = 'resolved';
  item.depth = item.height! / 100;
  item.height = height;
  item.width = item.width! / 100;
  return item;
}

export function getRoomPath(wallData: Pen3D[]) {
  let path: [number, number][] = [];
  wallData.map((wall) => {
    if (wall.exteriorWall) {
      const width = wall?.width || 0
      const position = wall.position
      if (wall.rotation[1] == 0) {
        path.push([-width / 2 + position[0], position[2]]);
        path.push([width / 2 + position[0], position[2]]);
      } else {
        path.push([position[0], width / 2 + position[2]]);
        path.push([position[0], -width / 2 + position[2]]);
      }
    }
  });
  //消除点偏移的影响
  //2. 根据点数据排序,顺序由入栈的第一面墙的第二个点决定
  let chunked = chunk(path, 2);
  let chunked2 = chunk(path, 2);
  let adjustedChunked = [chunked[0]];
  let pointer = adjustedChunked[0][1];
  let cacheIndex: Record<string, number> = {
    '0': 1,
  };
  for (let j = 0; j < 50; j++) {
    for (let i = 0; i < chunked2.length; i++) {
      let item = chunked[i];
      let r1 = checkClosePoint(pointer, item[0]);
      let r2 = checkClosePoint(pointer, item[1]);
      if ((r1 || r2) && !cacheIndex[i]) {
        adjustedChunked.push(item);
        if (r1) pointer = item[1];
        if (r2) pointer = item[0];
        cacheIndex[i] = 1;
      }
    }
  }
  chunked = adjustedChunked;
  let result = [];
  if (chunked[0]) {
    result.push(chunked[0]);
  }
  let current = result.length;
  let searched: number[] = [];
  while (current <= chunked.length) {
    for (let i = 1; i < chunked.length; i++) {
      if (!searched.includes(i)) {
        let point = chunked[current - 1][1];
        let [leftP, rightP] = chunked[i];
        let leftDeltaX = Math.abs(leftP[0] - point[0]);
        let leftDeltaY = Math.abs(leftP[1] - point[1]);
        if (leftDeltaX < extra && leftDeltaY < extra) {
          result.push([leftP, rightP]);
          chunked[i] = [leftP, rightP];
          searched.push(i);
        }
        let rightDeltaX = Math.abs(rightP[0] - point[0]);
        let rightDeltaY = Math.abs(rightP[1] - point[1]);
        if (rightDeltaX < extra && rightDeltaY < extra) {
          result.push([rightP, leftP]);
          chunked[i] = [rightP, leftP];
          searched.push(i);
        }
      }
    }
    current++;
  }
  path = flatten(result);
  if (path[path.length - 1]) {
    path[0] = path[path.length - 1];
  }
  let xDelta = Math.abs(path[1][0] - path[0][0]);
  let yDelta = Math.abs(path[1][1] - path[1][0]);
  if (xDelta < extra) {
    path[1][0] = path[0][0];
  }
  if (yDelta < extra) {
    path[1][1] = path[0][1];
  }
  for (let i = 2; i < path.length; i += 2) {
    swapXY(i, path);
  }
  return path;
}

function swapXY(i: number, path: [number, number][]) {
  path[i] = path[i - 1];
  const [currentX, currentY] = path[i];
  const [nextX, nextY] = path[i + 1];
  let xDelta = Math.abs(currentX - nextX);
  let yDelta = Math.abs(currentY - nextY);
  if (xDelta < extra) {
    path[i + 1][0] = currentX;
  }
  if (yDelta < extra) {
    path[i + 1][1] = currentY;
  }
}

export function checkClosePoint(p1: [number, number], p2: [number, number]) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  let xDelta = Math.abs(x1 - x2);
  let yDelta = Math.abs(y1 - y2);
  if (xDelta < extra && yDelta < extra) {
    return true;
  }
  return false;
}

export function calculateCenterPoint(points: [number, number][]) {
  const sumX = points.reduce((sum, point) => sum + point[0], 0);
  const sumY = points.reduce((sum, point) => sum + point[1], 0);
  const centerX = sumX / points.length;
  const centerY = sumY / points.length;
  return [centerX, centerY];
}

export function transformCustomSkinData(data: string[]) {
  const result = data.reduce((obj: Record<string, string>, url) => {
    const key = url.split('/').slice(-2, -1)[0];
    obj[key] = url;
    return obj;
  }, {});

  return result as {
    front: string;
    back: string;
    top: string;
    side: string;
  };
}
