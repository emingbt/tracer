import { SerialPort } from "serialport"
import { ReadlineParser } from "@serialport/parser-readline"
import fs from "fs"

// Change this to match your Arduino's serial port (e.g., "/dev/ttyUSB0" on Linux)
const SERIAL_PORT = "COM4"
const BAUD_RATE = 9600
const FILE_PATH = "commands.txt"

// Create SerialPort instance
const port = new SerialPort({ baudRate: BAUD_RATE, path: SERIAL_PORT })

// Create a parser to read lines
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

// Read commands from file
const commandQueue = fs.readFileSync(FILE_PATH, "utf-8").split("\n").map(cmd => cmd.trim()).filter(cmd => cmd)

// Function to send commands one by one
function sendNextCommand() {
  if (commandQueue.length === 0) {
    console.log("All commands sent!")
    return
  }

  const command = commandQueue.shift() // Get the next command
  console.log(`Sending: ${command}`)
  port.write(command + "\n") // Send to Arduino
}

// Handle responses from Arduino
parser.on("data", data => {
  console.log(`Arduino: ${data.trim()}`)
  if (data.trim() === "OK") {
    sendNextCommand() // Send the next command when Arduino replies "OK"
  }
})

// Wait for the port to open
port.on("open", () => {
  console.log("Serial port opened.")
  sendNextCommand() // Start sending commands
})

port.on("error", err => {
  console.error("Serial port error:", err.message)
})
