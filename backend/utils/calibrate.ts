import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"

export default function calibrate(): Promise<boolean> {
  const SERIAL_PORT = "COM5" // Adjust the serial port as needed
  const BAUD_RATE = 9600
  const timeoutMs = 30000 // 30 seconds

  return new Promise((resolve) => {
    const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE })
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

    const timeout = setTimeout(() => {
      console.log("⏱️ Calibration timed out.")
      cleanup()
      resolve(false)
    }, timeoutMs)

    function cleanup() {
      clearTimeout(timeout)
      parser.removeAllListeners()
      port.removeAllListeners()
      if (port.isOpen) port.close()
    }

    function handleMessage(data: string) {
      const message = data.trim()
      console.log(`📥 Arduino: "${message}"`)

      if (message === "READY") {
        console.log("🚀 Arduino is ready! Sending calibration command...")
        port.write("CALIBRATE\n")
      }

      if (message === "CALIBRATED") {
        console.log("✅ Calibration complete!")
        cleanup()
        resolve(true)
      }
    }

    function handleError(err: Error) {
      console.error("❌ Serial port error:", err.message)
      cleanup()
      resolve(false)
    }

    parser.on("data", handleMessage)
    port.on("error", handleError)
  })
}
