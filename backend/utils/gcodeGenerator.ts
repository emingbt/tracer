function calculateAngles(x, y, D) {
  // Helper function to convert radians to degrees (optional)
  function toDegrees(radians) {
    return radians * (180 / Math.PI)
  }

  const sqrtSum = Math.sqrt(x * x + y * y + D * D)

  const theta1 = Math.asin(-y / sqrtSum)
  const cosTheta1 = Math.cos(theta1)
  const theta2 = Math.asin(x / (cosTheta1 * sqrtSum))

  return {
    theta1Degrees: toDegrees(theta1),
    theta2Degrees: toDegrees(theta2)
  }
}

export default function generateGcode(points: number[][], distance: number, repeat: number = 1) {
  // Converts canvas coordinates to motor angles
  const convertToAngles = (x: number, y: number): [number, number] => {
    // motor1Angle controls X-axis rotation
    // motor2Angle controls Y-axis rotation
    const { theta1Degrees: motor1Angle, theta2Degrees: motor2Angle } = calculateAngles(x, y, distance)

    return [motor1Angle, motor2Angle]
  }

  // Generate G-code commands
  const gcodeCommands: string[] = []

  // Convert all points to angles first
  const anglePoints = points.map(point => convertToAngles(point[0], point[1]))

  // First movement from [0,0] to first point
  const [firstX, firstY] = anglePoints[0]
  gcodeCommands.push(`G1 X${firstX.toFixed(2)} Y${firstY.toFixed(2)}`)

  // Generate relative movements for each subsequent point
  for (let j = 1; j <= repeat; j++) {
    for (let i = 1; i < anglePoints.length; i++) {
      const [prevX, prevY] = anglePoints[i - 1]
      const [currX, currY] = anglePoints[i]

      // Calculate the difference between current and previous point
      const diffX = currX - prevX
      const diffY = currY - prevY

      gcodeCommands.push(`G1 X${diffX.toFixed(2)} Y${diffY.toFixed(2)}`)
    }
  }

  // Add return to [0,0] from last point
  const [lastX, lastY] = anglePoints[anglePoints.length - 1]
  gcodeCommands.push(`G1 X${(-lastX).toFixed(2)} Y${(-lastY).toFixed(2)}`)

  return gcodeCommands.join('\n')
}