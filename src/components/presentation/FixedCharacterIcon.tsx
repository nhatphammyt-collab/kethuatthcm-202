export function FixedCharacterIcon() {
  return (
    <div className="fixed bottom-8 left-6 z-50">
      <div className="relative group">
        {/* Character avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] to-[#e6c200] p-1 shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-[#b30000] character-breathe">
          <div className="w-full h-full rounded-full bg-[#b30000] flex items-center justify-center overflow-hidden">
            <img
              src="/vietnamese-military-officer-cartoon-avatar-chibi-s.jpg"
              alt="Teaching Assistant"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <p className="text-sm font-serif text-[#b30000] font-medium">Trợ giảng hỗ trợ bạn!</p>
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
        </div>
      </div>
    </div>
  )
}

