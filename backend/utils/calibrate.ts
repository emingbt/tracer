import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"

export default function calibrate() {
  const SERIAL_PORT = "COM3"
  const BAUD_RATE = 9600

  // Create SerialPort instance
  const port = new SerialPort({ baudRate: BAUD_RATE, path: SERIAL_PORT })

  // Create a parser to read lines
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

  // Wait for Arduino to say "READY" before sending commands
  parser.on("data", data => {
    const message = data.trim()
    console.log(`📥 Arduino: "${message}"`)

    if (message === "READY") {
      console.log("🚀 Arduino is ready! Sending calibration command...")
      port.write("CALIBRATE\n")
    } else if (message === "CALIBRATED") {
      console.log("✅ Calibration complete!")
      port.close()

      return
    }
  })
}