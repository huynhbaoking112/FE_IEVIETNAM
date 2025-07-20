import { API_ENDPOINTS } from '@/constants/endpoints';
import api from '@/lib/api';
import type { ChatHistoryParams, ChatHistoryResponse, ConversationsResponse, ApiResponse, UnreadCountResponse } from '@/types/socket.type';


export const getChatHistory = async (
  userId: string, 
  params: ChatHistoryParams = {}
): Promise<ChatHistoryResponse> => {
  try {
    const { page = 1, limit = 50 } = params;
    
    const response = await api.get(API_ENDPOINTS.CHAT.HISTORY(userId), {
      params: { page, limit }
    });

    const messages = response.data.messages.map((message: Record<string, unknown>) => ({
      ...message,
      timestamp: new Date(message.timestamp as string),
      readAt: message.readAt ? new Date(message.readAt as string) : undefined
    }));

    return {
      ...response.data,
      messages
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw new Error(apiError.response?.data?.message || 'Failed to get chat history');
  }
};

export const getConversations = async (): Promise<ConversationsResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.CHAT.CONVERSATIONS);
    
    const conversations = response.data.conversations.map((conv: Record<string, unknown>) => ({
      ...conv,
      lastMessageTime: new Date(conv.lastMessageTime as string)
    }));

    return {
      ...response.data,
      conversations
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw new Error(apiError.response?.data?.message || 'Failed to get conversations');
  }
};

export const markMessagesAsRead = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await api.put(API_ENDPOINTS.CHAT.MARK_READ(userId));
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw new Error(apiError.response?.data?.message || 'Failed to mark messages as read');
  }
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.CHAT.UNREAD_COUNT);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    throw new Error(apiError.response?.data?.message || 'Failed to get unread count');
  }
};

export interface PrivateMessageData {
  recipientId: string;
  message: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface TypingData {
  recipientId: string;
}

export interface MessageReadData {
  messageId: string;
}

