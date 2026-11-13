import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * useSocket hook — provides access to socket context
 * Must be used within a SocketProvider
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default useSocket;
