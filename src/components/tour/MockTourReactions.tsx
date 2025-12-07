import { useState, useEffect } from "react"
import type { TourReaction } from "../../types/tour"

interface MockTourReactionsProps {
  locationId: number
  playerName: string
  totalReactions: number // Total reactions sent (from parent)
  onReactionSent: () => void // Callback when reaction is sent
}

const EMOJI_OPTIONS = [
  { emoji: "❤️", label: "Yêu thích" },
  { emoji: "😊", label: "Vui vẻ" },
  { emoji: "👍", label: "Thích" },
  { emoji: "⭐", label: "Tuyệt vời" },
  { emoji: "🔥", label: "Nóng bỏng" },
]

export function MockTourReactions({ locationId, playerName, totalReactions, onReactionSent }: MockTourReactionsProps) {
  const [reactions, setReactions] = useState<TourReaction[]>([])
  const [userReaction, setUserReaction] = useState<string | null>(null)

  // Reset reactions list when location changes (but keep total count)
  useEffect(() => {
    setReactions([])
    setUserReaction(null)
  }, [locationId])

  // Count reactions by emoji
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleReact = (emoji: string) => {
    if (totalReactions >= 10) return

    const newReaction: TourReaction = {
      reactionId: `react_${Date.now()}`,
      playerId: "test_user",
      playerName,
      locationId,
      emoji,
      timestamp: new Date(),
    }

    setReactions([...reactions, newReaction])
    setUserReaction(emoji)
    onReactionSent() // Notify parent
  }

  return (
    <div className="glass-card p-3 backdrop-blur-md bg-black/60 border border-[#FFD700]/30 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Cảm Xúc</h3>
        {totalReactions > 0 && (
          <span className="text-xs text-white/80">{totalReactions}/10</span>
        )}
      </div>

      {/* Reaction Buttons */}
      {totalReactions < 10 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option.emoji}
              onClick={() => handleReact(option.emoji)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              title={option.label}
            >
              <span className="text-xl">{option.emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Limit reached message */}
      {totalReactions >= 10 && (
        <div className="mb-3 p-1.5 bg-yellow-500/30 rounded-lg">
          <p className="text-white text-xs">
            Đã đạt giới hạn 10 cảm xúc ({totalReactions}/10)
          </p>
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

