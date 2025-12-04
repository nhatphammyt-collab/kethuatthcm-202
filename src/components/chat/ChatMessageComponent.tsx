import { User, Bot } from 'lucide-react';
import { ChatMessage, ChatPersona } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  persona: ChatPersona | null;
}

function formatMessageContent(content: string) {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

  const lines = formatted.split('\n');
  let result = '';
  let inList = false;

  lines.forEach((line) => {
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      if (!inList) {
        result += '<ul class="list-disc list-inside mb-2 space-y-1">';
        inList = true;
      }
      result += `<li>${line.trim().substring(1).trim()}</li>`;
    } else if (line.trim().match(/^\d+\./)) {
      if (!inList) {
        result += '<ol class="list-decimal list-inside mb-2 space-y-1">';
        inList = true;
      }
      result += `<li>${line.trim().replace(/^\d+\./, '').trim()}</li>`;
    } else {
      if (inList) {
        result += inList ? '</ul>' : '</ol>';
        inList = false;
      }
      if (line.trim()) {
        result += `<p class="mb-2">${line}</p>`;
      }
    }
  });

  if (inList) {
    result += '</ul>';
  }

  return result;
}

export default function ChatMessageComponent({ message, persona }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-gray-600' : 'bg-white border-2'
        }`}
        style={{
          borderColor: !isUser && persona ? persona.color : undefined,
          backgroundColor: !isUser && persona ? `${persona.color}15` : undefined
        }}
      >
        {isUser ? (
          <User size={20} className="text-white" />
        ) : (
          <Bot size={20} style={{ color: persona?.color || '#b30000' }} />
        )}
      </div>

      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block p-4 rounded-2xl ${
            isUser
              ? 'bg-gray-700 text-white'
              : 'bg-white border-2 text-gray-800'
          }`}
          style={{
            borderColor: !isUser && persona ? persona.color : undefined
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
            />
          )}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}
