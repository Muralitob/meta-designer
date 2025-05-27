import { useSelections } from "@/store/selection"
import { Meta2d, Pen } from "@meta2d/core"
import { message } from "antd"
import { useEffect, useRef, useState } from "react"
import { DeviceRect, linkItemAnchors, nonAnchors } from "../../utils/CustomRect"
import Menu from "../Menu"
import { MetaPen } from "../Props/PenProps"
export default function View() {
  const cacheActivedRef = useRef<Pen[] | undefined>([])
  const anchorStart = useRef("")
  const [actived, setActived] = useState<Pen[]>([{}])
  const select = useSelections((state) => state.select)
  useEffect(() => {
    const meta2d = new Meta2d("meta2d", {
      rule: true,
    })
    meta2d.register({ deviceRect: DeviceRect })
    meta2d.registerAnchors({ deviceRect: linkItemAnchors })
    meta2d.registerAnchors({ rectangle: nonAnchors })
    meta2d.on("active", active)
    meta2d.on("inactive", inactive)
    meta2d.on("connectLine", (obj) => {
      setTimeout(() => {
        if (anchorStart.current == "") {
          anchorStart.current = obj.pen.itemType
        } else {
          if (anchorStart.current == obj.pen.itemType) {
            anchorStart.current = ""
            message.warning("只有门和墙之间可以连接")
            meta2d.delete([obj.line])
          } else {
            anchorStart.current = ""
          }
        }
      })
    })
    
    const data = localStorage.getItem("metaData")
    if (data) {
      meta2d.open(JSON.parse(data))
    }
    window.meta2d = meta2d
  }, [])

  const active = (pens?: MetaPen[]) => {
    setActived(pens!)
    cacheActivedRef.current = pens
    select(pens)
  }
  const inactive = () => {
    if (cacheActivedRef.current && cacheActivedRef.current.length == 1) {
      window.meta2d.setValue({
        id: cacheActivedRef.current[0]?.id,
        lineWidth: 1,
      })
    }
    setActived([])
    select()
  }
  return (
    <Menu actived={actived} setActived={setActived}>
      <div className="main">
        <div className="meta2d" id="meta2d"></div>
      </div>
    </Menu>
  )
}
