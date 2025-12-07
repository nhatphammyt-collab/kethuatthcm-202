import { useState, useEffect } from "react"
import { sendTourReaction, getLocationReactions } from "../../services/firebase/tourService"
import type { TourReaction } from "../../types/tour"

interface TourReactionsProps {
  tourId: string
  playerId: string
  playerName: string
  locationId: number
  canReact: boolean // Whether player can react (max 10 total)
  totalReactions?: number // Total reactions sent so far (for display)
}

const EMOJI_OPTIONS = [
  { emoji: "❤️", label: "Yêu thích" },
  { emoji: "😊", label: "Vui vẻ" },
  { emoji: "👍", label: "Thích" },
  { emoji: "⭐", label: "Tuyệt vời" },
  { emoji: "🔥", label: "Nóng bỏng" },
]

export function TourReactions({
  tourId,
  playerId,
  playerName,
  locationId,
  canReact,
  totalReactions = 0,
}: TourReactionsProps) {
  const [reactions, setReactions] = useState<TourReaction[]>([])
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Poll reactions every 5 seconds (to save reads)
  useEffect(() => {
    if (!tourId || !locationId) return

    const loadReactions = async () => {
      try {
        const reacts = await getLocationReactions(tourId, locationId)
        setReactions(reacts)

        // Check if user already reacted
        const userReact = reacts.find((r) => r.playerId === playerId)
        if (userReact) {
          setUserReaction(userReact.emoji)
        } else {
          setUserReaction(null)
        }
      } catch (error) {
        console.error('Error loading reactions:', error)
      }
    }

    // Load immediately
    loadReactions()
    // Then poll every 5 seconds
    const interval = setInterval(loadReactions, 5000)

    return () => clearInterval(interval)
  }, [tourId, locationId, playerId])

  // Count reactions by emoji
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleReact = async (emoji: string) => {
    if (!canReact || userReaction || loading || totalReactions >= 10) return

    setLoading(true)
    const success = await sendTourReaction(
      tourId,
      playerId,
      playerName,
      locationId,
      emoji
    )

    if (success) {
      setUserReaction(emoji)
      // Reload reactions
      const reacts = await getLocationReactions(tourId, locationId)
      setReactions(reacts)
    } else {
      alert("Bạn đã đạt giới hạn 10 cảm xúc!")
    }
    setLoading(false)
  }

  return (
    <div className="glass-card p-3 backdrop-blur-md bg-black/60 border border-[#FFD700]/30 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Cảm Xúc</h3>
        {totalReactions > 0 && (
          <span className="text-xs text-white/80">{totalReactions}/10</span>
        )}
      </div>

      {/* Limit reached message */}
      {!canReact && (
        <div className="mb-3 p-1.5 bg-yellow-500/30 rounded-lg">
          <p className="text-white text-xs">
            Đã đạt giới hạn 10 cảm xúc ({totalReactions}/10)
          </p>
        </div>
      )}

      {/* Reaction Buttons */}
      {canReact && !userReaction && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option.emoji}
              onClick={() => handleReact(option.emoji)}
              disabled={loading}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm"
              title={option.label}
            >
              <span className="text-xl">{option.emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* User's Reaction */}
      {userReaction && (
        <div className="mb-3 p-1.5 bg-[#FFD700]/30 rounded-lg">
          <p className="text-white text-xs">
            Bạn: <span className="text-lg">{userReaction}</span>
          </p>
        </div>
      )}

      {/* Reaction Counts */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <div
            key={emoji}
            className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <span className="text-sm">{emoji}</span>
            <span className="text-white text-xs font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

