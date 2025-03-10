import Image from "next/image"
import DrawingPage from "./components/DrawingCanvas"

export default function Home() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <DrawingPage />
    </div>
  )
}
