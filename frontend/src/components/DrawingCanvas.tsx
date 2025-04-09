"use client"

import { useRef, useState } from "react"

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState<boolean>(false)
  const [points, setPoints] = useState<[number, number][]>([])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Store the starting point
    setPoints([[x, y]])

    // Start drawing
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Store the point
    setPoints(prev => [...prev, [x, y]])

    // Draw the line
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setDrawing(false)
  }

  const clearDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setPoints([])
  }

  const replayDrawing = async () => {
    if (points.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up the drawing style for simulation
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2

    // Start drawing
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])

    // Draw each point with a small delay
    for (let i = 1; i < points.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)) // 10ms delay between points
      ctx.lineTo(points[i][0], points[i][1])
      ctx.stroke()
    }

    console.log(points)

    // Reset the drawing style
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1
  }

  const drawCircle = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 100

    // Clear previous points
    setPoints([])

    // Generate points for the circle
    const circlePoints: [number, number][] = []
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      circlePoints.push([x, y])
    }
    setPoints(circlePoints)

    // Draw the circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const drawSquare = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 200
    const startX = (canvas.width - size) / 2
    const startY = (canvas.height - size) / 2

    // Clear previous points
    setPoints([])

    // Generate points for the square
    const squarePoints: [number, number][] = [
      [startX, startY],
      [startX + size, startY],
      [startX + size, startY + size],
      [startX, startY + size],
      [startX, startY] // Close the square
    ]
    setPoints(squarePoints)

    // Draw the square
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX + size, startY)
    ctx.lineTo(startX + size, startY + size)
    ctx.lineTo(startX, startY + size)
    ctx.closePath()
    ctx.stroke()
  }

  const drawStar = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = 100
    const innerRadius = 40
    const spikes = 5

    // Clear previous points
    setPoints([])

    // Generate points for the star
    const starPoints: [number, number][] = []
    for (let i = 0; i <= spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes
      const x = centerX + radius * Math.sin(angle)
      const y = centerY - radius * Math.cos(angle)
      starPoints.push([x, y])
    }
    starPoints.push(starPoints[0]) // Close the star
    setPoints(starPoints)

    // Draw the star
    ctx.beginPath()
    ctx.moveTo(starPoints[0][0], starPoints[0][1])
    for (let i = 1; i < starPoints.length; i++) {
      ctx.lineTo(starPoints[i][0], starPoints[i][1])
    }
    ctx.closePath()
    ctx.stroke()
  }

  return (
    <div className="flex flex-col items-center gap-4">
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
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={replayDrawing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Simulate
        </button>
        <button
          onClick={clearDrawing}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={drawCircle}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Circle
        </button>
        <button
          onClick={drawSquare}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Square
        </button>
        <button
          onClick={drawStar}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Star
        </button>
      </div>
    </div>
  )
}