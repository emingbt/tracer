import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"
import fs from "fs"

type CommandFiles = "circle" | "cross" | "test" | "custom"

const BATCH_SIZE = 15 // Number of commands to send at once
const BUFFER_SIZE = 20 // Match Arduino's buffer size
const COMMAND_TIMEOUT = 5000 // Timeout for command acknowledgment in milliseconds

export default function sendGcodeCommands(commandFile: CommandFiles, customCommands?: string[]) {
  const SERIAL_PORT = "COM4"
  const BAUD_RATE = 9600
  const FILE_PATH = `./commands/${commandFile}.txt`

  // Create SerialPort instance
  const port = new SerialPort({ baudRate: BAUD_RATE, path: SERIAL_PORT })

  // Create a parser to read lines
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))
  let readCommands: string[] = []
  let commandQueue: string[] = []
  let isArduinoReady = false
  let commandsInFlight = 0
  let lastCommandTime = Date.now()

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

  commandQueue = [...readCommands]

  function sendNextBatch() {
    if (commandQueue.length === 0) {
      if (commandsInFlight === 0) {
        console.log("✅ All commands sent and processed!")
        port.close()
      }
      return
    }

    // Calculate how many commands we can send in this batch
    const availableBufferSpace = BUFFER_SIZE - commandsInFlight
    const batchSize = Math.min(BATCH_SIZE, availableBufferSpace, commandQueue.length)

    if (batchSize <= 0) {
      // Check for timeout
      if (Date.now() - lastCommandTime > COMMAND_TIMEOUT) {
        console.error("⚠️ Command timeout - no response from Arduino")
        port.close()
        return
      }
      // Wait for some commands to be processed before sending more
      return
    }

    // Send the batch of commands
    const batch = commandQueue.splice(0, batchSize)
    commandsInFlight += batch.length
    lastCommandTime = Date.now()

    console.log(`📤 Sending batch of ${batch.length} commands...`)
    batch.forEach(command => {
      port.write(command + "\n")
    })
  }

  // Wait for Arduino to say "READY" before sending commands
  parser.on("data", data => {
    const message = data.trim()
    console.log(`📥 Arduino: "${message}"`)

    if (message === "READY") {
      console.log("🚀 Arduino is ready! Sending first batch...")
      isArduinoReady = true
      sendNextBatch()
    } else if (message === "OK") {
      commandsInFlight--
      lastCommandTime = Date.now()
      sendNextBatch()
    } else if (message === "BUFFER_FULL") {
      // Wait for some commands to be processed before sending more
      console.log("⚠️ Arduino buffer is full, waiting for commands to be processed...")
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