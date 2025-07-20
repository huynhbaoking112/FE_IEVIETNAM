import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();

  const connect = () => {
    if (!isAuthenticated || !user || isConnecting || socket?.connected) {
      return;
    }

    setIsConnecting(true);
    
    try {
      const newSocket = initializeSocket(''); 
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setSocket(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        setSocket(null);
        
        if (reason === 'io server disconnect') {
          return;
        }
      });

      newSocket.on('connect_error', (error) => {
        setIsConnecting(false);
        setIsConnected(false);
        
        if (error.message === 'Authentication token required' || 
            error.message === 'Invalid authentication token') {
          toast.error('Real-time connection failed: Authentication error');
        } else {
          toast.error('Failed to connect to real-time server');
        }
      });

      newSocket.on('connection_confirmed', () => {
        toast.success('Connected to real-time server');
      });

      newSocket.on('user_online', (data) => {
        console.log('User came online:', data);
      });

      newSocket.on('user_offline', (data) => {
        console.log('User went offline:', data);
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setIsConnecting(false);
      toast.error('Failed to initialize real-time connection');
    }
  };

  const disconnect = () => {
    if (socket) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && !socket && !isConnecting) {
      connect();
    } else if (!isAuthenticated && socket) {
      disconnect();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

 