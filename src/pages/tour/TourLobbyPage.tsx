import { useParams, useLocation } from "react-router-dom"
import { TourLobby } from "../../components/tour/TourLobby"

export default function TourLobbyPage() {
  const { tourId } = useParams<{ tourId: string }>()
  const location = useLocation()
  const { role, playerId, playerName } = location.state || {}

  if (!tourId || !role || !playerId || !playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Thông tin không hợp lệ</div>
      </div>
    )
  }

  return (
    <TourLobby
      tourId={tourId}
      playerId={playerId}
      playerName={playerName}
      role={role}
    />
  )
}

