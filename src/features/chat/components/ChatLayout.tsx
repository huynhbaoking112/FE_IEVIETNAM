import React, { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';

export const ChatLayout: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  return (
    <div className="h-full border rounded-lg bg-background">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full"
      >
        <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
          <ConversationList
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={70} minSize={50}>
          <ChatWindow
            userId={selectedUserId}
            recipientName={selectedUserName || undefined}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}; 