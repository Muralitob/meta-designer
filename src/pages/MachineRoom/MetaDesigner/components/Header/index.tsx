import {
  LeftOutlined,
  PlayCircleOutlined,
  RightOutlined,
  SaveOutlined,
  ShrinkOutlined,
  SyncOutlined,
} from "@ant-design/icons"
import { Divider, message, Tooltip } from "antd"
import { useEffect, useState } from "react"
import "./index.less"
import { useNavigate } from "react-router-dom"
export default () => {
  const navigate = useNavigate()
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.meta2d) {
        clearInterval(timer)
        // 获取初始缩放比例
        scaleSubscriber(window.meta2d.store.data.scale)
        // 监听缩放
        // @ts-ignore
        meta2d.on("scale", scaleSubscriber)
      }
    }, 200)
  }, [])
  const scaleSubscriber = (val: number) => {
    setScale(Math.round(val * 100))
  }
  const onRedo = () => {
    console.log("window.meta2d", window.meta2d.redo)
    window.meta2d.redo()
  }

  const onUndo = () => {
    window.meta2d.undo()
  }

  const onScaleDefault = () => {
    window.meta2d.scale(1)
    window.meta2d.centerView()
  }

  const onScaleWindow = () => {
    window.meta2d.fitView()
  }

  function handleSave() {
    let data = window.meta2d.data()
    message.success("保存成功")
    localStorage.setItem("metaData", JSON.stringify(data))
  }

  function handleView() {
    let data = window.meta2d.data()
    localStorage.setItem("metaData", JSON.stringify(data))
    navigate('/room')
  }

  return (
    <div className="app-header">
      <Tooltip title="撤回">
        <LeftOutlined onClick={onUndo} />
      </Tooltip>
      <Tooltip title="重做">
        <RightOutlined onClick={onRedo} />
      </Tooltip>
      <Divider type="vertical" />
      <div className="px-4 leading-10 w-10">{scale}%</div>
      <Tooltip title="100%视图">
        <SyncOutlined onClick={onScaleDefault} />
      </Tooltip>
      <Tooltip title="窗口大小">
        <ShrinkOutlined onClick={onScaleWindow} />
      </Tooltip>
      <Divider type="vertical" />
      <Tooltip title="保存">
        <SaveOutlined onClick={handleSave} />
      </Tooltip>
      <Tooltip title="预览3D效果" >
      <PlayCircleOutlined onClick={handleView}/>
      </Tooltip>
    </div>
  )
}
