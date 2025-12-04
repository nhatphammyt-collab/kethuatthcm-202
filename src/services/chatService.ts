import { supabase } from '../config/firebase';
import type { ChatPersona, ChatSystemPrompt, ChatConversation, ChatMessage } from '../types/chat';

export const chatService = {
  async getPersonas(): Promise<ChatPersona[]> {
    const { data, error } = await supabase
      .from('chat_personas')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getActiveSystemPrompt(): Promise<ChatSystemPrompt | null> {
    const { data, error } = await supabase
      .from('chat_system_prompt')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createConversation(userId: string, personaId: string | null, title: string = 'Cuộc trò chuyện mới'): Promise<ChatConversation> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        persona_id: personaId,
        title
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations(userId: string): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateConversation(conversationId: string, updates: Partial<ChatConversation>): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content
      })
      .select()
      .single();

    if (error) throw error;

    await this.updateConversation(conversationId, {});

    return data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  generateUserId(): string {
    let userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_user_id', userId);
    }
    return userId;
  }
};
