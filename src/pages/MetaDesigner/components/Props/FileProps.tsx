import { ColorPicker, Form, InputNumber, Switch } from "antd"
import { Color } from "antd/es/color-picker/color"
import { useEffect, useState } from "react"
export default function FileProps(){
  const [options, setOptions] = useState({
    grid: false,
    gridSize: 20,
    gridRotate: undefined,
    gridColor: "#e2e2e2",
    rule: true,
    ...(window.meta2d ? window.meta2d.getOptions() : {}),
  })
  function handleChangeOptions(param: string, data: unknown) {
    setOptions((prev) => {
      return {
        ...prev,
        [param]: data,
      }
    })
  }

  useEffect(() => {
    const meta2d = window.meta2d
    if (meta2d) {
      console.log(meta2d)
      meta2d.setOptions(options)
      meta2d.store.patchFlagsTop = true
      meta2d.render()
    }
  }, [options, window.meta2d])
  
  return (
    <div className="file-props">
      <h3>图纸</h3>
      <Form>
        <Form.Item label={"网格"}>
          <Switch
            checked={options.grid}
            onChange={(checked) => handleChangeOptions("grid", checked)}
          />
        </Form.Item>
        <Form.Item label={"网格大小"}>
          <InputNumber
            value={options.gridSize}
            onChange={(checked) => handleChangeOptions("gridSize", checked)}
          />
        </Form.Item>
        <Form.Item label={"网格颜色"}>
          <ColorPicker
            value={options.gridColor}
            onChange={(value: Color) =>
              handleChangeOptions("gridColor", value.toRgbString())
            }
          />
        </Form.Item>
      </Form>
    </div>
  )
}
