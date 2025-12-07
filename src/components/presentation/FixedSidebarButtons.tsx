import { BookMarked, Gamepad2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function FixedSidebarButtons() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-3">
      {/* THƯ VIỆN KỶ NIỆM Button */}
      <button 
        onClick={() => navigate('/memory-gallery')}
        className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#FFD700] to-[#e6c200] text-[#b30000] font-bold rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl border-2 border-[#b8960a]"
      >
        <BookMarked className="w-6 h-6" />
        <span className="font-serif text-sm tracking-wide">THƯ VIỆN KỶ NIỆM</span>
      </button>

      {/* MINI GAME Button */}
      <button 
        onClick={() => navigate('/minigame')}
        className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#FFD700] to-[#e6c200] text-[#b30000] font-bold rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl border-2 border-[#b8960a]"
      >
        <Gamepad2 className="w-6 h-6" />
        <span className="font-serif text-sm tracking-wide">CHUYỂN SANG MINI GAME</span>
      </button>
    </div>
  )
}

