import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare } from "lucide-react"
import { sendTourMessage, getLocationMessages } from "../../services/firebase/tourService"
import type { TourMessage } from "../../types/tour"

interface TourChatProps {
  tourId: string
  playerId: string
  playerName: string
  locationId: number
  canSend: boolean // Whether player can send message (max 10 total)
  totalSent?: number // Total messages sent so far (for display)
}

export function TourChat({ tourId, playerId, playerName, locationId, canSend, totalSent = 0 }: TourChatProps) {
  const [messages, setMessages] = useState<TourMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Poll messages every 5 seconds (to save reads)
  useEffect(() => {
    if (!tourId || !locationId) return

    const loadMessages = async () => {
      try {
        const msgs = await getLocationMessages(tourId, locationId)
        setMessages(msgs.reverse()) // Reverse to show oldest first
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    // Load immediately
    loadMessages()
    // Then poll every 5 seconds
    const interval = setInterval(loadMessages, 5000)

    return () => clearInterval(interval)
  }, [tourId, locationId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canSend || sending || (totalSent && totalSent >= 10)) return

    setSending(true)
    const success = await sendTourMessage(
      tourId,
      playerId,
      playerName,
      locationId,
      newMessage.trim()
    )

    if (success) {
      setNewMessage("")
      // Reload messages
      const msgs = await getLocationMessages(tourId, locationId)
      setMessages(msgs.reverse())
    } else {
      alert("Bạn đã đạt giới hạn 10 bình luận!")
    }
    setSending(false)
  }

  return (
    <div className="glass-card p-3 backdrop-blur-md bg-black/60 border border-[#FFD700]/30 rounded-lg shadow-xl flex flex-col max-h-80">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FFD700]" />
          <h3 className="text-sm font-bold text-white">Bình Luận</h3>
        </div>
        {totalSent > 0 && (
          <span className="text-xs text-white/80">{totalSent}/10</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-2 max-h-40">
        {messages.length === 0 ? (
          <p className="text-white/60 text-xs text-center py-2">
            Chưa có bình luận
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.messageId}
              className={`p-1.5 rounded-lg text-xs ${
                msg.playerId === playerId
                  ? "bg-[#FFD700]/30 ml-auto max-w-[85%]"
                  : "bg-white/20"
              }`}
            >
              <p className="text-[#FFD700] font-semibold mb-0.5 text-xs">
                {msg.playerName}:
              </p>
              <p className="text-white text-xs">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={canSend ? "Nhập bình luận..." : "Đã gửi"}
          disabled={!canSend || sending}
          maxLength={200}
          className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] disabled:opacity-50 backdrop-blur-sm"
        />
        <button
          onClick={handleSendMessage}
          disabled={!canSend || sending || !newMessage.trim()}
          className="px-2 py-1.5 bg-[#FFD700] text-[#b30000] rounded-lg hover:bg-[#FFA500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

