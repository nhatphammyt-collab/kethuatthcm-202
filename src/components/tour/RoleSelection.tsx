import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bus, Users, Home, Gamepad2 } from "lucide-react"
import type { TourRole } from "../../types/tour"

export function RoleSelection() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<TourRole | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [tourCode, setTourCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSelectRole = (role: TourRole) => {
    setSelectedRole(role)
  }

  const handleStartAsDriver = async () => {
    if (!playerName.trim()) {
      alert("Vui lòng nhập tên của bạn")
      return
    }

    setLoading(true)
    try {
      // Import here to avoid circular dependency
      const { createTour } = await import("../../services/firebase/tourService")

      // Generate playerId ONCE and reuse it
      const playerId = `driver_${Date.now()}`
      console.log('[RoleSelection] Creating tour for:', playerName.trim(), 'with playerId:', playerId)

      const tourId = await createTour(
        playerId,
        playerName.trim(),
        50
      )

      console.log('[RoleSelection] Tour created:', tourId)

      if (tourId) {
        navigate(`/memory-gallery/tour/${tourId}`, {
          state: {
            role: "driver",
            playerId, // Use the same playerId
            playerName: playerName.trim(),
            tourId,
          },
        })
      } else {
        console.error('[RoleSelection] tourId is null/undefined')
        alert("Không thể tạo tour. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("[RoleSelection] Error creating tour:", error)
      alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinAsPassenger = async () => {
    if (!playerName.trim()) {
      alert("Vui lòng nhập tên của bạn")
      return
    }
    if (!tourCode.trim()) {
      alert("Vui lòng nhập mã tour")
      return
    }

    setLoading(true)
    try {
      const { joinTour } = await import("../../services/firebase/tourService")
      const playerId = `passenger_${Date.now()}`
      const tourId = await joinTour(tourCode.trim().toUpperCase(), playerId, playerName.trim())

      if (tourId) {
        navigate(`/memory-gallery/tour/${tourId}`, {
          state: {
            role: "passenger",
            playerId,
            playerName: playerName.trim(),
            tourId,
          },
        })
      } else {
        alert("Không tìm thấy tour hoặc tour đã đầy. Vui lòng kiểm tra lại mã tour.")
      }
    } catch (error) {
      console.error("Error joining tour:", error)
      alert("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/diadao.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
      </div>

      {/* Navigation Buttons - Top Left */}
      <nav className="fixed top-6 left-6 z-20 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-[#FFD700] text-[#b30000] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          <Home size={20} />
          Trang Chủ
        </button>
        <button
          onClick={() => navigate('/minigame')}
          className="flex items-center gap-2 bg-[#FFD700] text-[#b30000] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          <Gamepad2 size={20} />
          Minigame
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2 text-center">
            CHUYẾN DU LỊCH KỶ NIỆM
          </h1>
          <p className="text-white text-center mb-8">
            Chọn vai trò của bạn để bắt đầu hành trình
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSelectRole("driver")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedRole === "driver"
                  ? "border-[#FFD700] bg-[#FFD700]/20"
                  : "border-white/30 bg-white/5 hover:bg-white/10"
              }`}
            >
              <Bus className="w-12 h-12 text-[#FFD700] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Tài Xế</h3>
              <p className="text-sm text-white/80">
                Điều khiển tour và dẫn đường cho mọi người
              </p>
            </button>

            <button
              onClick={() => handleSelectRole("passenger")}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedRole === "passenger"
                  ? "border-[#FFD700] bg-[#FFD700]/20"
                  : "border-white/30 bg-white/5 hover:bg-white/10"
              }`}
            >
              <Users className="w-12 h-12 text-[#FFD700] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Hành Khách</h3>
              <p className="text-sm text-white/80">
                Tham gia tour và tương tác với mọi người
              </p>
            </button>
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-white mb-2 font-semibold">Tên của bạn</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700]"
              maxLength={30}
            />
          </div>

          {/* Driver Actions */}
          {selectedRole === "driver" && (
            <button
              onClick={handleStartAsDriver}
              disabled={loading || !playerName.trim()}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo tour..." : "Tạo Tour Mới"}
            </button>
          )}

          {/* Passenger Actions */}
          {selectedRole === "passenger" && (
            <>
              <div className="mb-4">
                <label className="block text-white mb-2 font-semibold">Mã Tour</label>
                <input
                  type="text"
                  value={tourCode}
                  onChange={(e) => setTourCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã tour"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] uppercase"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleJoinAsPassenger}
                disabled={loading || !playerName.trim() || !tourCode.trim()}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tham gia..." : "Lên Xe"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
