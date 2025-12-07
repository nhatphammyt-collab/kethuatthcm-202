import { ChevronLeft, BookOpen, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function FixedNavBar() {
  const navigate = useNavigate()

  return (
    <nav className="sticky-header scrolled h-14 bg-gradient-to-r from-[#b30000] via-[#cc0000] to-[#b30000] shadow-lg">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left - Back button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-[#b30000] font-bold rounded-lg hover:bg-[#e6c200] transition-colors shadow-md"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-serif">Trang Chủ</span>
        </button>

        {/* Center - Title */}
        <div className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-[#FFD700]" />
          <span className="font-arial font-bold text-lg tracking-wide">NỘI DUNG TRÌNH CHIẾU</span>
        </div>

        {/* Right - Content label */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <BookOpen className="w-5 h-5 text-[#FFD700]" />
          <span className="font-serif text-white font-medium">THƯ VIỆN KỶ NIỆM</span>
        </div>
      </div>
    </nav>
  )
}

