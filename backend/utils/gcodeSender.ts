import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"
import fs from "fs"

type CommandFiles = "circle" | "cross" | "square" | "test" | "custom"

export default function sendGcodeCommands(commandFile: CommandFiles, customCommands?: string[]) {
  const SERIAL_PORT = "COM5" // Agjust the serial port as needed
  const BAUD_RATE = 9600
  const FILE_PATH = `./commands/${commandFile}.txt`

  // Create SerialPort instance
  const port = new SerialPort({ baudRate: BAUD_RATE, path: SERIAL_PORT })

  // Create a parser to read lines
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))
  let readCommands: string[] = []

  // Read commands from file
  if (commandFile === "custom") {
    if (!customCommands || customCommands.length === 0) {
      console.error("❌ No custom commands provided.")
      return
    }
    readCommands = customCommands.map(cmd => cmd.trim()).filter(cmd => cmd)
  }
  else if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Command file "${FILE_PATH}" does not exist.`)
    return
  }
  else {
    readCommands = fs.readFileSync(FILE_PATH, "utf-8").split("\n").map(cmd => cmd.trim()).filter(cmd => cmd)
  }

  let commandQueue = readCommands

  let isArduinoReady = false

  function sendNextCommand() {
    if (commandQueue.length === 0) {
      console.log("✅ All commands sent!")
      console.log(commandQueue)
      port.close()
      return
    }

    const command = commandQueue.shift()
    console.log(`📤 Sending: ${command}`)
    port.write(command + "\n")
  }

  // Wait for Arduino to say "READY" before sending commands
  parser.on("data", data => {
    const message = data.trim()
    console.log(`📥 Arduino: "${message}"`)

    if (message === "READY") {
      console.log("🚀 Arduino is ready! Sending first command...")
      isArduinoReady = true
      sendNextCommand()
    } else if (message === "OK" && isArduinoReady) {
      sendNextCommand()
    }
  })

  port.on("open", () => {
    console.log("🔗 Serial connection established. Waiting for Arduino...")
  })

  port.on("error", err => {
    console.error("⚠️ Serial port error:", err.message)
    port.close()
  })
}