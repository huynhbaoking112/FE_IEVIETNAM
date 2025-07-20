import { useContext } from 'react';
import { SocketContext } from '@/contexts/SocketContext';
import type { SocketContextType } from '@/contexts/SocketContext';

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 