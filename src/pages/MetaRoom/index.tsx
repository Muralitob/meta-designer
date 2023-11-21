import { useEffect, useRef, useState } from "react"
import MetaEngine from "../MetaEngine"
import {
  Pen3D,
  calculateCenterPoint,
  categorizeData,
  getRoomPath,
  RoomItemType,
} from "../MetaEngine/utils/transform"
import { Object3D, Vector3 } from "three"
import * as TWEEN from "@tweenjs/tween.js"
import { Meta2dData } from "@meta2d/core"

const nonInteractiveModel = [
  "ups",
  "electric-box",
  "electric-meter-box",
  "air-conditioning",
  "ups-air-conditioning",
]
function MetaRoom() {
  const selectedObjects = useRef<Object3D[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const roomRef = useRef<MetaEngine>(null)
  const [roomData] = useState(() => {
    let localData = localStorage.getItem("metaData")
    const roomValue: Meta2dData = (localData ? JSON.parse(localData) : {pens: [], scale: 1})
    const pens = roomValue['pens'] as Pen3D[]
    let result = categorizeData<RoomItemType>(
      pens,
      roomValue.scale,
    );
    return result
  })
  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight
    let room: MetaEngine
    if (roomRef.current) {
      room = roomRef.current
    } else {
      room = new MetaEngine(canvasRef.current)
      roomRef.current = room
    }
    // room.createFloor(20, 20, []);
    /**创建无反馈的模型部分 */
    if (roomData.wall) {
      room.createRoomWall(roomData.wall)
      let path = getRoomPath(roomData.wall)
      console.log('path', path, roomData.wall);
      room.createFloor(20, 20, path)
      const centerPoint = calculateCenterPoint(path)
      // 将中心点设置为场景的位置
      room.controls!.target.set(centerPoint[0], 0, centerPoint[1])
      room.centerPosition = new Vector3(centerPoint[0], 0, centerPoint[1])
      room.camera!.position.set(centerPoint[0], 20, centerPoint[1] + 15)
      room.camera!.lookAt(centerPoint[0], 0, centerPoint[1])
    }
    Object.keys(roomData).map((item) => {
      let key = item as keyof typeof roomData
      if (nonInteractiveModel.includes(key) && roomData[key]?.length) {
        roomData[key]?.map((box: any, index: number) => {
          room.createCommonBox({ ...box }, textureLoadSuccess)
        })
      }
    })
    if (roomData["light"]) room.createLight(roomData["light"])

    if (roomData["cabinet"]) {
      roomData["cabinet"].map((box: any, index: number) => {
        let mesh = room.createCommonBox({ ...box }, textureLoadSuccess)
        mesh.cabinetNumber = box.cabinetNumber
        return mesh
      })
    }
  }, [roomData, canvasRef])

  useEffect(() => {
    window.addEventListener("resize", onWindowResize)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick, true)
    window.addEventListener("dblclick", handleDbcClick, true)
    return () => {
      roomRef.current && roomRef.current.beforeDestroy()
      roomRef.current = null
      window.removeEventListener("resize", onWindowResize) //重置窗口尺寸
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick, true)
      window.removeEventListener("dblclick", handleDbcClick, true)
    }
  }, [])

  useEffect(() => {
    if (roomRef.current) {
      roomRef.current.animate();
    }
  }, [roomRef.current]);

  function onWindowResize() {
    const room = roomRef.current
    if (room) {
      room.camera!.aspect = window.innerWidth / window.innerHeight
      //更新摄像机的投影矩阵
      //用于更新摄像机投影矩阵，相机任何参数被改变以后必须被调用
      room.camera!.updateProjectionMatrix()
      //更新渲染器
      room.renderer!.setSize(window.innerWidth, window.innerHeight)
      room.css2Renderer.setSize(window.innerWidth, window.innerHeight)
      room.css3Renderer.setSize(window.innerWidth, window.innerHeight)
      //设置渲染器的像素比
      room.renderer!.setPixelRatio(window.devicePixelRatio)
    }
  }

  function handleClick(e: MouseEvent) {
    const room = roomRef.current
    if (!room) return
    let obj = room.raycasterConfirm(e, room.scene!.children)
    if (obj) {
      if (obj.handleClick) {
        obj.handleClick()
        room.outlinePass.selectedObjects = [obj]
      }
    }
  }

  async function handleDbcClick(e: MouseEvent) {
    const room = roomRef.current
    if (!room) return
    e.stopPropagation() // 阻止事件冒泡
  }

  function handleMouseMove(e: MouseEvent) {
    const outlineType = ["cabinet", "service"]
    const room = roomRef.current
    if (!room) return
    let obj = room.raycasterConfirm(e, room.scene!.children)
    if (obj) {
      if (outlineType.includes(obj.itemType)) {
        selectedObjects.current = [...selectedObjects.current, obj]
        room.outlinePass.selectedObjects = [obj]
      }
    } else {
      room.outlinePass.selectedObjects = []
    }
  }

  async function createCabinetDetail(
    target: any,
    servers: any[],
    cabientData: any
  ) {
    const room = roomRef.current
    let alarmData = {}
    servers = servers.map(
      (item: {
        uNum: number
        uposition: number
        alarmData: any[]
        uPosition: number
      }) => {
        const hex2 = item.uposition.toString(2).split("").reverse()
        let uNum = 0
        hex2.map((num) => {
          let k = parseInt(num)
          if (k == 1) uNum++
        })
        item.uNum = uNum
        item.uPosition = hex2.length - uNum + 1
        return item
      }
    )
    let usedU =
      cabientData.usedUPosition
        .toString(2)
        .split("")
        .reduce((current: string, total: number) => {
          return parseInt(total.toString()) + parseInt(current)
        }, 0) || 0
    let detailData = {
      rotation: target.rotation,
      servers,
      position: {
        px: target.position.x,
        py: target.position.y,
        pz: target.position.z,
      },
      name: target.typeId,
      size: {
        w: target.width,
        h: target.height,
        d: target.depth,
      },
    }
    room!.toggleMeshShow(room!.scene!.children, false)
    const { cabinetObj, cabinetGroup } =
      roomRef.current!.showCabientDetail(detailData)
    return { cabinetObj, cabinetGroup }
  }

  function moveServerAnimation(item: any) {
    new TWEEN.Tween({ pz: item.position.z })
      .to(
        {
          pz: item.active ? item.originpz : item.activepz,
        },
        200
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function (obj) {
        item.position.z = obj.pz
      })
      .onComplete(() => {
        item.active = !item.active
      })
      .start()
  }

  function textureLoadSuccess() {
    // progressRef.current++;
    // console.log('totalMachineNum', totalMachineNum, progressRef.current);
    // if (progressRef.current == totalMachineNum) {
    //   setLoading(false);
    // }
  }
  return (
    <div className="meta-room">
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  )
}

export default MetaRoom
