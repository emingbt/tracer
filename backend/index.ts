import express from "express"
import sendGcodeCommands from "./utils/gcodeSender.ts"

const app = express()

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/cross", (req, res) => {
  res.send("Sending cross commands to Arduino")
  sendGcodeCommands("cross")
})

app.get("/circle", (req, res) => {
  res.send("Sending circle commands to Arduino")
  sendGcodeCommands("circle")
})

app.get("/test", (req, res) => {
  res.send("Sending test commands to Arduino")
  sendGcodeCommands("test")
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})