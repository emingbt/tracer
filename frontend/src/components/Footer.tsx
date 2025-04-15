import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0F1923] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">TRACER</h3>
            <p className="text-gray-300 text-sm">
              A 2-DOF Spherical Parallel Manipulator.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://github.com/emingbt/tracer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <Github className="mr-2 h-4 w-4" />
                  <span>GitHub Repository</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-[#FFD700] via-[#FF1493] to-[#1E90FF] mt-6" />
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} TRACER Project. All rights reserved.</p>

          <div className="mt-4 md:mt-0 flex items-center">
            <a href="https://www.github.com/emingbt" className="text-sm text-gray-300 hover:text-white transition-colors">emingbt</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
