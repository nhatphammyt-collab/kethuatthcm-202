import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { MapGallery } from "../../components/map-gallery/MapGallery"
import { TourChat } from "../../components/tour/TourChat"
import { TourReactions } from "../../components/tour/TourReactions"
import { FixedNavBar } from "../../components/presentation/FixedNavBar"
import { subscribeToTour, moveToLocation } from "../../services/firebase/tourService"
import type { Tour, TourRole } from "../../types/tour"
import { ArrowLeft, Navigation } from "lucide-react"
import { Link } from "react-router-dom"

export default function TourTravelPage() {
  const { tourId } = useParams<{ tourId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { role, playerId, playerName } = location.state || {}

  const [tour, setTour] = useState<Tour | null>(null)
  const [currentLocationId, setCurrentLocationId] = useState<number | null>(null)

  useEffect(() => {
    if (!tourId) return

    const unsubscribe = subscribeToTour(tourId, (tourData) => {
      setTour(tourData)
      if (tourData?.currentLocation !== null) {
        setCurrentLocationId(tourData.currentLocation)
      }
    })

    return () => unsubscribe()
  }, [tourId])

  // Save to session storage
  useEffect(() => {
    if (tourId && role) {
      sessionStorage.setItem("currentTourId", tourId)
      sessionStorage.setItem("currentTourRole", role)
    }
  }, [tourId, role])

  if (!tourId || !role || !playerId || !playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Thông tin không hợp lệ</div>
      </div>
    )
  }

  const isDriver = role === "driver"
  const player = tour?.players[playerId]
  // Check total count (max 10 each) - count keys in messages/reactions objects
  const totalMessages = player ? Object.keys(player.messages || {}).length : 0
  const totalReactions = player ? Object.keys(player.reactions || {}).length : 0
  const canSendMessage = totalMessages < 10
  const canReact = totalReactions < 10

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: "url('/diadao.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Fixed Nav */}
      <FixedNavBar />

      {/* Content */}
      <div className="relative z-10 pt-20 pb-12 px-4">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6">
          <Link
            to="/presentation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830] transition-colors shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Bài Thuyết Trình</span>
          </Link>
        </div>

        {/* Tour Info */}
        {tour && (
          <div className="max-w-6xl mx-auto mb-4">
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Mã Tour: <span className="font-bold text-[#FFD700]">{tour.tourCode}</span></p>
                <p className="text-white text-sm">
                  Địa điểm hiện tại:{" "}
                  <span className="font-bold text-[#FFD700]">
                    {currentLocationId
                      ? LOCATIONS.find((l) => l.id === currentLocationId)?.name || "Chưa có"
                      : "Chưa khởi hành"}
                  </span>
                </p>
              </div>
              {isDriver && (
                <div className="flex items-center gap-2 text-[#FFD700]">
                  <Navigation className="w-5 h-5" />
                  <span className="font-bold">Bạn là Tài Xế</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Gallery with Tour Sync */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - 2 columns */}
          <div className="lg:col-span-2">
            <MapGallery
              tourId={tourId}
              currentLocationId={currentLocationId}
              isDriver={isDriver}
              onLocationChange={(locationId) => {
                if (isDriver) {
                  moveToLocation(tourId, playerId, locationId)
                }
              }}
              reactionsComponent={
                currentLocationId ? (
                  <TourReactions
                    tourId={tourId}
                    playerId={playerId}
                    playerName={playerName}
                    locationId={currentLocationId}
                    canReact={canReact}
                    totalReactions={totalReactions}
                  />
                ) : undefined
              }
              chatComponent={
                currentLocationId ? (
                  <TourChat
                    tourId={tourId}
                    playerId={playerId}
                    playerName={playerName}
                    locationId={currentLocationId}
                    canSend={canSendMessage}
                    totalSent={totalMessages}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Chat & Reactions - 1 column (for non-modal view) */}
          {currentLocationId && (
            <div className="space-y-4">
              <TourReactions
                tourId={tourId}
                playerId={playerId}
                playerName={playerName}
                locationId={currentLocationId}
                canReact={canReact}
                totalReactions={totalReactions}
              />
              <TourChat
                tourId={tourId}
                playerId={playerId}
                playerName={playerName}
                locationId={currentLocationId}
                canSend={canSendMessage}
                totalSent={totalMessages}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// LOCATIONS list matching MapGallery
const LOCATIONS = [
  { id: 1, name: "Khu Hành Chính" },
  { id: 2, name: "Nhà Hàng Bến Dược" },
  { id: 3, name: "Đền Bến Dược" },
  { id: 4, name: "Quầy Lưu Niệm" },
  { id: 5, name: "Khu Tham Quan Địa Đạo" },
  { id: 6, name: "Hồ Bơi" },
  { id: 7, name: "Khu Tái Hiện Vùng Giải Phóng" },
  { id: 8, name: "Hồ Mô Phỏng Biển Đông" },
  { id: 9, name: "Khu Bắn Súng" },
  { id: 10, name: "Khu Truyền Thống Sài Gòn" },
  { id: 11, name: "Đại Học FPT" },
]

