export default function pixelToCM(
  pxX: number,
  pxY: number,
  canvasSize: number,
  distance: number
): { cmX: number; cmY: number } {
  const MAX_ANGLE = 20 // degrees
  const fov = MAX_ANGLE * Math.PI / 180
  const canvasLength = Math.tan(fov) * distance * 2
  const cmPerPixel = canvasLength / canvasSize

  // Translate origin from top-left to center
  const centeredX = pxX - canvasSize / 2
  const centeredY = canvasSize / 2 - pxY // invert Y axis to match Cartesian coords

  // Convert to centimeters
  const cmX = centeredX * cmPerPixel
  const cmY = centeredY * cmPerPixel

  return { cmX, cmY }
}