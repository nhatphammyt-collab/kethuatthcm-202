import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, Trash2, Plus, MessageSquare } from 'lucide-react';
import PersonaSelector from '../components/chat/PersonaSelector';
import ChatMessageComponent from '../components/chat/ChatMessageComponent';
import ChatInput from '../components/chat/ChatInput';
import { chatService } from '../services/chatService';
import { aiService } from '../services/aiService';
import type { ChatPersona, ChatMessage, ChatConversation, ChatSystemPrompt } from '../types/chat';

export default function ChatPage() {
  const [personas, setPersonas] = useState<ChatPersona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<ChatPersona | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<ChatSystemPrompt | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => chatService.generateUserId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInitialData = async () => {
    try {
      const [personasData, promptData, conversationsData] = await Promise.all([
        chatService.getPersonas(),
        chatService.getActiveSystemPrompt(),
        chatService.getConversations(userId)
      ]);

      setPersonas(personasData);
      setSystemPrompt(promptData);
      setConversations(conversationsData);

      if (personasData.length > 0) {
        setSelectedPersona(personasData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (persona: ChatPersona) => {
    setSelectedPersona(persona);
  };

  const handleNewConversation = async () => {
    if (!selectedPersona) return;

    try {
      const conversation = await chatService.createConversation(
        userId,
        selectedPersona.id,
        'Cuộc trò chuyện mới'
      );
      setCurrentConversation(conversation);
      setConversations([conversation, ...conversations]);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    try {
      const conversationMessages = await chatService.getMessages(conversation.id);
      setMessages(conversationMessages);

      const persona = personas.find(p => p.id === conversation.persona_id);
      if (persona) {
        setSelectedPersona(persona);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;

    try {
      await chatService.deleteConversation(conversationId);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedPersona || !systemPrompt) return;

    let conversation = currentConversation;

    if (!conversation) {
      conversation = await chatService.createConversation(
        userId,
        selectedPersona.id,
        content.substring(0, 50)
      );
      setCurrentConversation(conversation);
      setConversations([conversation, ...conversations]);
    }

    const userMessage = await chatService.addMessage(conversation.id, 'user', content);
    setMessages(prev => [...prev, userMessage]);

    try {
      const allMessages = [...messages, userMessage];
      const aiResponse = await aiService.generateResponse(allMessages, systemPrompt, selectedPersona);

      const assistantMessage = await chatService.addMessage(conversation.id, 'assistant', aiResponse);
      setMessages(prev => [...prev, assistantMessage]);

      if (messages.length === 0) {
        await chatService.updateConversation(conversation.id, {
          title: content.substring(0, 50)
        });
        setConversations(prev =>
          prev.map(c => c.id === conversation!.id ? { ...c, title: content.substring(0, 50) } : c)
        );
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#b30000] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
      <div className="h-screen flex flex-col">
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b-2 border-[#FFD700] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-[#b30000] text-white rounded-full hover:bg-[#8b0000] transition-all hover:scale-105"
              >
                <Home size={20} />
                Trang chủ
              </Link>
              <h1 className="text-2xl font-bold text-[#b30000]">Trợ lý AI Tư tưởng Hồ Chí Minh</h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex gap-6 p-6">
            <div className="w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex flex-col border-2 border-gray-200">
              <button
                onClick={handleNewConversation}
                disabled={!selectedPersona}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#b30000] text-white rounded-xl hover:bg-[#8b0000] transition-all hover:scale-105 disabled:bg-gray-300 mb-4"
              >
                <Plus size={20} />
                Cuộc trò chuyện mới
              </button>

              <div className="flex-1 overflow-y-auto space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 px-2">Lịch sử</h3>
                {conversations.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3 rounded-xl cursor-pointer transition-all group ${
                        currentConversation?.id === conv.id
                          ? 'bg-[#b30000] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare size={16} />
                            <span className="text-sm font-semibold truncate">{conv.title}</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {new Date(conv.updated_at).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col border-2 border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <PersonaSelector
                  personas={personas}
                  selectedPersona={selectedPersona}
                  onSelect={handleSelectPersona}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-2xl">
                      <div className="text-6xl mb-4">
                        {selectedPersona?.icon || '🎓'}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedPersona ? selectedPersona.name : 'Chào mừng bạn!'}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {selectedPersona?.description || 'Hãy chọn một trợ lý AI và bắt đầu cuộc trò chuyện'}
                      </p>
                      <div className="bg-gray-50 p-4 rounded-xl text-left">
                        <p className="font-semibold text-gray-700 mb-2">Gợi ý câu hỏi:</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Giải thích tư tưởng độc lập dân tộc gắn liền CNXH?</li>
                          <li>• Ý nghĩa của Cần Kiệm Liêm Chính với sinh viên?</li>
                          <li>• Văn hóa theo quan điểm HCM là gì?</li>
                          <li>• Đạo đức cách mạng có vai trò như thế nào?</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.map((message) => (
                      <ChatMessageComponent
                        key={message.id}
                        message={message}
                        persona={selectedPersona}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={!selectedPersona}
                  placeholder={
                    selectedPersona
                      ? 'Nhập câu hỏi của bạn...'
                      : 'Vui lòng chọn một trợ lý AI trước'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
