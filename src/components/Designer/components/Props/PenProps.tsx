import { useSelections } from '@/store/selection';
import { Checkbox, ColorPicker, Divider, Form, Input, InputNumber, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const { TextArea } = Input
export interface IPenProps {
  renderPropsList?: Record<string, any>
}
const PenProps = ({ renderPropsList = {} }: IPenProps) => {
  const [rect, setRect] = useState<Record<string, any>>({});
  const [pen, setPen] = useState<Record<string, any>>({});
  const [, setFresh] = useState(0)
  const penRef = useRef({})
  const selections = useSelections((state) => state.selections);
  useEffect(() => {
    const getPen = () => {
      const _pen = selections.pen;
      if (_pen.globalAlpha == undefined) {
        _pen.globalAlpha = 1;
      }
      const _rect = window.meta2d.getPenRect(_pen);
      console.log('_pen', _pen);
      if (_pen.id !== pen.id) {
        _pen.fontSize = 32
        setPen(_pen);
        penRef.current = _pen
        setRect(_rect);
        setFresh(Math.random() * (+new Date()))
      }
    };
    selections.pen.id && getPen();
  }, [selections.pen]);

  const changeValue = (prop: string, data: unknown) => {
    const v: any = { id: pen.id };
    v[prop] = data;
    setPen((prev) => {
      return {
        ...prev,
        [prop]: data,
      };
    });
    window.meta2d.setValue(v, { render: true });
  };

  const changeRect = (prop: string, data: number | null) => {
    let v: Partial<Record<string, any>> = { id: pen.id as string };
    v[prop] = data;

    setRect((prev) => {
      return {
        ...prev,
        [prop]: data,
      };
    });
    window.meta2d.setValue(v, { render: true });
  };
  return (
    <div className="pen-props">
      <h3>图元</h3>
      <Divider />
      <Form {...layout}>
        <h4 className="text-dark font-semibold text-base">配置</h4>
        {
          renderPropsList[pen.itemType] && renderPropsList[pen.itemType](changeValue, pen)
        }
        <Divider />
        <h4 className="text-dark font-semibold text-base">位置属性</h4>

        <Form.Item label={'X'}>
          <InputNumber onChange={(num) => changeRect('x', num)} value={rect.x} />
        </Form.Item>
        <Form.Item label={'Y'}>
          <InputNumber onChange={(num) => changeRect('y', num)} value={rect.y} />
        </Form.Item>
        <Form.Item label={'长度'}>
          <InputNumber onChange={(num) => changeRect('width', num)} value={rect.width} />
        </Form.Item>
        <Form.Item label={'宽度'}>
          <InputNumber onChange={(num) => changeRect('height', num)} value={rect.height} />
        </Form.Item>
        <Form.Item label={'旋转'}>
          <InputNumber onChange={(num) => changeValue('rotate', num)} value={pen.rotate} />
        </Form.Item>
        <Divider />
        <h4 className="text-dark font-semibold text-base">样式</h4>
        <Form.Item label={'背景颜色'}>
          <ColorPicker
            value={pen.background ?? 'rgba(0,0,0,1)'}
            format="rgb"
            onChange={(value) => changeValue('background', value.toRgbString())}
          />
        </Form.Item>
        <Divider />
        <h4 className="text-dark font-semibold text-base">字体</h4>
        <Form.Item label={'字体大小'}>
          <InputNumber onChange={(num) => changeRect('fontSize', num)} value={pen.fontSize} />
        </Form.Item>
        <Form.Item label={'字体颜色'}>
          <ColorPicker
            value={pen.color ?? 'rgba(0,0,0,1)'}
            format="rgb"
            onChange={(value) => changeValue('color', value.toRgbString())}
          />
        </Form.Item>
        <Form.Item label={'加粗'}>
          <Checkbox checked={pen.fontWeight === 700} onChange={(e) => {
            const val = e.target.checked
            changeValue('fontWeight', val ? 700 : 500)
          }}></Checkbox>
        </Form.Item>
        <Form.Item label={'字体背景颜色'}>
          <ColorPicker
            value={pen.textBackground ?? 'rgba(0,0,0,0)'}
            format="rgb"
            onChange={(value) => changeValue('textBackground', value.toRgbString())}
          />
        </Form.Item>
        <Form.Item label={'文本内容'}>
          <TextArea onChange={(e) => changeValue('text', e.target.value)} value={pen.text} />
        </Form.Item>
        <Form.Item label={'水平偏移'}>
          <InputNumber onChange={(num) => changeValue('textLeft', num)} value={pen.textLeft} />
        </Form.Item>
        <Form.Item label={'垂直偏移'}>
          <InputNumber onChange={(num) => changeValue('textTop', num)} value={pen.textTop} />
        </Form.Item>
        <Form.Item label={'垂直对齐'}>
          <Select
            onChange={(val) => changeValue('textBaseline', val)}
            value={pen.textBaseline}
            options={[{
              value: 'top',
              label: '顶部对齐'
            }, {
              value: 'middle',
              label: '居中对齐'
            }, {
              value: 'bottom',
              label: '底部对齐'
            }]} />
        </Form.Item>
        <Form.Item label={'水平对齐'}>
          <Select
            onChange={(val) => changeValue('textAlign', val)}
            value={pen.textAlign}
            options={[{
              value: 'left',
              label: '左对齐'
            }, {
              value: 'center',
              label: '左对齐'
            }, {
              value: 'right',
              label: '右对齐'
            }]} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default React.memo(PenProps)
