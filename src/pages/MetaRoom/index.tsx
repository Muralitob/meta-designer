import { useRef } from "react"

function MetaRoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const roomRef = useRef(null);
  return (
    <div className="meta-room">
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  )
}

export default MetaRoom
