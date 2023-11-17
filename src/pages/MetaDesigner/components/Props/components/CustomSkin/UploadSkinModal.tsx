import MetaEngine from '@/pages/MetaRoom/MetaEngine';
import DeviceENUM from '@/pages/MetaRoom/MetaEngine/utils/DeviceENUM';
import MachineRoomAPI from '@/services/machine-room';
import { PlusOutlined } from '@ant-design/icons';
import back from '@public/machine-room/textures/cabinet-back.jpg';
import front from '@public/machine-room/textures/cabinet-front.jpg';
import side from '@public/machine-room/textures/cabinet-side.jpg';
import top from '@public/machine-room/textures/cabinet-top.jpg';
import { Button, Form, message, Modal, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Mesh, MeshLambertMaterial, TextureLoader } from 'three';
import { graphicGroups } from '../../../Graphics';
import sizeENUM from './sizeENUM';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
type TProps = {
  open: boolean;
  itemType: keyof typeof DeviceENUM;
  handleCancel: () => void;
  handleOk: () => void;
};

const defaultSkin = {
  front: front,
  back: back,
  side: side,
  top: top,
};

const textureLoader = new TextureLoader();
export default function UploadSkinModal({ open, handleCancel, handleOk, itemType }: TProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<MetaEngine>();
  const [meshObject, setMeshObject] = useState<Mesh>(null);
  const meshRef = useRef();
  const [form] = Form.useForm();
  async function onFinish(value) {
    try {
      let res = await MachineRoomAPI.uploadCabinetSkin({
        timestamp: +new Date(),
        itemType,
        frontUploadFile: value.front[0].originFileObj,
        backUploadFile: value.back[0].originFileObj,
        topUploadFile: value.top[0].originFileObj,
        sideUploadFile: value.side[0].originFileObj,
      });
      if (res.code == 20000) {
        message.success('上传成功');
        handleOk();
        handleCancel();
        form.resetFields();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error(`上传错误:${error}`);
      console.log('error', error, value);
    }
  }
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
  useEffect(() => {
    const result = findItemDataByType(itemType);
    const height3d = DeviceENUM[itemType].height;
    if (open) {
      let room: MetaEngine | null = null;
      if (roomRef.current) {
        room = roomRef.current;
        room.scene?.remove(meshObject);
        let obj = room.createCommonBox(
          {
            width: result.width! / 100,
            height: height3d,
            position: [0, height3d / 2, 0],
            rotation: [0, 0, 0],
            depth: result.height! / 100,
            itemType,
          },
          () => {},
        );
        setMeshObject(obj);
      } else {
        room = new MetaEngine(canvasRef.current!);
        roomRef.current = room;

        room.camera!.position.set(0, height3d / 2, 3);
        room.camera!.lookAt(0, height3d / 2, 2);
        room.controls!.enablePan = false;
        room.controls!.target!.set(0, height3d / 2, 0);
        room.createLight([
          {
            x: 6.14,
            z: 10.461,
            y: 3.1859,
            color: 0xffffff,
            lightStength: 1,
          },
          {
            x: -11.527,
            z: 1.7,
            y: 3,
            color: 0xffffff,
            lightStength: 1,
          },
        ]);
        let obj = room.createCommonBox(
          {
            width: result.width! / 100,
            height: height3d,
            position: [0, height3d / 2, 0],
            rotation: [0, 0, 0],
            depth: result.height! / 100,
            itemType,
          },
          () => {},
        );
        setMeshObject(obj);
        meshRef.current = obj;
      }
      room.animate();
    } else {
      if (roomRef.current) {
        let room = roomRef.current;
        cancelAnimationFrame(room.requestId);
      }
      form.resetFields();
    }
  }, [open]);

  function changeTexture(type: keyof typeof defaultSkin, info) {
    const file = info.fileList[0];
    let mesh: any;
    roomRef.current!.scene!.children.map((item) => {
      if (item.type == 'Mesh') {
        mesh = item;
      }
    });
    const reader = new FileReader();
    reader.onload = () => {
      const textureUrl = reader.result;
      applySkin(textureUrl as string, type);
    };
    if (file) {
      reader.readAsDataURL(file.originFileObj);
    } else {
      applySkin(defaultSkin[type], type);
    }
  }

  function applySkin(textureUrl: any, type: keyof typeof defaultSkin) {
    meshObject.material = meshObject.material.map((item) => {
      if (item.name == type) {
        const texture = textureLoader.load(textureUrl as string);
        const material = new MeshLambertMaterial({
          map: texture,
          name: item.name,
        });
        item = material;
      }
      return item;
    });
  }
  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const size = sizeENUM[itemType];
  return (
    <Modal width={960} onCancel={handleCancel} title="上传自定义皮肤" footer={false} open={open}>
      <div className="flex">
        <Form form={form} className="flex-1" onFinish={onFinish}>
          <Form.Item required label={'正面贴图'}>
            <Form.Item
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: '不能为空' }]}
              name="front"
            >
              <Upload
                onChange={(info) => changeTexture('front', info)}
                action=""
                accept=".jpg,.png"
                maxCount={1}
                beforeUpload={(file) => false}
                listType="picture-card"
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>

            <div className="mt-3">
              (支持jpg,png,建议尺寸{size.width}*{size.height}px)
            </div>
          </Form.Item>
          <Form.Item required label={'背面贴图'}>
            <Form.Item
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: '不能为空' }]}
              name="back"
            >
              <Upload
                onChange={(info) => changeTexture('back', info)}
                action=""
                accept=".jpg,.png"
                beforeUpload={(file) => false}
                maxCount={1}
                listType="picture-card"
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>

            <div className="mt-3">
              (支持jpg,png,建议尺寸{size.width}*{size.height}px)
            </div>
          </Form.Item>
          <Form.Item required label={'侧面贴图'}>
            <Form.Item
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: '不能为空' }]}
              name="side"
            >
              <Upload
                action=""
                onChange={(info) => changeTexture('side', info)}
                accept=".jpg,.png"
                maxCount={1}
                beforeUpload={(file) => false}
                listType="picture-card"
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>

            <div className="mt-3">
              (支持jpg,png,建议尺寸{size.depth}*{size.height}px)
            </div>
          </Form.Item>
          <Form.Item required label={'顶面贴图'}>
            <Form.Item
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: '不能为空' }]}
              name="top"
            >
              <Upload
                action=""
                onChange={(info) => changeTexture('top', info)}
                beforeUpload={(file) => false}
                accept=".jpg,.png"
                maxCount={1}
                listType="picture-card"
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>
            <div className="mt-3">
              (支持jpg,png,建议尺寸{size.width}*{size.depth}px)
            </div>
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
        <div className="divider w-[1px] mx-4 bg-[#ccc]"></div>
        <div className="w-[400px]">
          <canvas width={400} height={600} ref={canvasRef} id="canvas"></canvas>
        </div>
      </div>
    </Modal>
  );
}
