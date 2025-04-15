type Point = [number, number]
type DrawFunction = (canvas: HTMLCanvasElement, setPoints: (points: Point[]) => void) => void

const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export const drawCircle: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 100

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.stroke()

  const points: Point[] = []
  for (let i = 0; i <= 360; i += 5) {
    const angle = (i * Math.PI) / 180
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    points.push([x, y])
  }
  setPoints(points)
}

export const drawSquare: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const size = 200
  const startX = (canvas.width - size) / 2
  const startY = (canvas.height - size) / 2

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + size, startY)
  ctx.lineTo(startX + size, startY + size)
  ctx.lineTo(startX, startY + size)
  ctx.closePath()
  ctx.stroke()

  setPoints([
    [startX, startY],
    [startX + size, startY],
    [startX + size, startY + size],
    [startX, startY + size],
    [startX, startY]
  ])
}

export const drawTriangle: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const size = 100

  ctx.beginPath()
  ctx.moveTo(centerX, centerY - size)
  ctx.lineTo(centerX + size * Math.cos(Math.PI / 6), centerY + size * Math.sin(Math.PI / 6))
  ctx.lineTo(centerX - size * Math.cos(Math.PI / 6), centerY + size * Math.sin(Math.PI / 6))
  ctx.closePath()
  ctx.stroke()

  setPoints([
    [centerX, centerY - size],
    [centerX + size * Math.cos(Math.PI / 6), centerY + size * Math.sin(Math.PI / 6)],
    [centerX - size * Math.cos(Math.PI / 6), centerY + size * Math.sin(Math.PI / 6)],
    [centerX, centerY - size]
  ])
}

export const drawDiamond: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const size = 100

  ctx.beginPath()
  ctx.moveTo(centerX, centerY - size)
  ctx.lineTo(centerX + size, centerY)
  ctx.lineTo(centerX, centerY + size)
  ctx.lineTo(centerX - size, centerY)
  ctx.closePath()
  ctx.stroke()

  setPoints([
    [centerX, centerY - size],
    [centerX + size, centerY],
    [centerX, centerY + size],
    [centerX - size, centerY],
    [centerX, centerY - size]
  ])
}

export const drawHexagon: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const size = 80
  const points: Point[] = []

  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const x = centerX + size * Math.cos(angle)
    const y = centerY + size * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    points.push([x, y])
  }
  points.push(points[0]) // Close the shape
  ctx.closePath()
  ctx.stroke()

  setPoints(points)
}

export const drawStar: DrawFunction = (canvas, setPoints) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  clearCanvas(ctx, canvas)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const outerRadius = 100
  const innerRadius = 40
  const points: Point[] = []
  const spikes = 5

  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / spikes
    const x = centerX + radius * Math.sin(angle)
    const y = centerY - radius * Math.cos(angle)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    points.push([x, y])
  }
  points.push(points[0]) // Close the shape
  ctx.closePath()
  ctx.stroke()

  setPoints(points)
} 