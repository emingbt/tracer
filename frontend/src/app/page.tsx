import DrawingCanvas from "../components/DrawingCanvas"

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-72px)] flex justify-center items-center bg-gray-100 py-4">
      <DrawingCanvas />
    </div>
  )
}
