export interface ChatPersona {
  id: string;
  name: string;
  slug: string;
  description: string;
  style: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface ChatSystemPrompt {
  id: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  persona_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  personaId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
}
