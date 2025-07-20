import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/types/socket.type';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'now';
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatFullTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getInitials = (role: string) => {
    return role === 'owner' ? 'M' : 'E';
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs">
            {getInitials(message.senderRole)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "rounded-2xl px-4 py-2 max-w-prose break-words",
                isOwn 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-muted rounded-bl-sm"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatFullTime(message.timestamp)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          
          {isOwn && (
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 