export default function generateGcode(points: number[][], canvasSize: number) {
  // Convert canvas coordinates to motor angles
  const convertToAngles = (x: number, y: number): [number, number] => {
    // Map from [0, canvasSize] to [-20, 20]
    const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
    }

    // Center the coordinates around (canvasSize/2, canvasSize/2)
    const centeredX = x - canvasSize / 2
    const centeredY = y - canvasSize / 2

    // Calculate angles based on position
    // For a 2DOF system, we can use simple trigonometry
    // motor1Angle controls X-axis rotation
    // motor2Angle controls Y-axis rotation
    const motor1Angle = mapRange(centeredX, -canvasSize / 2, canvasSize / 2, -20, 20)
    const motor2Angle = mapRange(centeredY, -canvasSize / 2, canvasSize / 2, -20, 20)

    return [motor1Angle, motor2Angle]
  }

  // Generate G-code commands
  const gcodeCommands: string[] = []

  // Convert all points to angles first
  const anglePoints = points.map(point => convertToAngles(point[0], point[1]))

  // First movement from [0,0] to first point
  const [firstX, firstY] = anglePoints[0]
  gcodeCommands.push(`G1 X${firstX.toFixed(1)} Y${firstY.toFixed(1)}`)

  // Generate relative movements for each subsequent point
  for (let i = 1; i < anglePoints.length; i++) {
    const [prevX, prevY] = anglePoints[i - 1]
    const [currX, currY] = anglePoints[i]

    // Calculate the difference between current and previous point
    const diffX = currX - prevX
    const diffY = currY - prevY

    gcodeCommands.push(`G1 X${diffX.toFixed(1)} Y${diffY.toFixed(1)}`)
  }

  // Add return to [0,0] from last point
  const [lastX, lastY] = anglePoints[anglePoints.length - 1]
  gcodeCommands.push(`G1 X${(-lastX).toFixed(1)} Y${(-lastY).toFixed(1)}`)

  return gcodeCommands.join('\n')
}