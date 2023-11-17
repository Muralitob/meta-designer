import { useCallback } from 'react';
import './index.less';

export const graphicGroups = [
  {
    name: '房间相关',
    show: true,
    list: [
      {
        name: '墙体',
        icon: 'wall',
        id: 'wall',
        data: {
          width: 200,
          height: 20,
          itemType: 'wall',
          name: 'deviceRect',
          image: new URL('@public/wall.svg', import.meta.url).href,
        },
      },
      {
        name: '门',
        icon: 'door',
        id: 'door',
        data: {
          width: 100,
          height: 20,
          name: 'deviceRect',
          itemType: 'door',
          image: new URL('@public/door.svg', import.meta.url).href,
        },
      },
      {
        name: '灯光',
        icon: 'light',
        id: 'light',
        data: {
          width: 40,
          height: 40,
          name: 'rectangle',
          itemType: 'light',
          image: new URL('@public/light.svg', import.meta.url).href,
        },
      },
    ],
  },
  {
    name: '机器设备',
    show: true,
    list: [
      {
        name: '机柜',
        icon: 'cabinet',
        id: 'cabinet',
        data: {
          width: 60,
          height: 120,
          itemType: 'cabinet',
          name: 'rectangle',
          image: new URL('@public/cabinet.svg', import.meta.url).href,
        },
      },
      {
        name: '空调',
        icon: 'air-conditioning',
        id: 'air-conditioning',
        data: {
          width: 170,
          height: 90,
          itemType: 'air-conditioning',
          name: 'rectangle',
          image: new URL('@public/air-conditioning.svg', import.meta.url).href,
        },
      },
      {
        name: 'UPS空调',
        icon: 'ups-air-conditioning',
        id: 'ups-air-conditioning',
        data: {
          width: 50,
          height: 40,
          itemType: 'ups-air-conditioning',
          name: 'rectangle',
          image: new URL('@public/ups-air-conditioning.svg', import.meta.url).href,
        },
      },
      {
        name: 'UPS电源',
        icon: 'ups',
        id: 'ups',
        data: {
          width: 60,
          height: 100,
          itemType: 'ups',
          name: 'rectangle',
          image: new URL('@public/ups.svg', import.meta.url).href,
        },
      },
      {
        name: '温湿度传感器',
        icon: 'th-sensor',
        id: 'th-sensor',
        data: {
          width: 40,
          height: 40,
          itemType: 'th-sensor',
          name: 'rectangle',
          image: new URL('@public/th-sensor.svg', import.meta.url).href,
        },
      },
      {
        name: '电柜',
        icon: 'electric-box',
        id: 'electric-box',
        data: {
          width: 80,
          height: 80,
          itemType: 'electric-box',
          name: 'rectangle',
          image: new URL('@public/electric-box.svg', import.meta.url).href,
        },
      },
    ],
  },
];
const Icons = () => {
  const onDragStart = useCallback((e: DragEvent, data: any) => {
    e.dataTransfer?.setData('Meta2d', JSON.stringify(data));
  }, []);

  return (
    <div className="aside">
      <div className="graphics">
        {graphicGroups.map((group) => {
          return (
            <div>
              <div className="title">{group.name}</div>
              <div className="group-list">
                {group.list.map((item) => {
                  const iconUrl =  new URL(`../../../../../public/${item.icon}.svg`, import.meta.url).href
                  console.log('iconUrl', iconUrl);
                  return (
                    <div
                      className="graphic"
                      draggable
                      onDragStart={(e) => onDragStart(e, item.data)}
                    >
                      <img src={iconUrl} alt="" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Icons;
