import express from "express"
import cors from "cors"
import { z } from "zod"
import sendGcodeCommands from "./utils/gcodeSender.ts"
import generateGcode from "./utils/gcodeGenerator.ts"
import calibrate from "./utils/calibrate.ts"

const app = express()

// Enable CORS for all routes
app.use(cors())

// Add middleware to parse JSON bodies
app.use(express.json())

// Define validation schema
const drawRequestSchema = z.object({
  points: z.array(
    z.tuple([z.number(), z.number()])
  ).min(1),
  distance: z.number().positive().min(1),
  repeat: z.number().positive().max(50).optional()
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/calibrate", async (req, res) => {
  console.log("📥 Calibration request received")

  try {
    const isCalibrated = await calibrate()

    if (isCalibrated) {
      res.json({ success: true, message: "Calibration complete" })
    } else {
      res.status(500).json({ success: false, message: "Calibration failed or timed out" })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

app.get("/cross", (req, res) => {
  res.send("Sending cross commands to Arduino")
  sendGcodeCommands("cross")
})

app.get("/circle", (req, res) => {
  res.send("Sending circle commands to Arduino")
  sendGcodeCommands("circle")
})

app.get("/square", (req, res) => {
  res.send("Sending square commands to Arduino")
  sendGcodeCommands("square")
})

app.get("/test", (req, res) => {
  res.send("Sending test commands to Arduino")
  sendGcodeCommands("test")
})

app.post("/draw", (req, res) => {
  try {
    // Validate request body
    const validatedData = drawRequestSchema.parse(req.body)
    const { points, distance, repeat } = validatedData

    const gcode = generateGcode(points, distance, repeat).split("\n")
    res.json({ message: "Points received successfully", points, gcode })
    sendGcodeCommands("custom", gcode)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      })
    } else {
      res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong"
      })
    }
  }
})

app.listen(8080, () => {
  console.log("Server is running on port 8080")
})