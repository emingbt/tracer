"use client"

import { useRef, useState, useEffect } from "react"
import { Circle, Square, Triangle, Diamond, Play, Send, Trash2, Hexagon, Star } from "lucide-react"
import pixelToCM from "@/utils/pixeltoCm"
import * as shapes from "@/utils/shapes"

export default function DrawingCanvas() {
  const CANVAS_SIZE = 500

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState<boolean>(false)
  const [points, setPoints] = useState<[number, number][]>([])
  const [repeat, setRepeat] = useState<number>(1)
  const [distance, setDistance] = useState<number>(200)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up drawing style
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"

    // Draw grid pattern
    const gridSize = 20
    const gridColor = "rgba(0, 0, 0, 0.1)"

    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Reset drawing style
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
  }, [])

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
      await new Promise(resolve => setTimeout(resolve, 10)) // 10ms delay between points
      ctx.lineTo(points[i][0], points[i][1])
      ctx.stroke()
    }

    // Reset the drawing style
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
  }

  const sendDrawing = async () => {
    if (points.length === 0) return

    const transformedPoints = points.map(point => {
      const { cmX, cmY } = pixelToCM(point[0], point[1], CANVAS_SIZE, distance)
      return [cmX, cmY]
    })

    // Send the drawing data to the server
    try {
      const response = await fetch('http://localhost:8080/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ points: transformedPoints, distance, repeat }),
      })

      if (!response.ok) {
        throw new Error('Failed to send drawing')
      }

      const data = await response.json()
      console.log('Drawing sent successfully:', data)
    } catch (error) {
      console.error('Error sending drawing:', error)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-lg max-w-[1400px] mx-auto">
      {/* Shapes Panel - Left Side */}
      <div className="lg:w-48 order-3 lg:order-1">
        <div className="h-full bg-gray-100 rounded-lg p-4">
          <div className="text-gray-700 text-sm font-medium mb-4">Shapes</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              onClick={() => shapes.drawCircle(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-400 text-yellow-600 hover:bg-yellow-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Circle className="w-4 h-4" />
              Circle
            </button>
            <button
              onClick={() => shapes.drawSquare(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-orange-50 border border-orange-400 text-orange-600 hover:bg-orange-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Square className="w-4 h-4" />
              Square
            </button>
            <button
              onClick={() => shapes.drawTriangle(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-pink-50 border border-pink-400 text-pink-600 hover:bg-pink-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Triangle className="w-4 h-4" />
              Triangle
            </button>
            <button
              onClick={() => shapes.drawDiamond(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-purple-50 border border-purple-400 text-purple-600 hover:bg-purple-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Diamond className="w-4 h-4" />
              Diamond
            </button>
            <button
              onClick={() => shapes.drawHexagon(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-green-50 border border-green-400 text-green-600 hover:bg-green-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Hexagon className="w-4 h-4" />
              Hexagon
            </button>
            <button
              onClick={() => shapes.drawStar(canvasRef.current!, setPoints)}
              className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-400 text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              <Star className="w-4 h-4" />
              Star
            </button>
          </div>
        </div>
      </div>

      {/* Canvas - Center */}
      <div className="order-1 lg:order-2 lg:flex-1">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
      </div>

      {/* Actions Panel - Right Side */}
      <div className="lg:w-48 order-2 lg:order-3">
        <div className="h-full bg-gray-100 rounded-lg p-4">
          <div className="text-gray-700 text-sm font-medium mb-2">Actions</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="distance" className="text-sm text-gray-600">Distance (cm):</label>
              <input
                type="number"
                id="distance"
                min="1"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value) || 200)}
                className="w-16 px-2 py-1 text-sm border rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="repeat" className="text-sm text-gray-600">Repeat:</label>
              <input
                type="number"
                id="repeat"
                min="1"
                max="50"
                value={repeat}
                onChange={(e) => setRepeat(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 text-sm border rounded-md"
              />
            </div>
            <div className="flex flex-row lg:flex-col gap-2">
              <button
                onClick={replayDrawing}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer transition-colors flex-1 lg:flex-none"
              >
                <Play className="w-4 h-4" />
                Simulate
              </button>
              <button
                onClick={clearDrawing}
                className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-md cursor-pointer transition-colors flex-1 lg:flex-none"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <div className="w-full h-[1px] bg-gray-300 my-1" />
              <button
                onClick={sendDrawing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] via-[#FF1493] to-[#1E90FF] text-white py-2 px-4 rounded-md cursor-pointer transition-colors flex-1 lg:flex-none"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}