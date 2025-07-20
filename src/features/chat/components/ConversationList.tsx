import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getConversations } from '@/services/chat.service';
import { getAllEmployees, getOwnerInfo } from '@/services/employee.service';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/endpoints';
import type { Conversation } from '@/types/socket.type';
import type { Employee } from '@/types/employee.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string, userName: string) => void;
}

interface ConversationWithUser extends Conversation {
  name: string;
  email: string;
  isOnline: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedUserId,
  onSelectUser,
}) => {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'owner') {
          const [conversationsData, employeesData] = await Promise.all([
            getConversations(),
            getAllEmployees({})
          ]);

                  
          const conversationsWithUsers = employeesData.employees.map((employee: Employee) => {
            const conversation = conversationsData.conversations.find(
              (conv: Conversation) => conv.userId === employee.id
            );
            
            return {
              userId: employee.id,
              userRole: 'employee',
              name: employee.name,
              email: employee.email,
              lastMessage: conversation?.lastMessage || '',
              lastMessageType: conversation?.lastMessageType || 'text',
              lastMessageTime: conversation?.lastMessageTime || new Date(),
              unreadCount: conversation?.unreadCount || 0,
              isOnline: onlineUsers.has(employee.id)
            };
          });

          setConversations(conversationsWithUsers);
        } else {
          const [conversationsData, ownerInfoData] = await Promise.all([
            getConversations(),
            getOwnerInfo()
          ]);
          
          const ownerId = ownerInfoData.owner.id;
          const ownerName = ownerInfoData.owner.name;
          
          const ownerConversation = conversationsData.conversations.find(
            (conv: Conversation) => conv.userId === ownerId
          );

          if (ownerConversation) {
            setConversations([{
              ...ownerConversation,
              name: ownerName,
              email: 'skipli@gmail.com',
              isOnline: onlineUsers.has(ownerId)
            }]);
          } else {
            setConversations([{
              userId: ownerId,
              userRole: 'owner',
              name: ownerName,
              email: 'skipli@gmail.com',
              lastMessage: '',
              lastMessageType: 'text',
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: onlineUsers.has(ownerId)
            }]);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.role, onlineUsers]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: { senderId: string; message: string; messageType: string; timestamp: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.userId === message.senderId) {
          return {
            ...conv,
            lastMessage: message.message,
            lastMessageType: message.messageType,
            lastMessageTime: new Date(message.timestamp),
            unreadCount: selectedUserId !== message.senderId ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      }));
    };

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    };
  }, [socket, isConnected, selectedUserId]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'now';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5" />
          <h2 className="font-semibold">Messages</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.userId}
                onClick={() => onSelectUser(conversation.userId, conversation.name)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                  selectedUserId === conversation.userId && "bg-accent"
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>

                {/* Unread badge */}
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 