import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

/**
 * SocketContext — manages Socket.io real-time connections
 * Provides socket instance and connection status
 */
export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Connect socket when authenticated
  useEffect(() => {
    if (token && token !== 'demo-token' && user) {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        // Join user-specific room
        socket.emit('join', { userId: user._id, role: user.role });
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setIsConnected(false);
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      };
    }
  }, [token, user]);

  // Emit event helper
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Listen to event helper
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Remove event listener helper
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
