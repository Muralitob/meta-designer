import Icon from '@/components/Icon';
import { MetaPen } from '@/pages/MetaDesigner';
import MachineRoomAPI from '@/services/machine-room';
import { useMetaStore } from '@/store/meta';
import { CheckOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ColorPicker, Popconfirm, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import CustomModel from '../CustomModel';
import './index.less';
import UploadSkinModal from './UploadSkinModal';
interface IProps {
  onChange: (type: string, value: unknown) => void;
  itemType: string;
  pen: MetaPen;
}
function importAll(r: any) {
  let images: Record<string, any> = {};
  r.keys().map((item: any) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images: Record<string, any> = importAll(
  require.context('@public/machine-room', false, /\.(png|jpe?g|svg)$/),
);
console.log('images', images);

export default ({ itemType, onChange, pen }: IProps) => {
  const [open, setOpen] = useState(false);
  const customSkinSet = useMetaStore((state) => state.customSkinSet);
  const setSkin = useMetaStore((state) => state.setSkin);
  const [colorValue, setColorValue] = useState('');
  const [presetValue, setPresetValue] = useState('');
  const [mode, setMode] = useState('show');
  const [customValue, setCustomValue] = useState('');
  async function getCabinetSkinList() {
    let { data } = await MachineRoomAPI.getCabinetSkinList({
      itemType,
    });
    setSkin(itemType, data.result);
  }
  useEffect(() => {
    if (!pen.skinType) {
      setCustomValue('');
      setColorValue('');
      setPresetValue('');
    }
    if (pen.skinType == 'custom') {
      if (!customSkinSet[itemType]) return;
      let customSkinList = Object.keys(customSkinSet[itemType]);
      if (customSkinList.includes(pen.skin!)) {
        setCustomValue(pen.skin!);
      } else {
        setCustomValue('');
        onChange('skinType', 'preset');
        onChange('skin', '');
        onChange('customSkinData', []);
      }
      setColorValue('');
      setPresetValue('');
    }
    if (pen.skinType == 'preset') {
      setPresetValue(pen.skin!);
      setCustomValue('');
      setColorValue('');
    }
    if (pen.skinType == 'color') {
      setColorValue(pen.skin!);
      setCustomValue('');
      setPresetValue('');
    }
  }, [pen, customSkinSet[itemType]]);

  function findCover(imageUrl: string) {
    const parts = imageUrl.split('/');
    const region = parts[parts.indexOf('front')];
    return region;
  }

  async function handleDeleteSkin(timestamp: string) {
    try {
      let res = await MachineRoomAPI.deleteCabinetSkin({
        timestamp,
        itemType,
      });
      if (res.code == 20000) {
        if (customValue) {
          setCustomValue('');
          onChange('skin', '');
          onChange('skinType', 'preset');
        }
        getCabinetSkinList();
        onChange('customSkinData', []);
      }
    } catch (error) {}
  }

  return (
    <div className="custom-skin">
      <div className="mb-4">
        <div className="mb-2">预设皮肤</div>
        <div className="flex">
          <div
            onClick={() => {
              onChange('skin', '');
              setPresetValue('');
              onChange('skinType', 'preset');
            }}
            className={`skin-item  relative ${
              (pen.skinType == 'preset' || !pen.skinType) && 'border-red-500 border-1 border-solid'
            }`}
          >
            <img className="w-full h-full" src={`${images[itemType + '.svg']}`} alt="" />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2">单色模式</div>
        <div
          className={`w-[38px] h-[38px] ${
            pen.skinType == 'color' && 'border-red-500 border-1 border-solid'
          }`}
        >
          <ColorPicker
            onChange={(value) => {
              onChange('skin', value.toRgbString());
              setColorValue(value.toRgbString());
              onChange('skinType', 'color');
            }}
          />
        </div>
      </div>
      <div>
        <div className="mb-2 flex justify-between">
          <span>上传皮肤</span>
          <span className="cursor-pointer hover:text-blue-600">
            {mode == 'show' ? (
              <Tooltip title="编辑模式">
                <EditOutlined onClick={() => setMode('edit')} />
              </Tooltip>
            ) : (
              <Tooltip title="结束编辑">
                <CheckOutlined onClick={() => setMode('show')} />
              </Tooltip>
            )}
          </span>
        </div>
        <div className="gap-2 flex flex-wrap">
          {Object.keys(customSkinSet[itemType] || {})?.map((item) => {
            let skinArr = customSkinSet[itemType][item];
            let cover = '';
            skinArr.map((str: string) => {
              if (findCover(str) == 'front') {
                cover = str;
              }
            });
            console.log('itemitemitem', item, customSkinSet);
            return (
              <div className="relative">
                {mode == 'edit' && (
                  <Popconfirm
                    title="删除皮肤"
                    description="你确定要删除这套皮肤吗？"
                    onConfirm={() => handleDeleteSkin(item)}
                    okText="是"
                    cancelText="否"
                  >
                    <div className="absolute right-[-4px] top-[-10px] cursor-pointer">
                      <Icon type="icon-shunwangren-cuohao1" />
                    </div>
                  </Popconfirm>
                )}
                <Tooltip
                  overlayClassName="render3d"
                  title={<CustomModel itemType={itemType} data={skinArr} />}
                >
                  <img
                    className={`w-16 h-16 cursor-pointer  ${
                      customValue == item && 'border-red-500 border-1 border-solid'
                    }`}
                    onClick={() => {
                      onChange('skin', item);
                      setCustomValue(item);
                      onChange('skinType', 'custom');
                      onChange('customSkinData', skinArr);
                    }}
                    src={cover}
                    alt="cover"
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
        <div>
          <div
            onClick={() => setOpen(true)}
            className="w-16 h-16 p-4 border-[1px] border-dashed border-black col-center hover:border-primary hover:text-primary cursor-pointer"
          >
            <PlusOutlined />
          </div>
        </div>
      </div>
      <UploadSkinModal
        itemType={itemType}
        open={open}
        handleCancel={() => setOpen(false)}
        handleOk={getCabinetSkinList}
      />
    </div>
  );
};
