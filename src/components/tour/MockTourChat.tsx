import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare } from "lucide-react"
import type { TourMessage } from "../../types/tour"

interface MockTourChatProps {
  locationId: number
  playerName: string
  totalSent: number // Total messages sent (from parent)
  onMessageSent: () => void // Callback when message is sent
}

export function MockTourChat({ locationId, playerName, totalSent, onMessageSent }: MockTourChatProps) {
  const [messages, setMessages] = useState<TourMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Reset messages list when location changes (but keep total count)
  useEffect(() => {
    setMessages([])
    setNewMessage("")
  }, [locationId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || totalSent >= 10) return

    const newMsg: TourMessage = {
      messageId: `msg_${Date.now()}`,
      playerId: "test_user",
      playerName,
      locationId,
      text: newMessage.trim(),
      timestamp: new Date(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
    onMessageSent() // Notify parent
  }

  return (
    <div className="glass-card p-3 backdrop-blur-md bg-black/60 border border-[#FFD700]/30 rounded-lg shadow-xl flex flex-col max-h-80">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-[#FFD700]" />
        <h3 className="text-sm font-bold text-white">Bình Luận</h3>
      </div>

      {/* Message count indicator */}
      {totalSent > 0 && (
        <div className="mb-2 text-xs text-white/80 text-right">
          Đã gửi: {totalSent}/10
        </div>
      )}

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
              className="p-1.5 rounded-lg bg-[#FFD700]/30 ml-auto max-w-[85%] text-xs"
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
          placeholder={totalSent >= 10 ? "Đã đạt giới hạn 10 bình luận" : "Nhập bình luận..."}
          disabled={totalSent >= 10}
          maxLength={200}
          className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] disabled:opacity-50 backdrop-blur-sm"
        />
        <button
          onClick={handleSendMessage}
          disabled={totalSent >= 10 || !newMessage.trim()}
          className="px-2 py-1.5 bg-[#FFD700] text-[#b30000] rounded-lg hover:bg-[#FFA500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

