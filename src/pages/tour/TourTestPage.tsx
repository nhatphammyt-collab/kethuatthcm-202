import { useState } from "react"
import { MapGallery } from "../../components/map-gallery/MapGallery"
import { MockTourChat } from "../../components/tour/MockTourChat"
import { MockTourReactions } from "../../components/tour/MockTourReactions"
import { FixedNavBar } from "../../components/presentation/FixedNavBar"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function TourTestPage() {
  const [currentLocationId, setCurrentLocationId] = useState<number | null>(null)
  const [playerName] = useState("Test User")
  // Track total messages and reactions across all locations (max 10 each)
  const [totalMessagesSent, setTotalMessagesSent] = useState(0)
  const [totalReactionsSent, setTotalReactionsSent] = useState(0)

  const handleLocationChange = (locationId: number) => {
    setCurrentLocationId(locationId)
  }

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

        {/* Test Info */}
        <div className="max-w-6xl mx-auto mb-4">
          <div className="glass-card p-4">
            <p className="text-white text-sm">
              <span className="font-bold text-[#FFD700]">Chế độ Test:</span> Bạn có thể test tất cả tính năng mà không cần tạo phòng
            </p>
            <p className="text-white text-xs mt-2 opacity-80">
              Địa điểm hiện tại: {currentLocationId ? `Địa điểm ${currentLocationId}` : "Chưa chọn"}
            </p>
          </div>
        </div>

        {/* Map Gallery with Chat & Reactions */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - 2 columns */}
          <div className="lg:col-span-2">
            <MapGallery
              currentLocationId={currentLocationId}
              isDriver={true}
              onLocationChange={handleLocationChange}
              reactionsComponent={
                currentLocationId ? (
                  <MockTourReactions
                    locationId={currentLocationId}
                    playerName={playerName}
                    totalReactions={totalReactionsSent}
                    onReactionSent={() => setTotalReactionsSent(prev => prev + 1)}
                  />
                ) : undefined
              }
              chatComponent={
                currentLocationId ? (
                  <MockTourChat
                    locationId={currentLocationId}
                    playerName={playerName}
                    totalSent={totalMessagesSent}
                    onMessageSent={() => setTotalMessagesSent(prev => prev + 1)}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Chat & Reactions - 1 column */}
          {currentLocationId && (
            <div className="space-y-4">
              <MockTourReactions
                locationId={currentLocationId}
                playerName={playerName}
                totalReactions={totalReactionsSent}
                onReactionSent={() => setTotalReactionsSent(prev => prev + 1)}
              />
              <MockTourChat
                locationId={currentLocationId}
                playerName={playerName}
                totalSent={totalMessagesSent}
                onMessageSent={() => setTotalMessagesSent(prev => prev + 1)}
              />
            </div>
          )}

          {/* Instructions when no location selected */}
          {!currentLocationId && (
            <div className="lg:col-span-1">
              <div className="glass-card p-4">
                <h3 className="text-lg font-bold text-white mb-2">Hướng dẫn</h3>
                <ul className="text-white text-sm space-y-2">
                  <li>• Click vào các marker trên bản đồ để chọn địa điểm</li>
                  <li>• Sau khi chọn địa điểm, bạn có thể:</li>
                  <li>  - Gửi 1 reaction (cảm xúc)</li>
                  <li>  - Gửi 1 tin nhắn bình luận</li>
                  <li>• Mỗi địa điểm chỉ có thể gửi 1 lần</li>
                  <li>• <span className="text-[#FFD700]">Chế độ test: Không tốn database!</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

