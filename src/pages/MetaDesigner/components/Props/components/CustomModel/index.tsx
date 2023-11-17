import DeviceENUM from '@/pages/MetaRoom/MetaEngine/utils/DeviceENUM';
import { transformCustomSkinData } from '@/pages/MetaRoom/MetaEngine/utils/transform';
import { useEffect, useState } from 'react';
import { graphicGroups } from '../../../Graphics';
import './index.less';
interface IProps {
  itemType: string;
  data: string[];
}
export default ({ itemType, data }: IProps) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [depth, setDepth] = useState(100);
  let _coverENUM = transformCustomSkinData(data ?? []);
  useEffect(() => {
    if (!itemType) return;
    let result = findItemDataByType(itemType);
    let k = itemType as keyof typeof DeviceENUM;
    let height3d = DeviceENUM[k].height * 100;
    setWidth(result.width!);
    setHeight(height3d);
    setDepth(result.height!);
    function findItemDataByType(itemType: string) {
      let list = graphicGroups[1].list;
      let result: Partial<(typeof list)[number]['data']> = {};
      list.map((item) => {
        if (item.data.itemType == itemType) {
          result = item.data;
        }
      });
      return result;
    }
  }, [itemType, data]);
  return (
    <div className="model">
      <div
        className="box-3d"
        style={{
          transform: `rotateX(-33.5deg) rotateY(-45deg) scaleX(${width / 100}) scaleY(${
            height / 100
          }) scaleX(${depth / 100})`,
        }}
      >
        <div
          className="item top"
          style={{
            backgroundImage: `url('${_coverENUM.top}')`,
          }}
        ></div>
        <div
          className="item bottom"
          style={{
            backgroundImage: `url('${_coverENUM.top}')`,
          }}
        ></div>
        <div
          className="item front"
          style={{
            backgroundImage: `url('${_coverENUM.front}')`,
          }}
        ></div>
        <div
          className="item back"
          style={{
            backgroundImage: `url('${_coverENUM.back}')`,
          }}
        ></div>
        <div
          className="item left"
          style={{
            backgroundImage: `url('${_coverENUM.side}')`,
          }}
        ></div>
        <div
          className="item right"
          style={{
            backgroundImage: `url('${_coverENUM.side}')`,
          }}
        >
          right
        </div>
      </div>
    </div>
  );
};
