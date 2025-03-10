"use client"

import { useRef, useState } from "react"

export default function DrawingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState<boolean>(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setDrawing(false)
  }

  const sendDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const imageData: string = canvas.toDataURL("image/png")

    console.log("Image data:", imageData, typeof imageData)
  }

  const clearDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: "1px solid black" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      ></canvas>
      <button onClick={sendDrawing}>Send Drawing</button>
      <button onClick={clearDrawing}>Clear Drawing</button>
    </div>
  )
}
