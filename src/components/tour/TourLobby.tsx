import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Play, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { subscribeToTour, setPlayerReady, startTour } from "../../services/firebase/tourService"
import type { Tour, TourRole } from "../../types/tour"

interface TourLobbyProps {
  tourId: string
  playerId: string
  playerName: string
  role: TourRole
}

export function TourLobby({ tourId, playerId, playerName, role }: TourLobbyProps) {
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToTour(tourId, (tourData) => {
      setTour(tourData)
      
      // Check if tour started
      if (tourData?.status === "traveling") {
        navigate(`/memory-gallery/tour/${tourId}/travel`, {
          state: { role, playerId, playerName, tourId },
        })
      }
    })

    return () => unsubscribe()
  }, [tourId, navigate, role, playerId, playerName])

  const handleToggleReady = async () => {
    if (role === "driver") return // Driver is always ready
    
    setLoading(true)
    const newReadyState = !isReady
    await setPlayerReady(tourId, playerId, newReadyState)
    setIsReady(newReadyState)
    setLoading(false)
  }

  const handleStartTour = async () => {
    if (role !== "driver") return
    
    setLoading(true)
    const success = await startTour(tourId, playerId)
    if (!success) {
      alert("Không thể khởi hành. Vui lòng thử lại.")
    }
    setLoading(false)
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    )
  }

  const players = Object.values(tour.players || {})
  const readyCount = players.filter((p) => p.isReady).length
  const allPassengersReady = players.filter((p) => p.role === "passenger").every((p) => p.isReady)
  const canStart = role === "driver" && allPassengersReady && players.length > 1

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

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
              CHUYẾN DU LỊCH KỶ NIỆM
            </h1>
            <p className="text-white text-lg">Mã Tour: <span className="font-bold text-[#FFD700]">{tour.tourCode}</span></p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
              <p className="text-white text-sm">Tổng số người</p>
              <p className="text-2xl font-bold text-[#FFD700]">{players.length}/{tour.maxPlayers}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
              <p className="text-white text-sm">Đã sẵn sàng</p>
              <p className="text-2xl font-bold text-[#FFD700]">{readyCount}/{players.length}</p>
            </div>
          </div>

          {/* Player List */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Danh sách hành khách</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    {player.role === "driver" ? (
                      <span className="text-[#FFD700] font-bold">🚌 Tài Xế</span>
                    ) : (
                      <span className="text-white">👤 {player.name}</span>
                    )}
                  </div>
                  <div>
                    {player.isReady ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {role === "passenger" && (
            <button
              onClick={handleToggleReady}
              disabled={loading}
              className={`w-full py-4 rounded-full font-bold transition-all ${
                isReady
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-[#FFD700] hover:bg-[#FFA500] text-[#b30000]"
              }`}
            >
              {isReady ? "✓ Đã Sẵn Sàng" : "Bấm Để Sẵn Sàng"}
            </button>
          )}

          {role === "driver" && (
            <>
              {!allPassengersReady && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4 text-center">
                  <p className="text-yellow-200">
                    Đang chờ tất cả hành khách sẵn sàng...
                  </p>
                </div>
              )}
              <button
                onClick={handleStartTour}
                disabled={!canStart || loading}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {loading ? "Đang khởi hành..." : "KHỞI HÀNH"}
              </button>
            </>
          )}

          {/* Back Button */}
          <button
            onClick={() => navigate("/memory-gallery")}
            className="mt-4 w-full flex items-center justify-center gap-2 text-white hover:text-[#FFD700] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}

