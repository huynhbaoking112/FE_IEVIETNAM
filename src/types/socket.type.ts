export interface Message {
    id: string;
    senderId: string;
    senderRole: string;
    recipientId: string;
    message: string;
    messageType: 'text' | 'image' | 'file';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    readAt?: Date;
  }
  
  export interface Conversation {
    userId: string;
    userRole: string;
    lastMessage: string;
    lastMessageType: string;
    lastMessageTime: Date;
    unreadCount: number;
  }
  
  export interface ChatHistoryParams {
    page?: number;
    limit?: number;
  }
  
  export interface ChatHistoryResponse {
    success: boolean;
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }
  
  export interface ConversationsResponse {
    success: boolean;
    conversations: Conversation[];
  }
  
  export interface UnreadCountResponse {
    success: boolean;
    unreadCount: number;
  }
  
  export interface ApiResponse {
    success: boolean;
    message: string;
  }