import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { getChatHistory, markMessagesAsRead } from '@/services/chat.service';
import { SOCKET_EVENTS } from '@/constants/endpoints';
import type { Message } from '@/types/socket.type';
import { toast } from 'sonner';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  userId: string | null;
  recipientName?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ userId, recipientName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<{ userId: string; isTyping: boolean } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }

    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const response = await getChatHistory(userId, { page: 1, limit: 50 });
        setMessages(response.messages);
        await markMessagesAsRead(userId);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => { 
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: { timestamp: string | Date; senderId: string; [key: string]: unknown }) => {
      const processedMessage: Message = {
        ...message,
        timestamp: new Date(message.timestamp)
      } as Message;
      setMessages(prev => [...prev, processedMessage]);
      
      if (message.senderId === userId && userId) {
        markMessagesAsRead(userId).catch(console.error);
      }
    };

    const handleMessageSent = (message: { timestamp: string | Date; id: string; status: string; senderId: string; [key: string]: unknown }) => {
      const processedMessage: Message = {
        ...message,
        timestamp: new Date(message.timestamp)
      } as Message;
      
      if (processedMessage.senderId !== user?.id) return;
      
      setMessages(prev => {
        const tempIndex = prev.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.senderId === processedMessage.senderId &&
          m.message === processedMessage.message
        );
        
        if (tempIndex >= 0) {
          const updated = [...prev];
          updated[tempIndex] = processedMessage;
          return updated;
        }
        
        const realIndex = prev.findIndex(m => m.id === processedMessage.id);
        if (realIndex >= 0) {
          const updated = [...prev];
          updated[realIndex] = { ...updated[realIndex], status: processedMessage.status };
          return updated;
        }
        
        return [...prev, processedMessage];
      });
    };

    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId === userId) {
        setTyping({ userId: data.userId, isTyping: true });
      }
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId === userId) {
        setTyping(null);
      }
    };

    const handleMessageError = (error: { error: string }) => {
      toast.error(error.error);
      setSending(false);
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, handleUserStoppedTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_ERROR, handleMessageError);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.USER_STOPPED_TYPING, handleUserStoppedTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_ERROR, handleMessageError);
    };
  }, [socket, isConnected, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !socket || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Create temporary message for immediate UI feedback
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user?.id || '',
        senderRole: user?.role || '',
        recipientId: userId,
        message: messageText,
        messageType: 'text',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, tempMessage]);

      socket.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, {
        recipientId: userId,
        message: messageText,
        messageType: 'text'
      });

      socket.emit(SOCKET_EVENTS.TYPING_STOP, { recipientId: userId });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTypingStart = () => {
    if (!socket || !userId) return;

    socket.emit(SOCKET_EVENTS.TYPING_START, { recipientId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { recipientId: userId });
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRecipientName = () => {
    if (!userId) return '';
    return recipientName || (user?.role === 'owner' ? 'Employee' : 'Manager');
  };

  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" />
          <AvatarFallback>
            {getRecipientName().split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{getRecipientName()}</h3>
          {typing?.isTyping && (
            <p className="text-sm text-muted-foreground">Typing...</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTypingStart();
            }}
            onKeyPress={handleKeyPress}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !isConnected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 