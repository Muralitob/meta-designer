import { useSelections } from "@/store/selection"
import { Pen } from "@meta2d/core"
import {
  Checkbox,
  Col,
  ColorPicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Slider,
} from "antd"
import React, { useEffect, useState } from "react"
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}
export interface MetaPen extends Pen {
  itemType: string
  rotate?: number
  assetId?: string
  lightColor?: string
  lightStength?: string
  exteriorWall?: boolean
  cabinetNumber?: string
}

export type RectType = ReturnType<typeof window.meta2d.getPenRect>

const noEntity = ["light", "th-sensor"]
export default () => {
  const [rect, setRect] = useState<RectType>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [pen, setPen] = useState<MetaPen | null>(null)
  const selections = useSelections((state) => state.selections)
  useEffect(() => {
    const getPen = () => {
      const _pen = selections.pen as MetaPen
      if (_pen.globalAlpha == undefined) {
        _pen.globalAlpha = 1
      }
      const _rect = window.meta2d.getPenRect(_pen!)
      setPen(_pen)
      setRect(_rect)
    }
    getPen()
  }, [selections.pen?.id])

  const changeValue = (
    prop: keyof Omit<MetaPen, "itemType" | keyof Pen> | "rotate",
    data: unknown
  ) => {
    const v: any = { id: pen?.id }
    v[prop] = data
    setPen((prev) => {
      return {
        ...prev!,
        [prop]: data,
      }
    })
    window.meta2d.setValue(v, { render: true })
  }
  const changeRect = (prop: keyof RectType, data: number | null) => {
    const v: any = { id: pen?.id }
    v[prop] = data
    setRect((prev) => {
      return {
        ...prev,
        [prop]: data,
      }
    })
    window.meta2d.setValue(v, { render: true })
  }
  return (
    <div className="pen-props">
      <h3>图元</h3>
      <Divider />
      <Form {...layout}>
        <h4 className="text-dark font-semibold text-base">配置</h4>
        {pen && pen.itemType == "cabinet" && (
          <Form.Item label={"机柜编号"}>
            <Input
              onChange={(e) => changeValue("cabinetNumber", e.target.value)}
              value={pen.cabinetNumber}
            />
          </Form.Item>
        )}
        {pen && pen.itemType == "th-sensor" && (
          <Form.Item label={"设备ID"}>
            <Input
              onChange={(e) => changeValue("assetId", e.target.value)}
              value={pen.assetId}
            />
          </Form.Item>
        )}
        {pen && pen.itemType == "wall" && (
          <Form.Item label={"是否为外墙"}>
            <Checkbox
              onChange={(e) => {
                changeValue("exteriorWall", e.target.checked)
              }}
              checked={pen.exteriorWall}></Checkbox>
          </Form.Item>
        )}
        {pen && pen.itemType == "light" && (
          <React.Fragment>
            <Form.Item label={"光源颜色"}>
              <ColorPicker
                value={pen.lightColor}
                onChange={(value) =>
                  changeValue("lightColor", value.toRgbString())
                }
              />
            </Form.Item>
            <Form.Item label={"光源强度"}>
              <Row>
                <Col span={12}>
                  <Slider
                    min={1}
                    max={20}
                    step={0.1}
                    onChange={(value) => changeValue("lightStength", value)}
                    value={
                      typeof pen.lightStength === "number"
                        ? pen.lightStength
                        : 0
                    }
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={1}
                    max={20 as unknown as string}
                    step={0.1}
                    style={{ margin: "0 16px" }}
                    value={pen.lightStength || 1}
                    onChange={(value) => changeValue("lightStength", value)}
                  />
                </Col>
              </Row>
            </Form.Item>
          </React.Fragment>
        )}
        <Divider />
        <h4 className="text-dark font-semibold text-base">位置属性</h4>

        <Form.Item label={"X"}>
          <InputNumber
            onChange={(num) => changeRect("x", num)}
            value={rect.x}
          />
        </Form.Item>
        <Form.Item label={"Y"}>
          <InputNumber
            onChange={(num) => changeRect("y", num)}
            value={rect.y}
          />
        </Form.Item>
        {pen && !noEntity.includes(pen.itemType) && (
          <React.Fragment>
            <Form.Item label={"长度"}>
              <InputNumber
                onChange={(num) => changeRect("width", num)}
                value={rect.width}
              />
            </Form.Item>
            <Form.Item label={"宽度"}>
              <InputNumber
                onChange={(num) => changeRect("height", num)}
                value={rect.height}
              />
            </Form.Item>
            <Form.Item label={"旋转"}>
              <InputNumber
                onChange={(num) => changeValue("rotate", num)}
                value={pen.rotate}
              />
            </Form.Item>
          </React.Fragment>
        )}
      </Form>
    </div>
  )
}
